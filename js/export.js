/**
 * Export and Backup Module
 * Supports CSV export, Print/PDF export, and JSON Backup & Restore
 */

/**
 * Escapes fields for standard CSV formatting (RFC 4180)
 */
function escapeCsv(field) {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exports all curriculum tasks, custom tasks, and completion statuses to CSV
 */
export function exportToCSV(curriculum, state, customTasks = []) {
  const rows = [
    ["Semester", "Section", "Category", "Task", "Status", "Completed Date"]
  ];

  curriculum.forEach((semData, si) => {
    semData.sections.forEach((sec, ci) => {
      sec.items.forEach((itemText, ii) => {
        const id = `s${si}-${ci}-${ii}`;
        const itemState = state[id];
        const isDone = !!(typeof itemState === "object" ? itemState.done : itemState);
        const completedAt = (typeof itemState === "object" && itemState.at) ? itemState.at : (isDone ? "Yes" : "");

        rows.push([
          `Sem ${semData.sem}`,
          sec.label,
          sec.category || "General",
          itemText,
          isDone ? "Completed" : "Pending",
          completedAt
        ]);
      });
    });
  });

  // Include custom tasks
  if (Array.isArray(customTasks)) {
    customTasks.forEach(task => {
      const isDone = !!(task.is_completed !== undefined ? task.is_completed : task.done);
      rows.push([
        `Sem ${task.semester || task.sem}`,
        "Custom Goals",
        "Custom",
        task.title,
        isDone ? "Completed" : "Pending",
        task.completed_at || task.at || (isDone ? "Yes" : "")
      ]);
    });
  }

  const csvContent = "\uFEFF" + rows.map(r => r.map(escapeCsv).join(",")).join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `Placement_Dashboard_Export_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Prepares print view and opens the native browser print / Save-to-PDF dialog
 */
export function exportToPDF() {
  window.print();
}

/**
 * Exports complete state and custom tasks as JSON for safe offline backup
 */
export function exportBackupJSON(state, customTasks = []) {
  const backup = {
    version: 2,
    exportedAt: new Date().toISOString(),
    profile: "Samar · BCA Data Science",
    state,
    customTasks
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `Placement_Dashboard_Backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports backup JSON file and restores state
 */
export function importBackupJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data || typeof data !== "object") {
          throw new Error("Invalid backup format");
        }
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
