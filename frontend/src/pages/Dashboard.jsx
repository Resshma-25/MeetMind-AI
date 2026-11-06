
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Mic,
  History,
  ListChecks,
  BrainCircuit,
  ArrowRight,
  RefreshCw,
  CalendarDays,
  Sparkles,
  Activity,
  Clock3,
  Zap,
  CircleCheck,
  Plus,
  TrendingUp,
  Upload,
  BarChart3
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Dashboard() {
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/meetings/history`
      );

      setMeetings(response.data);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load dashboard data. Check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const analyzed = meetings.filter(
    (meeting) => meeting.status === "analyzed"
  ).length;

  const totalTasks = meetings.reduce(
    (total, meeting) =>
      total + (meeting.action_items?.length || 0),
    0
  );

  const stats = [
    {
      title: "Total Meetings",
      value: meetings.length,
      icon: History,
      color: "blue",
      description: "All recorded meetings"
    },
    {
      title: "Analyzed Meetings",
      value: analyzed,
      icon: BrainCircuit,
      color: "green",
      description: "AI processed meetings"
    },
    {
      title: "Action Items",
      value: totalTasks,
      icon: ListChecks,
      color: "orange",
      description: "Tasks extracted by AI"
    }
  ];

  const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="dashboard-page premium-dashboard">

      {/* HERO */}
      <section className="dashboard-hero">
        <div className="hero-decoration hero-decoration-one" />
        <div className="hero-decoration hero-decoration-two" />
        <div className="hero-decoration hero-decoration-three" />

        <div className="hero-content">
          <div className="hero-label">
            <Sparkles size={15} />
            INTELLIGENT MEETING WORKSPACE
          </div>

          <h1>
            Turn Every Meeting
            <br />
            Into <span>Meaningful Action.</span>
          </h1>

          <p>
            Your conversations, transformed into insights,
            decisions and actionable outcomes with AI.
          </p>

          <div className="hero-buttons">
            <button
              className="hero-primary-button"
              onClick={() => navigate("/new-meeting")}
            >
              <Mic size={18} />
              Start New Meeting
              <ArrowRight size={17} />
            </button>

            <button
              className="hero-secondary-button"
              onClick={() => navigate("/history")}
            >
              Explore History
            </button>
          </div>

          <div className="hero-trust-line">
            <span className="hero-live-dot" />
            AI-powered meeting intelligence
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-orbit orbit-three" />

          <div className="hero-ai-circle">
            <BrainCircuit size={76} strokeWidth={1.3} />

            <div className="hero-ai-sparkle">
              <Sparkles size={19} />
            </div>
          </div>

          <div className="floating-ai-card floating-card-top">
            <CircleCheck size={17} />
            <span>AI Analysis Ready</span>
          </div>

          <div className="floating-ai-card floating-card-bottom">
            <Activity size={17} />
            <span>Smart Insights</span>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="dashboard-error">
          <span>{error}</span>
          <button onClick={fetchMeetings}>
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      {/* OVERVIEW */}
      <section className="dashboard-overview">
        <div className="premium-section-heading">
          <div>
            <span className="section-eyebrow">
              YOUR WORKSPACE
            </span>
            <h2>Workspace Overview</h2>
            <p>Track your meeting intelligence at a glance.</p>
          </div>

          <button
            className="premium-refresh"
            onClick={fetchMeetings}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "refresh-spinning" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="premium-stats">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                className={`premium-stat-card ${stat.color}`}
                key={stat.title}
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                <div className="premium-stat-top">
                  <div className="premium-stat-icon">
                    <Icon size={23} />
                  </div>

                  <span className="stat-indicator">
                    <TrendingUp size={13} />
                    Live
                  </span>
                </div>

                <h2>{loading ? "..." : stat.value}</h2>
                <h3>{stat.title}</h3>
                <p>{stat.description}</p>

                <div className="stat-card-decoration" />
              </div>
            );
          })}
        </div>
      </section>

      {/* RECENT MEETINGS */}
      <section className="premium-meetings-section">
        <div className="premium-section-heading">
          <div>
            <span className="section-eyebrow">
              YOUR ACTIVITY
            </span>
            <h2>Recent Meetings</h2>
            <p>Your latest recordings and AI analysis.</p>
          </div>

          <button
            className="premium-text-button"
            onClick={() => navigate("/history")}
          >
            View All
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="premium-meetings-card">
          {loading ? (
            <div className="premium-loading">
              <div className="premium-loader" />
              <p>Loading your meetings...</p>
            </div>
          ) : meetings.length === 0 ? (
            <div className="dashboard-empty">
              <div className="empty-icon-wrapper">
                <Mic size={30} />
              </div>

              <h3>Your workspace is waiting!</h3>

              <p>
                Upload your first meeting recording and
                let AI turn it into meaningful insights.
              </p>

              <button
                className="hero-primary-button"
                onClick={() => navigate("/new-meeting")}
              >
                <Plus size={17} />
                Create First Meeting
              </button>
            </div>
          ) : (
            meetings.slice(0, 5).map((meeting, index) => (
              <button
                type="button"
                className="premium-meeting-row"
                key={meeting.id}
                style={{ animationDelay: `${index * 0.08}s` }}
                onClick={() => navigate("/history")}
              >
                <div className="premium-meeting-icon">
                  <CalendarDays size={21} />
                </div>

                <div className="premium-meeting-info">
                  <h3>{meeting.title || "Untitled Meeting"}</h3>
                  <p>
                    {meeting.filename || "Meeting recording"}
                  </p>
                </div>

                <div className="premium-meeting-date">
                  <Clock3 size={14} />
                  {formatDate(meeting.created_at)}
                </div>

                <span
                  className={`premium-meeting-status ${
                    meeting.status === "analyzed"
                      ? "completed"
                      : "pending"
                  }`}
                >
                  {meeting.status === "analyzed"
                    ? "Analyzed"
                    : "Transcribed"}
                </span>

                <span className="premium-task-count">
                  <ListChecks size={15} />
                  {meeting.action_items?.length || 0}
                </span>

                <ArrowRight
                  size={17}
                  className="meeting-row-arrow"
                />
              </button>
            ))
          )}
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="premium-quick-section">
        <div className="premium-section-heading">
          <div>
            <span className="section-eyebrow">
              GET THINGS DONE
            </span>
            <h2>Quick Actions</h2>
            <p>Jump straight into your workspace.</p>
          </div>
        </div>

        <div className="premium-quick-grid">
          <button
            className="premium-quick-card quick-meeting"
            onClick={() => navigate("/new-meeting")}
          >
            <div className="quick-icon">
              <Mic size={25} />
            </div>

            <h3>New Meeting</h3>
            <p>Upload and analyze your next meeting.</p>

            <span>
              Get Started <ArrowRight size={16} />
            </span>
          </button>

          <button
            className="premium-quick-card quick-history"
            onClick={() => navigate("/history")}
          >
            <div className="quick-icon">
              <History size={25} />
            </div>

            <h3>Meeting History</h3>
            <p>Access your previous meeting reports.</p>

            <span>
              Explore History <ArrowRight size={16} />
            </span>
          </button>

          <button
            className="premium-quick-card quick-tasks"
            onClick={() => navigate("/action-items")}
          >
            <div className="quick-icon">
              <Zap size={25} />
            </div>

            <h3>Action Tracker</h3>
            <p>Manage owners, deadlines and task status.</p>

            <span>
              Manage Tasks <ArrowRight size={16} />
            </span>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="premium-dashboard-footer">
        <div>
          <BrainCircuit size={19} />
          <span>MeetMind AI</span>
        </div>

        <p>Intelligence behind every conversation.</p>
      </footer>

    </div>
  );
}

export default Dashboard;
