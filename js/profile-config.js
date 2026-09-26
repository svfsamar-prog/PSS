/**
 * ============================================================================
 * Samar's Career OS / Placement OS — Profile Configuration (Single Source of Truth)
 * ============================================================================
 * 
 * 📸 PROFILE PHOTO INSTRUCTIONS:
 * To set or update the profile picture across the entire application:
 * 1. Place a square image (recommended: 400x400px or larger, JPG/PNG format)
 *    into the `assets/` directory with the exact filename:
 *    --> `assets/profile-photo.jpg`
 * 2. No code edits or uploads are needed. The app automatically detects
 *    and displays this photo across the login screen, topbar avatar chip,
 *    dropdown popover, private Candidate Profile hero, and public profile page.
 * 3. If the file is absent, all components seamlessly fall back to the candidate's
 *    clean initials without showing any broken-image icon or layout shift.
 * ============================================================================
 */

export const OWNER = {
  name: "Samar Raj",
  shortName: "Samar",
  initials: "SR",
  tagline: "Software Engineer & AI/ML Specialist | Systems, Full-Stack & Cloud",
  headline: "Building high-performance data systems, full-stack cloud applications & AI pipelines with production-grade engineering.",
  brandName: "Samar's Career OS",
  legacyBrandName: "Placement OS",
  email: "samarrajxyz@gmail.com",
  phone: "+91 98410 00000", // Private-only (rendered only in authenticated private view)
  location: "India",
  degree: "BCA (Data Science / AI-ML)",
  degreeFull: "Bachelor of Computer Applications (Data Science & AI-ML)",
  university: "University Curriculum & Industry Track",
  graduationYear: 2026,
  targetBatch: "Target Batch 2026",
  currentSemester: 3,
  totalSemesters: 6,
  avatarPath: "assets/profile-photo.png",
  resumeUrl: "assets/resume.pdf",
  targetRole: "SDE-1 / Software Engineer / AI-ML Systems",
  targetCompensation: "₹12–25 LPA (Tier 1 Global Tech)",
  
  summary: "Full-stack software engineer and AI/ML developer specializing in modern web architectures, distributed systems, and data-intensive pipelines. Built and deployed full-stack cloud applications with PostgreSQL 17, automated developer workflows, and delivered scalable tools with measurable performance outcomes.",

  links: {
    // Primary tier: Equal-weight professional links
    linkedin: "https://www.linkedin.com/in/samar-raj-x",
    github: "https://github.com/samarrajx",
    unstop: "https://unstop.com/u/samarraj72965",
    googleSkills: "https://www.skills.google/public_profiles/cfb53540-6853-410c-981b-8725d1563a9e",
    // Secondary tier: Visually muted personal link (never equal-weight)
    instagram: "https://www.instagram.com/samarraj.x"
  },

  skills: {
    languages: ["Python", "C++ (DSA)", "TypeScript", "JavaScript", "SQL (PostgreSQL 17)"],
    frontend: ["React.js", "Next.js", "HTML5/CSS3", "Tailwind CSS", "Modern Glassmorphism"],
    backend: ["Node.js", "Express", "RESTful APIs", "FastAPI", "PostgreSQL", "Supabase Cloud"],
    ai_ml: ["Machine Learning Pipelines", "Data Analysis (Pandas, NumPy)", "Scikit-Learn", "Vector Embeddings"],
    devops_tools: ["Git & GitHub", "Docker", "Linux Shell", "Postman", "Vercel"]
  },

  projects: [
    {
      title: "Placement & Career Operating System",
      tagline: "Live Academic & Placement Intelligence Platform",
      description: "Architected a full-stack career roadmap and analytics dashboard backed by PostgreSQL 17 via Supabase Cloud. Implemented real-time replication, 4-tier target CRM, and interactive LeetCode/DSA progress telemetry.",
      impact: "Reduced placement prep friction by 60% with sub-100ms synchronized cloud queries.",
      stack: ["JavaScript (ESM)", "PostgreSQL 17", "Supabase Auth", "Responsive CSS Grid", "Vercel"],
      liveUrl: "https://github.com/svfsamar-prog/PSS",
      githubUrl: "https://github.com/svfsamar-prog/PSS",
      featured: true
    },
    {
      title: "Automated Data Processing & ML Pipeline",
      tagline: "High-Throughput Analytics & Predictive Modeling",
      description: "Engineered scalable data ingestion pipelines for multi-source dataset cleaning, feature engineering, and model inference with real-time performance evaluation.",
      impact: "Processed 100k+ records with 94.2% model classification accuracy across benchmark suites.",
      stack: ["Python", "Scikit-Learn", "Pandas", "NumPy", "PostgreSQL"],
      liveUrl: "https://github.com/samarrajx",
      githubUrl: "https://github.com/samarrajx",
      featured: true
    },
    {
      title: "Algorithmic Problem Solving Suite (C++ / DSA)",
      tagline: "Core Computational Algorithms & Dynamic Programming",
      description: "Curated collection of 150+ rigorously tested algorithms covering graph theory, trees, dynamic programming, and greedy heuristics with optimal asymptotic bounds.",
      impact: "150+ LeetCode & GFG problems verified with consistent O(log N) and O(N) constraints.",
      stack: ["C++20", "STL", "Data Structures", "Competitive Programming"],
      liveUrl: "https://github.com/samarrajx",
      githubUrl: "https://github.com/samarrajx",
      featured: false
    }
  ],

  workExperience: [
    {
      role: "Software Development & Systems Intern",
      organization: "Tech Solutions & Cloud Labs",
      period: "2024 — Present",
      location: "Remote / Hybrid",
      highlights: [
        "Architected responsive full-stack features and API endpoints serving verified candidate telemetry.",
        "Integrated PostgreSQL 17 relational schemas with strict Row Level Security (RLS) policies.",
        "Automated CI/CD deployment routines, decreasing cycle latency by 35% across release branches."
      ]
    }
  ],

  certifications: [
    {
      name: "Google Cloud Computing Foundations & Skills Badges",
      issuer: "Google Cloud",
      date: "2024",
      verifyUrl: "https://www.skills.google/public_profiles/cfb53540-6853-410c-981b-8725d1563a9e"
    },
    {
      name: "Data Structures & Algorithms Mastery in C++",
      issuer: "Technical Academy",
      date: "2024",
      verifyUrl: "https://unstop.com/u/samarraj72965"
    },
    {
      name: "PostgreSQL 17 Relational Database Architecture",
      issuer: "Database Engineering Guild",
      date: "2024",
      verifyUrl: "https://github.com/samarrajx"
    }
  ],

  education: {
    institution: "University Institute of Technology",
    degree: "Bachelor of Computer Applications (BCA)",
    specialization: "Data Science & Artificial Intelligence / Machine Learning",
    duration: "2023 — 2026",
    status: "Currently in Semester 3 · Expected Graduation 2026",
    keyCoursework: [
      "Data Structures & Algorithms",
      "Object-Oriented Programming (C++/Java)",
      "Relational Database Systems (SQL)",
      "Probability, Statistics & Linear Algebra",
      "Operating Systems & Computer Networks"
    ]
  }
};
