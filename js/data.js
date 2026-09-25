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
