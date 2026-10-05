const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
const getSeedData = () => {
  const hashedPassword = bcrypt.hashSync('password123', 10);

  return {
    users: [
      {
        id: "u_organizer",
        name: "John Doe",
        email: "john@hackflow.dev",
        password: hashedPassword,
        role: "organizer",
        assignedRoles: ["participant", "organizer"],
        organization: "HackFlow Community",
        avatar: "JD",
        isEmailVerified: true,
        mfaEnabled: true,
        createdAt: "2026-10-01T08:00:00.000Z",
      },
      {
        id: "u_organizer_2",
        name: "Sarah Jenkins",
        email: "sarah@apex.io",
        password: hashedPassword,
        role: "organizer",
        assignedRoles: ["participant", "organizer"],
        organization: "Apex Innovations",
        avatar: "SJ",
        isEmailVerified: true,
        mfaEnabled: true,
        createdAt: "2026-10-01T08:00:00.000Z",
      },
      {
        id: "u_organizer_3",
        name: "David Kim",
        email: "david@cloudguild.dev",
        password: hashedPassword,
        role: "organizer",
        assignedRoles: ["participant", "organizer"],
        organization: "Cloud Builders Network",
        avatar: "DK",
        isEmailVerified: true,
        mfaEnabled: true,
        createdAt: "2026-10-01T08:00:00.000Z",
      },
      {
        id: "u_participant",
        name: "Alex Rivera",
        email: "alex@neuralninjas.dev",
        password: hashedPassword,
        role: "participant",
        assignedRoles: ["participant"],
        avatar: "AR",
        isEmailVerified: true,
        mfaEnabled: true,
        createdAt: "2026-10-01T08:00:00.000Z",
      },
      {
        id: "u_judge",
        name: "Dr. Elena Rostova",
        email: "elena@judges.dev",
        password: hashedPassword,
        role: "judge",
        assignedRoles: ["participant", "judge"],
        avatar: "ER",
        isEmailVerified: true,
        mfaEnabled: true,
        createdAt: "2026-10-01T08:00:00.000Z",
      },
      {
        id: "u_mentor",
        name: "Siddharth Verma",
        email: "mentor@cloud.dev",
        password: hashedPassword,
        role: "mentor",
        assignedRoles: ["participant", "mentor"],
        avatar: "SV",
        isEmailVerified: true,
        mfaEnabled: true,
        createdAt: "2026-10-01T08:00:00.000Z",
      }
    ],
    otps: [],
    hackathons: [
      {
        id: "1",
        title: "TechFest Sri Lanka 2026",
        tagline: "Build innovative AI & cloud solutions for real-world impact.",
        description: "Sri Lanka's flagship national hackathon bringing together over 500+ developers, designers, and innovators to solve critical challenges in healthcare, education, and fintech.",
        date: "Oct 15 - Oct 17, 2026",
        startDate: "2026-10-15",
        endDate: "2026-10-17",
        participants: 487,
        maxTeams: 120,
        status: "Active",
        badge: "Registration Open",
        category: "AI & Cloud",
        prizePool: "$15,000",
        location: "Colombo / Hybrid",
        organizerId: "u_organizer",
        organizerEmail: "john@hackflow.dev",
        organizer: "HackFlow Community (John Doe)",
        rules: [
          "Teams can have 2 to 4 members.",
          "All code must be written during the hackathon period.",
          "Use of open source libraries and pre-trained models is allowed.",
          "Projects must be submitted with GitHub repository and a 3-minute video demo."
        ],
        timeline: [
          { step: "Registration Closes", date: "Oct 10, 2026", done: true },
          { step: "Opening Ceremony & Hack Kickoff", date: "Oct 15, 09:00 AM", done: false },
          { step: "Mentorship Round 1", date: "Oct 16, 02:00 PM", done: false },
          { step: "Submission Deadline", date: "Oct 17, 12:00 PM", done: false },
          { step: "Final Demo & Awards", date: "Oct 17, 05:00 PM", done: false },
        ],
        prizes: [
          { place: "1st Place (Grand Winner)", reward: "$8,000 + Cloud Credits + Trophy" },
          { place: "2nd Place (Runner-up)", reward: "$4,500 + Fast-track Incubation" },
          { place: "3rd Place", reward: "$2,500 + Developer Perks" },
          { place: "Best AI Innovation", reward: "Special $1,000 NVIDIA Grant" },
        ]
      },
      {
        id: "2",
        title: "AI Innovation Challenge",
        tagline: "Create AI-powered autonomous agents and predictive tools.",
        description: "A 48-hour intense sprint focusing on Generative AI, autonomous agents, computer vision, and NLP applications that redefine digital workflows.",
        date: "Nov 05 - Nov 07, 2026",
        startDate: "2026-11-05",
        endDate: "2026-11-07",
        participants: 215,
        maxTeams: 80,
        status: "Upcoming",
        badge: "Registration Open",
        category: "Artificial Intelligence",
        prizePool: "$10,000",
        location: "Virtual / Global",
        organizerId: "u_organizer_2",
        organizerEmail: "sarah@apex.io",
        organizer: "Apex Innovations (Sarah Jenkins)",
        rules: [
          "Teams of 1 to 4 members.",
          "Core AI pipeline must be demonstrated live.",
          "Full API documentation and README required."
        ],
        timeline: [
          { step: "Registration Deadline", date: "Nov 01, 2026", done: false },
          { step: "Hackathon Begins", date: "Nov 05, 10:00 AM", done: false },
          { step: "Judging Period", date: "Nov 07, 03:00 PM", done: false },
        ],
        prizes: [
          { place: "Champion", reward: "$6,000 + GPU Credits" },
          { place: "Runner Up", reward: "$3,000" },
          { place: "Community Choice", reward: "$1,000" },
        ]
      },
      {
        id: "3",
        title: "Cloud Native Hack 2026",
        tagline: "Build scalable cloud-native microservices and serverless architectures.",
        description: "Design resilient distributed systems, Kubernetes automation, and high-performance serverless backends engineered for massive scale.",
        date: "Dec 01 - Dec 03, 2026",
        startDate: "2026-12-01",
        endDate: "2026-12-03",
        participants: 134,
        maxTeams: 60,
        status: "Upcoming",
        badge: "Upcoming",
        category: "Cloud & DevOps",
        prizePool: "$8,000",
        location: "Hybrid (Kandy & Online)",
        organizerId: "u_organizer_3",
        organizerEmail: "david@cloudguild.dev",
        organizer: "Cloud Builders Network (David Kim)",
        rules: [
          "Infrastructure must be deployable via IaC or containerized.",
          "Zero downtime architectures receive bonus points."
        ],
        timeline: [
          { step: "Registration", date: "Nov 20, 2026", done: false },
          { step: "Hacking Starts", date: "Dec 01, 2026", done: false },
        ],
        prizes: [
          { place: "Grand Prize", reward: "$5,000" },
          { place: "Best DevOps Pipeline", reward: "$3,000" },
        ]
      }
    ],
    teams: [
      {
        id: "t1",
        hackathonId: "1",
        hackathonTitle: "TechFest Sri Lanka 2026",
        name: "NeuralNinjas",
        leader: "Alex Rivera",
        leaderEmail: "alex@neuralninjas.dev",
        members: [
          { name: "Alex Rivera", role: "Team Lead & ML Engineer" },
          { name: "Sarah Chen", role: "Fullstack Developer" },
          { name: "Devon Miles", role: "UI/UX Designer" }
        ],
        projectTitle: "MedVision AI Diagnostics",
        status: "Submitted",
        checkedIn: true,
        checkInTime: "10:14 AM, Oct 15",
      },
      {
        id: "t2",
        hackathonId: "1",
        hackathonTitle: "TechFest Sri Lanka 2026",
        name: "QuantumLeap",
        leader: "Priya Sharma",
        leaderEmail: "priya@example.com",
        members: [
          { name: "Priya Sharma", role: "Lead Architect" },
          { name: "Marcus Vance", role: "Backend Engineer" }
        ],
        projectTitle: "EcoGrid Smart Energy Router",
        status: "In Progress",
        checkedIn: true,
        checkInTime: "10:30 AM, Oct 15",
      },
      {
        id: "t3",
        hackathonId: "1",
        hackathonTitle: "TechFest Sri Lanka 2026",
        name: "ByteCraft",
        leader: "Kavinda Perera",
        leaderEmail: "kavinda@example.com",
        members: [
          { name: "Kavinda Perera", role: "Frontend Dev" },
          { name: "Amara Silva", role: "Data Scientist" },
          { name: "Nimal Fernando", role: "Product Manager" },
          { name: "Ruwan Dias", role: "Mobile Dev" }
        ],
        projectTitle: "AgriFlow Harvest Predictor",
        status: "Submitted",
        checkedIn: false,
        checkInTime: null,
      }
    ],
    projects: [
      {
        id: "sub-1",
        hackathonId: "1",
        teamId: "t1",
        teamName: "NeuralNinjas",
        title: "MedVision AI Diagnostics",
        description: "An automated multimodal medical imaging diagnostic assistant running lightweight vision-language models for rapid rural clinic triage.",
        githubUrl: "https://github.com/neuralninjas/medvision-ai",
        demoUrl: "https://medvision-demo.app",
        videoUrl: "https://youtube.com/watch?v=demo123",
        techStack: ["PyTorch", "FastAPI", "React", "Docker", "TailwindCSS"],
        submittedAt: "2026-10-16 18:42",
        status: "Evaluated",
        aiScore: 92,
        aiFeedback: "Strong architectural design and real-world clinical viability. Clear demonstration of low-latency inference. Minor improvement needed on edge device caching.",
        judgeScores: {
          innovation: 9.5,
          technicalExecution: 9.2,
          design: 9.0,
          impact: 9.3,
        },
        totalScore: 92.5
      },
      {
        id: "sub-2",
        hackathonId: "1",
        teamId: "t3",
        teamName: "ByteCraft",
        title: "AgriFlow Harvest Predictor",
        description: "Hyper-local weather telemetry and soil satellite imagery analysis platform empowering smallholder farmers to prevent crop losses.",
        githubUrl: "https://github.com/bytecraft/agriflow",
        demoUrl: "https://agriflow-test.dev",
        videoUrl: "https://youtube.com/watch?v=agri456",
        techStack: ["Node.js", "Python", "React", "MongoDB", "Sentinel Satellite API"],
        submittedAt: "2026-10-16 21:15",
        status: "In Review",
        aiScore: 88,
        aiFeedback: "Excellent social impact and telemetry integration. API error handling could be strengthened during connectivity dropouts.",
        judgeScores: {
          innovation: 8.8,
          technicalExecution: 8.5,
          design: 8.7,
          impact: 9.2,
        },
        totalScore: 88.0
      }
    ],
    judges: [
      {
        id: "j1",
        name: "Dr. Elena Rostova",
        role: "Senior AI Researcher at DeepTech Labs",
        expertise: "Machine Learning, Computer Vision",
        assignedSubmissions: 5,
        completedEvaluations: 4,
        avatar: "ER"
      },
      {
        id: "j2",
        name: "Tariq Mansoor",
        role: "VP of Engineering at CloudScale",
        expertise: "Cloud Architecture, DevOps, Scalability",
        assignedSubmissions: 6,
        completedEvaluations: 6,
        avatar: "TM"
      },
      {
        id: "j3",
        name: "Ayesha Jayawardena",
        role: "Design Lead & Founder",
        expertise: "UI/UX, Product Strategy, Accessibility",
        assignedSubmissions: 5,
        completedEvaluations: 3,
        avatar: "AJ"
      }
    ],
    mentors: [
      {
        id: "m1",
        name: "Siddharth Verma",
        company: "Google Cloud",
        specialty: "Cloud Architecture & Kubernetes",
        availability: "Available Now",
        slots: ["Today 3:00 PM", "Today 5:30 PM", "Tomorrow 10:00 AM"],
        bio: "Ex-DevOps Lead with 10+ years mentoring hackathon champions worldwide."
      },
      {
        id: "m2",
        name: "Chloe Dupont",
        company: "Hugging Face Contributor",
        specialty: "LLMs, RAG & Fine-Tuning",
        availability: "In Session",
        slots: ["Tomorrow 11:30 AM", "Tomorrow 2:00 PM"],
        bio: "Passionate about making open source AI accessible to all developers."
      },
      {
        id: "m3",
        name: "Kasun Bandara",
        company: "FinTech Innovation Hub",
        specialty: "Fullstack Architecture & Security",
        availability: "Available Now",
        slots: ["Today 4:00 PM", "Today 7:00 PM"],
        bio: "Built scalable payment gateways handling millions of requests daily."
      }
    ],
    mentorBookings: [],
    emails: [],
    hackathonMembers: [
      {
        id: "hm_1",
        hackathonId: "1",
        userId: "u_organizer",
        userEmail: "john@hackflow.dev",
        userName: "John Doe",
        role: "ORGANIZER",
        status: "ACTIVE",
        source: "CREATOR",
        createdAt: "2026-10-01T08:00:00.000Z"
      },
      {
        id: "hm_2",
        hackathonId: "2",
        userId: "u_organizer_2",
        userEmail: "sarah@apex.io",
        userName: "Sarah Jenkins",
        role: "ORGANIZER",
        status: "ACTIVE",
        source: "CREATOR",
        createdAt: "2026-10-01T08:00:00.000Z"
      },
      {
        id: "hm_3",
        hackathonId: "3",
        userId: "u_organizer_3",
        userEmail: "david@cloudguild.dev",
        userName: "David Kim",
        role: "ORGANIZER",
        status: "ACTIVE",
        source: "CREATOR",
        createdAt: "2026-10-01T08:00:00.000Z"
      },
      {
        id: "hm_4",
        hackathonId: "1",
        userId: "u_participant",
        userEmail: "alex@neuralninjas.dev",
        userName: "Alex Rivera",
        role: "PARTICIPANT",
        status: "ACTIVE",
        source: "REGISTRATION",
        createdAt: "2026-10-01T08:00:00.000Z"
      },
      {
        id: "hm_5",
        hackathonId: "1",
        userId: "u_judge",
        userEmail: "elena@judges.dev",
        userName: "Dr. Elena Rostova",
        role: "JUDGE",
        status: "ACTIVE",
        source: "APPROVED_APPLICATION",
        createdAt: "2026-10-01T08:00:00.000Z"
      },
      {
        id: "hm_6",
        hackathonId: "1",
        userId: "u_judge_2",
        userEmail: "tariq@cloudscale.io",
        userName: "Tariq Mansoor",
        role: "JUDGE",
        status: "ACTIVE",
        source: "ORGANIZER_INVITE",
        createdAt: "2026-10-01T08:00:00.000Z"
      }
    ],
    judgeApplications: [
      {
        id: "ja_1",
        userId: "u_applicant_dr_marcus",
        name: "Dr. Marcus Thorne",
        email: "marcus.thorne@oxford-ai.org",
        hackathonId: "1",
        hackathonTitle: "TechFest Sri Lanka 2026",
        experienceYears: 9,
        organization: "Oxford AI & Robotics Institute",
        title: "Principal Research Scientist",
        expertise: "Machine Learning, Computer Vision, Robotics, Edge AI",
        linkedinUrl: "https://linkedin.com/in/marcus-thorne-ai",
        portfolioUrl: "https://marcusthorne.dev",
        previousJudging: "Judged NeurIPS Hackathon 2024, MIT HackNation, and Global AI Sprint.",
        reason: "Passionate about evaluating production viability and deep learning rigor in emerging multimodal healthcare applications.",
        status: "PENDING",
        aiEvaluation: {
          evaluatedAt: "2026-10-02T10:15:00.000Z",
          compositeScore: 94,
          domainExpertise: "High",
          domainScore: 95,
          previousExperience: "High",
          experienceScore: 96,
          relevantSkills: "High",
          skillsScore: 95,
          profileCompleteness: 98,
          detectedDomains: ["Machine Learning", "Cloud & Systems"],
          aiRecommendation: "Highly qualified candidate with 9+ years seniority. Strongly recommended for technical and architecture evaluation focusing on Machine Learning & Cloud.",
          suitability: "Strongly Recommended",
          badgeColor: "emerald"
        },
        createdAt: "2026-10-02T10:14:00.000Z"
      },
      {
        id: "ja_2",
        userId: "u_applicant_kavindi",
        name: "Kavindi Jayasuriya",
        email: "kavindi.j@fintechlab.io",
        hackathonId: "1",
        hackathonTitle: "TechFest Sri Lanka 2026",
        experienceYears: 6,
        organization: "PayStream Global",
        title: "Senior Fullstack & Security Lead",
        expertise: "Fullstack Architecture, API Security, Cloud, Microservices",
        linkedinUrl: "https://linkedin.com/in/kavindij",
        portfolioUrl: "https://github.com/kavindi-j",
        previousJudging: "Served on panel for Colombo CodeFest 2025.",
        reason: "Keen to provide technical feedback on scalable web architectures and real-time backend reliability.",
        status: "PENDING",
        aiEvaluation: {
          evaluatedAt: "2026-10-02T14:30:00.000Z",
          compositeScore: 88,
          domainExpertise: "High",
          domainScore: 88,
          previousExperience: "High",
          experienceScore: 90,
          relevantSkills: "High",
          skillsScore: 88,
          profileCompleteness: 92,
          detectedDomains: ["Fullstack & Web", "Cloud & Systems"],
          aiRecommendation: "Solid background with relevant industry experience. Well-suited for architecture and fullstack evaluation.",
          suitability: "Strongly Recommended",
          badgeColor: "emerald"
        },
        createdAt: "2026-10-02T14:28:00.000Z"
      }
    ],
    judgeInvitations: [
      {
        id: "ji_1",
        hackathonId: "1",
        hackathonTitle: "TechFest Sri Lanka 2026",
        email: "expert.judge@techcorp.com",
        judgeName: "Sarah Chen, PhD",
        roleDescription: "Lead Systems Architect at TechCorp",
        expertise: "Distributed Systems & Kubernetes",
        invitedBy: "u_organizer",
        invitedByEmail: "john@hackflow.dev",
        token: "inv_token_techfest_sarah_2026",
        status: "PENDING",
        createdAt: "2026-10-02T09:00:00.000Z"
      }
    ],
    eventChangeHistory: [
      {
        id: "chg_1",
        hackathonId: "1",
        hackathonTitle: "TechFest Sri Lanka 2026",
        organizerId: "u_organizer",
        organizerName: "John Doe",
        field: "prizePool",
        beforeValue: "$10,000",
        afterValue: "$15,000",
        reason: "Secured extra sponsor grant from NVIDIA and Cloud Builders Network.",
        status: "APPROVED",
        changedAt: "2026-10-02T10:42:00.000Z",
        reviewedBy: "Platform Admin",
        reviewedAt: "2026-10-02T11:00:00.000Z",
        reviewNotes: "Prize pool increase verified and funded. Approved.",
        aiAnalysis: {
          riskLevel: "LOW",
          impactSummary: "Prize pool increased from $10,000 to $15,000 with 487 registered participants. Positive community incentive.",
          aiRecommendation: "Safe for expedited platform approval."
        }
      },
      {
        id: "chg_2",
        hackathonId: "1",
        hackathonTitle: "TechFest Sri Lanka 2026",
        organizerId: "u_organizer",
        organizerName: "John Doe",
        field: "endDate",
        beforeValue: "2026-10-17",
        afterValue: "2026-10-18",
        reason: "Extending hack duration by 24h to allow teams extra model training and testing time.",
        status: "PENDING_APPROVAL",
        changedAt: "2026-10-03T08:30:00.000Z",
        aiAnalysis: {
          riskLevel: "MEDIUM",
          impactSummary: "Event timeline extended by 1 day for 487 registered participants.",
          aiRecommendation: "Beneficial to engineering teams; verify hybrid venue booking."
        }
      }
    ],
    organizerApplications: [
      {
        id: "oa_1",
        userId: "u_applicant_org",
        name: "Nimali Rathnayake",
        email: "nimali@cybersprint.org",
        organizationName: "CyberSprint Sri Lanka",
        website: "https://cybersprint.org",
        officialEmail: "nimali@cybersprint.org",
        contactPhone: "+94 77 123 4567",
        pastEvents: "Hosted 3 national collegiate CTFs and Lanka CyberDef 2025 with 300+ students.",
        proposal: "Planning Lanka AI Shield 2026 - an offensive-defensive AI cybersecurity sprint focused on secure LLM deployment.",
        estimatedParticipants: 250,
        status: "PENDING",
        aiEvaluation: {
          credibilityScore: 90,
          riskLevel: "LOW",
          suitability: "Strongly Recommended",
          aiRecommendation: "Established entity with verified online presence, institutional email, and prior event track record. Low fraud risk."
        },
        createdAt: "2026-10-03T07:15:00.000Z"
      }
    ]
  };
};

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      this.data = initial;
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);

        // Ensure new collections exist in existing database.json
        const seed = getSeedData();
        let updated = false;
        if (!this.data.hackathonMembers || !this.data.hackathonMembers.length) {
          this.data.hackathonMembers = seed.hackathonMembers;
          updated = true;
        }
        if (!this.data.judgeApplications || !this.data.judgeApplications.length) {
          this.data.judgeApplications = seed.judgeApplications;
          updated = true;
        }
        if (!this.data.judgeInvitations || !this.data.judgeInvitations.length) {
          this.data.judgeInvitations = seed.judgeInvitations;
          updated = true;
        }
        if (!this.data.eventChangeHistory || !this.data.eventChangeHistory.length) {
          this.data.eventChangeHistory = seed.eventChangeHistory;
          updated = true;
        }
        if (!this.data.organizerApplications || !this.data.organizerApplications.length) {
          this.data.organizerApplications = seed.organizerApplications;
          updated = true;
        }
        // Ensure hackathons have eventState
        if (this.data.hackathons) {
          this.data.hackathons.forEach(h => {
            if (!h.eventState) {
              h.eventState = h.status === 'Draft' ? 'DRAFT' : 'PUBLISHED';
              updated = true;
            }
          });
        }
        if (updated) {
          this.save();
        }
      } catch (e) {
        console.error('Error loading database, re-seeding:', e);
        const initial = getSeedData();
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
        this.data = initial;
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database to disk:', err);
    }
  }

  find(collection, filterFn = null) {
    const list = this.data[collection] || [];
    return filterFn ? list.filter(filterFn) : list;
  }

  findOne(collection, filterFn) {
    const list = this.data[collection] || [];
    return list.find(filterFn) || null;
  }

  findById(collection, id) {
    const list = this.data[collection] || [];
    return list.find(item => String(item.id) === String(id)) || null;
  }

  insert(collection, document) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    const id = document.id || `${collection.slice(0, 3)}_${Date.now()}`;
    const docWithId = { id, createdAt: new Date().toISOString(), ...document };
    this.data[collection].unshift(docWithId);
    this.save();
    return docWithId;
  }

  updateById(collection, id, updates) {
    const list = this.data[collection] || [];
    const index = list.findIndex(item => String(item.id) === String(id));
    if (index === -1) return null;

    this.data[collection][index] = {
      ...this.data[collection][index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data[collection][index];
  }

  deleteById(collection, id) {
    const list = this.data[collection] || [];
    const filtered = list.filter(item => String(item.id) !== String(id));
    this.data[collection] = filtered;
    this.save();
    return true;
  }
}

const db = new Database();
module.exports = db;
