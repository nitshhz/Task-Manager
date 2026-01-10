import { useEffect, useState } from "react";

export default function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [dark, setDark] = useState(true);

  /* ---------- Load / Save ---------- */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("tasks"));
    if (stored) setTasks(stored);

    const theme = localStorage.getItem("theme");
    if (theme) setDark(theme === "dark");
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  /* ---------- Task Logic ---------- */
  const addTask = () => {
    if (!task.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: task, completed: false }]);
    setTask("");
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditingText(t.text);
  };

  const saveEdit = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, text: editingText } : t
      )
    );
    setEditingId(null);
    setEditingText("");
  };

  /* ---------- Derived State ---------- */
  const completed = tasks.filter((t) => t.completed).length;
  const active = tasks.length - completed;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "active") return !t.completed;
    return true;
  });

  /* ---------- UI ---------- */
  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
        dark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white"
          : "bg-gradient-to-br from-slate-100 to-slate-300 text-slate-900"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-2xl p-6 shadow-2xl transition-colors ${
          dark ? "bg-white/10 backdrop-blur-xl" : "bg-white"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Task Manager</h1>
          <button
            onClick={() => setDark(!dark)}
            className="text-sm px-3 py-1 rounded-full bg-blue-600 text-white"
          >
            {dark ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        <p className="text-sm opacity-80 mb-4">
          Organize your day efficiently
        </p>

        {/* Input */}
        <div className="flex gap-2 mb-4">
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a new task..."
            className={`flex-1 px-4 py-2 rounded-xl outline-none ${
              dark
                ? "bg-slate-900 border border-slate-700"
                : "bg-slate-100 border border-slate-300"
            }`}
          />
          <button
            onClick={addTask}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold"
          >
            Add
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
          <Stat label="Total" value={tasks.length} />
          <Stat label="Active" value={active} highlight="text-yellow-500" />
          <Stat label="Done" value={completed} highlight="text-green-500" />
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1 opacity-80">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-400/30 rounded-full">
            <div
              className="h-2 bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-xl text-sm transition ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : dark
                  ? "bg-black/40"
                  : "bg-slate-200"
              }`}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Task List */}
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {filteredTasks.length === 0 && (
            <p className="text-center opacity-70">No tasks to show</p>
          )}

          {filteredTasks.map((t) => (
            <li
              key={t.id}
              className={`flex items-center justify-between px-4 py-2 rounded-xl transition-all duration-300 ${
                t.completed
                  ? "bg-green-500/20 line-through opacity-70"
                  : dark
                  ? "bg-black/40"
                  : "bg-slate-200"
              }`}
            >
              {editingId === t.id ? (
                <input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(t.id)}
                  className="flex-1 mr-2 px-2 py-1 rounded"
                />
              ) : (
                <span
                  onClick={() => toggleTask(t.id)}
                  className="flex-1 cursor-pointer"
                >
                  {t.text}
                </span>
              )}

              <div className="flex gap-2 ml-2">
                {editingId === t.id ? (
                  <button
                    onClick={() => saveEdit(t.id)}
                    className="text-green-500"
                  >
                    ✔
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(t)}
                    className="text-blue-400"
                  >
                    ✎
                  </button>
                )}
                <button
                  onClick={() => deleteTask(t.id)}
                  className="text-red-400"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- Small Component ---------- */
function Stat({ label, value, highlight = "" }) {
  return (
    <div className="rounded-xl py-2 bg-black/30">
      <p className="text-xs opacity-70">{label}</p>
      <p className={`text-lg font-bold ${highlight}`}>{value}</p>
    </div>
  );
}
