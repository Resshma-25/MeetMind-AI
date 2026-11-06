
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function MeetingHistory() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/meetings/history`
      );
      setMeetings(response.data);
      setError("");
    } catch (err) {
      console.error("Meeting history error:", err);
      setError("Unable to load meeting history.");
    } finally {
      setLoading(false);
    }
  };

  const totalTasks = meetings.reduce(
    (total, meeting) =>
      total + (meeting.action_items?.length || 0),
    0
  );

  const analyzedMeetings = meetings.filter(
    (meeting) => meeting.status === "analyzed"
  ).length;

  if (loading) {
    return <p className="history-message">Loading meeting history...</p>;
  }

  return (
    <section className="history-section">
      <div className="history-heading">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h2>Meeting Dashboard</h2>
          <p>Manage your previous meetings and AI-generated insights.</p>
        </div>

        <button className="refresh-button" onClick={fetchMeetings}>
          ↻ Refresh
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="history-stats">
        <div className="stat-card">
          <span>Total Meetings</span>
          <h2>{meetings.length}</h2>
        </div>

        <div className="stat-card">
          <span>Analyzed Meetings</span>
          <h2>{analyzedMeetings}</h2>
        </div>

        <div className="stat-card">
          <span>Total Action Items</span>
          <h2>{totalTasks}</h2>
        </div>
      </div>

      <div className="history-list">
        <h3>Recent Meetings</h3>

        {meetings.length === 0 ? (
          <p>No meetings found. Upload your first recording!</p>
        ) : (
          meetings.map((meeting) => (
            <article className="history-card" key={meeting.id}>
              <div className="history-card-top">
                <div>
                  <h3>{meeting.title}</h3>
                  <p className="meeting-filename">
                    {meeting.filename}
                  </p>
                </div>

                <span
                  className={`status-badge ${
                    meeting.status === "analyzed"
                      ? "status-analyzed"
                      : "status-pending"
                  }`}
                >
                  {meeting.status}
                </span>
              </div>

              <p className="meeting-date">
                {new Date(meeting.created_at).toLocaleString()}
              </p>

              <h4>Meeting Summary</h4>
              <p className="meeting-summary">
                {meeting.summary || "Analysis not completed yet."}
              </p>

              <div className="meeting-tasks">
                <h4>
                  Action Items ({meeting.action_items?.length || 0})
                </h4>

                {meeting.action_items?.length > 0 ? (
                  meeting.action_items.map((item, index) => (
                    <div className="history-task" key={index}>
                      <strong>{item.task}</strong>
                      <p>Owner: {item.owner}</p>
                      <p>Deadline: {item.deadline}</p>
                    </div>
                  ))
                ) : (
                  <p>No action items available.</p>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default MeetingHistory;
