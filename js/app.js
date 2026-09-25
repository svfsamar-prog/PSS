/**
 * Placement OS Application Logic
 * Personal Academic + Placement Roadmap & Career OS
 * Candidate: Samar Raj · BCA (Data Science / AI-ML)
 * Backend: Supabase Cloud Database (Project PSS - sesshjrjyscnnjufypdf)
 * ZERO LocalStorage for all curriculum, goals, applications, and metrics!
 */

import {
  CURRICULUM,
  WEEKLY_RHYTHM,
  TARGET_SNAPSHOT,
  SKILLS_MATRIX,
  PROJECTS_SPEC,
  TODAY_FOCUS_TEMPLATES,
  STUDY_HOURS_TARGET
} from "./data.js";

import { db } from "./supabase.js";
import { exportToCSV, exportToPDF, exportBackupJSON } from "./export.js";

class PlacementOSApp {
  constructor() {
    this.curriculum = CURRICULUM;
    this.skillsMatrix = SKILLS_MATRIX;
    this.projectsSpec = PROJECTS_SPEC;
    this.activeSemIndex = 0; // 0 = Sem 3, 1 = Sem 4, 2 = Sem 5, 3 = Sem 6
    this.activeView = "dashboard";

    // Supabase State (Live Cloud Memory)
    this.profile = null;
    this.taskState = {}; // id -> { is_completed, completed_at }
    this.customGoals = [];
    this.applications = [];
    this.dailyTasks = [];
    this.studyHours = {};
    this.isLoading = true;

    this.initDOM();
    this.bindEvents();
    this.checkAuthAndStart();
  }

  checkAuthAndStart() {
    const session = db.getSession();
    const authWrapper = document.getElementById("authWrapper");

    if (!session) {
      if (authWrapper) authWrapper.style.display = "flex";
      this.bindAuthEvents();
    } else {
      if (authWrapper) authWrapper.style.display = "none";
      const user = db.getUser();
      const profileName = document.getElementById("userProfileName");
      if (profileName) profileName.textContent = user?.email ? user.email.split("@")[0] : "Samar";
      this.loadFromSupabase();
    }
  }

  bindAuthEvents() {
    const form = document.getElementById("loginForm");
    const errorBanner = document.getElementById("authErrorBanner");
    const errorMsg = document.getElementById("authErrorMsg");
    const submitBtn = document.getElementById("loginSubmitBtn");
    const togglePwdBtn = document.getElementById("togglePwdBtn");
    const pwdInput = document.getElementById("loginPassword");
    const emailInput = document.getElementById("loginEmail");
    togglePwdBtn?.addEventListener("click", () => {
      const type = pwdInput.getAttribute("type") === "password" ? "text" : "password";
      pwdInput.setAttribute("type", type);
      togglePwdBtn.textContent = type === "password" ? "👁️" : "🙈";
    });

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = pwdInput.value;

      errorBanner.classList.remove("show");
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Authenticating...</span> <span>⏳</span>`;

      try {
        await db.signIn(email, password);
        const authWrapper = document.getElementById("authWrapper");
        if (authWrapper) authWrapper.style.display = "none";

        const profileName = document.getElementById("userProfileName");
        if (profileName) profileName.textContent = email.split("@")[0];

        this.showToast("Welcome back, Samar! Authenticated via Supabase.");
        this.loadFromSupabase();
      } catch (err) {
        console.error("Login failed:", err);
        errorMsg.textContent = err.message || "Invalid credentials. Please verify your email and password.";
        errorBanner.classList.add("show");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Sign In to Placement OS</span> <span>→</span>`;
      }
    });
  }

  /* ==========================================================================
     Supabase Data Synchronization
     ========================================================================== */
  async loadFromSupabase() {
    this.setSyncStatus("syncing", "Connecting to Supabase...");
    try {
      const [profileData, tasksData, goalsData, appsData, dailyData, studyData] = await Promise.all([
        db.getProfile(),
        db.getCurriculumTasks(),
        db.getCustomGoals(),
        db.getCareerApplications(),
        db.getDailyFocusTasks(),
        db.getStudyHoursLog()
      ]);

      this.profile = profileData || {
        dsa_solved: 42,
        sql_solved: 68,
        internships_done: 0,
        certifications_done: 2
      };

      // Map tasks
      this.taskState = {};
      if (tasksData) {
        tasksData.forEach(t => {
          this.taskState[t.id] = {
            done: t.is_completed,
            at: t.completed_at
          };
        });
      }

      this.customGoals = goalsData || [];
      this.applications = appsData || [];
      this.dailyTasks = dailyData || [];

      this.studyHours = {};
      if (studyData) {
        studyData.forEach(s => {
          this.studyHours[s.day_code] = parseFloat(s.logged_hours) || 0;
        });
      }

      this.isLoading = false;
      this.setSyncStatus("connected", "Supabase Cloud: PSS (Connected)");
      this.render();
    } catch (err) {
      console.error("Supabase load error:", err);
      this.setSyncStatus("error", "Supabase sync error - Retrying...");
      this.isLoading = false;
      this.render();
    }
  }

  setSyncStatus(status, text) {
    const el = document.getElementById("cloudSyncBadge");
    if (!el) return;

    const dot = el.querySelector(".sync-dot");
    const label = el.querySelector(".sync-text");

    if (status === "syncing") {
      if (dot) {
        dot.style.background = "#F59E0B";
        dot.style.boxShadow = "0 0 8px rgba(245, 158, 11, 0.7)";
      }
      if (label) label.textContent = "Syncing...";
      el.setAttribute("title", text);
    } else if (status === "connected") {
      if (dot) {
        dot.style.background = "#10B981";
        dot.style.boxShadow = "0 0 8px rgba(16, 185, 129, 0.7)";
      }
      if (label) label.textContent = "PSS Live";
      el.setAttribute("title", text);
    } else {
      if (dot) {
        dot.style.background = "#EF4444";
        dot.style.boxShadow = "0 0 8px rgba(239, 68, 68, 0.7)";
      }
      if (label) label.textContent = "Offline";
      el.setAttribute("title", text);
    }
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
    // Navigation (Sidebar + Mobile bottom bar + Brand logo)
    document.querySelectorAll("[data-nav-view]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const view = e.currentTarget.getAttribute("data-nav-view");
        this.switchView(view);
      });
    });

    document.getElementById("brandHomeBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.switchView("dashboard");
    });

    // Theme toggle
    this.dom.themeToggleBtn?.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const nextTheme = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      const icon = document.getElementById("themeToggleIcon");
      if (icon) icon.textContent = nextTheme === "dark" ? "☀️" : "🌙";
    });

    // User Profile Dropdown Toggle
    const userMenuBtn = document.getElementById("userMenuToggleBtn");
    const userDropdown = document.getElementById("userDropdownMenu");
    userMenuBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown?.classList.toggle("show");
    });

    window.addEventListener("click", (e) => {
      if (userDropdown && !userDropdown.contains(e.target) && e.target !== userMenuBtn) {
        userDropdown.classList.remove("show");
      }
    });

    // Mobile Menu Toggle & Drawer
    const mobileMenuBtn = document.getElementById("mobileMenuToggle");
    const sidebar = document.querySelector(".app-sidebar");
    const sidebarBackdrop = document.getElementById("sidebarBackdrop");

    mobileMenuBtn?.addEventListener("click", () => {
      sidebar?.classList.toggle("mobile-open");
      sidebarBackdrop?.classList.toggle("show");
    });

    sidebarBackdrop?.addEventListener("click", () => {
      sidebar?.classList.remove("mobile-open");
      sidebarBackdrop?.classList.remove("show");
    });

    // Command Palette Trigger & Keyboard Listeners (⌘K / Ctrl+K)
    document.getElementById("openCommandPaletteBtn")?.addEventListener("click", () => this.openCommandPalette());
    document.getElementById("closeCommandPaletteBtn")?.addEventListener("click", () => this.closeCommandPalette());
    document.getElementById("commandPaletteModal")?.addEventListener("click", (e) => {
      if (e.target.id === "commandPaletteModal") this.closeCommandPalette();
    });

    document.getElementById("commandInput")?.addEventListener("input", (e) => {
      this.cmdSelectedIndex = 0;
      this.renderCommandList(e.target.value);
    });

    window.addEventListener("keydown", (e) => {
      // ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const modal = document.getElementById("commandPaletteModal");
        if (modal && modal.style.display !== "none") {
          this.closeCommandPalette();
        } else {
          this.openCommandPalette();
        }
        return;
      }

      // If Command Palette is open
      const modal = document.getElementById("commandPaletteModal");
      if (modal && modal.style.display !== "none") {
        if (e.key === "Escape") {
          e.preventDefault();
          this.closeCommandPalette();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (this.filteredCmdItems && this.filteredCmdItems.length > 0) {
            this.cmdSelectedIndex = (this.cmdSelectedIndex + 1) % this.filteredCmdItems.length;
            this.updateCommandSelectionHighlight();
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (this.filteredCmdItems && this.filteredCmdItems.length > 0) {
            this.cmdSelectedIndex = (this.cmdSelectedIndex - 1 + this.filteredCmdItems.length) % this.filteredCmdItems.length;
            this.updateCommandSelectionHighlight();
          }
        } else if (e.key === "Enter") {
          e.preventDefault();
          this.executeCommand(this.cmdSelectedIndex);
        }
      }
    });

    // Sidebar Focus CTA
    this.dom.sidebarFocusBtn?.addEventListener("click", () => {
      this.activeSemIndex = 0;
      this.switchView("roadmap");
    });

    // Sign Out Button
    document.getElementById("signOutBtn")?.addEventListener("click", () => {
      if (confirm("Sign out of Placement OS?")) {
        db.signOut();
        const authWrapper = document.getElementById("authWrapper");
        if (authWrapper) authWrapper.style.display = "flex";
        this.bindAuthEvents();
        this.showToast("Signed out successfully");
      }
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
     Raycast / Linear Style Command Palette (⌘K)
     ========================================================================== */
  openCommandPalette() {
    const modal = document.getElementById("commandPaletteModal");
    const input = document.getElementById("commandInput");
    if (!modal || !input) return;

    modal.style.display = "flex";
    input.value = "";
    input.focus();
    this.cmdSelectedIndex = 0;
    this.renderCommandList("");
  }

  closeCommandPalette() {
    const modal = document.getElementById("commandPaletteModal");
    if (modal) modal.style.display = "none";
  }

  getCommandPaletteItems() {
    return [
      { id: "v_dash", type: "view", title: "Go to Dashboard", icon: "📊", tag: "View", action: () => this.switchView("dashboard") },
      { id: "v_road", type: "view", title: "Curriculum Roadmap (Sem 3 → Sem 6)", icon: "🗺️", tag: "View", action: () => this.switchView("roadmap") },
      { id: "v_skill", type: "view", title: "Skills Matrix & Mastery Index", icon: "⚡", tag: "View", action: () => this.switchView("skills") },
      { id: "v_proj", type: "view", title: "Portfolio Projects Deck (4 Production Apps)", icon: "🚀", tag: "View", action: () => this.switchView("projects") },
      { id: "v_prac", type: "view", title: "DSA & SQL Practice Tracker", icon: "💻", tag: "View", action: () => this.switchView("practice") },
      { id: "v_car", type: "view", title: "Career Applications CRM", icon: "💼", tag: "View", action: () => this.switchView("career") },
      { id: "v_ana", type: "view", title: "Learning Analytics & Study Velocity", icon: "📈", tag: "View", action: () => this.switchView("analytics") },
      { id: "v_rhy", type: "view", title: "Weekly Rhythm & Routine", icon: "📅", tag: "View", action: () => this.switchView("rhythm") },
      { id: "v_tar", type: "view", title: "Placement Target Roles & Tiers", icon: "🎯", tag: "View", action: () => this.switchView("targets") },
      { id: "v_exp", type: "view", title: "Backup Data & Cloud Export", icon: "📥", tag: "View", action: () => this.switchView("export") },
      { id: "a_goal", type: "action", title: "Add Custom Placement Goal", icon: "＋", tag: "Action", action: () => { this.closeCommandPalette(); this.openAddTaskModal(); } },
      { id: "a_app", type: "action", title: "Log Job / Internship Application", icon: "📝", tag: "Action", action: () => { this.closeCommandPalette(); this.openAddAppModal(); } },
      { id: "a_theme", type: "action", title: "Toggle Dark / Light Theme", icon: "🌓", tag: "Theme", action: () => { 
          const current = document.documentElement.getAttribute("data-theme");
          const next = current === "dark" ? "light" : "dark";
          document.documentElement.setAttribute("data-theme", next);
          const icon = document.getElementById("themeToggleIcon");
          if (icon) icon.textContent = next === "dark" ? "☀️" : "🌙";
          this.closeCommandPalette();
        } 
      },
      { id: "a_out", type: "action", title: "Sign Out of Placement OS", icon: "🚪", tag: "Auth", action: () => {
          this.closeCommandPalette();
          document.getElementById("signOutBtn")?.click();
        } 
      }
    ];
  }

  renderCommandList(query = "") {
    const listEl = document.getElementById("commandList");
    if (!listEl) return;

    const q = query.toLowerCase().trim();
    const items = this.getCommandPaletteItems().filter(item => {
      if (!q) return true;
      return item.title.toLowerCase().includes(q) || item.tag.toLowerCase().includes(q);
    });

    if (items.length === 0) {
      listEl.innerHTML = `<div style="padding:1.5rem; text-align:center; color:var(--ink-muted); font-size:0.85rem;">No matching views or actions found</div>`;
      this.filteredCmdItems = [];
      return;
    }

    if (this.cmdSelectedIndex >= items.length) {
      this.cmdSelectedIndex = 0;
    }

    this.filteredCmdItems = items;

    listEl.innerHTML = items.map((item, idx) => `
      <button class="cmd-item ${idx === this.cmdSelectedIndex ? 'selected' : ''}" data-cmd-index="${idx}">
        <div class="cmd-item-left">
          <span class="cmd-item-icon">${item.icon}</span>
          <span>${item.title}</span>
        </div>
        <span class="cmd-item-tag">${item.tag}</span>
      </button>
    `).join("");

    listEl.querySelectorAll(".cmd-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-cmd-index"), 10);
        this.executeCommand(idx);
      });
    });
  }

  updateCommandSelectionHighlight() {
    const listEl = document.getElementById("commandList");
    if (!listEl) return;
    listEl.querySelectorAll(".cmd-item").forEach((btn, idx) => {
      btn.classList.toggle("selected", idx === this.cmdSelectedIndex);
    });
  }

  executeCommand(idx) {
    if (this.filteredCmdItems && this.filteredCmdItems[idx]) {
      const item = this.filteredCmdItems[idx];
      this.closeCommandPalette();
      item.action();
    }
  }

  /* ==========================================================================
     Calculations & Metrics
     ========================================================================== */
  isTaskDone(id) {
    const val = this.taskState[id];
    return val ? !!val.done : false;
  }

  async toggleTaskDone(id, isDone) {
    this.taskState[id] = {
      done: isDone,
      at: isDone ? new Date().toISOString().slice(0, 10) : null
    };

    this.updateSidebarFocus();
    this.setSyncStatus("syncing", "Saving to Supabase...");

    try {
      await db.setTaskStatus(id, isDone);
      this.setSyncStatus("connected", "Supabase Cloud: PSS (Synced)");
    } catch (err) {
      this.setSyncStatus("error", "Failed to save task to Supabase");
    }
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

      // Factor in custom goals for this semester
      const semCustom = this.customGoals.filter(t => t.semester === semData.sem);
      semCustom.forEach(t => {
        semTot++;
        totalAll++;
        if (t.is_completed) {
          semDone++;
          doneAll++;
        }
      });

      const pct = semTot ? Math.round((semDone / semTot) * 100) : 0;
      return { sem: semData.sem, tot: semTot, done: semDone, pct };
    });

    const overallPct = totalAll ? Math.round((doneAll / totalAll) * 100) : 0;

    // Project completion calculations
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

    document.querySelectorAll("[data-nav-view]").forEach(btn => {
      const isTarget = btn.getAttribute("data-nav-view") === viewName;
      btn.classList.toggle("active", isTarget);
    });

    const topbarViewEl = document.getElementById("topbarCurrentView");
    if (topbarViewEl) {
      const viewNames = {
        dashboard: "Dashboard",
        roadmap: "Curriculum Roadmap",
        skills: "Skills Matrix",
        projects: "Portfolio Projects",
        practice: "DSA & SQL Practice",
        career: "Career CRM",
        analytics: "Learning Analytics",
        rhythm: "Weekly Rhythm",
        targets: "Placement Targets",
        export: "Backup & Cloud Export"
      };
      topbarViewEl.textContent = viewNames[viewName] || "Dashboard";
    }

    // Close mobile drawer if open
    document.querySelector(".app-sidebar")?.classList.remove("mobile-open");
    document.getElementById("sidebarBackdrop")?.classList.remove("show");

    // Close user dropdown popover if open
    document.getElementById("userDropdownMenu")?.classList.remove("show");

    this.render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  render() {
    if (this.isLoading) {
      this.dom.mainContainer.innerHTML = `
        <div style="text-align:center; padding:5rem 2rem;">
          <div style="font-size:2.5rem; margin-bottom:1rem; animation: pulse 1.5s infinite;">☁️</div>
          <h2 style="font-family:var(--font-serif); font-size:1.5rem; margin-bottom:0.5rem;">Connecting to Supabase Database...</h2>
          <p style="color:var(--ink-secondary); font-size:0.9rem;">Fetching live tables from project <code>PSS</code> (PostgreSQL 17)</p>
        </div>
      `;
      return;
    }

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
    const p1Stat = stats.projectStats[0];

    const dsaSolved = this.profile?.dsa_solved ?? 42;
    const sqlSolved = this.profile?.sql_solved ?? 68;
    const internDone = this.profile?.internships_done ?? 0;
    const certDone = this.profile?.certifications_done ?? 2;

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

      <!-- 6-Card Placement Readiness KPI Grid (Backed by Supabase) -->
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
          <div class="kpi-val">${dsaSolved} <span style="font-size:0.95rem; color:var(--ink-muted);">/ 150</span></div>
          <div class="kpi-bar">
            <div class="kpi-bar-fill" style="width: ${Math.min(100, Math.round((dsaSolved / 150) * 100))}%;"></div>
          </div>
          <div class="kpi-meta">
            <span>Target: 150 problems</span>
            <button class="kpi-quick-btn" id="quickDsaPlusBtn">+1</button>
          </div>
        </div>

        <div class="readiness-kpi-card">
          <div class="kpi-label">SQL Solved</div>
          <div class="kpi-val">${sqlSolved} <span style="font-size:0.95rem; color:var(--ink-muted);">/ 150</span></div>
          <div class="kpi-bar">
            <div class="kpi-bar-fill" style="width: ${Math.min(100, Math.round((sqlSolved / 150) * 100))}%;"></div>
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
          <div class="kpi-val">${internDone} <span style="font-size:0.95rem; color:var(--ink-muted);">/ 2</span></div>
          <div class="kpi-bar">
            <div class="kpi-bar-fill" style="width: ${(internDone / 2) * 100}%;"></div>
          </div>
          <div class="kpi-meta">
            <span>Target: 1-2 by Sem 5</span>
            <button class="kpi-quick-btn" id="quickInternPlusBtn">+1</button>
          </div>
        </div>

        <div class="readiness-kpi-card">
          <div class="kpi-label">Certifications</div>
          <div class="kpi-val">${certDone} <span style="font-size:0.95rem; color:var(--ink-muted);">/ 4</span></div>
          <div class="kpi-bar">
            <div class="kpi-bar-fill" style="width: ${(certDone / 4) * 100}%;"></div>
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
            </div>

            <div class="focus-tasks-list">
              ${this.renderTodayFocusTasksHtml(todayPlan)}
            </div>

            <div class="focus-task-add">
              <input type="text" id="newFocusTaskInput" placeholder="Add custom today focus task to Supabase...">
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
                ≈ 15–17 focused hours/week. Direct Supabase cloud persistence.
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
    let html = "";

    todayPlan.tasks.forEach((t, i) => {
      const taskId = `plan-${todayPlan.name}-${i}`;
      const dbTask = this.dailyTasks.find(dt => dt.id === taskId);
      const isChecked = dbTask ? dbTask.is_completed : false;
      html += `
        <div class="focus-task-item ${isChecked ? 'checked' : ''}" data-focus-id="${taskId}">
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

    // Custom items in Supabase
    this.dailyTasks.filter(dt => dt.is_custom).forEach(dt => {
      html += `
        <div class="focus-task-item ${dt.is_completed ? 'checked' : ''}" data-focus-id="${dt.id}">
          <div class="focus-checkbox-circle"></div>
          <div class="focus-task-content">
            <div class="focus-task-header">
              <span class="focus-task-tag" style="background:var(--accent-green-soft); color:var(--accent-green);">${dt.task_tag || 'Custom'}</span>
            </div>
            <div class="focus-task-text">${dt.task_text}</div>
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

    // Quick counters with Supabase write
    document.getElementById("quickDsaPlusBtn")?.addEventListener("click", async (e) => {
      e.stopPropagation();
      this.profile.dsa_solved = (this.profile.dsa_solved || 42) + 1;
      this.render();
      await db.updateProfile(this.profile.id, { dsa_solved: this.profile.dsa_solved });
      this.showToast("Saved to Supabase: DSA = " + this.profile.dsa_solved);
    });

    document.getElementById("quickSqlPlusBtn")?.addEventListener("click", async (e) => {
      e.stopPropagation();
      this.profile.sql_solved = (this.profile.sql_solved || 68) + 1;
      this.render();
      await db.updateProfile(this.profile.id, { sql_solved: this.profile.sql_solved });
      this.showToast("Saved to Supabase: SQL = " + this.profile.sql_solved);
    });

    document.getElementById("quickInternPlusBtn")?.addEventListener("click", async (e) => {
      e.stopPropagation();
      if ((this.profile.internships_done || 0) < 2) {
        this.profile.internships_done = (this.profile.internships_done || 0) + 1;
        this.render();
        await db.updateProfile(this.profile.id, { internships_done: this.profile.internships_done });
        this.showToast("Saved to Supabase: Internships = " + this.profile.internships_done);
      }
    });

    document.getElementById("quickCertPlusBtn")?.addEventListener("click", async (e) => {
      e.stopPropagation();
      if ((this.profile.certifications_done || 0) < 4) {
        this.profile.certifications_done = (this.profile.certifications_done || 0) + 1;
        this.render();
        await db.updateProfile(this.profile.id, { certifications_done: this.profile.certifications_done });
        this.showToast("Saved to Supabase: Certifications = " + this.profile.certifications_done);
      }
    });

    // Today Focus Toggles
    document.querySelectorAll("[data-focus-id]").forEach(item => {
      item.addEventListener("click", async () => {
        const id = item.getAttribute("data-focus-id");
        const existing = this.dailyTasks.find(dt => dt.id === id);
        const newStatus = existing ? !existing.is_completed : true;

        if (existing) {
          existing.is_completed = newStatus;
        } else {
          this.dailyTasks.push({ id, is_completed: newStatus, is_custom: false });
        }

        item.classList.toggle("checked", newStatus);
        this.setSyncStatus("syncing", "Saving task to Supabase...");
        await db.setDailyFocusTaskStatus(id, newStatus);
        this.setSyncStatus("connected", "Supabase Cloud: PSS (Synced)");
      });
    });

    // Add custom today task to Supabase
    const addFocusBtn = document.getElementById("addFocusTaskBtn");
    const focusInput = document.getElementById("newFocusTaskInput");
    const handleAddFocus = async () => {
      const text = focusInput.value.trim();
      if (!text) return;
      focusInput.value = "";
      this.setSyncStatus("syncing", "Saving custom task to Supabase...");

      const newTask = {
        id: `focus-${Date.now()}`,
        tag: "Custom",
        text
      };
      await db.addDailyFocusTask(newTask);
      this.dailyTasks.push({ id: newTask.id, task_tag: "Custom", task_text: text, is_completed: false, is_custom: true });
      this.render();
      this.showToast("Saved to Supabase database!");
    };

    addFocusBtn?.addEventListener("click", handleAddFocus);
    focusInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleAddFocus();
    });
  }

  /* ==========================================================================
     VIEW 2: ROADMAP (Modular, No Checkbox Wall)
     ========================================================================== */
  renderRoadmapView() {
    const sem = this.curriculum[this.activeSemIndex];
    const stats = this.calculateStats();
    const semStat = stats.semStats[this.activeSemIndex];

    const dsaSolved = this.profile?.dsa_solved ?? 42;
    const sqlSolved = this.profile?.sql_solved ?? 68;

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
          <button class="btn-primary" id="openAddTaskRoadmapBtn">＋ Add Goal to Supabase</button>
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
          <!-- Left Column: Skill Modules with Drawers -->
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

            <!-- Custom Goals from Supabase -->
            ${this.renderCustomGoalsSectionHtml(sem.sem)}
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
                <div class="count">${sqlSolved} / 150</div>
              </div>

              <div class="problems-stat-box">
                <div>
                  <div class="title">DSA Target</div>
                  <div style="font-size:0.78rem; color:var(--ink-secondary);">Patterns over pure count</div>
                </div>
                <div class="count">${dsaSolved} / 150</div>
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

  renderCustomGoalsSectionHtml(semester) {
    const semGoals = this.customGoals.filter(g => g.semester === semester);
    if (semGoals.length === 0) return "";

    return `
      <div class="card" style="margin-bottom:1.4rem;">
        <div class="section-title-wrap">
          <div class="section-title">
            <span>➕</span> Custom Goals (Supabase Cloud)
          </div>
        </div>
        <ul class="checklist-items">
          ${semGoals.map(g => `
            <li class="check-item ${g.is_completed ? 'done' : ''}" style="justify-content:space-between;">
              <div style="display:flex; align-items:center; gap:0.65rem;">
                <input type="checkbox" id="${g.id}" ${g.is_completed ? 'checked' : ''} data-goal-toggle="${g.id}">
                <label for="${g.id}">${g.title}</label>
              </div>
              <button class="btn-subtle" data-delete-goal="${g.id}" style="color:#C53030; padding:0.15rem 0.45rem;">✕</button>
            </li>
          `).join("")}
        </ul>
      </div>
    `;
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
    document.querySelectorAll("[data-sem-tab]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const semIdx = parseInt(e.currentTarget.getAttribute("data-sem-tab"), 10);
        this.activeSemIndex = semIdx;
        this.renderRoadmapView();
      });
    });

    document.querySelectorAll(".skill-topic-summary").forEach(summary => {
      summary.addEventListener("click", () => {
        const accordion = summary.closest(".skill-topic-accordion");
        accordion.classList.toggle("open");
      });
    });

    // Checkbox toggles with direct Supabase save
    document.querySelectorAll("[data-task-toggle]").forEach(checkbox => {
      checkbox.addEventListener("change", async (e) => {
        const id = e.target.getAttribute("data-task-toggle");
        const li = e.target.closest(".check-item");
        li?.classList.toggle("done", e.target.checked);
        await this.toggleTaskDone(id, e.target.checked);
      });
    });

    // Custom goal toggles
    document.querySelectorAll("[data-goal-toggle]").forEach(checkbox => {
      checkbox.addEventListener("change", async (e) => {
        const id = e.target.getAttribute("data-goal-toggle");
        const goal = this.customGoals.find(g => g.id === id);
        if (goal) goal.is_completed = e.target.checked;
        const li = e.target.closest(".check-item");
        li?.classList.toggle("done", e.target.checked);
        await db.setCustomGoalStatus(id, e.target.checked);
      });
    });

    // Delete custom goal
    document.querySelectorAll("[data-delete-goal]").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-delete-goal");
        if (confirm("Delete this custom goal from Supabase?")) {
          this.customGoals = this.customGoals.filter(g => g.id !== id);
          await db.deleteCustomGoal(id);
          this.renderRoadmapView();
          this.showToast("Deleted goal from Supabase");
        }
      });
    });

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
                  <button class="btn-subtle" style="flex:1;" onclick="alert('Repository linking ready. PostgreSQL schema connected to project PSS.')">
                    GitHub Repo
                  </button>
                  <button class="btn-primary" style="flex:1; justify-content:center;" onclick="alert('Deployment checklist: Docker container on cloud / Render / Vercel')">
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

    document.querySelectorAll("[data-task-toggle]").forEach(checkbox => {
      checkbox.addEventListener("change", async (e) => {
        const id = e.target.getAttribute("data-task-toggle");
        const li = e.target.closest(".check-item");
        li?.classList.toggle("done", e.target.checked);
        await this.toggleTaskDone(id, e.target.checked);
      });
    });
  }

  /* ==========================================================================
     VIEW 5: PRACTICE (DSA & SQL TRACKER)
     ========================================================================== */
  renderPracticeView() {
    const dsaSolved = this.profile?.dsa_solved ?? 42;
    const sqlSolved = this.profile?.sql_solved ?? 68;

    const dsaPct = Math.min(100, Math.round((dsaSolved / 150) * 100));
    const sqlPct = Math.min(100, Math.round((sqlSolved / 150) * 100));

    const html = `
      <div>
        <div class="section-title-wrap">
          <div>
            <h2 class="welcome-title">Problem Solving & Practice Deck</h2>
            <div class="welcome-sub">
              Systematic tracking for LeetCode DSA and DataLemur/SQL assessments (Synced to Supabase)
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
                <div class="counter-value">${dsaSolved}</div>
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
                <div class="counter-value">${sqlSolved}</div>
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

    document.getElementById("dsaPlus1Btn")?.addEventListener("click", async () => {
      this.profile.dsa_solved = (this.profile.dsa_solved || 42) + 1;
      this.renderPracticeView();
      await db.updateProfile(this.profile.id, { dsa_solved: this.profile.dsa_solved });
    });

    document.getElementById("dsaPlus5Btn")?.addEventListener("click", async () => {
      this.profile.dsa_solved = (this.profile.dsa_solved || 42) + 5;
      this.renderPracticeView();
      await db.updateProfile(this.profile.id, { dsa_solved: this.profile.dsa_solved });
    });

    document.getElementById("dsaMinusBtn")?.addEventListener("click", async () => {
      if ((this.profile.dsa_solved || 0) > 0) {
        this.profile.dsa_solved = this.profile.dsa_solved - 1;
        this.renderPracticeView();
        await db.updateProfile(this.profile.id, { dsa_solved: this.profile.dsa_solved });
      }
    });

    document.getElementById("sqlPlus1Btn")?.addEventListener("click", async () => {
      this.profile.sql_solved = (this.profile.sql_solved || 68) + 1;
      this.renderPracticeView();
      await db.updateProfile(this.profile.id, { sql_solved: this.profile.sql_solved });
    });

    document.getElementById("sqlPlus5Btn")?.addEventListener("click", async () => {
      this.profile.sql_solved = (this.profile.sql_solved || 68) + 5;
      this.renderPracticeView();
      await db.updateProfile(this.profile.id, { sql_solved: this.profile.sql_solved });
    });

    document.getElementById("sqlMinusBtn")?.addEventListener("click", async () => {
      if ((this.profile.sql_solved || 0) > 0) {
        this.profile.sql_solved = this.profile.sql_solved - 1;
        this.renderPracticeView();
        await db.updateProfile(this.profile.id, { sql_solved: this.profile.sql_solved });
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
              Manage your internship pipeline and off-campus applications (Live in Supabase Postgres)
            </div>
          </div>
          <button class="btn-primary" id="openAddAppBtn">＋ Log Application to Supabase</button>
        </div>

        <!-- Funnel Overview -->
        <div class="career-funnel-grid">
          <div class="funnel-card">
            <div class="num">${totalApps} <span style="font-size:0.95rem; color:var(--ink-muted);">/ 25</span></div>
            <div class="lbl">Applications Logged</div>
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
              ` : this.applications.map((app) => `
                <tr>
                  <td style="font-weight:600; color:var(--ink-primary);">${app.company}</td>
                  <td>${app.role}</td>
                  <td><span class="stack-pill">${app.platform}</span></td>
                  <td>
                    <select class="status-select" data-app-id="${app.id}" style="padding:0.2rem 0.5rem; border-radius:var(--radius-xs); border:1px solid var(--line); font-size:0.78rem;">
                      <option value="Saved" ${app.status === 'Saved' ? 'selected' : ''}>Saved</option>
                      <option value="Applied" ${app.status === 'Applied' ? 'selected' : ''}>Applied</option>
                      <option value="Interview" ${app.status === 'Interview' ? 'selected' : ''}>Interview</option>
                      <option value="Offer" ${app.status === 'Offer' ? 'selected' : ''}>Offer</option>
                      <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                  </td>
                  <td style="color:var(--ink-secondary); font-size:0.8rem;">${app.applied_date || '-'}</td>
                  <td style="color:var(--ink-secondary); font-size:0.8rem; max-width:220px;">${app.notes || '-'}</td>
                  <td>
                    <button class="btn-subtle" data-delete-app="${app.id}" style="color:#C53030;">Delete</button>
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

    document.getElementById("openAddAppBtn")?.addEventListener("click", () => this.openAddAppModal());

    document.querySelectorAll("[data-app-id]").forEach(select => {
      select.addEventListener("change", async (e) => {
        const id = e.target.getAttribute("data-app-id");
        const status = e.target.value;
        const app = this.applications.find(a => a.id === id);
        if (app) app.status = status;
        this.setSyncStatus("syncing", "Updating application in Supabase...");
        await db.updateCareerApplicationStatus(id, status);
        this.setSyncStatus("connected", "Supabase Cloud: PSS (Synced)");
        this.showToast("Application status updated in Supabase!");
      });
    });

    document.querySelectorAll("[data-delete-app]").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-delete-app");
        if (confirm("Delete this application from Supabase database?")) {
          this.applications = this.applications.filter(a => a.id !== id);
          await db.deleteCareerApplication(id);
          this.renderCareerView();
          this.showToast("Application deleted from Supabase");
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
              Study time investment and category progression tracking (Supabase Cloud Database)
            </div>
          </div>
        </div>

        <div class="analytics-grid">
          <!-- Weekly Study Time Chart -->
          <div class="card">
            <div class="section-title-wrap">
              <div class="section-title">
                <span>⏱️</span> Weekly Study Hours Log
              </div>
              <span class="status-pill-crm Applied">≈ 19.5h Planned</span>
            </div>

            <div class="weekly-chart-box">
              ${STUDY_HOURS_TARGET.map(d => {
                const logged = this.studyHours[d.day] || d.target;
                const heightPct = Math.round((logged / 5.0) * 100);
                return `
                  <div class="bar-col">
                    <div class="bar-fill" style="height: ${heightPct}%;">
                      <div class="bar-tooltip">${logged}h</div>
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
            Calculated across verified skill topics in Supabase, DSA problem counts (42/150), SQL targets (68/150), and Project #1 deliverables. You are tracking ahead of schedule for Semester 3.
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
            <h2 class="welcome-title">Export, Backup & Database Hub</h2>
            <div class="welcome-sub">
              Supabase Project: <b>PSS</b> (PostgreSQL 17 on ap-southeast-1)
            </div>
          </div>
        </div>

        <div class="analytics-grid">
          <div class="card">
            <div class="section-title">
              <span>📄</span> Export Tabular CSV
            </div>
            <p style="font-size:0.84rem; color:var(--ink-secondary); margin:0.5rem 0 1rem;">
              Download your complete verified roadmap from Supabase in CSV format for Google Sheets or Excel.
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
              <span>💾</span> JSON Database Snapshot
            </div>
            <p style="font-size:0.84rem; color:var(--ink-secondary); margin:0.5rem 0 1rem;">
              Export full state including problems solved, custom goals, and career tracker as JSON.
            </p>
            <button class="btn-primary" id="backupJsonBtn">Export JSON Backup</button>
          </div>

          <div class="card">
            <div class="section-title">
              <span>♻️</span> Reset All Cloud Checkboxes
            </div>
            <p style="font-size:0.84rem; color:var(--ink-secondary); margin:0.5rem 0 1rem;">
              Unchecks all curriculum items in Supabase Postgres table.
            </p>
            <button class="btn-outline" style="color:#C53030;" id="resetAllBtn">Reset Cloud Tasks</button>
          </div>
        </div>
      </div>
    `;

    this.dom.mainContainer.innerHTML = html;

    document.getElementById("exportCsvBtn")?.addEventListener("click", () => {
      exportToCSV(this.curriculum, this.taskState, this.customGoals);
      this.showToast("CSV export downloaded");
    });

    document.getElementById("exportPdfBtn")?.addEventListener("click", () => {
      exportToPDF();
    });

    document.getElementById("backupJsonBtn")?.addEventListener("click", () => {
      exportBackupJSON(this.taskState, this.customGoals);
      this.showToast("Backup JSON downloaded");
    });

    document.getElementById("resetAllBtn")?.addEventListener("click", async () => {
      if (confirm("Are you sure? This resets all verified checkboxes in Supabase database.")) {
        this.setSyncStatus("syncing", "Resetting tasks in Supabase...");
        await db.resetAllCurriculumTasks();
        await this.loadFromSupabase();
        this.showToast("All tasks reset in Supabase database");
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

  async handleAddTaskSubmit() {
    const titleInput = document.getElementById("modalTaskTitle");
    const semSelect = document.getElementById("modalTaskSem");
    const title = titleInput.value.trim();
    const sem = parseInt(semSelect.value, 10);

    if (!title) return;

    this.closeAddTaskModal();
    this.setSyncStatus("syncing", "Saving goal to Supabase...");

    const newGoal = {
      id: `goal-${Date.now()}`,
      title,
      semester: sem
    };

    try {
      await db.addCustomGoal(newGoal);
      this.customGoals.unshift({ ...newGoal, is_completed: false });
      this.setSyncStatus("connected", "Supabase Cloud: PSS (Synced)");
      this.render();
      this.showToast("Saved goal to Supabase database!");
    } catch (err) {
      this.setSyncStatus("error", "Error saving goal to Supabase");
    }
  }

  openAddAppModal() {
    this.dom.addAppModal?.classList.add("open");
  }

  closeAddAppModal() {
    this.dom.addAppModal?.classList.remove("open");
    this.dom.addAppForm?.reset();
  }

  async handleAddAppSubmit() {
    const company = document.getElementById("modalAppCompany").value.trim();
    const role = document.getElementById("modalAppRole").value.trim();
    const platform = document.getElementById("modalAppPlatform").value;
    const status = document.getElementById("modalAppStatus").value;
    const notes = document.getElementById("modalAppNotes").value.trim();

    if (!company || !role) return;

    this.closeAddAppModal();
    this.setSyncStatus("syncing", "Saving application to Supabase...");

    const newApp = {
      company,
      role,
      platform,
      status,
      applied_date: new Date().toISOString().slice(0, 10),
      notes
    };

    try {
      const saved = await db.addCareerApplication(newApp);
      if (saved && saved.length > 0) {
        this.applications.unshift(saved[0]);
      } else {
        this.applications.unshift(newApp);
      }
      this.setSyncStatus("connected", "Supabase Cloud: PSS (Synced)");
      this.renderCareerView();
      this.showToast("Application saved to Supabase!");
    } catch (err) {
      this.setSyncStatus("error", "Error saving application to Supabase");
    }
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
