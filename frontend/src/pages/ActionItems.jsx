
import { useEffect, useState } from "react";
import axios from "axios";
import {
  ListChecks,
  User,
  CalendarDays,
  Search,
  RefreshCw,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function ActionItems() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_URL}/api/action-tasks/`);
      setTasks(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load action items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateTask = async (id, updates) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/action-tasks/${id}`,
        updates
      );

      setTasks((previous) =>
        previous.map((task) =>
          task.id === id ? response.data : task
        )
      );
    } catch (err) {
      console.error(err);
      alert("Unable to update task.");
      fetchTasks();
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await axios.delete(`${API_URL}/api/action-tasks/${id}`);
      setTasks((previous) => previous.filter((task) => task.id !== id));
    } catch (err) {
      console.error(err);
      alert("Unable to delete task.");
    }
  };

  const today = new Date().toLocaleDateString("en-CA");

  const pending = tasks.filter((task) => task.status === "Pending").length;
  const inProgress = tasks.filter((task) => task.status === "In Progress").length;
  const completed = tasks.filter((task) => task.status === "Completed").length;

  const overdue = tasks.filter(
    (task) =>
      task.deadline &&
      task.deadline < today &&
      task.status !== "Completed"
  ).length;

  const filteredTasks = tasks.filter((task) =>
    [task.task, task.owner, task.meeting_id]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const stats = [
    {
      label: "Total Tasks",
      value: tasks.length,
      icon: ListChecks,
      color: "purple",
      note: "All assigned tasks"
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "orange",
      note: "Waiting to start"
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: ClipboardList,
      color: "blue",
      note: "Currently active"
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle,
      color: "green",
      note: "Successfully finished"
    },
    {
      label: "Overdue",
      value: overdue,
      icon: AlertCircle,
      color: "red",
      note: "Needs attention"
    }
  ];

  const getStatusClass = (status) => {
    if (status === "Completed") return "completed";
    if (status === "In Progress") return "progress";
    return "pending";
  };

  return (
    <div className="page-content premium-action-page">

      {/* HERO SECTION */}
      <section className="action-hero">
        <div className="action-hero-content">
          <div className="action-hero-label">
            <Sparkles size={15} />
            MEETING PRODUCTIVITY
          </div>

          <h1>
            Action <span>Items</span>
          </h1>

          <p>
            Turn meeting discussions into meaningful progress.
            Track responsibilities, deadlines and team execution
            in one place.
          </p>

          <div className="action-hero-bottom">
            <div className="action-live-indicator">
              <span />
              Task workspace active
            </div>
            <span className="action-hero-caption">
              Your meeting commitments, organized.
            </span>
          </div>
        </div>

        <div className="action-hero-art">
          <div className="action-hero-circle circle-one" />
          <div className="action-hero-circle circle-two" />
          <div className="action-hero-main-icon">
            <ListChecks size={58} strokeWidth={1.5} />
          </div>
          <div className="action-floating-card floating-card-one">
            <CheckCircle size={17} />
            <span>Tasks organized</span>
          </div>
          <div className="action-floating-card floating-card-two">
            <Clock size={17} />
            <span>Deadlines tracked</span>
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="action-stats-section">
        <div className="action-section-heading">
          <div>
            <span className="action-section-kicker">WORKSPACE OVERVIEW</span>
            <h2>Task Overview</h2>
          </div>

          <button
            className="action-refresh-button"
            onClick={fetchTasks}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "refresh-spinning" : ""} />
            Refresh
          </button>
        </div>

        <div className="premium-action-stats">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                className={`premium-action-stat stat-${stat.color}`}
                key={stat.label}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="action-stat-top">
                  <div className="action-stat-icon">
                    <Icon size={21} />
                  </div>
                  <ArrowUpRight size={17} className="action-stat-arrow" />
                </div>

                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
                <span>{stat.note}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* TASK MANAGEMENT */}
      <section className="premium-action-list">
        <div className="action-list-heading">
          <div>
            <span className="action-section-kicker">STAY ON TRACK</span>
            <h2>Manage Tasks</h2>
            <p>Update ownership, deadlines and task progress.</p>
          </div>

          <div className="action-task-count">
            <ListChecks size={16} />
            {filteredTasks.length} tasks
          </div>
        </div>

        <div className="premium-action-toolbar">
          <div className="premium-action-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search tasks, owners or meeting ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} title="Clear search">
                ×
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="premium-action-empty">
            <div className="action-loading-icon">
              <RefreshCw size={28} />
            </div>
            <h3>Loading your tasks</h3>
            <p>Getting your latest meeting action items...</p>
          </div>
        ) : error ? (
          <div className="premium-action-empty">
            <AlertCircle size={34} />
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button className="action-refresh-button" onClick={fetchTasks}>
              <RefreshCw size={16} /> Try again
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="premium-action-empty">
            <div className="action-empty-icon">
              <ClipboardList size={34} />
            </div>
            <h3>No action items found</h3>
            <p>
              {search
                ? "Try a different search term."
                : "Action items from analyzed meetings will appear here."}
            </p>
          </div>
        ) : (
          <div className="premium-action-grid">
            {filteredTasks.map((task, index) => {
              const isOverdue =
                task.deadline &&
                task.deadline < today &&
                task.status !== "Completed";

              return (
                <article
                  className="premium-action-card"
                  key={task.id}
                  style={{ animationDelay: `${index * 55}ms` }}
                >
                  <div className="premium-task-card-top">
                    <div className="premium-task-icon">
                      <ListChecks size={22} />
                    </div>

                    <div className="premium-task-heading">
                      <span className="premium-meeting-id">
                        MEETING #{task.meeting_id}
                      </span>
                      <h3>{task.task}</h3>
                    </div>

                    <button
                      className="premium-task-delete"
                      onClick={() => deleteTask(task.id)}
                      title="Delete task"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="premium-task-status-row">
                    <span className={`premium-task-status ${getStatusClass(task.status)}`}>
                      <span />
                      {task.status}
                    </span>

                    {isOverdue && (
                      <span className="premium-overdue-label">
                        <AlertCircle size={14} />
                        Overdue
                      </span>
                    )}
                  </div>

                  <div className="premium-task-fields">
                    <label>
                      <span><User size={15} /> ASSIGNED TO</span>
                      <input
                        type="text"
                        placeholder="Add task owner"
                        value={task.owner || ""}
                        onChange={(e) =>
                          setTasks((previous) =>
                            previous.map((item) =>
                              item.id === task.id
                                ? { ...item, owner: e.target.value }
                                : item
                            )
                          )
                        }
                        onBlur={(e) =>
                          updateTask(task.id, {
                            owner: e.target.value.trim() || null
                          })
                        }
                      />
                    </label>

                    <label>
                      <span><CalendarDays size={15} /> DEADLINE</span>
                      <input
                        type="date"
                        value={task.deadline || ""}
                        onChange={(e) =>
                          updateTask(task.id, {
                            deadline: e.target.value || null
                          })
                        }
                      />
                    </label>
                  </div>

                  <div className="premium-task-footer">
                    <span>UPDATE STATUS</span>
                    <select
                      className={`premium-task-select ${getStatusClass(task.status)}`}
                      value={task.status}
                      onChange={(e) =>
                        updateTask(task.id, { status: e.target.value })
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default ActionItems;
