const db = require('../config/db');

exports.getStats = (req, res) => {
  try {
    const teams = db.find('teams');
    const total = teams.length;
    const present = teams.filter(t => t.checkedIn).length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    res.json({
      total,
      present,
      pending: total - present,
      percentage,
      roster: teams
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance stats.' });
  }
};

exports.scanQr = (req, res) => {
  try {
    const { teamId, badgeCode } = req.body;
    let target = null;

    if (teamId) {
      target = db.findById('teams', teamId);
    } else if (badgeCode) {
      target = db.findOne('teams', t => t.name.toLowerCase() === badgeCode.toLowerCase());
    }

    if (!target) {
      // Pick first unchecked team
      target = db.findOne('teams', t => !t.checkedIn) || db.find('teams')[0];
    }

    if (!target) {
      return res.status(404).json({ error: 'No teams available for check-in.' });
    }

    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = db.updateById('teams', target.id, {
      checkedIn: true,
      checkInTime,
    });

    res.json({
      success: true,
      message: `Team ${updated.name} checked in successfully.`,
      team: updated,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process QR scan.' });
  }
};
