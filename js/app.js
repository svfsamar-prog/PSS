/**
 * Placement Dashboard Application Logic
 * Mobile-First, LocalStorage-backed with CSV/PDF Export
 */

import { CURRICULUM, WEEKLY_RHYTHM, TARGET_SNAPSHOT } from "./data.js";
import { exportToCSV, exportToPDF, exportBackupJSON, importBackupJSON } from "./export.js";

// Storage Keys
const STORAGE_KEY_STATE = "placement-tracker-v2";
const STORAGE_KEY_CUSTOM = "placement-custom-tasks-v2";
const STORAGE_KEY_THEME = "placement-theme";
const LEGACY_KEY_V1 = "placement-ledger-v1";

class PlacementApp {
  constructor() {
    this.curriculum = CURRICULUM;
    this.activeSemIndex = 0;
    this.activeView = "checklist"; // checklist | projects | timetable | targets | export
    this.searchQuery = "";
    this.filterStatus = "all"; // all | pending | done
    this.filterCategory = "all";

    this.state = this.loadState();
    this.customTasks = this.loadCustomTasks();

    this.initTheme();
    this.initDOM();
    this.bindEvents();
    this.render();
  }

  /* ==========================================================================
     Storage & Migration
     ========================================================================== */
  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATE);
      if (saved) return JSON.parse(saved);

      // Check for legacy v1 migration
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
      console.error("Failed to load state from localStorage:", e);
    }
    return {};
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(this.state));
    } catch (e) {
      console.error("Failed to save state:", e);
    }
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
    } catch (e) {
      console.error("Failed to save custom tasks:", e);
    }
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
      kpiGrid: document.getElementById("kpiGrid"),
      pctOverall: document.getElementById("pctOverall"),
      overallFrac: document.getElementById("overallFrac"),
      ringOverall: document.getElementById("ringOverall"),
      pctCurrent: document.getElementById("pctCurrent"),
      currentLabel: document.getElementById("currentLabel"),
      ringCurrent: document.getElementById("ringCurrent"),
      pctProj: document.getElementById("pctProj"),
      ringProj: document.getElementById("ringProj"),
      messageCard: document.getElementById("messageCard"),
      semesterGrid: document.getElementById("semesterGrid"),
      filterContainer: document.getElementById("filterContainer"),
      searchInput: document.getElementById("searchInput"),
      searchClear: document.getElementById("searchClear"),
      filterPills: document.getElementById("filterPills"),
      contentPanel: document.getElementById("contentPanel"),
      themeToggleBtn: document.getElementById("themeToggleBtn"),
      addTaskBtn: document.getElementById("addTaskBtn"),
      addTaskModal: document.getElementById("addTaskModal"),
      addTaskForm: document.getElementById("addTaskForm"),
      closeModalBtn: document.getElementById("closeModalBtn"),
      cancelModalBtn: document.getElementById("cancelModalBtn"),
      toast: document.getElementById("toast")
    };
  }

  bindEvents() {
    // Theme toggle
    this.dom.themeToggleBtn?.addEventListener("click", () => this.toggleTheme());

    // Tab Navigation (Desktop + Mobile)
    document.querySelectorAll("[data-nav-view]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const view = e.currentTarget.getAttribute("data-nav-view");
        this.switchView(view);
      });
    });

    // Search input
    this.dom.searchInput?.addEventListener("input", (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.dom.searchClear.style.display = this.searchQuery ? "block" : "none";
      this.renderActiveView();
    });

    this.dom.searchClear?.addEventListener("click", () => {
      this.dom.searchInput.value = "";
      this.searchQuery = "";
      this.dom.searchClear.style.display = "none";
      this.renderActiveView();
    });

    // Add Task Modal
    this.dom.addTaskBtn?.addEventListener("click", () => {
      this.openAddTaskModal();
    });

    this.dom.closeModalBtn?.addEventListener("click", () => this.closeAddTaskModal());
    this.dom.cancelModalBtn?.addEventListener("click", () => this.closeAddTaskModal());

    this.dom.addTaskModal?.addEventListener("click", (e) => {
      if (e.target === this.dom.addTaskModal) this.closeAddTaskModal();
    });

    this.dom.addTaskForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleAddTaskSubmit();
    });
  }

  /* ==========================================================================
     Calculations & Metrics
     ========================================================================== */
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

    // Project completion calculations (Project 1 in Sem 3, Project 2 in Sem 4, Project 3 in Sem 5)
    const projectStats = [0, 1, 2].map(semIdx => {
      const sem = this.curriculum[semIdx];
      const projSec = sem.sections.find(s => s.isProject);
      if (!projSec) return { done: false, pct: 0 };
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

  /* ==========================================================================
     Render Flow
     ========================================================================== */
  render() {
    this.renderKPIs();
    this.renderSemesterGrid();
    this.renderFilterPills();
    this.renderActiveView();
  }

  renderKPIs() {
    const stats = this.calculateStats();

    // Overall Ring
    this.dom.pctOverall.textContent = `${stats.overallPct}%`;
    this.dom.overallFrac.textContent = `${stats.doneAll} / ${stats.totalAll}`;
    this.setRingColor(this.dom.ringOverall, stats.overallPct);

    // Current Semester Ring
    const curSem = stats.semStats[this.activeSemIndex];
    this.dom.pctCurrent.textContent = `${curSem.pct}%`;
    this.dom.currentLabel.textContent = `Sem ${curSem.sem}`;
    this.setRingColor(this.dom.ringCurrent, curSem.pct);

    // Projects Ring
    this.dom.pctProj.textContent = `${stats.completedProjectsCount} / 3`;
    const projPct = Math.round((stats.completedProjectsCount / 3) * 100);
    this.setRingColor(this.dom.ringProj, projPct);

    // Motivational Banner
    this.renderMessageBanner(stats.overallPct);
  }

  setRingColor(element, pct) {
    if (!element) return;
    element.style.background = `conic-gradient(var(--accent) ${pct * 3.6}deg, var(--border-subtle) 0deg)`;
  }

  renderMessageBanner(pct) {
    let msg, icon;
    if (pct === 0) {
      icon = "🎯";
      msg = "Fresh start! Dive into Semester 3 Python Core & SQL. Every single box checked builds compounding leverage for your fresher placement package.";
    } else if (pct < 20) {
      icon = "🌱";
      msg = "Great start. Consistency beats intensity — keep up your 15h weekly rhythm. Fundamentals stick faster than they appear.";
    } else if (pct < 45) {
      icon = "⚡";
      msg = "Solid momentum! Python, SQL, and Project #1 will be your core anchor during initial screening rounds. Keep going.";
    } else if (pct < 70) {
      icon = "🚀";
      msg = "Impressive depth! You have built substantial skills. Start internship applications in parallel and polish your deployed live projects.";
    } else if (pct < 95) {
      icon = "🔥";
      msg = "Placement ready! Run your revision passes on DSA, Core CS, and mock interviews. You are ready to stand out in technical rounds.";
    } else {
      icon = "🏆";
      msg = "Every single milestone achieved! You have put in the rigorous work. Placement season is for selecting offers, not scrambling.";
    }

    this.dom.messageCard.innerHTML = `<span class="icon">${icon}</span><div>${msg}</div>`;
  }

  renderSemesterGrid() {
    const stats = this.calculateStats();
    this.dom.semesterGrid.innerHTML = "";

    this.curriculum.forEach((sem, si) => {
      const tile = document.createElement("button");
      tile.className = `semester-tile ${si === this.activeSemIndex ? "active" : ""}`;
      tile.dataset.si = si;

      const semStat = stats.semStats[si];

      tile.innerHTML = `
        <div class="progress-ring sm" id="semRing-${si}">
          <b>${semStat.pct}%</b>
        </div>
        <div class="semester-tile-text">
          <b>Sem ${sem.sem}</b>
          <span>${sem.range}</span>
        </div>
      `;

      tile.addEventListener("click", () => {
        this.activeSemIndex = si;
        this.render();
      });

      this.dom.semesterGrid.appendChild(tile);
      this.setRingColor(tile.querySelector(`#semRing-${si}`), semStat.pct);
    });
  }

  renderFilterPills() {
    const categories = ["All", "Python", "SQL", "DSA", "Backend", "Projects", "Machine Learning", "System Design", "GenAI", "Core CS", "Career"];
    this.dom.filterPills.innerHTML = "";

    categories.forEach(cat => {
      const pill = document.createElement("button");
      pill.className = `filter-pill ${this.filterCategory.toLowerCase() === cat.toLowerCase() ? "active" : ""}`;
      pill.textContent = cat;
      pill.addEventListener("click", () => {
        this.filterCategory = cat.toLowerCase();
        this.renderFilterPills();
        this.renderActiveView();
      });
      this.dom.filterPills.appendChild(pill);
    });
  }

  switchView(viewName) {
    this.activeView = viewName;

    // Update active tab buttons
    document.querySelectorAll("[data-nav-view]").forEach(btn => {
      const isTarget = btn.getAttribute("data-nav-view") === viewName;
      btn.classList.toggle("active", isTarget);
    });

    // Control visibility of filter container & semester grid
    if (viewName === "checklist") {
      this.dom.semesterGrid.style.display = "grid";
      this.dom.filterContainer.style.display = "flex";
      this.dom.addTaskBtn.style.display = "inline-flex";
    } else {
      this.dom.semesterGrid.style.display = "none";
      this.dom.filterContainer.style.display = "none";
      this.dom.addTaskBtn.style.display = "none";
    }

    this.renderActiveView();
  }

  renderActiveView() {
    switch (this.activeView) {
      case "checklist":
        this.renderChecklistView();
        break;
      case "projects":
        this.renderProjectsView();
        break;
      case "timetable":
        this.renderTimetableView();
        break;
      case "targets":
        this.renderTargetsView();
        break;
      case "export":
        this.renderExportHubView();
        break;
    }
  }

  /* ==========================================================================
     Checklist View
     ========================================================================== */
  renderChecklistView() {
    const sem = this.curriculum[this.activeSemIndex];
    const semStat = this.calculateStats().semStats[this.activeSemIndex];

    let html = `
      <div class="panel-header">
        <div class="panel-title-area">
          <h2>${sem.title}</h2>
          <div class="semester-range">📅 ${sem.range} · Completed: ${semStat.done} of ${semStat.tot} items (${semStat.pct}%)</div>
        </div>
      </div>
    `;

    let totalDisplayed = 0;

    sem.sections.forEach((sec, ci) => {
      // Category filter check
      if (this.filterCategory !== "all" && (sec.category || "").toLowerCase() !== this.filterCategory) {
        return;
      }

      // Filter section items by search & status
      const filteredItems = sec.items.map((text, ii) => {
        const id = `s${this.activeSemIndex}-${ci}-${ii}`;
        const isDone = this.isTaskDone(id);
        return { text, id, isDone, originalIndex: ii };
      }).filter(item => {
        if (this.filterStatus === "pending" && item.isDone) return false;
        if (this.filterStatus === "done" && !item.isDone) return false;
        if (this.searchQuery && !item.text.toLowerCase().includes(this.searchQuery)) return false;
        return true;
      });

      if (filteredItems.length === 0) return;
      totalDisplayed += filteredItems.length;

      html += `
        <div class="topic-section">
          <div class="section-head">
            <h3>${sec.label}</h3>
            ${sec.category ? `<span class="category-chip">${sec.category}</span>` : ""}
          </div>
          <ul class="item-list">
      `;

      filteredItems.forEach(item => {
        html += `
          <li class="task-item ${item.isDone ? "done" : ""}">
            <input type="checkbox" class="custom-checkbox" id="${item.id}" ${item.isDone ? "checked" : ""}>
            <label class="task-label" for="${item.id}">${item.text}</label>
          </li>
        `;
      });

      html += `</ul></div>`;
    });

    // Custom tasks for this semester
    const semCustomTasks = this.customTasks.filter(t => t.sem === sem.sem).filter(t => {
      if (this.filterStatus === "pending" && t.done) return false;
      if (this.filterStatus === "done" && !t.done) return false;
      if (this.searchQuery && !t.title.toLowerCase().includes(this.searchQuery)) return false;
      return true;
    });

    if (semCustomTasks.length > 0) {
      totalDisplayed += semCustomTasks.length;
      html += `
        <div class="topic-section">
          <div class="section-head">
            <h3>Personal Added Tasks</h3>
            <span class="category-chip">Custom</span>
          </div>
          <ul class="item-list">
      `;

      semCustomTasks.forEach(task => {
        html += `
          <li class="task-item ${task.done ? "done" : ""}">
            <input type="checkbox" class="custom-checkbox" data-custom-id="${task.id}" ${task.done ? "checked" : ""}>
            <label class="task-label" data-custom-label="${task.id}">${task.title}</label>
            <div class="task-meta">
              <button class="delete-task-btn" data-delete-id="${task.id}" title="Delete task">🗑️</button>
            </div>
          </li>
        `;
      });

      html += `</ul></div>`;
    }

    if (totalDisplayed === 0) {
      html += `
        <div style="text-align:center; padding: 2.5rem 1rem; color: var(--ink-secondary);">
          <div style="font-size:2rem; margin-bottom: 0.5rem;">🔍</div>
          <b>No tasks match your current filter</b>
          <p style="font-size: 0.85rem; margin-top: 0.3rem;">Try resetting your search query or switching categories.</p>
        </div>
      `;
    }

    if (sem.note) {
      html += `<div class="semester-note">💡 <b>Semester Advice:</b> ${sem.note}</div>`;
    }

    this.dom.contentPanel.innerHTML = html;

    // Attach checkbox handlers
    this.dom.contentPanel.querySelectorAll(".custom-checkbox").forEach(box => {
      box.addEventListener("change", (e) => {
        const id = e.target.id;
        const customId = e.target.getAttribute("data-custom-id");

        if (customId) {
          const task = this.customTasks.find(t => t.id === customId);
          if (task) {
            task.done = e.target.checked;
            task.at = e.target.checked ? new Date().toISOString().slice(0, 10) : "";
            this.saveCustomTasks();
          }
        } else if (id) {
          this.setTaskDone(id, e.target.checked);
        }

        const li = e.target.closest(".task-item");
        li?.classList.toggle("done", e.target.checked);
        this.renderKPIs();
        this.renderSemesterGrid();
      });
    });

    // Delete custom task handlers
    this.dom.contentPanel.querySelectorAll("[data-delete-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-delete-id");
        if (confirm("Remove this custom task?")) {
          this.customTasks = this.customTasks.filter(t => t.id !== id);
          this.saveCustomTasks();
          this.render();
          this.showToast("Task removed");
        }
      });
    });
  }

  /* ==========================================================================
     Projects Showcase View
     ========================================================================== */
  renderProjectsView() {
    const stats = this.calculateStats();

    const projectsInfo = [
      {
        num: 1,
        sem: 3,
        name: "Full Stack Analytics & Reporting Platform",
        desc: "Role-based authentication, CSV upload with automated validation, interactive business analytics dashboard, monthly trends, and automated export layer.",
        stack: "Next.js, TypeScript, FastAPI, PostgreSQL / Supabase, Docker, Power BI"
      },
      {
        num: 2,
        sem: 4,
        name: "Production End-to-End Machine Learning Pipeline",
        desc: "Predictive modeling (churn / customer segmentation / CLV), live model serving via FastAPI endpoints, connected to Next.js interactive frontend.",
        stack: "Python, Scikit-Learn, Pandas, PostgreSQL, FastAPI, Docker, Next.js"
      },
      {
        num: 3,
        sem: 5,
        name: "Showpiece Generative AI & Enterprise RAG Platform",
        desc: "Natural language query answering, Text-to-SQL query generation, automated metric anomaly explanation, report generation, and vector retrieval.",
        stack: "LLMs, LangChain/LlamaIndex, Vector DB (pgvector), FastAPI, Next.js, Cloud Deployment"
      }
    ];

    let html = `
      <div class="panel-header">
        <div class="panel-title-area">
          <h2>Portfolio Projects Showcase</h2>
          <div class="semester-range">3 High-Impact Live Deployments for Freshers (Currently ${stats.completedProjectsCount}/3 fully checked)</div>
        </div>
      </div>
    `;

    projectsInfo.forEach((proj, pIdx) => {
      const sem = this.curriculum[pIdx];
      const projSec = sem.sections.find(s => s.isProject);
      const projStat = stats.projectStats[pIdx];

      html += `
        <div class="project-card">
          <div class="project-card-header">
            <div>
              <span class="project-badge">Project #${proj.num} · Sem ${proj.sem}</span>
              <h3 class="project-title" style="margin-top:0.4rem;">${proj.name}</h3>
            </div>
            <div style="text-align: right;">
              <b style="font-size: 1.15rem; color: var(--accent);">${projStat.pct}%</b>
              <div style="font-size: 0.72rem; color: var(--ink-secondary);">${projStat.count} items</div>
            </div>
          </div>

          <p style="font-size: 0.85rem; color: var(--ink-secondary); margin-bottom: 0.75rem;">${proj.desc}</p>
          <div style="font-size: 0.76rem; margin-bottom: 0.85rem; color: var(--ink-tertiary);"><b>Tech Stack:</b> ${proj.stack}</div>

          <div class="project-progress-bar-bg">
            <div class="project-progress-bar-fill" style="width: ${projStat.pct}%;"></div>
          </div>

          <h4 style="font-size: 0.76rem; text-transform: uppercase; color: var(--ink-secondary); margin-bottom: 0.5rem;">Core Deliverables Checklist</h4>
          <ul class="item-list">
      `;

      if (projSec) {
        const secIdx = sem.sections.indexOf(projSec);
        projSec.items.forEach((itemText, ii) => {
          const id = `s${pIdx}-${secIdx}-${ii}`;
          const isDone = this.isTaskDone(id);
          html += `
            <li class="task-item ${isDone ? "done" : ""}">
              <input type="checkbox" class="custom-checkbox" id="${id}" ${isDone ? "checked" : ""}>
              <label class="task-label" for="${id}">${itemText}</label>
            </li>
          `;
        });
      }

      html += `</ul></div>`;
    });

    this.dom.contentPanel.innerHTML = html;

    // Attach checkbox listeners
    this.dom.contentPanel.querySelectorAll(".custom-checkbox").forEach(box => {
      box.addEventListener("change", (e) => {
        this.setTaskDone(e.target.id, e.target.checked);
        this.renderKPIs();
        this.renderProjectsView();
      });
    });
  }

  /* ==========================================================================
     Timetable & Weekly Rhythm View
     ========================================================================== */
  renderTimetableView() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = days[new Date().getDay()];

    let html = `
      <div class="panel-header">
        <div class="panel-title-area">
          <h2>Weekly Study Rhythm</h2>
          <div class="semester-range">≈15–17 focused hours/week. Consistency beats intensity every single time.</div>
        </div>
      </div>

      <div class="data-table-wrap">
        <table class="modern-table">
          <thead>
            <tr>
              <th style="width: 110px;">Day</th>
              <th>Planned Routine</th>
              <th>Focus Area</th>
            </tr>
          </thead>
          <tbody>
    `;

    WEEKLY_RHYTHM.forEach(r => {
      const isToday = r.day.toLowerCase() === todayName.toLowerCase();
      html += `
        <tr style="${isToday ? "background: var(--accent-light); font-weight: 600;" : ""}">
          <td>
            ${r.day}
            ${isToday ? `<span class="category-chip" style="margin-left: 4px; background: var(--accent); color: white;">Today</span>` : ""}
          </td>
          <td>${r.tasks}</td>
          <td style="color: var(--ink-secondary);">${r.focus}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
      <div class="semester-note" style="margin-top: 1.25rem;">
        ⚡ <b>Pro Tip:</b> Treat Monday–Friday as 2-hour daily blocks (before/after college). Save Saturday and Sunday for deep, uninterrupted 3–4 hour project building.
      </div>
    `;

    this.dom.contentPanel.innerHTML = html;
  }

  /* ==========================================================================
     Target Snapshot View
     ========================================================================== */
  renderTargetsView() {
    let html = `
      <div class="panel-header">
        <div class="panel-title-area">
          <h2>Placement Target Snapshot</h2>
          <div class="semester-range">Benchmark criteria by placement season (Sem 6) to qualify for top-tier fresher roles</div>
        </div>
      </div>

      <div class="data-table-wrap">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Target Metric</th>
              <th>Placement Season Benchmark</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
    `;

    TARGET_SNAPSHOT.forEach(t => {
      html += `
        <tr>
          <td><b>${t.metric}</b></td>
          <td>${t.target}</td>
          <td><span class="category-chip">${t.tag}</span></td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    this.dom.contentPanel.innerHTML = html;
  }

  /* ==========================================================================
     Export & Backup Hub View
     ========================================================================== */
  renderExportHubView() {
    const stats = this.calculateStats();

    let html = `
      <div class="panel-header">
        <div class="panel-title-area">
          <h2>Data Export & Backup Hub</h2>
          <div class="semester-range">Export your progress, print a PDF checklist, or safely backup your data</div>
        </div>
      </div>

      <p style="font-size: 0.88rem; color: var(--ink-secondary);">
        All your checklist data is saved securely in your browser's local storage. Use the tools below to export spreadsheets, generate printable PDF reports, or backup your progress.
      </p>

      <div class="export-card-grid">
        <div class="export-option-card" id="exportCsvBtn">
          <div class="export-icon">📊</div>
          <b>Export to CSV</b>
          <p>Download full progress spreadsheet with tasks, status, and completion dates.</p>
        </div>

        <div class="export-option-card" id="exportPdfBtn">
          <div class="export-icon">📄</div>
          <b>Export to PDF</b>
          <p>Open print preview formatted cleanly for saving as a PDF report or printing.</p>
        </div>

        <div class="export-option-card" id="backupJsonBtn">
          <div class="export-icon">💾</div>
          <b>Backup JSON</b>
          <p>Download a complete JSON backup to transfer progress between devices.</p>
        </div>

        <div class="export-option-card" id="restoreJsonTrigger">
          <div class="export-icon">📥</div>
          <b>Restore JSON</b>
          <p>Restore progress from a previously saved JSON backup file.</p>
          <input type="file" id="restoreJsonInput" accept=".json" style="display: none;">
        </div>

        <div class="export-option-card" id="resetProgressBtn" style="border-color: #F87171;">
          <div class="export-icon">🔄</div>
          <b style="color: #DC2626;">Reset Progress</b>
          <p>Clear all checked boxes and reset checklist to 0%. Cannot be undone.</p>
        </div>
      </div>
    `;

    this.dom.contentPanel.innerHTML = html;

    // Attach export event listeners
    document.getElementById("exportCsvBtn")?.addEventListener("click", () => {
      exportToCSV(this.curriculum, this.state, this.customTasks);
      this.showToast("CSV file exported successfully!");
    });

    document.getElementById("exportPdfBtn")?.addEventListener("click", () => {
      exportToPDF();
    });

    document.getElementById("backupJsonBtn")?.addEventListener("click", () => {
      exportBackupJSON(this.state, this.customTasks);
      this.showToast("Backup JSON downloaded!");
    });

    const restoreTrigger = document.getElementById("restoreJsonTrigger");
    const restoreInput = document.getElementById("restoreJsonInput");

    restoreTrigger?.addEventListener("click", () => restoreInput?.click());

    restoreInput?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const backupData = await importBackupJSON(file);
        if (backupData.state) {
          this.state = backupData.state;
          this.saveState();
        }
        if (Array.isArray(backupData.customTasks)) {
          this.customTasks = backupData.customTasks;
          this.saveCustomTasks();
        }
        this.render();
        this.showToast("Backup restored successfully!");
      } catch (err) {
        alert("Failed to restore backup: " + err.message);
      }
      restoreInput.value = "";
    });

    document.getElementById("resetProgressBtn")?.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all progress? This will uncheck every item.")) {
        this.state = {};
        this.saveState();
        this.render();
        this.showToast("Progress has been reset.");
      }
    });
  }

  /* ==========================================================================
     Custom Task Modal
     ========================================================================== */
  openAddTaskModal() {
    this.dom.addTaskModal?.classList.add("open");
    const semSelect = document.getElementById("modalTaskSem");
    if (semSelect) {
      semSelect.value = this.curriculum[this.activeSemIndex].sem;
    }
    document.getElementById("modalTaskTitle")?.focus();
  }

  closeAddTaskModal() {
    this.dom.addTaskModal?.classList.remove("open");
    this.dom.addTaskForm?.reset();
  }

  handleAddTaskSubmit() {
    const titleInput = document.getElementById("modalTaskTitle");
    const semSelect = document.getElementById("modalTaskSem");

    const title = titleInput?.value.trim();
    const sem = parseInt(semSelect?.value, 10) || 3;

    if (!title) return;

    const newTask = {
      id: "cust-" + Date.now(),
      sem,
      title,
      done: false,
      at: ""
    };

    this.customTasks.push(newTask);
    this.saveCustomTasks();
    this.closeAddTaskModal();
    this.render();
    this.showToast("Custom task added!");
  }

  /* ==========================================================================
     Toast Notifications
     ========================================================================== */
  showToast(message) {
    if (!this.dom.toast) return;
    this.dom.toast.textContent = message;
    this.dom.toast.classList.add("show");
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.dom.toast.classList.remove("show");
    }, 2400);
  }
}

// Start app on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new PlacementApp();
});
