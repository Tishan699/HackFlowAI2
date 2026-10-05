/**
 * AI Support Knowledge Base & Heuristic Assistant Engine for HackFlow AI
 * Provides intelligent, role-aware, step-by-step guidance for participants, judges, mentors, and organizers.
 */

const PLATFORM_KNOWLEDGE = [
  {
    category: "getting-started",
    keywords: ["how to use", "how to start", "guide", "overview", "what is hackflow", "features", "help", "tutorial"],
    title: "Welcome to HackFlow AI - Platform Overview",
    quickSteps: [
      "1. **Explore Hackathons**: Go to the Hackathons tab to find active events and tracks.",
      "2. **Register & Join/Create Teams**: Form a team or join using a 6-character team invite code.",
      "3. **Build & Collaborate**: Work with your teammates and connect with mentors for technical guidance.",
      "4. **Submit Your Project**: Add GitHub repo, live demo URL, video pitch, and tech stack in the Submissions portal.",
      "5. **Judging & Leaderboards**: Get scored on Innovation, Execution, UI/UX, and Impact with automated AI Code validation."
    ],
    actionLinks: [
      { label: "Explore Hackathons", path: "/hackathons" },
      { label: "View Teams", path: "/teams" },
      { label: "Go to Dashboard", path: "/dashboard" }
    ],
    detailedAnswer: `HackFlow AI is an end-to-end intelligent hackathon management platform designed for hackers, judges, mentors, and organizers.

**Key Features:**
- 🚀 **Hackathon Discovery & Registration**: Browse global hackathons with prize pools and timeline tracks.
- 👥 **Team Formation**: Create or join teams with invite codes.
- 💻 **Project Submissions**: Submit repository links, live demos, and project videos.
- 🧠 **AI Code & AI-Generated Detector Lab**: Comprehensive evaluation tool for judges to detect synthetic LLM code and security flaws.
- 👨‍🏫 **Mentor Office Hours**: Real-time 1:1 mentorship and technical guidance.
- 🏆 **Dynamic Rubric Scoring & Certificates**: Automated scoring calculations and verifiable digital certificates.`
  },
  {
    category: "registration",
    keywords: ["register", "sign up", "join hackathon", "how to register", "apply", "enroll"],
    title: "How to Register for a Hackathon",
    quickSteps: [
      "1. Navigate to **Hackathons** from the left sidebar or top navigation.",
      "2. Select an active hackathon card to view prize pools, rules, and tracks.",
      "3. Click the **Register Now** or **Join Hackathon** button.",
      "4. Choose your participation track (e.g., AI/ML, Web3, FinTech, Open Innovation).",
      "5. Head to the **Teams** page to invite your squad or participate solo."
    ],
    actionLinks: [
      { label: "Browse Hackathons", path: "/hackathons" },
      { label: "Manage Teams", path: "/teams" }
    ],
    detailedAnswer: `Registering for a hackathon on HackFlow AI is instantaneous:
1. Open the [Hackathons](/hackathons) page.
2. Click on the hackathon of your choice.
3. Review submission deadlines and requirements.
4. Click **Register**. Once confirmed, your registration status will be saved to your dashboard profile.`
  },
  {
    category: "teams",
    keywords: ["team", "teams", "create team", "join team", "invite code", "invite members", "find teammates", "squad"],
    title: "How to Create or Join a Team",
    quickSteps: [
      "1. Go to the **Teams** page.",
      "2. **To Create a Team**: Click **Create New Team**, name your team, select the target hackathon, and set your tech stack.",
      "3. **To Invite Members**: Copy your unique **Team Invite Code** and share it with your teammates.",
      "4. **To Join an Existing Team**: Click **Join with Code**, enter the invite code provided by your team leader, and submit.",
      "5. Maximum team size defaults to 4 members per team."
    ],
    actionLinks: [
      { label: "Go to Teams Page", path: "/teams" }
    ],
    detailedAnswer: `Collaboration is central to HackFlow AI:
- **Team Leaders**: Can manage members, assign roles (Frontend, Backend, AI/ML, Design), and submit the final project deliverable.
- **Teammates**: Simply paste the team code to instantly sync permissions and shared project submissions.`
  },
  {
    category: "submissions",
    keywords: ["submit", "submission", "how to submit", "project submit", "github link", "demo link", "video", "deliverable"],
    title: "How to Submit Your Project",
    quickSteps: [
      "1. Go to **Submissions** in the sidebar.",
      "2. Select your registered hackathon and team.",
      "3. Fill out the project details:",
      "   - **Project Title & Tagline**",
      "   - **Description & Problem Statement**",
      "   - **GitHub Repository URL** (must be public or shared with judges)",
      "   - **Live Demo / Deployment URL** (e.g. Vercel, Netlify, Railway)",
      "   - **Video Demo / Loom Link** (2-3 min recommended)",
      "   - **Tech Stack & Tags**",
      "4. Click **Submit Project**. You can edit submissions until the deadline countdown ends."
    ],
    actionLinks: [
      { label: "Go to Submissions", path: "/submissions" }
    ],
    detailedAnswer: `Ensure your project meets all submission guidelines before the countdown timer expires. Judges evaluate submissions directly through the platform based on your repository, demo, and AI Code Analysis.`
  },
  {
    category: "judges-ai-code",
    keywords: ["judge", "judging", "ai code", "ai detector", "detect ai", "rubric", "score", "grade", "evaluate", "synthetic code", "vulnerabilities"],
    title: "How to Use the Judges Panel & AI Code Detector Lab",
    quickSteps: [
      "1. Go to **Judges** in the navigation (for Judge or Organizer roles).",
      "2. **Evaluation Queue**: Review pending project submissions with live GitHub links.",
      "3. **AI Code & AI-Generated Detector Lab**:",
      "   - Click **AI Code & AI-Generated Detector Lab** at the top or **Scan Code** on any card.",
      "   - Paste code snippets or upload source files (.js, .py, .ts, .cpp, .java, etc.).",
      "   - View **AI Probability %**, synthetic step comment density, token burstiness, and security vulnerabilities.",
      "   - Click **Transfer to Scoring Rubric** to auto-calibrate scores.",
      "4. **Rubric Evaluation**: Grade on Innovation (0-100), Technical Execution (0-100), UI/UX (0-100), and Impact (0-100).",
      "5. Click **Submit Evaluation** to record your verified score."
    ],
    actionLinks: [
      { label: "Open Judges Panel", path: "/judges" }
    ],
    detailedAnswer: `The Judges Panel includes our state-of-the-art **AI Code & AI-Generated Detector Lab**:
- Detects whether code was synthesized by LLMs using multi-signal heuristics (step comments, token uniformity, identifier density).
- Audits hardcoded secrets, AWS keys, database URIs, and dangerous ` + "`eval()`" + ` vectors.
- Automatically calculates a Maintainability Index ($A, B, C, D$) to assist judges in fair, transparent evaluations.`
  },
  {
    category: "mentors",
    keywords: ["mentor", "mentorship", "ask mentor", "get help", "office hours", "troubleshoot code", "technical help"],
    title: "How to Connect with Mentors",
    quickSteps: [
      "1. Visit the **Mentors** tab.",
      "2. Browse available mentors by their domain expertise (AI/ML, Web3, Full Stack, Cloud/DevOps).",
      "3. Click **Request 1:1 Session** or join open **Virtual Office Hours**.",
      "4. Share your issue, code repository link, or architecture diagram to get instant guidance."
    ],
    actionLinks: [
      { label: "Find a Mentor", path: "/mentors" }
    ],
    detailedAnswer: `Mentors are industry veterans available to help unblock bugs, optimize system architecture, and provide feedback on your hackathon pitch.`
  },
  {
    category: "organizers",
    keywords: ["organizer", "create hackathon", "manage event", "prizes", "rubrics", "export", "analytics", "announcement"],
    title: "Organizer Portal & Event Management",
    quickSteps: [
      "1. Organizers have access to event creation, live telemetry, and attendee analytics.",
      "2. **Create Hackathon**: Set event dates, tracks, prize distributions, and custom judging rubrics.",
      "3. **Real-time Analytics**: Track registration counts, submission velocity, and judging completion rates in the **Analytics** tab.",
      "4. **Attendance & Check-in**: Use the **Attendance** tab to scan attendee QR codes and generate verified completion certificates."
    ],
    actionLinks: [
      { label: "View Analytics", path: "/analytics" },
      { label: "Manage Attendance", path: "/attendance" }
    ],
    detailedAnswer: `Organizers have end-to-end control over the hackathon lifecycle, including dynamic leaderboard publishing, automated certificate issuance, and judging progress tracking.`
  },
  {
    category: "certificates",
    keywords: ["certificate", "certificates", "badge", "credential", "proof", "claim certificate", "download certificate"],
    title: "How to Claim & Verify Certificates",
    quickSteps: [
      "1. Navigate to the **Certificates** page.",
      "2. Check your eligible hackathon events (Participation, Finalist, Winner, or Judge/Mentor badges).",
      "3. Click **Generate / Download Certificate** for high-resolution printable PDF or verified digital credential.",
      "4. Share directly to LinkedIn or add to your portfolio."
    ],
    actionLinks: [
      { label: "View Certificates", path: "/certificates" }
    ],
    detailedAnswer: `Digital certificates are cryptographically verifiable on HackFlow AI, proving your participation and placement in global hackathons.`
  },
  {
    category: "troubleshooting",
    keywords: ["error", "login issue", "cannot submit", "password reset", "verification code", "otp", "email not received", "bug"],
    title: "Troubleshooting & Support",
    quickSteps: [
      "1. **Email OTP Not Received**: Check your Spam folder or click the **Resend OTP** button in the Verify Email screen. You can also view recent OTPs in the quick test inbox if in dev mode.",
      "2. **Submission Edit**: You can edit your submission any time before the deadline from the Submissions page.",
      "3. **Role Access**: Make sure you have the required role (Participant, Judge, Mentor, or Organizer) for specific restricted pages.",
      "4. **Session Timeout**: If you experience 401 errors, log out and log back in to refresh your authentication token."
    ],
    actionLinks: [
      { label: "Back to Login", path: "/login" },
      { label: "Go to Dashboard", path: "/dashboard" }
    ],
    detailedAnswer: `For additional technical support, feel free to ask me any specific question about using the HackFlow AI platform!`
  }
];

/**
 * Intelligent Heuristic Matcher & Answer Generator
 */
function findBestSupportAnswer(userQuery, userRole = "participant", currentPath = "/") {
  if (!userQuery || typeof userQuery !== "string") {
    return {
      title: "How can I help you today?",
      category: "general",
      answer: "I am your HackFlow AI Assistant. Ask me anything about registering, forming teams, submitting projects, using the AI Code Detector, judging, or claiming certificates!",
      quickSteps: [
        "Ask 'How do I register for a hackathon?'",
        "Ask 'How do I create or join a team?'",
        "Ask 'How does the AI Code Detector work?'",
        "Ask 'How do I submit my project?'"
      ],
      actionLinks: [
        { label: "Explore Hackathons", path: "/hackathons" },
        { label: "Dashboard", path: "/dashboard" }
      ],
      suggestedQuestions: [
        "How do I join or create a team?",
        "How do I submit my GitHub repository?",
        "How does the AI Code Detector work for Judges?",
        "How do I claim my hackathon certificate?"
      ]
    };
  }

  const queryLower = userQuery.toLowerCase().trim();

  // Score each knowledge item based on keyword matches & title overlap
  let bestMatch = null;
  let highestScore = 0;

  for (const item of PLATFORM_KNOWLEDGE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (queryLower.includes(kw.toLowerCase())) {
        score += kw.length; // weight longer specific keywords higher
      }
    }

    // Role contextual boost
    if (userRole === "judge" && item.category === "judges-ai-code") score += 5;
    if (userRole === "organizer" && item.category === "organizers") score += 5;
    if (userRole === "mentor" && item.category === "mentors") score += 5;

    // Path contextual boost
    if (currentPath.includes("judges") && item.category === "judges-ai-code") score += 6;
    if (currentPath.includes("teams") && item.category === "teams") score += 6;
    if (currentPath.includes("submissions") && item.category === "submissions") score += 6;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore > 3) {
    // Generate context-rich response
    const otherSuggestions = PLATFORM_KNOWLEDGE
      .filter(k => k.category !== bestMatch.category)
      .slice(0, 3)
      .map(k => k.keywords[0] ? `How to ${k.keywords[0]}?` : k.title);

    return {
      title: bestMatch.title,
      category: bestMatch.category,
      quickSteps: bestMatch.quickSteps,
      detailedAnswer: bestMatch.detailedAnswer,
      actionLinks: bestMatch.actionLinks,
      suggestedQuestions: otherSuggestions
    };
  }

  // Fallback with intelligent synthesis
  return {
    title: "HackFlow AI Platform Guide",
    category: "general-guidance",
    quickSteps: [
      "1. **Hackathons**: Browse, register, and track timelines in the Hackathons tab.",
      "2. **Teams**: Form squads and invite members with secret team codes.",
      "3. **Submissions**: Post GitHub repos, demo links, and video walkthroughs.",
      "4. **AI Code Detector**: Judges analyze code for AI generation & security risks.",
      "5. **Certificates & Analytics**: Download certificates and view live telemetry."
    ],
    detailedAnswer: `I understand you're asking about: "${userQuery}".\n\nHackFlow AI provides tools for the entire hackathon lifecycle. You can navigate directly using the sidebar or choose one of the quick options below:`,
    actionLinks: [
      { label: "Browse Hackathons", path: "/hackathons" },
      { label: "My Teams", path: "/teams" },
      { label: "Submissions", path: "/submissions" },
      { label: "Judges Panel", path: "/judges" }
    ],
    suggestedQuestions: [
      "How do I submit my hackathon project?",
      "How does the AI Code Detector work?",
      "How do I create or join a team?",
      "How do judges evaluate projects?"
    ]
  };
}

module.exports = {
  PLATFORM_KNOWLEDGE,
  findBestSupportAnswer
};
