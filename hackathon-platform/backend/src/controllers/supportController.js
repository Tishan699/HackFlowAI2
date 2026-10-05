const { findBestSupportAnswer, PLATFORM_KNOWLEDGE } = require('../utils/aiSupportKnowledge');

/**
 * Handle AI Support Assistant Chat Request
 * POST /api/support/chat
 */
exports.handleSupportChat = async (req, res) => {
  try {
    const { message, role = 'participant', currentPath = '/' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Heuristic & Semantic Knowledge Engine
    const analysis = findBestSupportAnswer(message, role, currentPath);

    return res.json({
      success: true,
      query: message,
      reply: analysis.detailedAnswer,
      title: analysis.title,
      category: analysis.category,
      quickSteps: analysis.quickSteps || [],
      actionLinks: analysis.actionLinks || [],
      suggestedQuestions: analysis.suggestedQuestions || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Support Chat Error:', error);
    return res.status(500).json({
      error: 'Failed to process support request',
      message: error.message
    });
  }
};

/**
 * Get Contextual FAQs & Quick Prompts
 * GET /api/support/suggestions
 */
exports.getSupportSuggestions = async (req, res) => {
  try {
    const { role = 'participant', path = '/' } = req.query;

    const quickChips = [
      { label: "🚀 How do I register?", prompt: "How do I register for a hackathon?" },
      { label: "👥 How to form a team?", prompt: "How do I create or join a team?" },
      { label: "💻 How to submit my project?", prompt: "How do I submit my GitHub repository and demo?" },
      { label: "🧠 How does the AI Code Detector work?", prompt: "How does the AI Code Detector work for Judges?" },
      { label: "👨‍🏫 How to connect with Mentors?", prompt: "How do I connect with mentors?" },
      { label: "🏆 How to claim certificates?", prompt: "How do I claim my hackathon certificate?" }
    ];

    const categories = PLATFORM_KNOWLEDGE.map(k => ({
      category: k.category,
      title: k.title,
      summary: k.quickSteps[0] || ""
    }));

    return res.json({
      success: true,
      quickChips,
      categories
    });
  } catch (error) {
    console.error('AI Support Suggestions Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve suggestions' });
  }
};
