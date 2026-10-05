const db = require('../config/db');

exports.getTeams = (req, res) => {
  try {
    const { hackathonId } = req.query;
    let teams = db.find('teams');
    if (hackathonId) {
      teams = teams.filter(t => String(t.hackathonId) === String(hackathonId));
    }
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams.' });
  }
};

exports.getTeamById = (req, res) => {
  try {
    const team = db.findById('teams', req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team.' });
  }
};

exports.createTeam = (req, res) => {
  try {
    const { name, leader, leaderEmail, hackathonId, hackathonTitle, projectTitle } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Team name is required.' });
    }

    const newTeam = db.insert('teams', {
      name,
      leader: leader || req.user?.name || 'Lead Innovator',
      leaderEmail: leaderEmail || req.user?.email || 'leader@example.com',
      hackathonId: hackathonId || '1',
      hackathonTitle: hackathonTitle || 'TechFest Sri Lanka 2026',
      projectTitle: projectTitle || 'Pending Project Definition',
      status: 'Registered',
      checkedIn: false,
      checkInTime: null,
      members: [
        { name: leader || req.user?.name || 'Lead Innovator', role: 'Team Lead' }
      ]
    });

    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team.' });
  }
};

exports.joinTeam = (req, res) => {
  try {
    const { teamId, memberName, role } = req.body;
    const team = db.findById('teams', teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    const members = team.members || [];
    const newMember = {
      name: memberName || req.user?.name || 'Collaborator',
      role: role || 'Developer'
    };

    const updated = db.updateById('teams', teamId, {
      members: [...members, newMember]
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to join team.' });
  }
};

exports.toggleCheckIn = (req, res) => {
  try {
    const team = db.findById('teams', req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    const nextState = !team.checkedIn;
    const checkInTime = nextState
      ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null;

    const updated = db.updateById('teams', req.params.id, {
      checkedIn: nextState,
      checkInTime,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle check-in state.' });
  }
};
