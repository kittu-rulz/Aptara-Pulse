/**
 * Aptara Pulse Calendar Data Schema & Dataset
 * 
 * Single source of truth for employee training, events, and engagement sessions.
 * Structured for offline, zero-CORS static hosting.
 */

window.APTARA_CALENDAR_DATA = {
  version: "1.0.0",
  lastUpdated: "2026-09-01T09:00:00Z",
  organization: {
    name: "Aptara",
    portalTitle: "Aptara Pulse — Training, Events & Engagement Calendar",
    tagline: "Learn. Engage. Celebrate.",
    monthLabel: "September 2026",
    monthlyMessage: "Welcome to September! Discover this month's curated technical workshops, wellness sessions, global town halls, and engagement challenges designed to help you learn, connect, and celebrate."
  },
  categories: [
    {
      id: "training",
      name: "Training & Workshops",
      color: "#145DA0",
      bg: "#EDF5FC",
      border: "#145DA0",
      accent: "#145DA0",
      icon: "book-open"
    },
    {
      id: "engagement",
      name: "Employee Engagement",
      color: "#6B4C9A",
      bg: "#F5F0FA",
      border: "#6B4C9A",
      accent: "#6B4C9A",
      icon: "party-popper"
    },
    {
      id: "wellness",
      name: "Health & Wellness",
      color: "#E85D75",
      bg: "#FDF1F3",
      border: "#E85D75",
      accent: "#E85D75",
      icon: "heart-pulse"
    },
    {
      id: "townhall",
      name: "Town Halls & Leadership",
      color: "#102A43",
      bg: "#EEF2F6",
      border: "#102A43",
      accent: "#102A43",
      icon: "megaphone"
    },
    {
      id: "holiday",
      name: "Holidays & Observances",
      color: "#B45309",
      bg: "#FEF9EE",
      border: "#F2B84B",
      accent: "#F2B84B",
      icon: "calendar-check"
    }
  ],
  events: [
    {
      id: "evt-20260904-01",
      title: "Fun Friday: Virtual Trivia & Puzzle Challenge",
      category: "engagement",
      start: "2026-09-04T16:00:00",
      end: "2026-09-04T17:00:00",
      allDay: false,
      location: "Virtual (MS Teams)",
      mode: "Virtual",
      instructor: "HR Engagement Committee",
      audience: "All Aptara Employees",
      description: "Unwind before the weekend with our inter-team trivia contest! Fast-paced rounds covering pop culture, science, digital trends, and Aptara trivia with gift vouchers for the top 3 winners.",
      joinUrl: "https://teams.microsoft.com/l/meetup-join/aptara-trivia",
      registrationUrl: "",
      recordingUrl: "",
      featured: true,
      tags: ["Trivia", "Fun Friday", "Engagement", "Team Building"]
    },
    {
      id: "evt-20260907-01",
      title: "Labor Day / Regional Holiday Observance",
      category: "holiday",
      start: "2026-09-07",
      end: "2026-09-07",
      allDay: true,
      location: "Company-wide",
      mode: "In-Person",
      instructor: "Corporate HR",
      audience: "All Employees (US & Designated Operations)",
      description: "Official company holiday. Emergency support escalations will follow on-call duty rosters. Regular business operations resume following business day.",
      joinUrl: "",
      registrationUrl: "",
      recordingUrl: "",
      featured: false,
      tags: ["Holiday", "Observance", "Off"]
    },
    {
      id: "evt-20260909-01",
      title: "Generative AI Prompt Engineering for Digital Publishing",
      category: "training",
      start: "2026-09-09T14:30:00",
      end: "2026-09-09T16:30:00",
      allDay: false,
      location: "Virtual (MS Teams Live)",
      mode: "Virtual",
      instructor: "AI & Innovation COE",
      audience: "Content Architects, Editors, XML Specialists",
      description: "Master advanced prompt formulation, context structuring, and LLM evaluation frameworks to streamline XML/ePub conversion pipelines and digital editorial workflows.",
      joinUrl: "https://teams.microsoft.com/l/meetup-join/genai-prompt-eng",
      registrationUrl: "https://forms.office.com/r/aptara-ai-training",
      recordingUrl: "",
      featured: true,
      tags: ["AI", "GenAI", "Publishing", "Upskilling", "XML", "Productivity"]
    },
    {
      id: "evt-20260911-01",
      title: "Desk Ergonomics & Eye Strain Prevention Workshop",
      category: "wellness",
      start: "2026-09-11T11:00:00",
      end: "2026-09-11T12:00:00",
      allDay: false,
      location: "Auditorium & Live Stream",
      mode: "Hybrid",
      instructor: "Dr. Ananya Sharma (Occupational Health Specialist)",
      audience: "All Employees",
      description: "Interactive session on posture correction, 20-20-20 screen rules, active stretching routines, and workstation adjustments for hybrid workers.",
      joinUrl: "https://teams.microsoft.com/l/meetup-join/ergonomics-live",
      registrationUrl: "",
      recordingUrl: "",
      featured: false,
      tags: ["Wellness", "Health", "Ergonomics", "Hybrid", "Posture"]
    },
    {
      id: "evt-20260916-01",
      title: "Advanced Excel: Power Query & Dynamic Dashboards",
      category: "training",
      start: "2026-09-16T15:00:00",
      end: "2026-09-16T17:00:00",
      allDay: false,
      location: "Virtual (MS Teams)",
      mode: "Virtual",
      instructor: "L&D Technical Training Cell",
      audience: "Finance, PMO, Operations & Team Leads",
      description: "Deep dive into M-code basics, merging multi-source tables, automating weekly reporting, and interactive KPI dashboard creation for operational excellence.",
      joinUrl: "https://teams.microsoft.com/l/meetup-join/excel-powerquery",
      registrationUrl: "https://forms.office.com/r/excel-advanced-2026",
      recordingUrl: "",
      featured: false,
      tags: ["Excel", "Analytics", "Dashboards", "L&D", "Automation"]
    },
    {
      id: "evt-20260918-01",
      title: "Aptara Wellness Walkathon & Fitness Challenge Kickoff",
      category: "wellness",
      start: "2026-09-18T09:00:00",
      end: "2026-09-25T18:00:00",
      allDay: true,
      location: "Global / Remote Fitness App",
      mode: "Hybrid",
      instructor: "Aptara Sports & Wellness Club",
      audience: "All Employees",
      description: "A 7-day 10,000-steps-a-day challenge with fitness tracker sync, daily department leaderboards, group walking milestones, and grand fitness rewards.",
      joinUrl: "",
      registrationUrl: "https://forms.office.com/r/walkathon-signup",
      recordingUrl: "",
      featured: true,
      tags: ["Walkathon", "Fitness", "Wellness", "Challenge", "Prizes"]
    },
    {
      id: "evt-20260924-01",
      title: "Q3 Global Leadership Town Hall & Pulse Awards",
      category: "townhall",
      start: "2026-09-24T17:00:00",
      end: "2026-09-24T18:30:00",
      allDay: false,
      location: "Executive Boardroom & Global Broadcast",
      mode: "Hybrid",
      instructor: "Executive Leadership Team & HR",
      audience: "All Aptara Global Workforce",
      description: "Quarterly business review, key client milestone celebration, strategic roadmaps for Q4, live employee Q&A, and the prestigious Q3 Pulse Star Awards announcement.",
      joinUrl: "https://teams.microsoft.com/l/meetup-join/q3-townhall-2026",
      registrationUrl: "",
      recordingUrl: "",
      featured: true,
      tags: ["Townhall", "Leadership", "Awards", "Executive", "Q3", "Recognition"]
    },
    {
      id: "evt-20260928-01",
      title: "Effective Cross-Cultural Communication for Global Teams",
      category: "training",
      start: "2026-09-28T14:00:00",
      end: "2026-09-28T15:30:00",
      allDay: false,
      location: "Virtual (MS Teams)",
      mode: "Virtual",
      instructor: "Talent Development Team",
      audience: "Project Managers, Account Leads & Coordinators",
      description: "Best practices for asynchronous collaboration, client meeting etiquette, and managing multicultural project expectations smoothly across global time zones.",
      joinUrl: "https://teams.microsoft.com/l/meetup-join/cross-culture-comm",
      registrationUrl: "",
      recordingUrl: "",
      featured: false,
      tags: ["Communication", "Soft Skills", "Leadership", "Global", "Collaboration"]
    }
  ]
};
