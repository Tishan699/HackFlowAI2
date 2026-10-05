const db = require('../config/db');

exports.getMentors = (req, res) => {
  try {
    const mentors = db.find('mentors');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentors.' });
  }
};

exports.bookSession = (req, res) => {
  try {
    const { mentorId, slot, teamName } = req.body;
    const mentor = db.findById('mentors', mentorId);
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found.' });
    }

    const booking = db.insert('mentorBookings', {
      mentorId,
      mentorName: mentor.name,
      slot: slot || 'Next Available Slot',
      teamName: teamName || 'Team Innovator',
      bookedAt: new Date().toISOString(),
      status: 'Confirmed'
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to book mentorship session.' });
  }
};
