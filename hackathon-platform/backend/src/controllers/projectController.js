const db = require('../config/db');
const { evaluateProject } = require('../utils/aiEvaluator');

exports.getProjects = (req, res) => {
  try {
    const { hackathonId, teamId } = req.query;
    let projects = db.find('projects');
    if (hackathonId) {
      projects = projects.filter(p => String(p.hackathonId) === String(hackathonId));
    }
    if (teamId) {
      projects = projects.filter(p => String(p.teamId) === String(teamId));
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
};

exports.getProjectById = (req, res) => {
  try {
    const project = db.findById('projects', req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve project.' });
  }
};

exports.uploadFiles = (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded. Please attach at least one file.' });
    }

    const uploaded = files.map(file => {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const sizeKB = (file.size / 1024).toFixed(1);
      const sizeFormatted = file.size >= 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
      const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');

      return {
        id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        sizeFormatted,
        isPdf,
        url: `/uploads/submissions/${file.filename}`
      };
    });

    res.json({
      success: true,
      message: `${uploaded.length} file(s) uploaded successfully (Max 20MB allowed).`,
      files: uploaded
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to process file uploads.' });
  }
};

exports.submitProject = (req, res) => {
  try {
    const {
      title,
      teamName,
      teamId,
      hackathonId,
      description,
      githubUrl,
      demoUrl,
      videoUrl,
      techStack,
      files, // Array of uploaded files (PDFs, ZIPs, diagrams up to 20MB)
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Project title is required.' });
    }

    const parsedStack = Array.isArray(techStack)
      ? techStack
      : typeof techStack === 'string'
      ? techStack.split(',').map(s => s.trim())
      : ['React', 'Node.js', 'AI API'];

    const attachedFiles = Array.isArray(files) ? files : [];

    // Run Automated AI Rubric Evaluation with file awareness
    const aiResults = evaluateProject({
      title,
      description,
      techStack: parsedStack,
      githubUrl,
      demoUrl,
      files: attachedFiles,
    });

    const newProject = db.insert('projects', {
      title,
      teamName: teamName || 'Team Innovator',
      teamId: teamId || 't_general',
      hackathonId: hackathonId || '1',
      description: description || 'Innovative technical solution built during the hackathon.',
      githubUrl: githubUrl || '',
      demoUrl: demoUrl || '',
      videoUrl: videoUrl || '',
      techStack: parsedStack,
      files: attachedFiles,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Evaluated',
      aiScore: aiResults.aiScore,
      aiFeedback: aiResults.aiFeedback,
      judgeScores: aiResults.judgeScores,
      totalScore: aiResults.totalScore,
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Project submission error:', error);
    res.status(500).json({ error: 'Failed to submit project.' });
  }
};

exports.scoreProject = (req, res) => {
  try {
    const { innovation, technicalExecution, design, impact, feedback } = req.body;
    const project = db.findById('projects', req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const inno = Number(innovation) || 9.0;
    const tech = Number(technicalExecution) || 9.0;
    const des = Number(design) || 8.5;
    const imp = Number(impact) || 9.0;

    const totalScore = Math.round(((inno + tech + des + imp) / 4) * 10);

    const updated = db.updateById('projects', req.params.id, {
      judgeScores: {
        innovation: inno,
        technicalExecution: tech,
        design: des,
        impact: imp,
      },
      totalScore,
      judgeFeedback: feedback || project.judgeFeedback,
      judgeId: req.user?.id || 'u_judge',
      judgeName: req.user?.name || 'Verified Judge',
      judgeEmail: req.user?.email || 'judge@hackflow.dev',
      status: 'Evaluated',
      judgedAt: new Date().toISOString(),
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record project score.' });
  }
};

exports.getStats = (req, res) => {
  try {
    const projects = db.find('projects');
    const totalSubmissions = projects.length;
    const averageScore = totalSubmissions > 0
      ? (projects.reduce((acc, p) => acc + (p.totalScore || 0), 0) / totalSubmissions).toFixed(1)
      : 0;

    res.json({
      totalSubmissions,
      averageScore,
      evaluatedCount: projects.filter(p => p.status === 'Evaluated').length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compute stats.' });
  }
};
