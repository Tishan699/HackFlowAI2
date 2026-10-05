const db = require('../config/db');
const { analyzeJudgeApplication } = require('../utils/aiJudgeEvaluator');
const { analyzeCodeSnippet } = require('../utils/aiCodeAnalyzer');
const { sendJudgeInvitationEmail, sendJudgeApplicationStatusEmail } = require('../utils/mailer');

/**
 * 1. Get All Active Judges (Optional filter by hackathonId)
 */
exports.getJudges = (req, res) => {
  try {
    const { hackathonId } = req.query;
    let judges = db.find('judges');

    if (hackathonId) {
      judges = judges.filter(j => !j.hackathonId || String(j.hackathonId) === String(hackathonId));
    }

    res.json(judges);
  } catch (error) {
    console.error('Failed to fetch judges:', error);
    res.status(500).json({ error: 'Failed to fetch judges.' });
  }
};

/**
 * 2. Get Judge by ID
 */
exports.getJudgeById = (req, res) => {
  try {
    const judge = db.findById('judges', req.params.id);
    if (!judge) {
      return res.status(404).json({ error: 'Judge not found.' });
    }
    res.json(judge);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve judge.' });
  }
};

/**
 * 3. Submit Judge Application (User Application Workflow)
 * Any authenticated participant can submit an application for an event
 */
exports.applyForJudge = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required to apply.' });
    }

    const {
      hackathonId = '1',
      experienceYears,
      organization,
      title,
      expertise,
      linkedinUrl,
      portfolioUrl,
      previousJudging,
      reason
    } = req.body;

    if (!organization || !title || !expertise) {
      return res.status(400).json({ error: 'Organization, professional title, and areas of expertise are required.' });
    }

    // Lookup hackathon title
    const hackathon = db.findById('hackathons', hackathonId);
    const hackathonTitle = hackathon ? hackathon.title : 'TechFest Sri Lanka 2026';

    // Prevent duplicate pending applications for the same hackathon
    const existing = db.findOne('judgeApplications', a => 
      (a.userId === user.id || a.email.toLowerCase() === user.email.toLowerCase()) &&
      String(a.hackathonId) === String(hackathonId) &&
      a.status === 'PENDING'
    );

    if (existing) {
      return res.status(400).json({
        error: 'You already have a pending judge application for this hackathon under review.'
      });
    }

    // Run AI Evaluation Assistant to evaluate credentials and generate recommendation scorecard
    const aiEvaluation = analyzeJudgeApplication({
      name: user.name,
      experienceYears,
      title,
      organization,
      expertise,
      previousJudging,
      linkedinUrl,
      portfolioUrl,
      reason,
      hackathonTitle
    });

    const newApplication = db.insert('judgeApplications', {
      userId: user.id,
      name: user.name,
      email: user.email.toLowerCase(),
      hackathonId: String(hackathonId),
      hackathonTitle,
      experienceYears: Number(experienceYears) || 0,
      organization,
      title,
      expertise,
      linkedinUrl: linkedinUrl || '',
      portfolioUrl: portfolioUrl || '',
      previousJudging: previousJudging || '',
      reason: reason || '',
      status: 'PENDING',
      aiEvaluation,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Judge application submitted successfully. The event organizer will review your profile.',
      application: newApplication
    });
  } catch (error) {
    console.error('Judge application error:', error);
    res.status(500).json({ error: 'Failed to submit judge application.' });
  }
};

/**
 * 4. Get Judge Applications (Organizer Review Portal)
 */
exports.getApplications = (req, res) => {
  try {
    const { hackathonId } = req.query;
    let applications = db.find('judgeApplications');

    if (hackathonId) {
      applications = applications.filter(a => String(a.hackathonId) === String(hackathonId));
    }

    // Sort newest first
    applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(applications);
  } catch (error) {
    console.error('Failed to get applications:', error);
    res.status(500).json({ error: 'Failed to retrieve judge applications.' });
  }
};

/**
 * 5. Review Application (Organizer Approves or Rejects)
 * When approved: user receives role = 'JUDGE' for that hackathon in hackathonMembers
 */
exports.reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, notes } = req.body; // 'APPROVE' or 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be APPROVE or REJECT.' });
    }

    const application = db.findById('judgeApplications', id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const isApproved = decision === 'APPROVE';
    const newStatus = isApproved ? 'APPROVED' : 'REJECTED';

    // Update Application
    const updatedApp = db.updateById('judgeApplications', id, {
      status: newStatus,
      reviewedBy: req.user ? req.user.id : 'u_organizer',
      reviewedByEmail: req.user ? req.user.email : 'john@hackflow.dev',
      reviewedAt: new Date().toISOString(),
      reviewNotes: notes || (isApproved ? 'Approved by organizing committee.' : 'Application not accepted for this event.')
    });

    if (isApproved) {
      // 1. Assign Role in hackathonMembers
      const existingMember = db.findOne('hackathonMembers', hm =>
        (hm.userId === application.userId || hm.userEmail.toLowerCase() === application.email.toLowerCase()) &&
        String(hm.hackathonId) === String(application.hackathonId)
      );

      if (existingMember) {
        db.updateById('hackathonMembers', existingMember.id, {
          role: 'JUDGE',
          status: 'ACTIVE',
          source: 'APPROVED_APPLICATION',
          updatedAt: new Date().toISOString()
        });
      } else {
        db.insert('hackathonMembers', {
          hackathonId: String(application.hackathonId),
          userId: application.userId,
          userEmail: application.email,
          userName: application.name,
          role: 'JUDGE',
          status: 'ACTIVE',
          source: 'APPROVED_APPLICATION',
          createdAt: new Date().toISOString()
        });
      }

      // 2. Add to Judges directory roster if not already present
      const existingJudge = db.findOne('judges', j =>
        (j.email && j.email.toLowerCase() === application.email.toLowerCase()) ||
        (j.name && j.name.toLowerCase() === application.name.toLowerCase())
      );

      if (!existingJudge) {
        db.insert('judges', {
          name: application.name,
          role: `${application.title || 'Expert Judge'} at ${application.organization || 'Tech Industry'}`,
          expertise: application.expertise || 'Fullstack & Architecture',
          assignedSubmissions: 4,
          completedEvaluations: 0,
          avatar: application.name.slice(0, 2).toUpperCase(),
          email: application.email,
          userId: application.userId,
          hackathonId: application.hackathonId,
        });
      }
    }

    // 3. Dispatch Notification Email
    await sendJudgeApplicationStatusEmail({
      to: application.email,
      applicantName: application.name,
      hackathonTitle: application.hackathonTitle || 'Hackathon',
      decision,
      notes
    });

    res.json({
      success: true,
      message: isApproved ? 'Judge approved and granted judging authority for this hackathon.' : 'Judge application rejected.',
      application: updatedApp
    });
  } catch (error) {
    console.error('Review application error:', error);
    res.status(500).json({ error: 'Failed to process application review.' });
  }
};

/**
 * 6. Send Direct Judge Invitation (Organizer Invites Judge by Email)
 */
exports.inviteJudge = async (req, res) => {
  try {
    const {
      email,
      hackathonId = '1',
      judgeName,
      roleDescription,
      expertise,
      personalMessage
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Judge email address is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const hackathon = db.findById('hackathons', hackathonId);
    const hackathonTitle = hackathon ? hackathon.title : 'TechFest Sri Lanka 2026';

    const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const invitation = db.insert('judgeInvitations', {
      hackathonId: String(hackathonId),
      hackathonTitle,
      email: normalizedEmail,
      judgeName: judgeName || 'Invited Judge',
      roleDescription: roleDescription || 'Distinguished Technical Judge',
      expertise: expertise || 'Technical Architecture & Innovation',
      invitedBy: req.user ? req.user.id : 'u_organizer',
      invitedByEmail: req.user ? req.user.email : 'john@hackflow.dev',
      personalMessage: personalMessage || '',
      token,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Dispatch Invitation Email
    await sendJudgeInvitationEmail({
      to: normalizedEmail,
      judgeName: judgeName || 'Distinguished Judge',
      hackathonTitle,
      organizerName: req.user ? req.user.name : 'Event Organizer',
      inviteToken: token,
      personalMessage
    });

    res.status(201).json({
      success: true,
      message: `Invitation successfully dispatched to ${normalizedEmail}.`,
      invitation
    });
  } catch (error) {
    console.error('Invite judge error:', error);
    res.status(500).json({ error: 'Failed to dispatch judge invitation.' });
  }
};

/**
 * 7. Accept Judge Invitation
 */
exports.acceptInvitation = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Invitation token is required.' });
    }

    const invitation = db.findOne('judgeInvitations', i => i.token === token && i.status === 'PENDING');
    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired judge invitation token.' });
    }

    const user = req.user;
    if (!user) {
      return res.status(200).json({
        requiresLogin: true,
        message: 'Please sign in or create an account with this email to activate your judge privileges.',
        invitation: {
          email: invitation.email,
          hackathonTitle: invitation.hackathonTitle,
          hackathonId: invitation.hackathonId,
        }
      });
    }

    // Update invitation status
    db.updateById('judgeInvitations', invitation.id, {
      status: 'ACCEPTED',
      acceptedBy: user.id,
      acceptedAt: new Date().toISOString()
    });

    // Assign role = 'JUDGE' for this hackathon
    const existingMember = db.findOne('hackathonMembers', hm =>
      (hm.userId === user.id || hm.userEmail.toLowerCase() === user.email.toLowerCase()) &&
      String(hm.hackathonId) === String(invitation.hackathonId)
    );

    if (existingMember) {
      db.updateById('hackathonMembers', existingMember.id, {
        role: 'JUDGE',
        status: 'ACTIVE',
        source: 'ORGANIZER_INVITE',
        updatedAt: new Date().toISOString()
      });
    } else {
      db.insert('hackathonMembers', {
        hackathonId: String(invitation.hackathonId),
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        role: 'JUDGE',
        status: 'ACTIVE',
        source: 'ORGANIZER_INVITE',
        createdAt: new Date().toISOString()
      });
    }

    // Add to Judges roster
    const existingJudge = db.findOne('judges', j =>
      (j.email && j.email.toLowerCase() === user.email.toLowerCase()) ||
      (j.name && j.name.toLowerCase() === user.name.toLowerCase())
    );

    if (!existingJudge) {
      db.insert('judges', {
        name: user.name,
        role: invitation.roleDescription || 'Distinguished Judge',
        expertise: invitation.expertise || 'Technical Evaluation',
        assignedSubmissions: 5,
        completedEvaluations: 0,
        avatar: user.name.slice(0, 2).toUpperCase(),
        email: user.email,
        userId: user.id,
        hackathonId: invitation.hackathonId,
      });
    }

    res.json({
      success: true,
      message: `Congratulations! You are now an official Judge for ${invitation.hackathonTitle}.`,
      hackathonId: invitation.hackathonId
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Failed to accept invitation.' });
  }
};

/**
 * 8. Get Logged-in User's Judge Status & Applications
 */
exports.getMyStatus = (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const applications = db.find('judgeApplications', a => 
      a.userId === user.id || (user.email && a.email.toLowerCase() === user.email.toLowerCase())
    );

    const memberships = db.find('hackathonMembers', hm => 
      (hm.userId === user.id || (user.email && hm.userEmail.toLowerCase() === user.email.toLowerCase())) &&
      hm.role === 'JUDGE' && hm.status === 'ACTIVE'
    );

    const pendingInvitations = db.find('judgeInvitations', i => 
      user.email && i.email.toLowerCase() === user.email.toLowerCase() && i.status === 'PENDING'
    );

    res.json({
      isJudge: memberships.length > 0 || user.role === 'judge',
      applications,
      memberships,
      pendingInvitations
    });
  } catch (error) {
    console.error('Get judge status error:', error);
    res.status(500).json({ error: 'Failed to retrieve judge status.' });
  }
};

/**
 * 9. AI Submission Code Analysis & AI-Generated Code Detector
 * Analyzes raw code or project submissions for judges
 */
exports.analyzeCode = async (req, res) => {
  try {
    const { code, filename = 'submission_code.js', language = 'javascript', submissionId } = req.body;

    let targetCode = code;
    let targetFilename = filename;
    let targetLanguage = language;
    let submissionContext = {};

    // If submissionId is provided, pull info from database
    if (submissionId) {
      const project = db.findById('projects', submissionId);
      if (project) {
        submissionContext = {
          title: project.title,
          teamName: project.teamName,
          githubUrl: project.githubUrl,
          techStack: project.techStack
        };

        if (!targetCode) {
          // If no raw code was pasted, synthesize sample code context from project tech stack and description
          const stack = Array.isArray(project.techStack) ? project.techStack : ['React', 'Node.js'];
          targetCode = `/**\n * HackFlow Project: ${project.title}\n * Team: ${project.teamName || 'Hackers'}\n * Tech Stack: ${stack.join(', ')}\n * Description: ${project.description || ''}\n */\n\n// Step 1: Initialize main service pipeline\nasync function handleSubmissionWorkflow(payload) {\n  // Validate input request\n  if (!payload || !payload.data) {\n    return { success: false, error: "Invalid payload provided" };\n  }\n\n  // Process core domain telemetry\n  try {\n    const processedResult = await executeModelInference(payload.data);\n    return {\n      status: 200,\n      body: processedResult,\n      timestamp: new Date().toISOString()\n    };\n  } catch (error) {\n    console.error("Error occurred while processing:", error);\n    return { success: false, message: error.message };\n  }\n}\n\nmodule.exports = { handleSubmissionWorkflow };`;
          targetFilename = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_main.js`;
        }
      }
    }

    if (!targetCode || !targetCode.trim()) {
      return res.status(400).json({ error: 'Code content or submissionId is required for analysis.' });
    }

    const analysis = analyzeCodeSnippet({
      code: targetCode,
      filename: targetFilename,
      language: targetLanguage,
      submissionContext
    });

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('AI code analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze code submission.' });
  }
};

