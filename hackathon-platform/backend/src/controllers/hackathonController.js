const db = require('../config/db');
const { isSensitiveField, analyzeEventChange } = require('../utils/aiEventChangeAnalyzer');

/**
 * Helper to determine if the requesting user owns/organizes the event
 */
function isUserEventOrganizer(user, hackathon) {
  if (!user || !hackathon) return false;
  if (user.role === 'admin') return true;

  const matchesId = hackathon.organizerId && String(hackathon.organizerId) === String(user.id);
  const matchesEmail = hackathon.organizerEmail && hackathon.organizerEmail.toLowerCase() === user.email?.toLowerCase();
  const matchesName = user.name && hackathon.organizer && hackathon.organizer.toLowerCase().includes(user.name.toLowerCase());
  const matchesOrg = user.organization && hackathon.organizer && hackathon.organizer.toLowerCase().includes(user.organization.toLowerCase());

  return !!(matchesId || matchesEmail || matchesName || matchesOrg);
}

/**
 * 1. Get All Hackathons (Supports scope=my_events, state filters)
 */
exports.getAll = (req, res) => {
  try {
    let hackathons = db.find('hackathons');
    const { scope, organizerId, state } = req.query;

    if (scope === 'my_events' && req.user) {
      hackathons = hackathons.filter(h => isUserEventOrganizer(req.user, h));
    } else if (organizerId) {
      hackathons = hackathons.filter(h => String(h.organizerId) === String(organizerId));
    }

    if (state) {
      hackathons = hackathons.filter(h => (h.eventState || 'PUBLISHED').toUpperCase() === state.toUpperCase());
    }

    const enriched = hackathons.map(h => {
      const isOwner = isUserEventOrganizer(req.user, h);
      return {
        ...h,
        eventState: h.eventState || (h.status === 'Draft' ? 'DRAFT' : 'PUBLISHED'),
        isOwner,
        canEdit: isOwner && (req.user?.role === 'organizer' || req.user?.role === 'admin')
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error('Error in getAll hackathons:', error);
    res.status(500).json({ error: 'Failed to fetch hackathons.' });
  }
};

/**
 * 2. Get Single Hackathon by ID
 */
exports.getById = (req, res) => {
  try {
    const hackathon = db.findById('hackathons', req.params.id);
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found.' });
    }

    const isOwner = isUserEventOrganizer(req.user, hackathon);

    res.json({
      ...hackathon,
      eventState: hackathon.eventState || (hackathon.status === 'Draft' ? 'DRAFT' : 'PUBLISHED'),
      isOwner,
      canEdit: isOwner && (req.user?.role === 'organizer' || req.user?.role === 'admin')
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve hackathon.' });
  }
};

/**
 * 3. Create Hackathon (Supports DRAFT or PUBLISHED states)
 */
exports.create = (req, res) => {
  try {
    const {
      title,
      category,
      date,
      startDate,
      endDate,
      registrationDeadline,
      prizePool,
      entryFee,
      location,
      tagline,
      description,
      maxTeams,
      rules,
      timeline,
      prizes,
      tracks,
      contactEmail,
      eventState = 'PUBLISHED',
      badge
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Hackathon title is required.' });
    }

    const organizerId = req.user?.id || 'u_organizer';
    const organizerEmail = req.user?.email || 'john@hackflow.dev';
    const organizerName = req.user?.organization || req.user?.name || 'HackFlow Organizer';

    const normalizedState = ['DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN'].includes(eventState.toUpperCase())
      ? eventState.toUpperCase()
      : 'PUBLISHED';

    const newHackathon = db.insert('hackathons', {
      title,
      category: category || 'AI & Machine Learning',
      date: date || 'TBD',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '',
      registrationDeadline: registrationDeadline || '',
      prizePool: prizePool || '$10,000',
      entryFee: entryFee || 'Free',
      location: location || 'Hybrid',
      tagline: tagline || 'Build the future of technology with AI',
      description: description || 'Join international builders for an intense competition sprint.',
      participants: 0,
      maxTeams: Number(maxTeams) || 100,
      eventState: normalizedState,
      status: normalizedState === 'DRAFT' ? 'Draft' : 'Active',
      badge: badge || (normalizedState === 'DRAFT' ? 'Draft Mode' : 'Registration Open'),
      organizerId,
      organizerEmail,
      organizer: organizerName,
      contactEmail: contactEmail || organizerEmail,
      tracks: Array.isArray(tracks) ? tracks : ['AI & Machine Learning', 'Cloud Architecture', 'Social Impact'],
      rules: Array.isArray(rules) && rules.length > 0 ? rules : [
        'Teams can have 2 to 4 members.',
        'All code must be written during the competition period.',
        'Projects must include a working repository and video demo.'
      ],
      timeline: Array.isArray(timeline) && timeline.length > 0 ? timeline : [
        { step: 'Registration Opens', date: 'Now', done: true },
        { step: 'Hack Kickoff', date: date || 'Day 1', done: false },
        { step: 'Project Submissions Deadline', date: 'Final Day', done: false },
        { step: 'Awards Ceremony', date: 'Final Day, Evening', done: false }
      ],
      prizes: Array.isArray(prizes) && prizes.length > 0 ? prizes : [
        { place: 'Grand Champion (1st Place)', reward: `${prizePool || '$10,000'} + Cloud Credits` },
        { place: 'Runner Up (2nd Place)', reward: '$3,000 Cash' },
        { place: 'Best Technical Innovation', reward: '$1,500 Special Award' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Automatically register creator in hackathonMembers as ORGANIZER
    const existingMember = db.findOne('hackathonMembers', hm => hm.hackathonId === String(newHackathon.id) && hm.userId === organizerId);
    if (!existingMember) {
      db.insert('hackathonMembers', {
        hackathonId: String(newHackathon.id),
        userId: organizerId,
        userEmail: organizerEmail,
        userName: organizerName,
        role: 'ORGANIZER',
        status: 'ACTIVE',
        source: 'CREATOR',
        createdAt: new Date().toISOString()
      });
    }

    res.status(201).json({
      ...newHackathon,
      isOwner: true,
      canEdit: true
    });
  } catch (error) {
    console.error('Error creating hackathon:', error);
    res.status(500).json({ error: 'Failed to create hackathon.' });
  }
};

/**
 * 4. Update Hackathon with FIELD-LEVEL RESTRICTIONS & CHANGE APPROVAL WORKFLOW
 */
exports.update = (req, res) => {
  try {
    const hackathon = db.findById('hackathons', req.params.id);
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found.' });
    }

    // ENFORCE MULTI-ORGANIZER PERMISSION
    const isOwner = isUserEventOrganizer(req.user, hackathon);
    if (!isOwner) {
      return res.status(403).json({
        error: `Access Denied: Only the assigned organizer (${hackathon.organizer || 'Event Owner'}) can modify event details.`
      });
    }

    const currentEventState = (hackathon.eventState || 'PUBLISHED').toUpperCase();

    // COMPLETED STATE: Read-only
    if (currentEventState === 'COMPLETED') {
      return res.status(403).json({
        error: 'Event is COMPLETED and locked in read-only archive mode. No further modifications permitted.'
      });
    }

    const participantsCount = hackathon.participants || 0;
    const isDraft = currentEventState === 'DRAFT';
    const hasRegisteredParticipants = participantsCount > 0 && !isDraft;

    const incomingData = { ...req.body };

    // Strip strictly immutable fields
    delete incomingData.id;
    delete incomingData.organizerId;
    delete incomingData.organizerEmail;
    delete incomingData.participants;

    const directUpdates = {};
    const pendingChanges = [];
    const autoAppliedChanges = [];

    // Evaluate each field
    for (const [field, newVal] of Object.entries(incomingData)) {
      if (newVal === undefined) continue;

      const oldVal = hackathon[field];

      // Check if value actually changed
      const isDifferent = JSON.stringify(oldVal) !== JSON.stringify(newVal);
      if (!isDifferent) continue;

      // SENSITIVE FIELD CHECK:
      // If participants have registered and event is published, sensitive fields trigger an Approval Request!
      if (hasRegisteredParticipants && isSensitiveField(field)) {
        const aiAnalysis = analyzeEventChange({
          field,
          beforeValue: oldVal,
          afterValue: newVal,
          participantsCount,
          eventTitle: hackathon.title
        });

        const changeRecord = db.insert('eventChangeHistory', {
          hackathonId: String(hackathon.id),
          hackathonTitle: hackathon.title,
          organizerId: req.user ? req.user.id : hackathon.organizerId,
          organizerName: req.user ? req.user.name : hackathon.organizer,
          field,
          beforeValue: oldVal,
          afterValue: newVal,
          reason: req.body.changeReason || 'Organizer submitted event modification',
          status: 'PENDING_APPROVAL',
          aiAnalysis,
          changedAt: new Date().toISOString()
        });

        pendingChanges.push(changeRecord);
      } else {
        // Non-sensitive field OR draft event with 0 participants: Auto-apply
        directUpdates[field] = newVal;

        const changeRecord = db.insert('eventChangeHistory', {
          hackathonId: String(hackathon.id),
          hackathonTitle: hackathon.title,
          organizerId: req.user ? req.user.id : hackathon.organizerId,
          organizerName: req.user ? req.user.name : hackathon.organizer,
          field,
          beforeValue: oldVal,
          afterValue: newVal,
          reason: req.body.changeReason || 'Direct update',
          status: 'AUTO_APPLIED',
          changedAt: new Date().toISOString()
        });

        autoAppliedChanges.push(changeRecord);
      }
    }

    // Apply direct updates to database
    let updatedHackathon = hackathon;
    if (Object.keys(directUpdates).length > 0) {
      directUpdates.updatedAt = new Date().toISOString();
      updatedHackathon = db.updateById('hackathons', req.params.id, directUpdates);
    }

    const requiresApproval = pendingChanges.length > 0;

    let responseMessage = 'Hackathon details updated successfully.';
    if (requiresApproval && autoAppliedChanges.length > 0) {
      responseMessage = `Operational details updated. However, ${pendingChanges.length} sensitive change(s) (e.g. Prize Pool / Schedule) require Platform Admin approval due to active participant registrations.`;
    } else if (requiresApproval) {
      responseMessage = `Modifying sensitive parameters (e.g. Prize Pool or Dates) after registrations have begun requires Platform Admin approval. A change request has been submitted.`;
    }

    res.json({
      success: true,
      message: responseMessage,
      requiresApproval,
      pendingChanges,
      autoAppliedChanges,
      hackathon: {
        ...updatedHackathon,
        isOwner: true,
        canEdit: true
      }
    });
  } catch (error) {
    console.error('Error updating hackathon:', error);
    res.status(500).json({ error: 'Failed to update hackathon.' });
  }
};

/**
 * 5. Update Event Lifecycle State (State Machine)
 * States: DRAFT -> PUBLISHED / REGISTRATION_OPEN -> REGISTRATION_CLOSED -> ONGOING -> COMPLETED
 */
exports.updateState = (req, res) => {
  try {
    const { id } = req.params;
    const { eventState } = req.body;

    const hackathon = db.findById('hackathons', id);
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found.' });
    }

    const isOwner = isUserEventOrganizer(req.user, hackathon);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access Denied: Only event organizers can transition event states.' });
    }

    const ALLOWED_STATES = ['DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED'];
    const normalizedState = (eventState || '').toUpperCase();

    if (!ALLOWED_STATES.includes(normalizedState)) {
      return res.status(400).json({ error: `Invalid state. Allowed states: ${ALLOWED_STATES.join(', ')}` });
    }

    const oldState = hackathon.eventState || 'PUBLISHED';

    let badgeText = 'Active';
    if (normalizedState === 'DRAFT') badgeText = 'Draft Mode';
    else if (normalizedState === 'REGISTRATION_CLOSED') badgeText = 'Registration Closed';
    else if (normalizedState === 'ONGOING') badgeText = 'Hack in Progress';
    else if (normalizedState === 'COMPLETED') badgeText = 'Event Finished';
    else badgeText = 'Registration Open';

    const updated = db.updateById('hackathons', id, {
      eventState: normalizedState,
      status: normalizedState === 'DRAFT' ? 'Draft' : normalizedState === 'COMPLETED' ? 'Completed' : 'Active',
      badge: badgeText,
      updatedAt: new Date().toISOString()
    });

    // Record state change in audit trail
    db.insert('eventChangeHistory', {
      hackathonId: String(hackathon.id),
      hackathonTitle: hackathon.title,
      organizerId: req.user ? req.user.id : hackathon.organizerId,
      organizerName: req.user ? req.user.name : hackathon.organizer,
      field: 'eventState',
      beforeValue: oldState,
      afterValue: normalizedState,
      reason: `Event state transition to ${normalizedState}`,
      status: 'AUTO_APPLIED',
      changedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `Event transitioned to ${normalizedState}.`,
      eventState: updated.eventState,
      status: updated.status,
      badge: updated.badge,
      hackathon: {
        ...updated,
        isOwner: true,
        canEdit: true
      }
    });
  } catch (error) {
    console.error('Error updating event state:', error);
    res.status(500).json({ error: 'Failed to update event state.' });
  }
};

/**
 * 6. Get Event Change History & Audit Log
 */
exports.getChangeHistory = (req, res) => {
  try {
    const { id } = req.params;
    let history = db.find('eventChangeHistory', ch => String(ch.hackathonId) === String(id));
    history.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
    res.json(history);
  } catch (error) {
    console.error('Error getting change history:', error);
    res.status(500).json({ error: 'Failed to fetch change history.' });
  }
};

/**
 * 7. Get All Pending Sensitive Changes (Platform Admin Review Queue)
 */
exports.getPendingChanges = (req, res) => {
  try {
    let pending = db.find('eventChangeHistory', ch => ch.status === 'PENDING_APPROVAL');
    pending.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
    res.json(pending);
  } catch (error) {
    console.error('Error getting pending changes:', error);
    res.status(500).json({ error: 'Failed to fetch pending change requests.' });
  }
};

/**
 * 8. Review Sensitive Change Request (Platform Admin Approves or Rejects)
 */
exports.reviewChange = (req, res) => {
  try {
    const { changeId } = req.params;
    const { decision, notes } = req.body; // 'APPROVE'/'APPROVED' or 'REJECT'/'REJECTED'

    const normalizedDecision = String(decision || '').toUpperCase();
    if (!['APPROVE', 'APPROVED', 'REJECT', 'REJECTED'].includes(normalizedDecision)) {
      return res.status(400).json({ error: 'Decision must be APPROVE or REJECT.' });
    }

    const change = db.findById('eventChangeHistory', changeId);
    if (!change) {
      return res.status(404).json({ error: 'Change request not found.' });
    }

    const isApproved = normalizedDecision.startsWith('APPROV');
    const newStatus = isApproved ? 'APPROVED' : 'REJECTED';

    const updatedChange = db.updateById('eventChangeHistory', changeId, {
      status: newStatus,
      reviewedBy: req.user ? req.user.name || req.user.id : 'Platform Admin',
      reviewedAt: new Date().toISOString(),
      reviewNotes: notes || (isApproved ? 'Approved by platform administrator.' : 'Rejected by platform administrator.')
    });

    // If approved, commit the pending sensitive field value to the hackathon
    if (isApproved) {
      const hackathon = db.findById('hackathons', change.hackathonId);
      if (hackathon) {
        db.updateById('hackathons', hackathon.id, {
          [change.field]: change.afterValue,
          updatedAt: new Date().toISOString()
        });
      }
    }

    res.json({
      success: true,
      message: isApproved ? `Change for ${change.field} approved and applied to competition.` : `Change for ${change.field} rejected.`,
      change: updatedChange
    });
  } catch (error) {
    console.error('Error reviewing change request:', error);
    res.status(500).json({ error: 'Failed to process change review.' });
  }
};

/**
 * 9. Delete Hackathon
 */
exports.delete = (req, res) => {
  try {
    const hackathon = db.findById('hackathons', req.params.id);
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found.' });
    }

    const isOwner = isUserEventOrganizer(req.user, hackathon);
    if (!isOwner) {
      return res.status(403).json({
        error: `Access Denied: You do not have permission to delete this event. Only the assigned organizer can delete it.`
      });
    }

    db.deleteById('hackathons', req.params.id);
    res.json({ success: true, message: 'Hackathon removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete hackathon.' });
  }
};
