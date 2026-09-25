# Placement OS 🎯
> **Candidate:** Samar Raj · BCA (Data Science / AI-ML)  
> **Target:** Sem 3 → Sem 6 Placement Season Preparation  
> **Architecture:** Personal Placement & Academic Operating System

A modern, responsive, phone-friendly, offline-capable **Placement OS** designed for zero-config hosting on **GitHub Pages**.

---

## 🌟 Key Architecture & Modules

### 1. 📊 Central Dashboard
- **Greeting & Current Focus Banner**: Dynamic greeting with Semester 3 status (`Python + SQL + DSA`) and live progress bar.
- **6 Placement Readiness KPIs**:
  - `Overall Roadmap` (% completion across all topics)
  - `DSA Problems Solved` (Interactive counter towards 150 target)
  - `SQL Problems Solved` (Interactive counter towards 150 target)
  - `Major Projects` (Checked checkpoints across 3 systems)
  - `Internships` (Tracked towards 1–2 target)
  - `Certifications` (GCP + Kaggle milestones)
- **Visual Semester Pipeline**: Interactive horizontal roadmap connecting `S3 (Foundations)` ━━ `S4 (ML)` ━━ `S5 (GenAI)` ━━ `S6 (Placement)`.
- **Today's Focus**: Dynamic day-of-week micro-checklist based on the weekly study rhythm with custom task addition.
- **Skill Snapshot & Active Project**: Quick-glance progress widgets.

### 2. 🗺️ Semester Roadmap (Modular, No Checkbox Wall)
- Clean, structured card layout instead of an overwhelming wall of tasks:
  - **Skill Modules Accordion**: Python Core, Python for Data, Backend Basics, SQL, DSA, Git & GitHub. Each module has its own completion bar; clicking expands the detailed checklist.
  - **Problem Solving Target Card**: Direct links to LeetCode Top 150, DataLemur, and StrataScratch.
  - **Project Milestone Card**: Checkpoints and engineering criteria.
  - **Strategic Advisory Banners**: Semester-specific mentorship advice.

### 3. ⚡ Skills Matrix
- Complete technical skills matrix (Python, SQL, DSA, Machine Learning, Generative AI, Git & GitHub, System Design, Core CS).
- Target proficiencies, verification benchmarks, and live progress bars.

### 4. 🚀 Projects Workspace
- Dedicated workspaces for the 3 major portfolio showpieces:
  1. **Full-Stack Analytics Platform** (`Next.js`, `FastAPI`, `PostgreSQL`, `Docker`, `Power BI`)
  2. **Production ML Pipeline** (`Python`, `Scikit-Learn`, `FastAPI`, `Next.js`, `PostgreSQL`)
  3. **Enterprise GenAI & RAG Platform** (`Transformers`, `pgvector`, `LangChain`, `FastAPI`, `Next.js`)

### 5. 💻 Practice Deck (DSA & SQL)
- Problem trackers with quick `+1`, `+5`, and `-1` counter controls.
- Topic distribution tags (Sliding Window, Trees, DP, Window Functions, CTEs).
- Direct access to NeetCode, LeetCode, DataLemur, and StrataScratch.

### 6. 💼 Career CRM & Applications Tracker
- Application funnel metrics (Total Applications, Active Pipeline, Interviews, Offers).
- Interactive Application Table with company, role, platform, status changer (`Applied`, `Interview`, `Offer`, `Rejected`), and notes.
- Profile polish audit (1-Page ATS resume checklist, GitHub repo standards, LinkedIn recommendations).

### 7. 📈 Learning Analytics
- Interactive weekly study time distribution chart (Monday to Sunday study hours).
- Completion by domain category (Python, SQL, DSA, Backend, Projects, Career).
- Placement Readiness composite index (0–100).

### 8. 📥 Export, Backup & Offline Sync
- **Export to CSV**: Tabular report for Excel or Google Sheets.
- **Save to PDF**: Print-optimized executive summary.
- **JSON Backup & Restore**: Transfer data between phone and laptop.
- **100% Offline & Local**: Saved automatically in browser `localStorage`.

---

## 🚀 How to Publish on GitHub Pages (2 Minutes)

1. Create a repository on GitHub (e.g., `placement-os`).
2. Push this folder's contents to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "feat: Upgrade to Placement OS architecture"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** > **Pages** (under "Code and automation" in the left sidebar).
   - Under **Build and deployment** > **Branch**, select `main` and root `/`.
   - Click **Save**.
4. Your site will be live at:  
   `https://<your-username>.github.io/<your-repo-name>/`
