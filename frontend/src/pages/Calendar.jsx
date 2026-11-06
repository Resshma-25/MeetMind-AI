
import { useEffect, useState } from "react";
import axios from "axios";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Video,
  ListChecks,
  Clock,
  CalendarCheck,
  CircleAlert,
  RefreshCw,
  User,
  CheckCircle2
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FORMAT DATE AS YYYY-MM-DD
  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // FETCH MEETINGS AND ACTION TASKS
  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError("");

      const [meetingResponse, taskResponse] = await Promise.all([
        axios.get(`${API_URL}/api/meetings/history`),
        axios.get(`${API_URL}/api/action-tasks/`)
      ]);

      setMeetings(
        Array.isArray(meetingResponse.data)
          ? meetingResponse.data
          : []
      );

      setTasks(
        Array.isArray(taskResponse.data)
          ? taskResponse.data
          : []
      );

    } catch (err) {
      console.error("Calendar loading error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load meetings and task deadlines. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  // CONVERT MEETING RECORDS INTO CALENDAR EVENTS
  const meetingEvents = meetings
    .map((meeting) => {
      if (!meeting.created_at) return null;

      const meetingDate = new Date(meeting.created_at);

      if (isNaN(meetingDate.getTime())) return null;

      return {
        id: `meeting-${meeting.id}`,
        meetingId: meeting.id,
        title: meeting.title || "Untitled Meeting",
        date: formatDate(meetingDate),

        time: meetingDate.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit"
        }),

        type: "meeting",

        description:
          meeting.summary ||
          "Meeting recording saved in MeetMind AI.",

        status: meeting.status || "Pending"
      };
    })
    .filter(Boolean);

  // CONVERT TASK DEADLINES INTO CALENDAR EVENTS
  const taskEvents = tasks
    .filter((task) => task.deadline)
    .map((task) => ({
      id: `task-${task.id}`,
      taskId: task.id,
      meetingId: task.meeting_id,

      title: task.task || "Untitled Task",

      // Keep date-only deadlines in local calendar format.
      date: String(task.deadline).slice(0, 10),

      time: "All day",
      type: "task",

      description: task.owner
        ? `Assigned to: ${task.owner}`
        : "No task owner assigned.",

      owner: task.owner || "Unassigned",
      status: task.status || "Pending"
    }));

  // COMBINE BOTH EVENT TYPES
  const events = [...meetingEvents, ...taskEvents];

  // CALENDAR DATE INFORMATION
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString("default", {
    month: "long"
  });

  // NAVIGATE CALENDAR
  const changeDate = (direction) => {
    const next = new Date(currentDate);

    if (view === "month") {
      next.setDate(1);
      next.setMonth(next.getMonth() + direction);
    } else if (view === "week") {
      next.setDate(next.getDate() + direction * 7);
    } else {
      next.setDate(next.getDate() + direction);
    }

    setCurrentDate(next);
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  // GET EVENTS FOR A PARTICULAR DATE
  const getEvents = (date) => {
    const dateString = formatDate(date);

    return events
      .filter((event) => event.date === dateString)
      .sort((a, b) => {
        if (a.type === b.type) {
          return a.title.localeCompare(b.title);
        }

        return a.type === "meeting" ? -1 : 1;
      });
  };

  // WEEK VIEW DATES
  const weekStart = new Date(currentDate);

  weekStart.setDate(
    currentDate.getDate() - currentDate.getDay()
  );

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);

    date.setDate(weekStart.getDate() + index);

    return date;
  });

  const displayedDays =
    view === "week"
      ? weekDays
      : [new Date(currentDate)];

  // EVENT STATISTICS
  const totalMeetings = meetingEvents.length;
  const totalTasks = taskEvents.length;
  const totalEvents = events.length;

  const todayString = formatDate(new Date());

  const upcomingTasks = tasks.filter(
    (task) =>
      task.deadline &&
      String(task.deadline).slice(0, 10) >= todayString &&
      task.status !== "Completed"
  ).length;

  return (
    <div className="calendar-page">

      {/* HERO SECTION */}
      <div className="calendar-hero">
        <div>
          <div className="calendar-eyebrow">
            <CalendarDays size={15} />
            MEETING SCHEDULER
          </div>

          <h1>
            Your <span>Calendar.</span>
          </h1>

          <p>
            Keep track of meetings, task deadlines and
            important activities in one place.
          </p>
        </div>

        <div className="calendar-hero-icon">
          <CalendarDays size={65} />
        </div>
      </div>

      {/* STATISTICS */}
      <div className="calendar-stats">

        <div className="calendar-stat-card">
          <Video size={23} />

          <div>
            <strong>{loading ? "..." : totalMeetings}</strong>
            <span>Total Meetings</span>
          </div>
        </div>

        <div className="calendar-stat-card">
          <ListChecks size={23} />

          <div>
            <strong>{loading ? "..." : totalTasks}</strong>
            <span>Task Deadlines</span>
          </div>
        </div>

        <div className="calendar-stat-card">
          <CalendarCheck size={23} />

          <div>
            <strong>{loading ? "..." : upcomingTasks}</strong>
            <span>Upcoming Tasks</span>
          </div>
        </div>

      </div>

      {/* LOADING AND ERROR */}
      {loading && (
        <div className="calendar-data-message">
          <RefreshCw size={18} className="settings-spinning" />
          Loading your meetings and task deadlines...
        </div>
      )}

      {error && (
        <div className="calendar-data-error">
          <CircleAlert size={20} />

          <span>{error}</span>

          <button onClick={fetchCalendarData}>
            Try Again
          </button>
        </div>
      )}

      {/* CALENDAR TOOLBAR */}
      <div className="calendar-toolbar">

        <div className="calendar-date-navigation">

          <button
            onClick={() => changeDate(-1)}
            aria-label="Previous period"
          >
            <ChevronLeft size={20} />
          </button>

          <h2>
            {monthName} {year}
          </h2>

          <button
            onClick={() => changeDate(1)}
            aria-label="Next period"
          >
            <ChevronRight size={20} />
          </button>

          <button
            className="calendar-today"
            onClick={goToday}
          >
            Today
          </button>

        </div>

        <div className="calendar-view-switch">

          {["month", "week", "day"].map((item) => (
            <button
              key={item}
              className={view === item ? "active" : ""}
              onClick={() => setView(item)}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}

        </div>

        <button
          className="action-refresh-button"
          onClick={fetchCalendarData}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "settings-spinning" : ""}
          />
          Refresh
        </button>

      </div>

      {/* MONTH VIEW */}
      {view === "month" && (

        <div className="calendar-card">

          <div className="calendar-grid">

            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div className="calendar-weekday" key={day}>
                  {day}
                </div>
              )
            )}

            {/* EMPTY DAYS BEFORE MONTH START */}
            {Array.from({ length: firstDay }).map((_, index) => (
              <div
                className="calendar-day empty"
                key={`empty-${index}`}
              />
            ))}

            {/* MONTH DATES */}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;

              const date = new Date(year, month, day);

              const dateString = formatDate(date);

              const dayEvents = getEvents(date);

              const isToday = dateString === todayString;

              return (
                <div
                  key={day}
                  className={`calendar-day ${
                    isToday ? "today" : ""
                  }`}
                  onClick={() => {
                    setCurrentDate(date);
                    setView("day");
                  }}
                >

                  <span className="calendar-day-number">
                    {day}
                  </span>

                  <div className="calendar-day-events">

                    {dayEvents.map((event) => (
                      <button
                        key={event.id}
                        className={`calendar-event ${event.type}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                      >

                        {event.type === "meeting" ? (
                          <Video size={12} />
                        ) : (
                          <ListChecks size={12} />
                        )}

                        <span>{event.title}</span>

                      </button>
                    ))}

                  </div>

                </div>
              );
            })}

          </div>

        </div>
      )}

      {/* WEEK AND DAY VIEW */}
      {(view === "week" || view === "day") && (

        <div className="calendar-card calendar-list-view">

          {displayedDays.map((date) => {
            const dayEvents = getEvents(date);

            return (
              <div
                className="calendar-agenda-day"
                key={formatDate(date)}
              >

                <div className="calendar-agenda-date">

                  <span>
                    {date.toLocaleDateString("default", {
                      weekday: "long"
                    })}
                  </span>

                  <strong>
                    {date.toLocaleDateString("default", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </strong>

                </div>

                {dayEvents.length === 0 ? (

                  <p className="calendar-empty-message">
                    No scheduled events for this day.
                  </p>

                ) : (

                  dayEvents.map((event) => (
                    <button
                      key={event.id}
                      className={`calendar-agenda-event ${event.type}`}
                      onClick={() => setSelectedEvent(event)}
                    >

                      {event.type === "meeting" ? (
                        <Video size={19} />
                      ) : (
                        <ListChecks size={19} />
                      )}

                      <div>
                        <strong>{event.title}</strong>

                        <span>
                          <Clock size={13} />
                          {event.time}
                        </span>
                      </div>

                      <ChevronRight size={18} />

                    </button>
                  ))

                )}

              </div>
            );
          })}

        </div>
      )}

      {/* LEGEND */}
      <div className="calendar-legend">

        <span>
          <i className="meeting-dot" />
          Meetings
        </span>

        <span>
          <i className="task-dot" />
          Task Deadlines
        </span>

        <span>
          <i className="today-dot" />
          Today
        </span>

      </div>

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (

        <div
          className="calendar-modal-overlay"
          onClick={() => setSelectedEvent(null)}
        >

          <div
            className="calendar-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="calendar-modal-close"
              onClick={() => setSelectedEvent(null)}
            >
              ×
            </button>

            <div className="calendar-modal-icon">

              {selectedEvent.type === "meeting" ? (
                <Video size={26} />
              ) : (
                <ListChecks size={26} />
              )}

            </div>

            <h2>{selectedEvent.title}</h2>

            <p>{selectedEvent.description}</p>

            <div className="calendar-modal-detail">
              <CalendarDays size={17} />
              {selectedEvent.date}
            </div>

            <div className="calendar-modal-detail">
              <Clock size={17} />
              {selectedEvent.time}
            </div>

            <div className="calendar-modal-detail">
              {selectedEvent.status === "Completed" ? (
                <CheckCircle2 size={17} />
              ) : (
                <CircleAlert size={17} />
              )}

              Status: {selectedEvent.status}
            </div>

            {selectedEvent.owner && (
              <div className="calendar-modal-detail">
                <User size={17} />
                Owner: {selectedEvent.owner}
              </div>
            )}

            {selectedEvent.meetingId && (
              <div className="calendar-modal-detail">
                <Video size={17} />
                Meeting ID: #{selectedEvent.meetingId}
              </div>
            )}

            <span
              className={`calendar-modal-type ${selectedEvent.type}`}
            >
              {selectedEvent.type === "meeting"
                ? "Meeting"
                : "Task Deadline"}
            </span>

          </div>

        </div>
      )}

    </div>
  );
}

export default Calendar;
