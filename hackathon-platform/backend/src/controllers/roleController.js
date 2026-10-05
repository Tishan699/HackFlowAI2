const db = require('../config/db');

/**
 * Switch Active Persona
 * SECURITY: Only allows switching to roles in user's assignedRoles array.
 * The backend is the final authority — frontend must never be trusted.
 */
exports.switchPersona = async (req, res) => {
  try {
    const { role: newRole } = req.body;
    const userId = req.user.id;

    if (!newRole) {
      return res.status(400).json({ error: 'Role is required.' });
    }

    const user = db.findById('users', userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Derive the authoritative list of assigned roles
    const assignedRoles = Array.isArray(user.assignedRoles)
      ? user.assignedRoles
      : [user.role || 'participant'];

    // SECURITY CHECK: Reject unauthorized persona escalation
    if (!assignedRoles.includes(newRole)) {
      console.warn(`[SECURITY] User ${userId} (${user.email}) attempted unauthorized persona switch to '${newRole}'. Assigned: [${assignedRoles.join(',')}]`);
      return res.status(403).json({
        error: `Forbidden. You are not authorized for the '${newRole}' persona.`,
        assignedRoles,
      });
    }

    // Update active role
    const updated = db.updateById('users', userId, { role: newRole });
    res.json({
      success: true,
      message: `Active persona switched to '${newRole}'.`,
      role: updated.role,
      assignedRoles: updated.assignedRoles || assignedRoles,
    });
  } catch (error) {
    console.error('Switch persona error:', error);
    res.status(500).json({ error: 'Failed to switch active persona.' });
  }
};

/**
 * Request a new role (Participant → Mentor/Judge/Organizer)
 * SECURITY: Does NOT grant the role. Creates a pending request for admin approval.
 */
exports.requestRole = async (req, res) => {
  try {
    const { requestedRole, reason } = req.body;
    const userId = req.user.id;

    const validRoles = ['mentor', 'judge', 'organizer'];
    if (!requestedRole || !validRoles.includes(requestedRole)) {
      return res.status(400).json({
        error: `Invalid role. Requestable roles: ${validRoles.join(', ')}`,
      });
    }

    const user = db.findById('users', userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if user already has this role
    const assignedRoles = Array.isArray(user.assignedRoles)
      ? user.assignedRoles
      : [user.role || 'participant'];

    if (assignedRoles.includes(requestedRole)) {
      return res.status(409).json({
        error: `You already have the '${requestedRole}' role assigned.`,
      });
    }

    // Check for existing pending request
    const existingRequest = db.findOne('roleRequests', r =>
      r.userId === userId &&
      r.requestedRole === requestedRole &&
      r.status === 'PENDING'
    );

    if (existingRequest) {
      return res.status(409).json({
        error: `You already have a pending request for the '${requestedRole}' role.`,
        requestId: existingRequest.id,
      });
    }

    // Create the role request
    const roleRequest = db.insert('roleRequests', {
      userId,
      userEmail: user.email,
      userName: user.name,
      requestedRole,
      reason: reason || '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: `Your request to become '${requestedRole}' has been submitted for admin review.`,
      request: roleRequest,
    });
  } catch (error) {
    console.error('Role request error:', error);
    res.status(500).json({ error: 'Failed to submit role request.' });
  }
};

/**
 * Get role requests (for admin/organizer review)
 * SECURITY: Only organizers and admins can view role requests.
 */
exports.getRoleRequests = async (req, res) => {
  try {
    const { status } = req.query;

    let requests;
    if (status) {
      requests = db.find('roleRequests', r => r.status === status.toUpperCase());
    } else {
      requests = db.find('roleRequests');
    }

    res.json(requests);
  } catch (error) {
    console.error('Get role requests error:', error);
    res.status(500).json({ error: 'Failed to fetch role requests.' });
  }
};

/**
 * Get the current user's own role requests
 */
exports.getMyRoleRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = db.find('roleRequests', r => r.userId === userId);
    res.json(requests);
  } catch (error) {
    console.error('Get my role requests error:', error);
    res.status(500).json({ error: 'Failed to fetch your role requests.' });
  }
};

/**
 * Approve or Reject a role request
 * SECURITY: Only organizers/admins can approve. Users CANNOT approve their own requests.
 */
exports.reviewRoleRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, reviewNotes } = req.body; // action: 'approve' or 'reject'
    const reviewerId = req.user.id;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: "Action must be 'approve' or 'reject'." });
    }

    const roleRequest = db.findById('roleRequests', requestId);
    if (!roleRequest) {
      return res.status(404).json({ error: 'Role request not found.' });
    }

    if (roleRequest.status !== 'PENDING') {
      return res.status(409).json({ error: `This request has already been ${roleRequest.status.toLowerCase()}.` });
    }

    // SECURITY: Prevent self-approval
    if (roleRequest.userId === reviewerId) {
      console.warn(`[SECURITY] User ${reviewerId} attempted to approve their own role request ${requestId}.`);
      return res.status(403).json({ error: 'You cannot approve your own role request.' });
    }

    if (action === 'approve') {
      // Grant the role to the user
      const targetUser = db.findById('users', roleRequest.userId);
      if (targetUser) {
        const currentRoles = Array.isArray(targetUser.assignedRoles)
          ? targetUser.assignedRoles
          : [targetUser.role || 'participant'];

        if (!currentRoles.includes(roleRequest.requestedRole)) {
          currentRoles.push(roleRequest.requestedRole);
        }

        db.updateById('users', targetUser.id, {
          assignedRoles: currentRoles,
          // Optionally set active role to the newly approved one
          role: roleRequest.requestedRole,
        });
      }

      db.updateById('roleRequests', requestId, {
        status: 'APPROVED',
        reviewedBy: reviewerId,
        reviewedByEmail: req.user.email,
        reviewedAt: new Date().toISOString(),
        reviewNotes: reviewNotes || 'Approved.',
      });

      res.json({
        success: true,
        message: `Role '${roleRequest.requestedRole}' has been granted to ${roleRequest.userName || roleRequest.userEmail}.`,
      });
    } else {
      // Reject
      db.updateById('roleRequests', requestId, {
        status: 'REJECTED',
        reviewedBy: reviewerId,
        reviewedByEmail: req.user.email,
        reviewedAt: new Date().toISOString(),
        reviewNotes: reviewNotes || 'Request rejected.',
      });

      res.json({
        success: true,
        message: `Role request for '${roleRequest.requestedRole}' by ${roleRequest.userName} has been rejected.`,
      });
    }
  } catch (error) {
    console.error('Review role request error:', error);
    res.status(500).json({ error: 'Failed to review role request.' });
  }
};
