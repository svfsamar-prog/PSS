/**
 * Supabase Cloud Client & Database Service for Placement OS
 * Connects directly to Supabase Project: PSS (sesshjrjyscnnjufypdf)
 * Zero LocalStorage dependency - Supabase PostgreSQL is the Single Source of Truth
 */

export const SUPABASE_CONFIG = {
  url: "https://sesshjrjyscnnjufypdf.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlc3NoanJqeXNjbm5qdWZ5cGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMjI3NjMsImV4cCI6MjEwNTg5ODc2M30.KDI0q4mSTTBjQZZ6JsoIRZOGVzXoN827bPUk35TKklQ",
  projectId: "sesshjrjyscnnjufypdf"
};

class SupabaseService {
  constructor() {
    this.url = SUPABASE_CONFIG.url;
    this.key = SUPABASE_CONFIG.anonKey;
    this.headers = {
      "apikey": this.key,
      "Authorization": `Bearer ${this.key}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    };
    this.getSession(); // Initialize session if active
  }

  /* ==========================================
     Authentication
     ========================================== */
  async signIn(email, password) {
    const authUrl = `${this.url}/auth/v1/token?grant_type=password`;
    const res = await fetch(authUrl, {
      method: "POST",
      headers: {
        "apikey": this.key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error_description || data.msg || data.message || "Invalid email or password");
    }

    if (data.access_token) {
      sessionStorage.setItem("placement_auth_session", JSON.stringify(data));
      this.headers["Authorization"] = `Bearer ${data.access_token}`;
    }
    return data;
  }

  signOut() {
    sessionStorage.removeItem("placement_auth_session");
    this.headers["Authorization"] = `Bearer ${this.key}`;
  }

  getSession() {
    try {
      const saved = sessionStorage.getItem("placement_auth_session");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && parsed.access_token) {
        this.headers["Authorization"] = `Bearer ${parsed.access_token}`;
        return parsed;
      }
    } catch (e) {}
    return null;
  }

  getUser() {
    const session = this.getSession();
    return session?.user || null;
  }


  async request(endpoint, options = {}) {
    const fullUrl = `${this.url}/rest/v1/${endpoint}`;
    const fetchOptions = {
      ...options,
      headers: {
        ...this.headers,
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(fullUrl, fetchOptions);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Supabase API error (${endpoint}):`, errorText);
        throw new Error(`Supabase error ${response.status}: ${errorText}`);
      }
      // For DELETE or 204 No Content
      if (response.status === 204) return null;
      return await response.json();
    } catch (err) {
      console.error("Supabase network request failed:", err);
      throw err;
    }
  }

  /* ==========================================
     Profile & Metrics
     ========================================== */
  async getProfile() {
    const data = await this.request("placement_profile?select=*&limit=1");
    return data && data.length > 0 ? data[0] : null;
  }

  async updateProfile(id, fields) {
    const data = await this.request(`placement_profile?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({ ...fields, updated_at: new Date().toISOString() })
    });
    return data && data.length > 0 ? data[0] : null;
  }

  /* ==========================================
     Curriculum Tasks
     ========================================== */
  async getCurriculumTasks() {
    return await this.request("curriculum_tasks?select=*&order=id.asc");
  }

  async setTaskStatus(id, isCompleted) {
    const body = {
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };
    const data = await this.request(`curriculum_tasks?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
    return data && data.length > 0 ? data[0] : null;
  }

  async resetAllCurriculumTasks() {
    return await this.request("curriculum_tasks", {
      method: "PATCH",
      body: JSON.stringify({
        is_completed: false,
        completed_at: null,
        updated_at: new Date().toISOString()
      })
    });
  }

  /* ==========================================
     Custom Goals
     ========================================== */
  async getCustomGoals() {
    return await this.request("custom_goals?select=*&order=created_at.desc");
  }

  async addCustomGoal(goal) {
    const body = {
      id: goal.id || `custom-${Date.now()}`,
      semester: goal.semester,
      title: goal.title,
      is_completed: false
    };
    const data = await this.request("custom_goals", {
      method: "POST",
      body: JSON.stringify(body)
    });
    return data && data.length > 0 ? data[0] : null;
  }

  async setCustomGoalStatus(id, isCompleted) {
    return await this.request(`custom_goals?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      })
    });
  }

  async deleteCustomGoal(id) {
    return await this.request(`custom_goals?id=eq.${id}`, {
      method: "DELETE"
    });
  }

  /* ==========================================
     Career Applications CRM
     ========================================== */
  async getCareerApplications() {
    return await this.request("career_applications?select=*&order=applied_date.desc,created_at.desc");
  }

  async addCareerApplication(app) {
    const body = {
      company: app.company,
      role: app.role,
      platform: app.platform || "LinkedIn",
      status: app.status || "Applied",
      applied_date: app.applied_date || new Date().toISOString().slice(0, 10),
      notes: app.notes || ""
    };
    const data = await this.request("career_applications", {
      method: "POST",
      body: JSON.stringify(body)
    });
    return data && data.length > 0 ? data[0] : null;
  }

  async updateCareerApplicationStatus(id, status) {
    return await this.request(`career_applications?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
        updated_at: new Date().toISOString()
      })
    });
  }

  async deleteCareerApplication(id) {
    return await this.request(`career_applications?id=eq.${id}`, {
      method: "DELETE"
    });
  }

  /* ==========================================
     Daily Focus Tasks
     ========================================== */
  async getDailyFocusTasks() {
    return await this.request("daily_focus_tasks?select=*&order=created_at.asc");
  }

  async setDailyFocusTaskStatus(id, isCompleted) {
    return await this.request(`daily_focus_tasks?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_completed: isCompleted })
    });
  }

  async addDailyFocusTask(task) {
    const body = {
      id: task.id || `focus-${Date.now()}`,
      task_tag: task.tag || "Custom",
      task_text: task.text,
      is_completed: false,
      is_custom: true
    };
    const data = await this.request("daily_focus_tasks", {
      method: "POST",
      body: JSON.stringify(body)
    });
    return data && data.length > 0 ? data[0] : null;
  }

  async resetDailyFocusTasks() {
    // Delete custom tasks and uncheck existing
    await this.request("daily_focus_tasks?is_custom=eq.true", { method: "DELETE" });
    return await this.request("daily_focus_tasks", {
      method: "PATCH",
      body: JSON.stringify({ is_completed: false })
    });
  }

  /* ==========================================
     Study Hours Log
     ========================================== */
  async getStudyHoursLog() {
    return await this.request("study_hours_log?select=*&order=day_code.asc");
  }

  async updateStudyHour(dayCode, loggedHours) {
    return await this.request(`study_hours_log?day_code=eq.${dayCode}`, {
      method: "PATCH",
      body: JSON.stringify({
        logged_hours: loggedHours,
        updated_at: new Date().toISOString()
      })
    });
  }
}

export const db = new SupabaseService();
