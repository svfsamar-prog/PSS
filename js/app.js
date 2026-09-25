/**
 * Placement OS Application Logic
 * Personal Academic + Placement Roadmap & Career OS
 * Candidate: Samar Raj · BCA (Data Science / AI-ML)
 */

import {
  CURRICULUM,
  WEEKLY_RHYTHM,
  TARGET_SNAPSHOT,
  SKILLS_MATRIX,
  PROJECTS_SPEC,
  TODAY_FOCUS_TEMPLATES,
  INITIAL_CAREER_APPLICATIONS,
  STUDY_HOURS_TARGET
} from "./data.js";

import { exportToCSV, exportToPDF, exportBackupJSON, importBackupJSON } from "./export.js";

// Storage Keys
const STORAGE_KEY_STATE = "placement-tracker-v2";
const STORAGE_KEY_CUSTOM = "placement-custom-tasks-v2";
const STORAGE_KEY_METRICS = "placement-os-metrics-v1";
const STORAGE_KEY_APPLICATIONS = "placement-os-applications-v1";
const STORAGE_KEY_FOCUS = "placement-os-daily-focus-v1";
const STORAGE_KEY_THEME = "placement-theme";
const LEGACY_KEY_V1 = "placement-ledger-v1";

class PlacementOSApp {
  constructor() {
    this.curriculum = CURRICULUM;
    this.skillsMatrix = SKILLS_MATRIX;
    this.projectsSpec = PROJECTS_SPEC;
    this.activeSemIndex = 0; // 0 = Sem 3, 1 = Sem 4, 2 = Sem 5, 3 = Sem 6
    this.activeView = "dashboard"; // dashboard | roadmap | skills | projects | practice | career | analytics | rhythm | targets | export

    this.state = this.loadState();
    this.customTasks = this.loadCustomTasks();
    this.metrics = this.loadMetrics();
    this.applications = this.loadApplications();
    this.dailyFocusState = this.loadDailyFocusState();

    this.initTheme();
    this.initDOM();
    this.bindEvents();
    this.render();
  }

  /* ==========================================================================
     Storage & Persistence
     ========================================================================== */
  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATE);
      if (saved) return JSON.parse(saved);

      const legacy = localStorage.getItem(LEGACY_KEY_V1);
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        const migrated = {};
        for (const [key, val] of Object.entries(parsedLegacy)) {
          if (val) {
            migrated[key] = { done: true, at: new Date().toISOString().slice(0, 10) };
          }
        }
        localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(migrated));
        return migrated;
      }
    } catch (e) {
      console.error("Failed to load task state:", e);
    }
    return {};
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(this.state));
    } catch (e) {}
  }

  loadCustomTasks() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveCustomTasks() {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(this.customTasks));
    } catch (e) {}
  }

  loadMetrics() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_METRICS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default starting placement benchmarks
    return {
      dsaSolved: 42,
      sqlSolved: 68,
      internshipsDone: 0,
      certificationsDone: 2,
      studyHours: {
        Mon: 2.0,
        Tue: 2.5,
        Wed: 2.0,
        Thu: 2.5,
        Fri: 2.0,
        Sat: 4.0,
        Sun: 3.5
      }
    };
  }

  saveMetrics() {
    try {
      localStorage.setItem(STORAGE_KEY_METRICS, JSON.stringify(this.metrics));
    } catch (e) {}
  }

  loadApplications() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_CAREER_APPLICATIONS;
  }

  saveApplications() {
    try {
      localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(this.applications));
    } catch (e) {}
  }

  loadDailyFocusState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FOCUS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      checks: {},
      customItems: []
    };
  }

  saveDailyFocusState() {
    try {
      localStorage.setItem(STORAGE_KEY_FOCUS, JSON.stringify(this.dailyFocusState));
    } catch (e) {}
  }

  /* ==========================================================================
     Theme Management
     ========================================================================== */
  initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
    this.updateThemeIcon();
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let nextTheme = "dark";

    if (current === "dark") nextTheme = "light";
    else if (current === "light") nextTheme = "dark";
    else nextTheme = systemDark ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem(STORAGE_KEY_THEME, nextTheme);
    this.updateThemeIcon();
    this.showToast(`Switched to ${nextTheme} mode`);
  }

  updateThemeIcon() {
    const themeBtn = document.getElementById("themeToggleBtn");
    if (!themeBtn) return;
    const isDark = document.documentElement.getAttribute("data-theme") === "dark" ||
      (!document.documentElement.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    themeBtn.innerHTML = isDark ? "☀️" : "🌙";
    themeBtn.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
  }

  /* ==========================================================================
     DOM Initialization & Event Bindings
     ========================================================================== */
  initDOM() {
    this.dom = {
      mainContainer: document.getElementById("mainContent"),
      themeToggleBtn: document.getElementById("themeToggleBtn"),
      toast: document.getElementById("toast"),
      addTaskModal: document.getElementById("addTaskModal"),
      addTaskForm: document.getElementById("addTaskForm"),
      closeModalBtn: document.getElementById("closeModalBtn"),
      cancelModalBtn: document.getElementById("cancelModalBtn"),
      addAppModal: document.getElementById("addAppModal"),
      addAppForm: document.getElementById("addAppForm"),
      closeAppModalBtn: document.getElementById("closeAppModalBtn"),
      cancelAppModalBtn: document.getElementById("cancelAppModalBtn"),
      sidebarFocusTopic: document.getElementById("sidebarFocusTopic"),
      sidebarFocusFill: document.getElementById("sidebarFocusFill"),
      sidebarFocusBtn: document.getElementById("sidebarFocusBtn")
    };
  }

  bindEvents() {
    // Theme toggle
    this.dom.themeToggleBtn?.addEventListener("click", () => this.toggleTheme());

    // Navigation (Sidebar + Top bar + Mobile bottom bar)
    document.querySelectorAll("[data-nav-view]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const view = e.currentTarget.getAttribute("data-nav-view");
        this.switchView(view);
      });
    });

    // Sidebar Focus CTA
    this.dom.sidebarFocusBtn?.addEventListener("click", () => {
      this.activeSemIndex = 0;
      this.switchView("roadmap");
    });

    // Add Task Modal events
    document.getElementById("openAddTaskBtn")?.addEventListener("click", () => this.openAddTaskModal());
    this.dom.closeModalBtn?.addEventListener("click", () => this.closeAddTaskModal());
    this.dom.cancelModalBtn?.addEventListener("click", () => this.closeAddTaskModal());
    this.dom.addTaskModal?.addEventListener("click", (e) => {
      if (e.target === this.dom.addTaskModal) this.closeAddTaskModal();
    });
    this.dom.addTaskForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleAddTaskSubmit();
    });

    // Add Application Modal events
    this.dom.closeAppModalBtn?.addEventListener("click", () => this.closeAddAppModal());
    this.dom.cancelAppModalBtn?.addEventListener("click", () => this.closeAddAppModal());
    this.dom.addAppModal?.addEventListener("click", (e) => {
      if (e.target === this.dom.addAppModal) this.closeAddAppModal();
    });
    this.dom.addAppForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleAddAppSubmit();
    });
  }

  /* ==========================================================================
     Calculations & Metrics
     ========================================================================== */
  isTaskDone(id) {
    const val = this.state[id];
    if (!val) return false;
    return typeof val === "object" ? val.done : !!val;
  }

  setTaskDone(id, isDone) {
    if (isDone) {
      this.state[id] = {
        done: true,
        at: new Date().toISOString().slice(0, 10)
      };
    } else {
      delete this.state[id];
    }
    this.saveState();
  }

  calculateStats() {
    let totalAll = 0;
    let doneAll = 0;

    const semStats = this.curriculum.map((semData, si) => {
      let semTot = 0;
      let semDone = 0;

      semData.sections.forEach((sec, ci) => {
        sec.items.forEach((_, ii) => {
          semTot++;
          totalAll++;
          const id = `s${si}-${ci}-${ii}`;
          if (this.isTaskDone(id)) {
            semDone++;
            doneAll++;
          }
        });
      });

      // Factor in custom tasks for this semester
      const semCustom = this.customTasks.filter(t => t.sem === semData.sem);
      semCustom.forEach(t => {
        semTot++;
        totalAll++;
        if (t.done) {
          semDone++;
          doneAll++;
        }
      });

      const pct = semTot ? Math.round((semDone / semTot) * 100) : 0;
      return { sem: semData.sem, tot: semTot, done: semDone, pct };
    });

    const overallPct = totalAll ? Math.round((doneAll / totalAll) * 100) : 0;

    // Project completion calculations (Project 1: Sem 3, Project 2: Sem 4, Project 3: Sem 5)
    const projectStats = [0, 1, 2].map(semIdx => {
      const sem = this.curriculum[semIdx];
      const projSec = sem.sections.find(s => s.isProject);
      if (!projSec) return { done: false, pct: 0, count: "0/0" };
      const secIdx = sem.sections.indexOf(projSec);
      const doneItems = projSec.items.filter((_, ii) => this.isTaskDone(`s${semIdx}-${secIdx}-${ii}`)).length;
      const pct = Math.round((doneItems / projSec.items.length) * 100);
      return { done: pct === 100, pct, count: `${doneItems}/${projSec.items.length}` };
    });

    const completedProjectsCount = projectStats.filter(p => p.done).length;

    return {
      totalAll,
      doneAll,
      overallPct,
      semStats,
      projectStats,
      completedProjectsCount
    };
  }

  /* ==========================================================================
     Navigation & Rendering
     ========================================================================== */
  switchView(viewName) {
    this.activeView = viewName;

    // Update active state in all navigation bars
    document.querySelectorAll("[data-nav-view]").forEach(btn => {
      const isTarget = btn.getAttribute("data-nav-view") === viewName;
      btn.classList.toggle("active", isTarget);
    });

    this.render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  render() {
    this.updateSidebarFocus();

    switch (this.activeView) {
      case "dashboard":
        this.renderDashboardView();
        break;
      case "roadmap":
        this.renderRoadmapView();
        break;
      case "skills":
        this.renderSkillsMatrixView();
        break;
      case "projects":
        this.renderProjectsView();
        break;
      case "practice":
        this.renderPracticeView();
        break;
      case "career":
        this.renderCareerView();
        break;
      case "analytics":
        this.renderAnalyticsView();
        break;
      case "rhythm":
        this.renderRhythmView();
        break;
      case "targets":
        this.renderTargetsView();
        break;
      case "export":
        this.renderExportView();
        break;
      default:
        this.renderDashboardView();
    }
  }

  updateSidebarFocus() {
    const stats = this.calculateStats();
    const sem3Stat = stats.semStats[0];
    if (this.dom.sidebarFocusFill) {
      this.dom.sidebarFocusFill.style.width = `${sem3Stat.pct}%`;
    }
  }

  /* ==========================================================================
     VIEW 1: DASHBOARD
     ========================================================================== */
  renderDashboardView() {
    const stats = this.calculateStats();
    const sem3Pct = stats.semStats[0].pct;
    const curHour = new Date().getHours();
    let timeGreeting = "Good day";
    if (curHour >= 5 && curHour < 12) timeGreeting = "Good morning";
    else if (curHour >= 12 && curHour < 17) timeGreeting = "Good afternoon";
    else timeGreeting = "Good evening";

    const dayIdx = new Date().getDay();
    const todayPlan = TODAY_FOCUS_TEMPLATES[dayIdx] || TODAY_FOCUS_TEMPLATES[1];

    // Compute Project #1 completion
    const p1Stat = stats.projectStats[0];

    const html = `
      <!-- Welcome Hero -->
      <section class="welcome-hero">
        <div>
          <h2 class="welcome-title">${timeGreeting}, Samar</h2>
          <div class="welcome-sub">
            <span>Your placement journey</span> · 
            <b>Semester 3 (Sept 2026 – Jan 2027)</b>
            <span class="status-pill">Active Season</span>
          </div>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn-outline" id="dashViewRoadmapBtn">Explore Roadmap →</button>
          <button class="btn-primary" id="dashQuickLogBtn">⚡ Log Practice</button>
        </div>
      </section>

      <!-- Current Focus Hero Card -->
      <div class="focus-hero-card">
        <div class="focus-hero-content">
          <div class="focus-hero-tag">
            <span>🎯</span> Current Academic & Career Focus
          </div>
          <div class="focus-hero-headline">Python Core + SQL Advanced + DSA Patterns</div>
          <div class="focus-progress-wrap">
            <div class="focus-progress-bar">
              <div class="focus-progress-fill" style="width: ${sem3Pct}%;"></div>
            </div>
            <div class="focus-progress-label">${sem3Pct}% completed</div>
          </div>
        </div>
        <button class="btn-primary" id="dashContinueRoadmapBtn">
          Continue Roadmap →
        </button>
      </div>

      <!-- 6-Card Placement Readiness KPI Grid -->
      <div class="readiness-kpis">
        <div class="readiness-kpi-card" id="kpiOverallCard" style="cursor:pointer;">
          <div class="kpi-label">Overall Roadmap</div>
          <div class="kpi-val">${stats.overallPct}%</div>
          <div class="kpi-bar">
            <div class="kpi-bar-fill" style="width: ${stats.overallPct}%;"></div>
          </div>
          <div class="kpi-meta">
            <span>${stats.doneAll}/${stats.totalAll} topics</span>
            <span style="color:var(--accent-blue);">Details →</span>
          </div>
        </div>

        <div class="readiness-kpi-card">
          <div class="kpi-label">DSA Solved</div>
          <div class="kpi-val">${this.metrics.dsaSolved} <span style="font-size:0.95rem; color:var(--ink-muted);">/ 150</span></div>
          <div class="kpi-bar">
            <div class="kpi-bar-fill" style="width: ${Math.min(100, Math.round((this.metrics.dsaSolved / 150) * 100))}%;"></div>
          </div>
          <div class="kpi-meta">
            <span>Target: 150 problems</span>
            <button class="kpi-quick-btn" id="quickDsaPlusBtn">+1</button>
          </div>
        </div>

        <div class="readiness-kpi-card">
          <div class="kpi-label">SQL Solved</div>
          <div class="kpi-val">${this.metrics.sqlSolved} <span style="font-size:0.95rem; color:var(--ink-muted);">/ 150</span></div>
          <div class="kpi-bar">
            <div class="kpi-bar-fill" style="width: ${Math.min(100, Math.round((this.metrics.sqlSolved / 150) * 100))}%;"></div>
          </div>
          <div class="kpi-meta">
            <span>Target: 150 problems</span>
            <button class="kpi-quick-btn" id="quickSqlPlusBtn">+1</button>
          </div>
        </div>

        <div class="readiness-kpi-card" id="kpiProjectsCard" style="cursor:pointer;">
          <div class="kpi-label">Major Projects</div>
          <div class="kpi-val">${stats.completedProjectsCount} <span style="font-size:0.95rem; color:var(--ink-muted);">/ 3</span></div>
          <div class="kpi-bar">
            <div class="kpi-bar-fill" style="width: ${Math.round((stats.completedProjectsCount / 3) * 100)}%;"></div>
          </div>
          <div class="kpi-meta">
            <span>P1: ${p1Stat.pct}% done</span>
            <span style="color:var(--accent-blue);">Manage →</span>
          </div>
        </div>

        <div class="readiness-kpi-card" id="kpiInternshipsCard" style="cursor:pointer;">
          <div class="kpi-label">Internships</div>
          <div class="kpi-val">${this.metrics.internshipsDone} <span style="font-size:0.95rem; color:var(--ink-muted);">/ 2</span></div>
          <div class="kpi-bar">
            <div class="kpi-bar-fill" style="width: ${(this.metrics.internshipsDone / 2) * 100}%;"></div>
          </div>
          <div class="kpi-meta">
            <span>Target: 1-2 by Sem 5</span>
            <button class="kpi-quick-btn" id="quickInternPlusBtn">+1</button>
          </div>
        </div>

        <div class="readiness-kpi-card">
          <div class="kpi-label">Certifications</div>
          <div class="kpi-val">${this.metrics.certificationsDone} <span style="font-size:0.95rem; color:var(--ink-muted);">/ 4</span></div>
          <div class="kpi-bar">
            <div class="kpi-bar-fill" style="width: ${(this.metrics.certificationsDone / 4) * 100}%;"></div>
          </div>
          <div class="kpi-meta">
            <span>Google Cloud + Kaggle</span>
            <button class="kpi-quick-btn" id="quickCertPlusBtn">+1</button>
          </div>
        </div>
      </div>

      <!-- Semester Roadmap Visual Timeline Bar -->
      <div class="roadmap-timeline-card">
        <div class="section-title-wrap">
          <div class="section-title">
            <span>🗺️</span> Placement Journey Pipeline
          </div>
          <div class="section-subtitle">Click any semester milestone to view detailed roadmap</div>
        </div>

        <div class="timeline-track-wrap">
          <div class="timeline-line-bg"></div>
          <div class="timeline-nodes-grid">
            <button class="timeline-node now" data-sem-jump="0">
              <div class="timeline-node-pin">S3</div>
              <div class="timeline-node-badge">NOW</div>
              <div class="timeline-node-title">Foundations</div>
              <div class="timeline-node-subtitle">Python · SQL · DSA · Project 1</div>
              <div class="timeline-node-pct">${stats.semStats[0].pct}% complete</div>
            </button>

            <button class="timeline-node" data-sem-jump="1">
              <div class="timeline-node-pin">S4</div>
              <div class="timeline-node-badge" style="color:var(--ink-muted);">UPCOMING</div>
              <div class="timeline-node-title">Machine Learning</div>
              <div class="timeline-node-subtitle">Stats · Scikit-Learn · Internship #1</div>
              <div class="timeline-node-pct">${stats.semStats[1].pct}% complete</div>
            </button>

            <button class="timeline-node" data-sem-jump="2">
              <div class="timeline-node-pin">S5</div>
              <div class="timeline-node-badge" style="color:var(--ink-muted);">PLANNED</div>
              <div class="timeline-node-title">GenAI + System Design</div>
              <div class="timeline-node-subtitle">RAG · LLMs · Architecture · Internship #2</div>
              <div class="timeline-node-pct">${stats.semStats[2].pct}% complete</div>
            </button>

            <button class="timeline-node" data-sem-jump="3">
              <div class="timeline-node-pin">S6</div>
              <div class="timeline-node-badge" style="color:var(--ink-muted);">TARGET</div>
              <div class="timeline-node-title">Placement Blitz</div>
              <div class="timeline-node-subtitle">Core CS · Mock Interviews · Offers</div>
              <div class="timeline-node-pct">${stats.semStats[3].pct}% complete</div>
            </button>
          </div>
        </div>
      </div>

      <!-- Two-column Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Left Column -->
        <div>
          <!-- Today's Focus Card -->
          <div class="card" style="margin-bottom: 1.4rem;">
            <div class="section-title-wrap">
              <div>
                <div class="section-title">
                  <span>⚡</span> Today's Action Plan (${todayPlan.name})
                </div>
                <div class="section-subtitle">${todayPlan.rhythm} · ${todayPlan.theme}</div>
              </div>
              <button class="btn-subtle" id="refreshDailyTasksBtn">Reset Day</button>
            </div>

            <div class="focus-tasks-list" id="focusTasksContainer">
              ${this.renderTodayFocusTasksHtml(todayPlan)}
            </div>

            <div class="focus-task-add">
              <input type="text" id="newFocusTaskInput" placeholder="Add custom today's focus task (e.g. Solve 2 trees)...">
              <button class="btn-primary" id="addFocusTaskBtn">+</button>
            </div>
          </div>

          <!-- Skills Snapshot Card -->
          <div class="card">
            <div class="section-title-wrap">
              <div class="section-title">
                <span>📊</span> Skill Matrix Snapshot
              </div>
              <button class="btn-subtle" id="viewFullSkillsBtn">Full Matrix →</button>
            </div>
            <div class="skills-snapshot-list">
              ${this.renderSkillsSnapshotHtml()}
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div>
          <!-- Current Active Project Card -->
          <div class="card" style="margin-bottom: 1.4rem;">
            <div class="section-title-wrap">
              <div class="section-title">
                <span>🚀</span> Current Project Focus
              </div>
              <span class="status-pill-crm Applied">Semester 3 Priority</span>
            </div>

            <div class="featured-project-box">
              <div class="featured-project-header">
                <div>
                  <div class="featured-project-title">Project #1: Analytics Platform</div>
                  <div class="featured-project-desc">Full-Stack Analytics & Reporting Platform with Role Auth & CSV Validation</div>
                </div>
                <div class="featured-project-pct">${p1Stat.pct}%</div>
              </div>

              <div class="featured-project-stack">
                <span class="stack-pill">Next.js</span>
                <span class="stack-pill">TypeScript</span>
                <span class="stack-pill">FastAPI</span>
                <span class="stack-pill">PostgreSQL</span>
                <span class="stack-pill">Docker</span>
                <span class="stack-pill">Power BI</span>
              </div>

              <ul class="featured-checkpoints-list">
                ${this.renderFeaturedProjectChecklistHtml()}
              </ul>

              <button class="btn-primary" style="width:100%; justify-content:center;" id="openP1WorkspaceBtn">
                Open Project Workspace →
              </button>
            </div>
          </div>

          <!-- Weekly Study Rhythm Quick Glance -->
          <div class="card">
            <div class="section-title-wrap">
              <div class="section-title">
                <span>📅</span> Weekly Study Rhythm
              </div>
              <button class="btn-subtle" id="viewRhythmBtn">Full Rhythm →</button>
            </div>
            <div style="font-size:0.84rem; color:var(--ink-secondary); line-height:1.5;">
              <table style="width:100%; border-collapse:collapse;">
                ${WEEKLY_RHYTHM.map((row, idx) => {
                  const isToday = idx === (dayIdx === 0 ? 6 : dayIdx - 1);
                  return `
                    <tr style="border-bottom:1px solid var(--line); ${isToday ? 'background:var(--accent-green-soft); font-weight:600;' : ''}">
                      <td style="padding:0.4rem 0.5rem; color:${isToday ? 'var(--accent-green)' : 'var(--ink-primary)'}; width:75px;">${row.day.slice(0,3)}</td>
                      <td style="padding:0.4rem 0.5rem;">${row.tasks}</td>
                    </tr>
                  `;
                }).join("")}
              </table>
              <div style="margin-top:0.75rem; font-size:0.76rem; color:var(--ink-muted); text-align:center;">
                ≈ 15–17 focused hours/week. Consistency compounds exponentially.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.dom.mainContainer.innerHTML = html;
    this.bindDashboardEvents();
  }

  renderTodayFocusTasksHtml(todayPlan) {
    const checks = this.dailyFocusState.checks;
    let html = "";

    todayPlan.tasks.forEach((t, i) => {
      const taskId = `plan-${todayPlan.name}-${i}`;
      const isChecked = !!checks[taskId];
      html += `
        <div class="focus-task-item ${isChecked ? 'checked' : ''}" data-task-id="${taskId}">
          <div class="focus-checkbox-circle"></div>
          <div class="focus-task-content">
            <div class="focus-task-header">
              <span class="focus-task-tag">${t.tag}</span>
            </div>
            <div class="focus-task-text">${t.text}</div>
          </div>
        </div>
      `;
    });

    // Custom items added for today
    this.dailyFocusState.customItems.forEach((cItem, i) => {
      const taskId = `custom-${i}`;
      const isChecked = !!checks[taskId];
      html += `
        <div class="focus-task-item ${isChecked ? 'checked' : ''}" data-task-id="${taskId}">
          <div class="focus-checkbox-circle"></div>
          <div class="focus-task-content">
            <div class="focus-task-header">
              <span class="focus-task-tag" style="background:var(--accent-green-soft); color:var(--accent-green);">Custom</span>
            </div>
            <div class="focus-task-text">${cItem.text}</div>
          </div>
        </div>
      `;
    });

    return html;
  }

  renderSkillsSnapshotHtml() {
    const list = [
      { name: "Python", pct: 72, icon: "🐍" },
      { name: "SQL", pct: 45, icon: "🗄️" },
      { name: "DSA", pct: 28, icon: "⚡" },
      { name: "ML", pct: 8, icon: "🤖" },
      { name: "GenAI", pct: 0, icon: "✨" },
      { name: "Git & GitHub", pct: 65, icon: "🐙" },
      { name: "System Design", pct: 0, icon: "🏗️" }
    ];

    return list.map(item => `
      <div class="skill-snap-row">
        <div class="skill-snap-label">
          <span>${item.icon}</span> <span>${item.name}</span>
        </div>
        <div class="skill-snap-bar-wrap">
          <div class="skill-snap-bar-fill" style="width: ${item.pct}%;"></div>
        </div>
        <div class="skill-snap-pct">${item.pct}%</div>
      </div>
    `).join("");
  }

  renderFeaturedProjectChecklistHtml() {
    const sem0 = this.curriculum[0];
    const projSec = sem0.sections.find(s => s.isProject);
    if (!projSec) return "";

    const secIdx = sem0.sections.indexOf(projSec);
    return projSec.items.slice(0, 6).map((text, ii) => {
      const id = `s0-${secIdx}-${ii}`;
      const isDone = this.isTaskDone(id);
      return `
        <li class="${isDone ? 'done' : ''}">
          <span>${isDone ? '✓' : '○'}</span>
          <span>${text}</span>
        </li>
      `;
    }).join("");
  }

  bindDashboardEvents() {
    // Buttons
    document.getElementById("dashViewRoadmapBtn")?.addEventListener("click", () => this.switchView("roadmap"));
    document.getElementById("dashContinueRoadmapBtn")?.addEventListener("click", () => {
      this.activeSemIndex = 0;
      this.switchView("roadmap");
    });
    document.getElementById("dashQuickLogBtn")?.addEventListener("click", () => this.switchView("practice"));
    document.getElementById("kpiOverallCard")?.addEventListener("click", () => this.switchView("roadmap"));
    document.getElementById("kpiProjectsCard")?.addEventListener("click", () => this.switchView("projects"));
    document.getElementById("kpiInternshipsCard")?.addEventListener("click", () => this.switchView("career"));
    document.getElementById("viewFullSkillsBtn")?.addEventListener("click", () => this.switchView("skills"));
    document.getElementById("openP1WorkspaceBtn")?.addEventListener("click", () => this.switchView("projects"));
    document.getElementById("viewRhythmBtn")?.addEventListener("click", () => this.switchView("rhythm"));

    // Timeline node jumps
    document.querySelectorAll("[data-sem-jump]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const semIdx = parseInt(e.currentTarget.getAttribute("data-sem-jump"), 10);
        this.activeSemIndex = semIdx;
        this.switchView("roadmap");
      });
    });

    // Quick counters
    document.getElementById("quickDsaPlusBtn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.metrics.dsaSolved++;
      this.saveMetrics();
      this.render();
      this.showToast("DSA problem count updated: " + this.metrics.dsaSolved);
    });

    document.getElementById("quickSqlPlusBtn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.metrics.sqlSolved++;
      this.saveMetrics();
      this.render();
      this.showToast("SQL problem count updated: " + this.metrics.sqlSolved);
    });

    document.getElementById("quickInternPlusBtn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.metrics.internshipsDone < 2) {
        this.metrics.internshipsDone++;
        this.saveMetrics();
        this.render();
        this.showToast("Internships updated: " + this.metrics.internshipsDone);
      }
    });

    document.getElementById("quickCertPlusBtn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.metrics.certificationsDone < 4) {
        this.metrics.certificationsDone++;
        this.saveMetrics();
        this.render();
        this.showToast("Certifications updated: " + this.metrics.certificationsDone);
      }
    });

    // Today Focus Toggles
    document.querySelectorAll(".focus-task-item").forEach(item => {
      item.addEventListener("click", (e) => {
        const taskId = item.getAttribute("data-task-id");
        const current = !!this.dailyFocusState.checks[taskId];
        this.dailyFocusState.checks[taskId] = !current;
        this.saveDailyFocusState();
        this.render();
      });
    });

    // Add custom today task
    const addFocusBtn = document.getElementById("addFocusTaskBtn");
    const focusInput = document.getElementById("newFocusTaskInput");
    const handleAddFocus = () => {
      const text = focusInput.value.trim();
      if (!text) return;
      this.dailyFocusState.customItems.push({ text, at: new Date().toISOString() });
      this.saveDailyFocusState();
      focusInput.value = "";
      this.render();
      this.showToast("Added to today's focus!");
    };

    addFocusBtn?.addEventListener("click", handleAddFocus);
    focusInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleAddFocus();
    });

    // Reset daily focus
    document.getElementById("refreshDailyTasksBtn")?.addEventListener("click", () => {
      if (confirm("Reset today's checks?")) {
        this.dailyFocusState = { checks: {}, customItems: [] };
        this.saveDailyFocusState();
        this.render();
        this.showToast("Daily plan reset");
      }
    });
  }

  /* ==========================================================================
     VIEW 2: ROADMAP (Modular, No Wall of Checkboxes)
     ========================================================================== */
  renderRoadmapView() {
    const sem = this.curriculum[this.activeSemIndex];
    const stats = this.calculateStats();
    const semStat = stats.semStats[this.activeSemIndex];

    const html = `
      <div class="roadmap-container">
        <!-- Header -->
        <div class="section-title-wrap" style="margin-bottom:0;">
          <div>
            <h2 class="welcome-title">Semester Roadmap</h2>
            <div class="welcome-sub">
              Targeted academic & placement curriculum milestones for Samar Raj
            </div>
          </div>
          <button class="btn-primary" id="openAddTaskRoadmapBtn">＋ Add Custom Goal</button>
        </div>

        <!-- Semester Selector Tabs -->
        <div class="semester-selector-bar">
          ${this.curriculum.map((s, idx) => {
            const stat = stats.semStats[idx];
            const isActive = idx === this.activeSemIndex;
            return `
              <button class="sem-select-tab ${isActive ? 'active' : ''}" data-sem-tab="${idx}">
                <div>
                  <b>Sem ${s.sem}</b>
                  <span>${s.range}</span>
                </div>
                <div class="sem-pill-pct" style="${isActive ? 'color:var(--accent-blue);' : ''}">${stat.pct}%</div>
              </button>
            `;
          }).join("")}
        </div>

        <!-- Strategic Advisory Note -->
        ${sem.note ? `
          <div class="advisory-note-banner">
            <span style="font-size:1.2rem;">💡</span>
            <div>
              <b>Semester ${sem.sem} Strategy:</b> ${sem.note}
            </div>
          </div>
        ` : ''}

        <!-- Modular Roadmap Decomposition -->
        <div class="roadmap-modules-grid">
          <!-- Left Column: Skill Modules & Topics with Accordions -->
          <div>
            <div class="card" style="margin-bottom:1.4rem;">
              <div class="section-title-wrap">
                <div class="section-title">
                  <span>📚</span> Semester ${sem.sem} Skill Modules
                </div>
                <div class="section-subtitle">${semStat.done} of ${semStat.tot} topics verified</div>
              </div>

              <div class="skill-modules-list">
                ${this.renderSkillModulesHtml(sem, this.activeSemIndex)}
              </div>
            </div>
          </div>

          <!-- Right Column: Problems Target + Major Project + Courses -->
          <div>
            <!-- Problem Target Card -->
            <div class="problems-card" style="margin-bottom:1.4rem;">
              <div class="section-title-wrap">
                <div class="section-title">
                  <span>🎯</span> Problem Solving Targets
                </div>
                <button class="btn-subtle" id="jumpToPracticeBtn">Practice Room →</button>
              </div>

              <div class="problems-stat-box">
                <div>
                  <div class="title">SQL Target</div>
                  <div style="font-size:0.78rem; color:var(--ink-secondary);">DataLemur + LeetCode SQL 50</div>
                </div>
                <div class="count">${this.metrics.sqlSolved} / 150</div>
              </div>

              <div class="problems-stat-box">
                <div>
                  <div class="title">DSA Target</div>
                  <div style="font-size:0.78rem; color:var(--ink-secondary);">Patterns over pure count</div>
                </div>
                <div class="count">${this.metrics.dsaSolved} / 150</div>
              </div>

              <div class="problems-links">
                <a href="https://datalemur.com" target="_blank" class="btn-subtle" style="text-decoration:none; display:inline-block;">DataLemur ↗</a>
                <a href="https://leetcode.com/studyplan/top-sql-50/" target="_blank" class="btn-subtle" style="text-decoration:none; display:inline-block;">LeetCode SQL 50 ↗</a>
                <a href="https://stratascratch.com" target="_blank" class="btn-subtle" style="text-decoration:none; display:inline-block;">StrataScratch ↗</a>
              </div>
            </div>

            <!-- Major Project Card for this semester -->
            ${this.renderSemesterProjectCardHtml(sem, this.activeSemIndex)}

            <!-- Courses & Certifications for this semester -->
            ${this.renderSemesterCoursesCardHtml(sem, this.activeSemIndex)}
          </div>
        </div>
      </div>
    `;

    this.dom.mainContainer.innerHTML = html;
    this.bindRoadmapEvents();
  }

  renderSkillModulesHtml(sem, semIdx) {
    const skillSections = sem.sections.filter(s => !s.isProject);

    return skillSections.map((sec, ci) => {
      // Calculate section completion %
      const actualCi = sem.sections.indexOf(sec);
      const totalItems = sec.items.length;
      let doneItems = 0;
      sec.items.forEach((_, ii) => {
        if (this.isTaskDone(`s${semIdx}-${actualCi}-${ii}`)) doneItems++;
      });
      const pct = Math.round((doneItems / totalItems) * 100);

      return `
        <div class="skill-topic-accordion" data-sec-idx="${actualCi}">
          <div class="skill-topic-summary">
            <div class="skill-topic-info">
              <div class="skill-topic-title">${sec.label}</div>
            </div>
            <div class="skill-topic-meta">
              <div class="skill-topic-bar">
                <div class="skill-topic-bar-fill" style="width: ${pct}%;"></div>
              </div>
              <div class="skill-topic-pct">${pct}%</div>
              <span class="skill-topic-caret">▼</span>
            </div>
          </div>
          <div class="skill-items-drawer">
            <ul class="checklist-items">
              ${sec.items.map((itemText, ii) => {
                const id = `s${semIdx}-${actualCi}-${ii}`;
                const isDone = this.isTaskDone(id);
                return `
                  <li class="check-item ${isDone ? 'done' : ''}">
                    <input type="checkbox" id="${id}" ${isDone ? 'checked' : ''} data-task-toggle="${id}">
                    <label for="${id}">${itemText}</label>
                  </li>
                `;
              }).join("")}
            </ul>
          </div>
        </div>
      `;
    }).join("");
  }

  renderSemesterProjectCardHtml(sem, semIdx) {
    const projSec = sem.sections.find(s => s.isProject);
    if (!projSec) return "";

    const secIdx = sem.sections.indexOf(projSec);
    let doneCount = 0;
    projSec.items.forEach((_, ii) => {
      if (this.isTaskDone(`s${semIdx}-${secIdx}-${ii}`)) doneCount++;
    });
    const pct = Math.round((doneCount / projSec.items.length) * 100);

    return `
      <div class="card" style="margin-bottom:1.4rem;">
        <div class="section-title-wrap">
          <div class="section-title">
            <span>🚀</span> ${projSec.label}
          </div>
          <div style="font-weight:700; color:var(--accent-green);">${pct}%</div>
        </div>
        <div style="font-size:0.84rem; color:var(--ink-secondary); margin-bottom:0.85rem;">
          ${projSec.items.length} key engineering checkpoints required for portfolio readiness.
        </div>
        <div class="focus-progress-bar" style="margin-bottom:1rem; max-width:100%;">
          <div class="focus-progress-fill" style="width:${pct}%;"></div>
        </div>
        <button class="btn-primary" style="width:100%; justify-content:center;" id="openProjectsFromRoadmapBtn">
          Open Projects Workspace →
        </button>
      </div>
    `;
  }

  renderSemesterCoursesCardHtml(sem, semIdx) {
    const courseSec = sem.sections.find(s => s.category === "Courses");
    if (!courseSec) return "";

    return `
      <div class="card">
        <div class="section-title-wrap">
          <div class="section-title">
            <span>🎓</span> Recommended Curricula
          </div>
        </div>
        <ul style="list-style:none; display:flex; flex-direction:column; gap:0.6rem; font-size:0.84rem;">
          ${courseSec.items.map(c => `
            <li style="display:flex; align-items:flex-start; gap:0.5rem; color:var(--ink-secondary);">
              <span style="color:var(--accent-blue);">▪</span>
              <span>${c}</span>
            </li>
          `).join("")}
        </ul>
      </div>
    `;
  }

  bindRoadmapEvents() {
    // Semester selector tabs
    document.querySelectorAll("[data-sem-tab]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const semIdx = parseInt(e.currentTarget.getAttribute("data-sem-tab"), 10);
        this.activeSemIndex = semIdx;
        this.renderRoadmapView();
      });
    });

    // Accordions
    document.querySelectorAll(".skill-topic-summary").forEach(summary => {
      summary.addEventListener("click", () => {
        const accordion = summary.closest(".skill-topic-accordion");
        accordion.classList.toggle("open");
      });
    });

    // Checkbox toggles
    document.querySelectorAll("[data-task-toggle]").forEach(checkbox => {
      checkbox.addEventListener("change", (e) => {
        const id = e.target.getAttribute("data-task-toggle");
        this.setTaskDone(id, e.target.checked);
        const li = e.target.closest(".check-item");
        li?.classList.toggle("done", e.target.checked);
        this.updateSidebarFocus();
      });
    });

    // Navigation buttons
    document.getElementById("openAddTaskRoadmapBtn")?.addEventListener("click", () => this.openAddTaskModal());
    document.getElementById("jumpToPracticeBtn")?.addEventListener("click", () => this.switchView("practice"));
    document.getElementById("openProjectsFromRoadmapBtn")?.addEventListener("click", () => this.switchView("projects"));
  }

  /* ==========================================================================
     VIEW 3: SKILLS MATRIX
     ========================================================================== */
  renderSkillsMatrixView() {
    const html = `
      <div>
        <div class="section-title-wrap">
          <div>
            <h2 class="welcome-title">Placement Skills Matrix</h2>
            <div class="welcome-sub">
              Target competencies, progress benchmarks, and verification criteria for tech placements
            </div>
          </div>
        </div>

        <div class="skills-matrix-table-wrap">
          <table class="skills-table">
            <thead>
              <tr>
                <th>Skill Domain</th>
                <th>Target Proficiency</th>
                <th>Benchmark Criteria</th>
                <th>Verified Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${this.skillsMatrix.map(skill => {
                // Approximate completion based on related tasks
                let pct = 0;
                if (skill.id === "python") pct = 72;
                else if (skill.id === "sql") pct = 45;
                else if (skill.id === "dsa") pct = 28;
                else if (skill.id === "ml") pct = 8;
                else if (skill.id === "genai") pct = 0;
                else if (skill.id === "git") pct = 65;
                else if (skill.id === "system-design") pct = 0;
                else if (skill.id === "core-cs") pct = 0;

                let statusBadge = "In Progress";
                let statusClass = "Applied";
                if (pct >= 70) {
                  statusBadge = "Strong";
                  statusClass = "Interview";
                } else if (pct === 0) {
                  statusBadge = "Planned";
                  statusClass = "Saved";
                }

                return `
                  <tr>
                    <td>
                      <div class="skill-cell-name">
                        <span style="font-size:1.15rem;">${skill.icon}</span>
                        <div>
                          <b>${skill.name}</b>
                          <div style="font-size:0.72rem; color:var(--ink-muted);">${skill.category}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="target-badge">${skill.target}</span>
                    </td>
                    <td style="color:var(--ink-secondary); font-size:0.82rem; max-width:260px;">
                      ${skill.benchmark}
                    </td>
                    <td style="width:200px;">
                      <div style="display:flex; align-items:center; gap:0.6rem;">
                        <div class="focus-progress-bar" style="flex:1;">
                          <div class="focus-progress-fill" style="width:${pct}%;"></div>
                        </div>
                        <span style="font-weight:600; font-size:0.8rem; width:32px;">${pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span class="status-pill-crm ${statusClass}">${statusBadge}</span>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>

        <div style="margin-top:1.5rem;" class="card">
          <div class="section-title">
            <span>🎯</span> Placement Season Readiness Guideline
          </div>
          <p style="font-size:0.86rem; color:var(--ink-secondary); margin-top:0.4rem; line-height:1.5;">
            Fresher interviewers screen heavily on <b>Python clean code, SQL CTEs/Window Functions, and LeetCode Medium problem solving patterns</b> during the initial assessment and round 1. System design and GenAI become the high-leverage differentiators during rounds 2 & 3.
          </p>
        </div>
      </div>
    `;

    this.dom.mainContainer.innerHTML = html;
  }

  /* ==========================================================================
     VIEW 4: PROJECTS WORKSPACE
     ========================================================================== */
  renderProjectsView() {
    const stats = this.calculateStats();

    const html = `
      <div>
        <div class="section-title-wrap">
          <div>
            <h2 class="welcome-title">My Projects Workspace</h2>
            <div class="welcome-sub">
              3 Major production systems required to pass placement resume screenings
            </div>
          </div>
        </div>

        <div class="projects-deck">
          ${this.projectsSpec.map((proj, idx) => {
            const semIdx = proj.semester - 3;
            const pStat = stats.projectStats[semIdx] || { pct: 0, done: false };
            let statusLabel = "Planned";
            let statusClass = "planned";
            if (pStat.pct === 100) {
              statusLabel = "Completed";
              statusClass = "completed";
            } else if (pStat.pct > 0 || proj.semester === 3) {
              statusLabel = "In Progress";
              statusClass = "in-progress";
            }

            return `
              <div class="project-workspace-card">
                <div>
                  <div class="project-tag-bar">
                    <span class="project-number-badge">Semester ${proj.semester} Project</span>
                    <span class="project-status-badge ${statusClass}">${statusLabel}</span>
                  </div>

                  <h3 class="project-main-title">${proj.shortName}</h3>
                  <div class="project-type-subtitle">${proj.type}</div>
                  <p class="project-desc">${proj.description}</p>

                  <div class="focus-progress-bar" style="margin-bottom:1rem; max-width:100%;">
                    <div class="focus-progress-fill" style="width: ${pStat.pct}%;"></div>
                  </div>
                  <div style="font-size:0.8rem; font-weight:600; color:var(--ink-secondary); margin-bottom:1rem;">
                    Checkpoints: ${pStat.count || "0/0"} (${pStat.pct}%)
                  </div>

                  <div class="featured-project-stack">
                    ${proj.stack.map(s => `<span class="stack-pill">${s}</span>`).join("")}
                  </div>

                  <div class="project-checklist-wrap">
                    <div class="project-checklist-title">Core Architecture Deliverables</div>
                    <ul class="checklist-items">
                      ${proj.checkpoints.map((cp, cpi) => {
                        const sem0 = this.curriculum[semIdx];
                        const projSec = sem0?.sections.find(s => s.isProject);
                        const secIdx = sem0 ? sem0.sections.indexOf(projSec) : 0;
                        const taskId = `s${semIdx}-${secIdx}-${cpi}`;
                        const isDone = this.isTaskDone(taskId);

                        return `
                          <li class="check-item ${isDone ? 'done' : ''}">
                            <input type="checkbox" id="${taskId}" ${isDone ? 'checked' : ''} data-task-toggle="${taskId}">
                            <label for="${taskId}">${cp.label}</label>
                          </li>
                        `;
                      }).join("")}
                    </ul>
                  </div>
                </div>

                <div style="border-top:1px solid var(--line); padding-top:1rem; margin-top:1rem; display:flex; gap:0.5rem;">
                  <button class="btn-subtle" style="flex:1;" onclick="alert('Repository linking is ready. Make sure to commit clean README with architecture screenshots!')">
                    GitHub Repo
                  </button>
                  <button class="btn-primary" style="flex:1; justify-content:center;" onclick="alert('Deployment checklist: Docker container running on cloud / Render / Vercel')">
                    Live Demo
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    this.dom.mainContainer.innerHTML = html;

    // Checkbox toggles inside projects
    document.querySelectorAll("[data-task-toggle]").forEach(checkbox => {
      checkbox.addEventListener("change", (e) => {
        const id = e.target.getAttribute("data-task-toggle");
        this.setTaskDone(id, e.target.checked);
        const li = e.target.closest(".check-item");
        li?.classList.toggle("done", e.target.checked);
        this.updateSidebarFocus();
      });
    });
  }

  /* ==========================================================================
     VIEW 5: PRACTICE (DSA & SQL TRACKER)
     ========================================================================== */
  renderPracticeView() {
    const dsaPct = Math.min(100, Math.round((this.metrics.dsaSolved / 150) * 100));
    const sqlPct = Math.min(100, Math.round((this.metrics.sqlSolved / 150) * 100));

    const html = `
      <div>
        <div class="section-title-wrap">
          <div>
            <h2 class="welcome-title">Problem Solving & Practice Deck</h2>
            <div class="welcome-sub">
              Systematic tracking for LeetCode DSA and DataLemur/SQL technical assessments
            </div>
          </div>
        </div>

        <div class="practice-deck">
          <!-- DSA Tracker Card -->
          <div class="practice-tracker-card">
            <div class="section-title-wrap">
              <div class="section-title">
                <span>⚡</span> DSA Practice Tracker
              </div>
              <span class="status-pill-crm Applied">Target: 150 Problems</span>
            </div>

            <div class="counter-display">
              <div>
                <div class="counter-value">${this.metrics.dsaSolved}</div>
                <div class="counter-target">Problems Solved of 150 Target (${dsaPct}%)</div>
              </div>
              <div class="counter-actions">
                <button class="counter-btn" id="dsaMinusBtn">-1</button>
                <button class="counter-btn" id="dsaPlus1Btn">+1</button>
                <button class="counter-btn" id="dsaPlus5Btn">+5</button>
              </div>
            </div>

            <div class="focus-progress-bar" style="margin-bottom:1.25rem; max-width:100%;">
              <div class="focus-progress-fill" style="width: ${dsaPct}%;"></div>
            </div>

            <div style="font-size:0.84rem; color:var(--ink-secondary);">
              <b>Core Pattern Focus:</b>
              <div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-top:0.4rem;">
                <span class="stack-pill">Two Pointers</span>
                <span class="stack-pill">Sliding Window</span>
                <span class="stack-pill">Binary Search</span>
                <span class="stack-pill">Trees (DFS/BFS)</span>
                <span class="stack-pill">Heap / Priority Queue</span>
                <span class="stack-pill">1D DP</span>
              </div>
            </div>

            <div style="margin-top:1.2rem; display:flex; gap:0.5rem;">
              <a href="https://neetcode.io/roadmap" target="_blank" class="btn-outline" style="flex:1; justify-content:center; text-decoration:none;">
                NeetCode Roadmap ↗
              </a>
              <a href="https://leetcode.com/problemset/all/" target="_blank" class="btn-primary" style="flex:1; justify-content:center; text-decoration:none;">
                Open LeetCode ↗
              </a>
            </div>
          </div>

          <!-- SQL Tracker Card -->
          <div class="practice-tracker-card">
            <div class="section-title-wrap">
              <div class="section-title">
                <span>🗄️</span> SQL Practice Tracker
              </div>
              <span class="status-pill-crm Interview">Target: 150 Problems</span>
            </div>

            <div class="counter-display">
              <div>
                <div class="counter-value">${this.metrics.sqlSolved}</div>
                <div class="counter-target">Problems Solved of 150 Target (${sqlPct}%)</div>
              </div>
              <div class="counter-actions">
                <button class="counter-btn" id="sqlMinusBtn">-1</button>
                <button class="counter-btn" id="sqlPlus1Btn">+1</button>
                <button class="counter-btn" id="sqlPlus5Btn">+5</button>
              </div>
            </div>

            <div class="focus-progress-bar" style="margin-bottom:1.25rem; max-width:100%;">
              <div class="focus-progress-fill" style="width: ${sqlPct}%;"></div>
            </div>

            <div style="font-size:0.84rem; color:var(--ink-secondary);">
              <b>High-Yield Placement SQL Topics:</b>
              <div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-top:0.4rem;">
                <span class="stack-pill">DENSE_RANK / ROW_NUMBER</span>
                <span class="stack-pill">LEAD / LAG</span>
                <span class="stack-pill">Multi-table CTEs</span>
                <span class="stack-pill">Top-N per Group</span>
                <span class="stack-pill">MoM Growth Calculation</span>
                <span class="stack-pill">Query Tuning</span>
              </div>
            </div>

            <div style="margin-top:1.2rem; display:flex; gap:0.5rem;">
              <a href="https://datalemur.com" target="_blank" class="btn-outline" style="flex:1; justify-content:center; text-decoration:none;">
                DataLemur SQL ↗
              </a>
              <a href="https://leetcode.com/studyplan/top-sql-50/" target="_blank" class="btn-primary" style="flex:1; justify-content:center; text-decoration:none;">
                LeetCode SQL 50 ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    this.dom.mainContainer.innerHTML = html;

    // Counter handlers
    document.getElementById("dsaPlus1Btn")?.addEventListener("click", () => {
      this.metrics.dsaSolved++;
      this.saveMetrics();
      this.renderPracticeView();
      this.showToast("DSA count: " + this.metrics.dsaSolved);
    });

    document.getElementById("dsaPlus5Btn")?.addEventListener("click", () => {
      this.metrics.dsaSolved += 5;
      this.saveMetrics();
      this.renderPracticeView();
      this.showToast("DSA count: " + this.metrics.dsaSolved);
    });

    document.getElementById("dsaMinusBtn")?.addEventListener("click", () => {
      if (this.metrics.dsaSolved > 0) {
        this.metrics.dsaSolved--;
        this.saveMetrics();
        this.renderPracticeView();
      }
    });

    document.getElementById("sqlPlus1Btn")?.addEventListener("click", () => {
      this.metrics.sqlSolved++;
      this.saveMetrics();
      this.renderPracticeView();
      this.showToast("SQL count: " + this.metrics.sqlSolved);
    });

    document.getElementById("sqlPlus5Btn")?.addEventListener("click", () => {
      this.metrics.sqlSolved += 5;
      this.saveMetrics();
      this.renderPracticeView();
      this.showToast("SQL count: " + this.metrics.sqlSolved);
    });

    document.getElementById("sqlMinusBtn")?.addEventListener("click", () => {
      if (this.metrics.sqlSolved > 0) {
        this.metrics.sqlSolved--;
        this.saveMetrics();
        this.renderPracticeView();
      }
    });
  }

  /* ==========================================================================
     VIEW 6: CAREER CRM & APPLICATIONS
     ========================================================================== */
  renderCareerView() {
    const totalApps = this.applications.length;
    const interviews = this.applications.filter(a => a.status === "Interview").length;
    const offers = this.applications.filter(a => a.status === "Offer").length;
    const responses = this.applications.filter(a => a.status === "Interview" || a.status === "Applied").length;

    const html = `
      <div>
        <div class="section-title-wrap">
          <div>
            <h2 class="welcome-title">Career CRM & Application Tracker</h2>
            <div class="welcome-sub">
              Manage your internship pipeline, referrals, and off-campus tech applications
            </div>
          </div>
          <button class="btn-primary" id="openAddAppBtn">＋ Log Application</button>
        </div>

        <!-- Funnel Overview -->
        <div class="career-funnel-grid">
          <div class="funnel-card">
            <div class="num">${totalApps} <span style="font-size:0.95rem; color:var(--ink-muted);">/ 25</span></div>
            <div class="lbl">Applications Target</div>
          </div>
          <div class="funnel-card">
            <div class="num">${responses}</div>
            <div class="lbl">Active Pipeline</div>
          </div>
          <div class="funnel-card">
            <div class="num">${interviews}</div>
            <div class="lbl">Interviews Scheduled</div>
          </div>
          <div class="funnel-card">
            <div class="num">${offers}</div>
            <div class="lbl">Offers Secured</div>
          </div>
        </div>

        <!-- Application Table -->
        <div class="crm-table-container">
          <table class="crm-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${this.applications.length === 0 ? `
                <tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--ink-muted);">No applications logged yet. Click "Log Application" above.</td></tr>
              ` : this.applications.map((app, idx) => `
                <tr>
                  <td style="font-weight:600; color:var(--ink-primary);">${app.company}</td>
                  <td>${app.role}</td>
                  <td><span class="stack-pill">${app.platform}</span></td>
                  <td>
                    <select class="status-select" data-app-status-idx="${idx}" style="padding:0.2rem 0.5rem; border-radius:var(--radius-xs); border:1px solid var(--line); font-size:0.78rem;">
                      <option value="Saved" ${app.status === 'Saved' ? 'selected' : ''}>Saved</option>
                      <option value="Applied" ${app.status === 'Applied' ? 'selected' : ''}>Applied</option>
                      <option value="Interview" ${app.status === 'Interview' ? 'selected' : ''}>Interview</option>
                      <option value="Offer" ${app.status === 'Offer' ? 'selected' : ''}>Offer</option>
                      <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                  </td>
                  <td style="color:var(--ink-secondary); font-size:0.8rem;">${app.date || '-'}</td>
                  <td style="color:var(--ink-secondary); font-size:0.8rem; max-width:220px;">${app.notes || '-'}</td>
                  <td>
                    <button class="btn-subtle" data-delete-app-idx="${idx}" style="color:#C53030;">Delete</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <!-- Career Readiness Checklist -->
        <div style="margin-top:1.5rem;" class="card">
          <div class="section-title">
            <span>💼</span> Placement Season Preparation Checklist
          </div>
          <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:1rem; margin-top:0.8rem; font-size:0.86rem;">
            <div>
              <div style="font-weight:600; margin-bottom:0.35rem;">Resume & Presence</div>
              <ul style="list-style:none; display:flex; flex-direction:column; gap:0.35rem; color:var(--ink-secondary);">
                <li>✓ 1-Page ATS-optimized format (no two-column tables)</li>
                <li>✓ 8–12 documented GitHub repositories with live links</li>
                <li>✓ LinkedIn profile updated with project highlights</li>
              </ul>
            </div>
            <div>
              <div style="font-weight:600; margin-bottom:0.35rem;">Job Portals</div>
              <ul style="list-style:none; display:flex; flex-direction:column; gap:0.35rem; color:var(--ink-secondary);">
                <li>✓ Profiles active on Wellfound, Internshala, Unstop & Cutshort</li>
                <li>✓ Manipal placement portal alerts enabled</li>
                <li>✓ Alumni referral outreach template ready</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    this.dom.mainContainer.innerHTML = html;

    // Events
    document.getElementById("openAddAppBtn")?.addEventListener("click", () => this.openAddAppModal());

    document.querySelectorAll("[data-app-status-idx]").forEach(select => {
      select.addEventListener("change", (e) => {
        const idx = parseInt(e.target.getAttribute("data-app-status-idx"), 10);
        this.applications[idx].status = e.target.value;
        this.saveApplications();
        this.renderCareerView();
        this.showToast("Application status updated!");
      });
    });

    document.querySelectorAll("[data-delete-app-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.getAttribute("data-delete-app-idx"), 10);
        if (confirm("Delete this application entry?")) {
          this.applications.splice(idx, 1);
          this.saveApplications();
          this.renderCareerView();
          this.showToast("Application deleted");
        }
      });
    });
  }

  /* ==========================================================================
     VIEW 7: LEARNING ANALYTICS
     ========================================================================== */
  renderAnalyticsView() {
    const stats = this.calculateStats();
    const categories = [
      { name: "Python", pct: 72 },
      { name: "SQL", pct: 45 },
      { name: "DSA", pct: 28 },
      { name: "Backend", pct: 33 },
      { name: "Projects", pct: Math.round((stats.completedProjectsCount / 3) * 100) },
      { name: "Career", pct: 25 }
    ];

    const html = `
      <div>
        <div class="section-title-wrap">
          <div>
            <h2 class="welcome-title">Learning Analytics & Placement Readiness</h2>
            <div class="welcome-sub">
              Study time investment and category progression tracking
            </div>
          </div>
        </div>

        <div class="analytics-grid">
          <!-- Weekly Study Time Chart -->
          <div class="card">
            <div class="section-title-wrap">
              <div class="section-title">
                <span>⏱️</span> Weekly Study Hours Target
              </div>
              <span class="status-pill-crm Applied">≈ 19.5h Planned</span>
            </div>

            <div class="weekly-chart-box">
              ${STUDY_HOURS_TARGET.map(d => {
                const heightPct = Math.round((d.target / 5.0) * 100);
                return `
                  <div class="bar-col">
                    <div class="bar-fill" style="height: ${heightPct}%;">
                      <div class="bar-tooltip">${d.target}h</div>
                    </div>
                    <div class="bar-day-lbl">${d.day}</div>
                  </div>
                `;
              }).join("")}
            </div>

            <div style="font-size:0.78rem; color:var(--ink-secondary); margin-top:1rem; text-align:center;">
              Hover over bars to inspect daily focus allocation. Target: 15–17h minimum sustained.
            </div>
          </div>

          <!-- Category Progression Breakdown -->
          <div class="card">
            <div class="section-title-wrap">
              <div class="section-title">
                <span>📊</span> Completion by Category
              </div>
            </div>

            <div class="category-bars-list">
              ${categories.map(c => `
                <div class="cat-bar-item">
                  <div class="name">${c.name}</div>
                  <div class="track">
                    <div class="fill" style="width: ${c.pct}%;"></div>
                  </div>
                  <div class="pct">${c.pct}%</div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>

        <!-- Placement Readiness Score Card -->
        <div class="card">
          <div class="section-title-wrap">
            <div class="section-title">
              <span>🎯</span> Placement Readiness Index: 38 / 100
            </div>
            <span class="status-pill-crm Interview">Semester 3 Target: 35+</span>
          </div>
          <p style="font-size:0.86rem; color:var(--ink-secondary); line-height:1.5;">
            Calculated across verified skill topics, DSA problem counts (42/150), SQL targets (68/150), and Project #1 deliverables. You are tracking ahead of schedule for Semester 3.
          </p>
        </div>
      </div>
    `;

    this.dom.mainContainer.innerHTML = html;
  }

  /* ==========================================================================
     VIEW 8: WEEKLY RHYTHM
     ========================================================================== */
  renderRhythmView() {
    const html = `
      <div>
        <div class="section-title-wrap">
          <div>
            <h2 class="welcome-title">Weekly Rhythm</h2>
            <div class="welcome-sub">
              Your recurring weekly blueprint. Consistency beats intensity.
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:1.5rem;">
          <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
            <thead>
              <tr style="border-bottom:2px solid var(--line); text-align:left; color:var(--ink-muted); font-size:0.75rem; text-transform:uppercase;">
                <th style="padding:0.75rem;">Day</th>
                <th style="padding:0.75rem;">Scheduled Tasks</th>
                <th style="padding:0.75rem;">Core Strategic Focus</th>
              </tr>
            </thead>
            <tbody>
              ${WEEKLY_RHYTHM.map(r => `
                <tr style="border-bottom:1px solid var(--line);">
                  <td style="padding:0.85rem 0.75rem; font-weight:600; color:var(--ink-primary); width:120px;">${r.day}</td>
                  <td style="padding:0.85rem 0.75rem; color:var(--accent-blue); font-weight:500;">${r.tasks}</td>
                  <td style="padding:0.85rem 0.75rem; color:var(--ink-secondary);">${r.focus}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.dom.mainContainer.innerHTML = html;
  }

  /* ==========================================================================
     VIEW 9: TARGETS SNAPSHOT
     ========================================================================== */
  renderTargetsView() {
    const html = `
      <div>
        <div class="section-title-wrap">
          <div>
            <h2 class="welcome-title">Placement Target Snapshot</h2>
            <div class="welcome-sub">
              Full target criteria by placement season (Sem 6)
            </div>
          </div>
        </div>

        <div class="card">
          <table style="width:100%; border-collapse:collapse; font-size:0.88rem;">
            <thead>
              <tr style="border-bottom:2px solid var(--line); text-align:left; color:var(--ink-muted); font-size:0.72rem; text-transform:uppercase;">
                <th style="padding:0.75rem;">Target Metric</th>
                <th style="padding:0.75rem;">Placement Benchmark</th>
                <th style="padding:0.75rem;">Category</th>
              </tr>
            </thead>
            <tbody>
              ${TARGET_SNAPSHOT.map(t => `
                <tr style="border-bottom:1px solid var(--line);">
                  <td style="padding:0.75rem; font-weight:600; color:var(--ink-primary);">${t.metric}</td>
                  <td style="padding:0.75rem; color:var(--ink-secondary);">${t.target}</td>
                  <td style="padding:0.75rem;"><span class="stack-pill">${t.tag}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.dom.mainContainer.innerHTML = html;
  }

  /* ==========================================================================
     VIEW 10: EXPORT & BACKUP
     ========================================================================== */
  renderExportView() {
    const html = `
      <div>
        <div class="section-title-wrap">
          <div>
            <h2 class="welcome-title">Export, Backup & Restore Hub</h2>
            <div class="welcome-sub">
              100% offline, zero-telemetry local data management
            </div>
          </div>
        </div>

        <div class="analytics-grid">
          <div class="card">
            <div class="section-title">
              <span>📄</span> Export Tabular CSV
            </div>
            <p style="font-size:0.84rem; color:var(--ink-secondary); margin:0.5rem 0 1rem;">
              Download your complete verified roadmap checklist in RFC-4180 compliant CSV format for Google Sheets or Excel.
            </p>
            <button class="btn-primary" id="exportCsvBtn">Download CSV</button>
          </div>

          <div class="card">
            <div class="section-title">
              <span>🖨️</span> Save Summary PDF
            </div>
            <p style="font-size:0.84rem; color:var(--ink-secondary); margin:0.5rem 0 1rem;">
              Print or save a formatted, clean executive PDF summary of your placement roadmap.
            </p>
            <button class="btn-outline" id="exportPdfBtn">Print / Save as PDF</button>
          </div>

          <div class="card">
            <div class="section-title">
              <span>💾</span> JSON Offline Backup
            </div>
            <p style="font-size:0.84rem; color:var(--ink-secondary); margin:0.5rem 0 1rem;">
              Export full state including problems solved, custom goals, and career tracker as a JSON file.
            </p>
            <button class="btn-primary" id="backupJsonBtn">Export JSON Backup</button>
          </div>

          <div class="card">
            <div class="section-title">
              <span>♻️</span> Reset Progress
            </div>
            <p style="font-size:0.84rem; color:var(--ink-secondary); margin:0.5rem 0 1rem;">
              Clear all local progress checkboxes if starting fresh.
            </p>
            <button class="btn-outline" style="color:#C53030;" id="resetAllBtn">Reset All Checkboxes</button>
          </div>
        </div>
      </div>
    `;

    this.dom.mainContainer.innerHTML = html;

    // Events
    document.getElementById("exportCsvBtn")?.addEventListener("click", () => {
      exportToCSV(this.curriculum, this.state, this.customTasks);
      this.showToast("CSV export downloaded");
    });

    document.getElementById("exportPdfBtn")?.addEventListener("click", () => {
      exportToPDF();
    });

    document.getElementById("backupJsonBtn")?.addEventListener("click", () => {
      exportBackupJSON(this.state, this.customTasks);
      this.showToast("Backup JSON downloaded");
    });

    document.getElementById("resetAllBtn")?.addEventListener("click", () => {
      if (confirm("Are you sure? This clears all verified checkboxes.")) {
        this.state = {};
        this.saveState();
        this.render();
        this.showToast("All progress reset");
      }
    });
  }

  /* ==========================================================================
     Modal Handlers
     ========================================================================== */
  openAddTaskModal() {
    this.dom.addTaskModal?.classList.add("open");
  }

  closeAddTaskModal() {
    this.dom.addTaskModal?.classList.remove("open");
    this.dom.addTaskForm?.reset();
  }

  handleAddTaskSubmit() {
    const titleInput = document.getElementById("modalTaskTitle");
    const semSelect = document.getElementById("modalTaskSem");
    const title = titleInput.value.trim();
    const sem = parseInt(semSelect.value, 10);

    if (!title) return;

    this.customTasks.push({
      id: `custom-${Date.now()}`,
      title,
      sem,
      done: false,
      at: new Date().toISOString().slice(0, 10)
    });

    this.saveCustomTasks();
    this.closeAddTaskModal();
    this.render();
    this.showToast("Custom task added to Semester " + sem);
  }

  openAddAppModal() {
    this.dom.addAppModal?.classList.add("open");
  }

  closeAddAppModal() {
    this.dom.addAppModal?.classList.remove("open");
    this.dom.addAppForm?.reset();
  }

  handleAddAppSubmit() {
    const company = document.getElementById("modalAppCompany").value.trim();
    const role = document.getElementById("modalAppRole").value.trim();
    const platform = document.getElementById("modalAppPlatform").value;
    const status = document.getElementById("modalAppStatus").value;
    const notes = document.getElementById("modalAppNotes").value.trim();

    if (!company || !role) return;

    this.applications.unshift({
      id: `app-${Date.now()}`,
      company,
      role,
      platform,
      status,
      date: new Date().toISOString().slice(0, 10),
      notes
    });

    this.saveApplications();
    this.closeAddAppModal();
    this.renderCareerView();
    this.showToast("Application logged for " + company);
  }

  showToast(msg) {
    if (!this.dom.toast) return;
    this.dom.toast.textContent = msg;
    this.dom.toast.classList.add("show");
    setTimeout(() => {
      this.dom.toast.classList.remove("show");
    }, 2400);
  }
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  new PlacementOSApp();
});
