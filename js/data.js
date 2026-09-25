/**
 * Placement Curriculum & Reference Data
 * Samar · BCA (Data Science / AI-ML) · Sem 3 -> Sem 6
 */

export const CURRICULUM = [
  {
    sem: 3,
    title: "Semester 3: Foundations & Backend",
    range: "Sept 2026 – Jan 2027",
    note: "Don't buy Intellipaat yet — revisit only if, after 6–8 weeks on this plan, you still feel you need structured mentorship.",
    sections: [
      {
        id: "s3-py-core",
        label: "Topics — Python Core",
        category: "Python",
        items: [
          "Functions & Lambdas",
          "OOP (Classes, Inheritance, Dunder Methods)",
          "Exceptions & Error Handling",
          "File Handling & Context Managers",
          "Modules & Packages",
          "Virtual Environments (venv/poetry)",
          "Working with APIs & Requests",
          "JSON Parsing & Serialization",
          "Regular Expressions (re)"
        ]
      },
      {
        id: "s3-py-data",
        label: "Topics — Python for Data Science",
        category: "Python",
        items: [
          "NumPy: Arrays, Broadcasting, Matrix Operations",
          "Pandas: DataFrames, Series, Indexing",
          "Pandas: GroupBy, Merging, Pivots",
          "Data Cleaning & Imputation Techniques",
          "Matplotlib & Seaborn Visualizations",
          "Jupyter Notebooks & Exploratory Data Analysis (EDA)"
        ]
      },
      {
        id: "s3-backend",
        label: "Topics — Python Backend Basics",
        category: "Backend",
        items: [
          "Requests Library & HTTP Protocols",
          "FastAPI or Flask Core Principles",
          "Pydantic Validation & Data Models",
          "PostgreSQL Connection (psycopg2 / SQLAlchemy)"
        ]
      },
      {
        id: "s3-sql",
        label: "Topics — SQL Fundamentals & Advanced",
        category: "SQL",
        items: [
          "JOIN (Inner, Left, Right, Full, Cross)",
          "GROUP BY, HAVING & Aggregations",
          "CASE Statements & Conditional Logic",
          "Subqueries (Correlated & Nested)",
          "Common Table Expressions (CTEs)",
          "Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LEAD/LAG)",
          "Database Indexes & Performance",
          "Views & Materialized Views",
          "ACID Transactions & Isolation Levels",
          "Query Optimization & EXPLAIN ANALYZE"
        ]
      },
      {
        id: "s3-dsa",
        label: "Topics — DSA Foundations",
        category: "DSA",
        items: [
          "Arrays & Dynamic Arrays",
          "Strings & Pattern Matching",
          "Hashing & Hash Maps",
          "Two Pointers Technique",
          "Sliding Window Technique",
          "Binary Search & Search Spaces",
          "Stack & Monotonic Stack",
          "Queue & Deque",
          "Singly & Doubly Linked Lists",
          "Binary Trees & Traversals (DFS/BFS)",
          "Binary Search Trees (BST)",
          "Heap / Priority Queue",
          "Recursion & Backtracking",
          "Graphs (Intro & BFS/DFS)",
          "Dynamic Programming (1D Basics)"
        ]
      },
      {
        id: "s3-git",
        label: "Topics — Git & GitHub Best Practices",
        category: "Tools",
        items: [
          "Write a clean, professional README with badges",
          "Add UI/architecture screenshots to repos",
          "Document system architecture & flowcharts",
          "Write clear setup & installation instructions",
          "Document database schema (ER diagrams)",
          "Write clear API docs (Swagger/Postman)",
          "Make meaningful, semantic commits"
        ]
      },
      {
        id: "s3-practice",
        label: "Questions & Problem Solving Target",
        category: "Practice",
        items: [
          "100 SQL problems (DataLemur + LeetCode SQL 50 + StrataScratch)",
          "70–100 DSA problems across topics — patterns over pure count"
        ]
      },
      {
        id: "s3-proj1",
        label: "Project #1 Must-Haves (Full Stack Analytics Platform)",
        category: "Projects",
        isProject: true,
        projectNumber: 1,
        items: [
          "User Authentication (JWT / Session)",
          "Role-based access control (Admin / User)",
          "CSV upload + automated data validation",
          "Interactive performance / analytics dashboard",
          "Trend-over-time view (e.g. monthly analytics)",
          "Target-vs-achievement comparison metrics",
          "Automated report / export feature (CSV/PDF)",
          "Python layer: data cleaning + feature engineering + basic stats",
          "Deployed — touching Next.js/TypeScript, Python/FastAPI, and PostgreSQL/Supabase",
          "Power BI (or equivalent) reporting layer",
          "Docker containerization & deployment"
        ]
      },
      {
        id: "s3-courses",
        label: "Courses & Curricula",
        category: "Courses",
        items: [
          "Python for Everybody — only if Python fundamentals aren't rock solid",
          "Google Advanced Data Analytics Certificate — as structured curriculum"
        ]
      }
    ]
  },
  {
    sem: 4,
    title: "Semester 4: Statistics, Machine Learning & Internships",
    range: "Jan – Jun 2027",
    note: "Sem 4 skill-star target by June 2027: Python ★★★★ · SQL ★★★★★ · DSA ★★★ · ML ★★★ · Git/GitHub ★★★★ · Projects: 2 serious ones · Internship: ideally 1.",
    sections: [
      {
        id: "s4-stats",
        label: "Topics — Applied Statistics & Probability",
        category: "Math & Stats",
        items: [
          "Descriptive Stats: Mean, Median, Mode, Quantiles",
          "Dispersion: Variance, Standard Deviation, IQR",
          "Probability Rules, Conditional Probability & Bayes",
          "Probability Distributions (Normal, Binomial, Poisson)",
          "Correlation vs Covariance & Pearson/Spearman",
          "Hypothesis Testing (p-value, t-test, Chi-square, ANOVA)",
          "Confidence Intervals & Central Limit Theorem",
          "Regression Diagnostics & Assumptions"
        ]
      },
      {
        id: "s4-ml",
        label: "Topics — Machine Learning Fundamentals",
        category: "Machine Learning",
        items: [
          "Linear Regression & Regularization (L1/L2)",
          "Logistic Regression & Classification",
          "Decision Trees & Pruning",
          "Random Forests & Ensemble Methods",
          "K-Means & Hierarchical Clustering",
          "Feature Engineering & Encoding Techniques",
          "Model Evaluation Metrics (ROC-AUC, F1, Precision, Recall)",
          "Neural Network Basics & Perceptrons",
          "Hands-on Implementation with Scikit-Learn"
        ]
      },
      {
        id: "s4-practice",
        label: "Questions & Problem Solving Target",
        category: "Practice",
        items: [
          "Keep SQL practice active — push toward 150 total",
          "Keep DSA practice active — push toward 150 total",
          "Implement each core ML algorithm from scratch once"
        ]
      },
      {
        id: "s4-proj2",
        label: "Project #2 Must-Haves (Production ML Pipeline)",
        category: "Projects",
        isProject: true,
        projectNumber: 2,
        items: [
          "Customer segmentation / Churn prediction / Sales forecasting",
          "Customer Lifetime Value (CLV) calculation",
          "Personalized recommendation feature",
          "A deployed model — live API, not just a Jupyter notebook",
          "Full pipeline: Data → Pandas → PostgreSQL → Model → FastAPI → Next.js Dashboard",
          "Model tracking or evaluation monitoring"
        ]
      },
      {
        id: "s4-career",
        label: "Career & Internship Hunt",
        category: "Career",
        items: [
          "Start internship applications early (Feb–Mar 2027)",
          "Apply to Software Dev / Backend / Python / Data Analyst / ML-AI intern roles",
          "Set up & polish profiles: LinkedIn, Naukri, Internshala, Wellfound, Unstop, Cutshort, Hirist",
          "Check the Manipal placement portal regularly for opportunities",
          "Direct cold outreach to startup founders and tech leads",
          "Land at least 1 internship by end of Sem 4"
        ]
      },
      {
        id: "s4-courses",
        label: "Courses",
        category: "Courses",
        items: [
          "Andrew Ng — Machine Learning Specialization (DeepLearning.AI / Coursera)"
        ]
      }
    ]
  },
  {
    sem: 5,
    title: "Semester 5: Generative AI, System Design & Specialization",
    range: "Jul – Dec 2027",
    note: "Focus on building a showpiece GenAI application and securing a high-impact second internship.",
    sections: [
      {
        id: "s5-stack",
        label: "Topics — Industry Full-Stack & Cloud",
        category: "Backend",
        items: [
          "Python & TypeScript Proficiency",
          "Next.js App Router & Server Components",
          "Node.js Backend Microservices",
          "PostgreSQL & Complex Data Modeling",
          "FastAPI High-Performance Endpoints",
          "Docker & Multi-stage Builds",
          "Cloud Platform Deployment (AWS / GCP / Vercel / Render)"
        ]
      },
      {
        id: "s5-genai",
        label: "Topics — Generative AI & LLM Systems",
        category: "GenAI",
        items: [
          "LLM Fundamentals & Transformers Architecture",
          "Vector Embeddings & Semantic Search",
          "Vector Databases (Pinecone, Chroma, pgvector)",
          "Retrieval-Augmented Generation (RAG) Architecture",
          "Prompt Engineering & Few-Shot Techniques",
          "Function & Tool Calling with LLMs",
          "AI Agent Frameworks (LangChain / LlamaIndex / CrewAI)",
          "Evaluation Methods (Ragas, TruLens, LLM-as-a-judge)",
          "Guardrails & Hallucination Mitigation"
        ]
      },
      {
        id: "s5-sysdesign",
        label: "Topics — System Design Foundations",
        category: "System Design",
        items: [
          "HTTP/HTTPS, WebSockets, REST APIs",
          "Authentication, JWT & OAuth2",
          "Caching Strategies (Redis)",
          "DB Indexing, Partitioning & Sharding",
          "Load Balancing & Reverse Proxies (Nginx)",
          "Message Queues (RabbitMQ / Kafka / Celery)",
          "Microservices vs Monolith Architecture"
        ]
      },
      {
        id: "s5-sysdesign-practice",
        label: "System Design Practice Problems",
        category: "System Design",
        items: [
          "Design a URL Shortener (TinyURL)",
          "Design a Scalable Attendance System",
          "Design a Food Delivery Backend",
          "Design a Real-time Chat Application"
        ]
      },
      {
        id: "s5-practice",
        label: "Questions & Problem Solving Target",
        category: "Practice",
        items: [
          "150–200 DSA problems (Arrays, Two Pointers, Trees, Graphs, Greedy, DP)",
          "150+ SQL problems (Top-N per group, MoM, retention, deduplication)"
        ]
      },
      {
        id: "s5-proj3",
        label: "Project #3 Must-Haves (Showpiece GenAI / Data Platform)",
        category: "Projects",
        isProject: true,
        projectNumber: 3,
        items: [
          "Natural-language question answering over enterprise data",
          "Text-to-SQL query generation engine",
          "Business metric analysis + automatic anomaly explanation",
          "Automated chart & analytical report generation",
          "Production RAG over supporting documentation",
          "Fully deployed live system — not just a demo notebook"
        ]
      },
      {
        id: "s5-career",
        label: "Career & Applications",
        category: "Career",
        items: [
          "Land internship #2 — ideally 3–6 months at startup/SaaS/data/AI company",
          "Keep applications and networking continuous in parallel"
        ]
      },
      {
        id: "s5-courses",
        label: "Courses",
        category: "Courses",
        items: [
          "DeepLearning.AI Generative AI / RAG Specialization"
        ]
      }
    ]
  },
  {
    sem: 6,
    title: "Semester 6: Placement Blitz & Core CS Revision",
    range: "Jan 2028 onward",
    note: "Prep-time split this semester: DSA 40% · SQL 20% · Core CS 15% · Projects 15% · Applications & Referrals 10%.",
    sections: [
      {
        id: "s6-corecs",
        label: "Topics — Core CS Revision (Interview Ready)",
        category: "Core CS",
        items: [
          "DBMS: Normalization, ACID, Transactions, Indexing, Joins, Triggers",
          "Operating Systems: Processes, Threads, Memory Management, CPU Scheduling, Deadlock",
          "Computer Networks: HTTP/HTTPS, TCP/IP, DNS, OSI 7-Layer, REST, Sockets",
          "OOP: Encapsulation, Inheritance, Polymorphism, Abstraction, Design Patterns"
        ]
      },
      {
        id: "s6-practice",
        label: "Revision & Mock Interview Practice",
        category: "Practice",
        items: [
          "Full revision pass over your DSA problem set",
          "Full revision pass over your SQL problem set",
          "Timed mock technical interviews & live problem solving"
        ]
      },
      {
        id: "s6-portfolio",
        label: "Portfolio & Presentation Polish",
        category: "Portfolio",
        items: [
          "Resume trimmed to a high-impact, ATS-optimized 1 page",
          "GitHub cleaned to 8–12 polished, well-documented quality repos",
          "All 3 major projects deployed, live, and linked on resume/GitHub",
          "LinkedIn profile active, professional, and optimized for recruiters",
          "2–4 relevant certifications showcased (Google Cloud, Kaggle, etc.)"
        ]
      },
      {
        id: "s6-career",
        label: "Campus & Off-Campus Placement Blitz",
        category: "Career",
        items: [
          "Apply immediately once the Manipal placement portal opens",
          "Apply broadly: Software Dev, Full Stack, Backend, Python, Data Analyst, Data Eng, AI/ML",
          "Target hundreds of structured applications across the season",
          "Continuous active referral outreach through alumni and LinkedIn networks"
        ]
      }
    ]
  }
];

export const WEEKLY_RHYTHM = [
  { day: "Monday", tasks: "1h DSA · 1h Python / ML", focus: "Problem Solving & Core Skills" },
  { day: "Tuesday", tasks: "1h SQL · 1.5h Project Dev", focus: "Data & Project Building" },
  { day: "Wednesday", tasks: "1h DSA · 1h Course / Theory", focus: "Algorithms & Concept Mastery" },
  { day: "Thursday", tasks: "1h SQL · 1.5h Project Dev", focus: "Data & Project Building" },
  { day: "Friday", tasks: "1h DSA · 1h Python / ML", focus: "Weekly Review & Code Polish" },
  { day: "Saturday", tasks: "3–4h Project Deep Dive · 1h DSA", focus: "Major Feature Implementation" },
  { day: "Sunday", tasks: "2h Project · 1h Revision · 1h Applications", focus: "Polish & Career Prep" }
];

export const TARGET_SNAPSHOT = [
  { metric: "Python", target: "Strong / Production Ready", tag: "Tech" },
  { metric: "SQL", target: "150+ Complex Problems Solved", tag: "Practice" },
  { metric: "DSA", target: "150–200 LeetCode Problems Solved", tag: "Practice" },
  { metric: "Machine Learning", target: "Solid Fundamentals & Algorithms from scratch", tag: "AI/ML" },
  { metric: "Generative AI", target: "1 Production Deployed Project (RAG + Agent)", tag: "AI/ML" },
  { metric: "GitHub Profile", target: "8–12 Quality Repos with Documentation", tag: "Portfolio" },
  { metric: "Major Projects", target: "3 Full Stack / ML / GenAI Systems", tag: "Portfolio" },
  { metric: "Internships", target: "1–2 Real Industry Internships", tag: "Career" },
  { metric: "Live Deployments", target: "3+ Accessible Web Apps / APIs", tag: "Portfolio" },
  { metric: "LinkedIn", target: "Professional, Active Network & Content", tag: "Career" },
  { metric: "Resume", target: "1-Page ATS-Optimized Clean Resume", tag: "Career" },
  { metric: "Certifications", target: "2–4 Relevant (GCP, Kaggle, Coursera)", tag: "Creds" },
  { metric: "System Design", target: "Basic Scalability & Architecture Knowledge", tag: "Core" },
  { metric: "Core CS (OS/DBMS/CN/OOP)", target: "Interview-Ready Fluency", tag: "Core" },
  { metric: "Applications", target: "Hundreds over placement cycle", tag: "Career" },
  { metric: "Referrals", target: "Continuous Alumni & Tech Outreach", tag: "Career" }
];

export const SKILLS_MATRIX = [
  {
    id: "python",
    name: "Python",
    category: "Languages & Frameworks",
    target: "Strong / Production Ready",
    benchmark: "Core, OOP, Data Stack, FastAPI",
    semesters: [3, 4, 5],
    icon: "🐍",
    topics: [
      "Functions & Lambdas", "OOP & Inheritance", "Exceptions & Error Handling",
      "File Handling & Context Managers", "Modules & Packages", "Virtual Environments",
      "APIs & Requests", "JSON Serialization", "Regular Expressions", "NumPy Arrays",
      "Pandas DataFrames", "Data Cleaning & Imputation", "Matplotlib & Seaborn"
    ]
  },
  {
    id: "sql",
    name: "SQL & Databases",
    category: "Data & Persistence",
    target: "150+ Problems (Advanced)",
    benchmark: "CTEs, Window Functions, Optimization",
    semesters: [3, 4, 5],
    icon: "🗄️",
    topics: [
      "Inner & Outer JOINs", "GROUP BY & Aggregations", "CASE & Conditionals",
      "Subqueries (Correlated)", "Common Table Expressions (CTEs)", "Window Functions",
      "Indexes & Query Optimization", "Views & Materialized Views", "ACID Transactions",
      "EXPLAIN ANALYZE"
    ]
  },
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    category: "Problem Solving",
    target: "150–200 Problems",
    benchmark: "Patterns over count: Two Pointers, Trees, DP",
    semesters: [3, 4, 5, 6],
    icon: "⚡",
    topics: [
      "Arrays & Dynamic Arrays", "Strings & Pattern Matching", "Hashing & Hash Maps",
      "Two Pointers Technique", "Sliding Window Technique", "Binary Search Spaces",
      "Stack & Monotonic Stack", "Queue & Deque", "Linked Lists", "Binary Trees & BST",
      "Heap & Priority Queue", "Recursion & Backtracking", "Graph BFS/DFS", "Dynamic Programming"
    ]
  },
  {
    id: "ml",
    name: "Machine Learning",
    category: "AI & Data Science",
    target: "Solid Fundamentals",
    benchmark: "Regression, Trees, Ensembles, Metrics",
    semesters: [4],
    icon: "🤖",
    topics: [
      "Linear & Logistic Regression", "Decision Trees & Random Forests",
      "K-Means Clustering", "Feature Engineering", "Evaluation Metrics (ROC-AUC, F1)",
      "Neural Networks Basics", "Implementations from Scratch", "Scikit-Learn Pipeline"
    ]
  },
  {
    id: "genai",
    name: "Generative AI & LLMs",
    category: "AI & Data Science",
    target: "1 Production Project",
    benchmark: "RAG, Vector DB, Tool-Calling Agents",
    semesters: [5],
    icon: "✨",
    topics: [
      "LLM Architectures", "Embeddings & Semantic Search", "Vector Databases (pgvector)",
      "RAG Architecture", "Prompt Engineering", "Function / Tool Calling",
      "AI Agents (LangChain / CrewAI)", "Guardrails & Evaluation"
    ]
  },
  {
    id: "git",
    name: "Git & GitHub",
    category: "Developer Tools",
    target: "Strong / Professional",
    benchmark: "8–12 Quality Repos, Architecture Docs",
    semesters: [3, 6],
    icon: "🐙",
    topics: [
      "Semantic Commits", "README Documentation", "Screenshots & Demos",
      "Architecture Flowcharts", "Setup & Install Guides", "Database Schema Docs", "API Swagger Docs"
    ]
  },
  {
    id: "system-design",
    name: "System Design",
    category: "Architecture",
    target: "Basic Scalability",
    benchmark: "Caching, Queues, DB Indexing, Microservices",
    semesters: [5],
    icon: "🏗️",
    topics: [
      "REST APIs & WebSockets", "Authentication & JWT", "Redis Caching Strategies",
      "Database Sharding & Indexes", "Load Balancing & Nginx", "Message Queues (Kafka/Celery)",
      "URL Shortener Design", "Chat App Design"
    ]
  },
  {
    id: "core-cs",
    name: "Core CS Fundamentals",
    category: "Interview Foundations",
    target: "Interview-Ready Fluency",
    benchmark: "DBMS, OS, CN, OOP",
    semesters: [6],
    icon: "📚",
    topics: [
      "DBMS: Normalization & ACID", "OS: Processes, Threads & Deadlocks",
      "OS: Memory & Paging", "CN: TCP/IP & HTTP/HTTPS", "CN: DNS & OSI Model",
      "OOP: Polymorphism & Design Patterns"
    ]
  }
];

export const PROJECTS_SPEC = [
  {
    id: 1,
    title: "Project #1: Full-Stack Analytics Platform",
    shortName: "Analytics Platform",
    semester: 3,
    type: "Full-Stack + Data Engineering",
    description: "Multi-tenant analytics platform with authentication, secure CSV ingestion, automated data validation, interactive KPI dashboards, and automated scheduled reporting.",
    stack: ["Next.js", "TypeScript", "FastAPI", "Python", "PostgreSQL", "Docker", "Power BI"],
    checkpoints: [
      { id: "p1-auth", label: "User authentication (JWT / Session)" },
      { id: "p1-rbac", label: "Role-based access control (Admin / User)" },
      { id: "p1-csv", label: "CSV upload + automated data validation pipeline" },
      { id: "p1-dashboard", label: "Interactive performance & analytics dashboard" },
      { id: "p1-trend", label: "Trend-over-time visual analytics (monthly/quarterly)" },
      { id: "p1-target", label: "Target-vs-achievement KPI comparison metrics" },
      { id: "p1-report", label: "Automated report export feature (CSV / PDF)" },
      { id: "p1-python", label: "Python layer: cleaning + feature engineering + stats" },
      { id: "p1-deploy", label: "Live deployment on cloud (Vercel + Render / Cloud)" },
      { id: "p1-bi", label: "Power BI (or equivalent) embedded reporting layer" },
      { id: "p1-docker", label: "Docker containerization & docker-compose configuration" }
    ]
  },
  {
    id: 2,
    title: "Project #2: Production ML Pipeline & Churn Prediction",
    shortName: "Production ML Pipeline",
    semester: 4,
    type: "Machine Learning & MLOps",
    description: "End-to-end predictive customer intelligence system integrating RFM segmentation, XGBoost churn classification, CLV estimation, and automated FastAPI inference.",
    stack: ["Python", "Scikit-Learn", "PostgreSQL", "FastAPI", "Next.js", "Pandas", "Docker"],
    checkpoints: [
      { id: "p2-segment", label: "Customer RFM segmentation & clustering" },
      { id: "p2-churn", label: "Supervised churn prediction model with evaluation" },
      { id: "p2-forecast", label: "Sales forecasting or time-series module" },
      { id: "p2-clv", label: "Customer Lifetime Value (CLV) calculation engine" },
      { id: "p2-recom", label: "Personalized item or action recommendation engine" },
      { id: "p2-api", label: "FastAPI inference service with pydantic validation" },
      { id: "p2-pipeline", label: "Complete pipeline: Data → PostgreSQL → Model → UI" },
      { id: "p2-deploy", label: "Live cloud deployment with interactive inference demo" }
    ]
  },
  {
    id: 3,
    title: "Project #3: Enterprise GenAI & Showpiece RAG Platform",
    shortName: "Enterprise GenAI Platform",
    semester: 5,
    type: "Generative AI & LLM Systems",
    description: "Flagship showpiece platform featuring conversational question answering over proprietary company data, natural text-to-SQL generation, vector RAG search, and automated anomaly diagnosis.",
    stack: ["Python", "LangChain/LlamaIndex", "pgvector", "FastAPI", "Next.js", "Claude/GPT/Gemini", "Docker"],
    checkpoints: [
      { id: "p3-qa", label: "Natural-language Q&A over enterprise datasets" },
      { id: "p3-sql", label: "Natural text-to-SQL query generation engine" },
      { id: "p3-anomaly", label: "Business metric analysis + LLM anomaly explanation" },
      { id: "p3-charts", label: "Dynamic automated chart & analytical report synthesis" },
      { id: "p3-rag", label: "Production RAG over documentation (pgvector / Chroma)" },
      { id: "p3-agent", label: "Autonomous agent tool-calling for data retrieval" },
      { id: "p3-deploy", label: "Fully deployed live web app with latency & guardrail checks" }
    ]
  }
];

export const TODAY_FOCUS_TEMPLATES = {
  1: { // Monday
    name: "Monday",
    rhythm: "1h DSA · 1h Python / ML",
    theme: "Algorithms & Core Language Foundations",
    tasks: [
      { tag: "DSA", text: "Solve 2 LeetCode Two Pointers / Sliding Window problems" },
      { tag: "Python", text: "Complete Python OOP: Classes, Inheritance & Dunder methods" },
      { tag: "Review", text: "Verify time and space complexity of today's solutions" }
    ]
  },
  2: { // Tuesday
    name: "Tuesday",
    rhythm: "1h SQL · 1.5h Project Dev",
    theme: "Data Querying & Full-Stack Implementation",
    tasks: [
      { tag: "SQL", text: "Solve 3 JOIN & GROUP BY problems on DataLemur or LeetCode" },
      { tag: "Project", text: "Implement FastAPI backend endpoints or PostgreSQL schema" },
      { tag: "Data", text: "Validate CSV upload parsing and error responses" }
    ]
  },
  3: { // Wednesday
    name: "Wednesday",
    rhythm: "1h DSA · 1h Course / Theory",
    theme: "Algorithmic Patterns & Structured Learning",
    tasks: [
      { tag: "DSA", text: "Solve 2 Binary Search / Hashing problems" },
      { tag: "Course", text: "Complete 1 module of Google Advanced Data Analytics / Course" },
      { tag: "Notes", text: "Document edge cases and recurring problem patterns" }
    ]
  },
  4: { // Thursday
    name: "Thursday",
    rhythm: "1h SQL · 1.5h Project Dev",
    theme: "Advanced SQL & Feature Engineering",
    tasks: [
      { tag: "SQL", text: "Solve 2 Window Functions problems (RANK, DENSE_RANK, LEAD/LAG)" },
      { tag: "Project", text: "Build frontend analytics dashboard view in Next.js" },
      { tag: "Git", text: "Make semantic commit and test local Docker container" }
    ]
  },
  5: { // Friday
    name: "Friday",
    rhythm: "1h DSA · 1h Python / ML",
    theme: "Weekly Mastery & Coding Polish",
    tasks: [
      { tag: "DSA", text: "Solve 2 Stack / Queue / Recursion practice problems" },
      { tag: "Python", text: "Practice NumPy matrix operations and Pandas groupby aggregations" },
      { tag: "Review", text: "Audit weekly problem count and log completed questions" }
    ]
  },
  6: { // Saturday
    name: "Saturday",
    rhythm: "3–4h Project Deep Dive · 1h DSA",
    theme: "Deep Work Sprint & Heavy Feature Building",
    tasks: [
      { tag: "Project", text: "Sprint 1: Complete major feature (Auth / Visualization / API)" },
      { tag: "Project", text: "Sprint 2: Integrate frontend components with live database" },
      { tag: "DSA", text: "Solve 1 Medium difficulty Binary Tree or Graph question" }
    ]
  },
  0: { // Sunday
    name: "Sunday",
    rhythm: "2h Project · 1h Revision · 1h Applications",
    theme: "System Polish, Spaced Repetition & Career CRM",
    tasks: [
      { tag: "Project", text: "Polish UI responsiveness, error states, and documentation" },
      { tag: "Revision", text: "Spaced repetition review of all DSA & SQL problems from this week" },
      { tag: "Career", text: "Log 3 internship opportunities or refine LinkedIn / Resume notes" }
    ]
  }
};

export const INITIAL_CAREER_APPLICATIONS = [
  {
    id: "app-1",
    company: "ABC Tech Labs",
    role: "Python Backend Intern",
    platform: "Wellfound",
    status: "Applied",
    date: "2026-09-20",
    notes: "Applied with Project #1 repo link and ATS resume."
  },
  {
    id: "app-2",
    company: "XYZ Data Solutions",
    role: "Junior Data Analyst",
    platform: "LinkedIn",
    status: "Interview",
    date: "2026-09-18",
    notes: "Technical screening on SQL window functions & Pandas scheduled."
  },
  {
    id: "app-3",
    company: "ScaleGrid Systems",
    role: "Full Stack / Python Intern",
    platform: "Manipal Portal",
    status: "Saved",
    date: "2026-09-24",
    notes: "Requires FastAPI + PostgreSQL portfolio project."
  }
];

export const STUDY_HOURS_TARGET = [
  { day: "Mon", target: 2.0, label: "Mon (2h)" },
  { day: "Tue", target: 2.5, label: "Tue (2.5h)" },
  { day: "Wed", target: 2.0, label: "Wed (2h)" },
  { day: "Thu", target: 2.5, label: "Thu (2.5h)" },
  { day: "Fri", target: 2.0, label: "Fri (2h)" },
  { day: "Sat", target: 4.5, label: "Sat (4.5h)" },
  { day: "Sun", target: 4.0, label: "Sun (4h)" }
];

