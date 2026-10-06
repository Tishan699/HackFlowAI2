const db = require('../config/db');
const { analyzeOrganizerApplication } = require('../utils/aiOrganizerEvaluator');

/**
 * 1. Submit Organizer Application (Participant -> Verified Organizer Workflow)
 */
exports.applyForOrganizer = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required to apply.' });
    }

    const {
      organizationName,
      proposedEventTitle,
      eventCategory,
      proposedDates,
      prizeBudget,
      website,
      officialEmail,
      contactPhone,
      pastEvents,
      proposal,
      estimatedParticipants
    } = req.body;

    if (!organizationName || !proposal) {
      return res.status(400).json({ error: 'Organization name and event proposal description are required.' });
    }

    // Check if user already has organizer role — no need to re-apply
    if (user.role === 'organizer' || user.role === 'admin') {
      return res.status(409).json({ error: 'You already have organizer access.' });
    }

    // Check for any existing non-rejected application
    const existing = db.findOne('organizerApplications', a =>
      (a.userId === user.id || (user.email && a.email?.toLowerCase() === user.email.toLowerCase())) &&
      ['PENDING', 'APPROVED'].includes(a.status)
    );

    if (existing) {
      return res.status(400).json({
        error: 'You already have an organizer application on record.',
        application: existing
      });
    }

    // Run AI Evaluation Assistant for Host Verification
    const aiEvaluation = analyzeOrganizerApplication({
      organizationName,
      proposedEventTitle: proposedEventTitle || '',
      eventCategory: eventCategory || 'AI & Machine Learning',
      proposedDates: proposedDates || '',
      prizeBudget: prizeBudget || '',
      officialEmail: officialEmail || user.email,
      website: website || '',
      pastEvents: pastEvents || '',
      proposal,
      estimatedParticipants: Number(estimatedParticipants) || 100
    });

    // ─── AUTO-APPROVE: Grant organizer role immediately on application ───────
    const existingUser = db.findById('users', user.id);
    if (existingUser) {
      const currentRoles = Array.isArray(existingUser.assignedRoles)
        ? existingUser.assignedRoles
        : [existingUser.role || 'participant'];

      if (!currentRoles.includes('organizer')) {
        currentRoles.push('organizer');
      }

      db.updateById('users', user.id, {
        role: 'organizer',
        assignedRoles: currentRoles,
        isOrganizerVerified: true,
        organization: organizationName,
        updatedAt: new Date().toISOString(),
      });
    }
    // ────────────────────────────────────────────────────────────────────────

    const newApp = db.insert('organizerApplications', {
      userId: user.id,
      name: user.name,
      email: (officialEmail || user.email).toLowerCase(),
      organizationName,
      proposedEventTitle: proposedEventTitle || 'Untitled Hackathon Proposal',
      eventCategory: eventCategory || 'AI & Machine Learning',
      proposedDates: proposedDates || 'TBD',
      prizeBudget: prizeBudget || '$10,000',
      website: website || '',
      officialEmail: officialEmail || user.email,
      contactPhone: contactPhone || '',
      pastEvents: pastEvents || '',
      proposal,
      estimatedParticipants: Number(estimatedParticipants) || 100,
      status: 'APPROVED',  // Auto-approved immediately
      autoApproved: true,
      aiEvaluation,
      reviewedAt: new Date().toISOString(),
      reviewNotes: 'Auto-approved on submission.',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      autoApproved: true,
      message: 'Congratulations! Your Organizer application has been approved. You now have full organizer access.',
      application: newApp,
      role: 'organizer',
    });
  } catch (error) {
    console.error('Organizer application error:', error);
    res.status(500).json({ error: 'Failed to submit organizer application.' });
  }
};

/**
 * 2. Get All Organizer Applications (Admin Portal)
 */
exports.getApplications = (req, res) => {
  try {
    const applications = db.find('organizerApplications');
    applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(applications);
  } catch (error) {
    console.error('Error fetching organizer applications:', error);
    res.status(500).json({ error: 'Failed to retrieve organizer applications.' });
  }
};

/**
 * 3. Review Organizer Application (Admin Decision)
 */
exports.reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, notes } = req.body; // 'APPROVE'/'APPROVED' or 'REJECT'/'REJECTED'

    const normalizedDecision = String(decision || '').toUpperCase();
    if (!['APPROVE', 'APPROVED', 'REJECT', 'REJECTED'].includes(normalizedDecision)) {
      return res.status(400).json({ error: 'Decision must be APPROVE or REJECT.' });
    }

    const app = db.findById('organizerApplications', id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const isApproved = normalizedDecision.startsWith('APPROV');
    const newStatus = isApproved ? 'APPROVED' : 'REJECTED';

    const updatedApp = db.updateById('organizerApplications', id, {
      status: newStatus,
      reviewedBy: req.user ? req.user.id : 'u_admin',
      reviewedAt: new Date().toISOString(),
      reviewNotes: notes || (isApproved ? 'Approved by platform administration.' : 'Proposal does not meet hosting criteria.')
    });

    if (isApproved) {
      // Upgrade user role to organizer with verification badge
      const user = db.findById('users', app.userId);
      if (user) {
        db.updateById('users', user.id, {
          role: 'organizer',
          isOrganizerVerified: true,
          organization: app.organizationName,
          updatedAt: new Date().toISOString()
        });
      }
    }

    res.json({
      success: true,
      message: isApproved ? 'Organizer approved! The user has been granted event creation and management privileges.' : 'Application rejected.',
      application: updatedApp
    });
  } catch (error) {
    console.error('Error reviewing organizer application:', error);
    res.status(500).json({ error: 'Failed to review organizer application.' });
  }
};

/**
 * 4. Get Current User's Organizer Application Status
 */
exports.getMyStatus = (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const applications = db.find('organizerApplications', a =>
      a.userId === user.id || (user.email && a.email?.toLowerCase() === user.email.toLowerCase())
    );

    res.json({
      isOrganizer: user.role === 'organizer' || user.role === 'admin',
      isVerified: user.isOrganizerVerified || user.role === 'organizer',
      applications
    });
  } catch (error) {
    console.error('Error getting organizer status:', error);
    res.status(500).json({ error: 'Failed to retrieve organizer status.' });
  }
};
