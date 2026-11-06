
import { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";

import {
  History,
  Search,
  RefreshCw,
  CalendarDays,
  FileText,
  ListChecks,
  BrainCircuit,
  Target,
  CheckCircle2,
  LoaderCircle,
  Download,
  Send,
  ArrowRight,
  FileCheck2,
  X
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");
function MeetingHistory() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const [clientEmail, setClientEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  // FETCH ALL MEETINGS
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/meetings/history`
      );

      setMeetings(response.data);
    } catch (err) {
      console.error("Meeting history error:", err);
      setError("Unable to load meeting history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // FETCH COMPLETE MEETING DETAILS
  const openMeetingDetails = async (meetingId) => {
    try {
      setSelectedMeeting(null);
      setDetailsError("");
      setEmailMessage("");
      setEmailError("");
      setClientEmail("");
      setDetailsLoading(true);

      const response = await axios.get(
        `${API_URL}/api/meetings/${meetingId}`
      );

      setSelectedMeeting(response.data);
    } catch (err) {
      console.error("Meeting details error:", err);

      setDetailsError(
        "Unable to load complete meeting details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // FORMAT DATE
  const formatDate = (date) => {
    return date
      ? new Date(date).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "Date unavailable";
  };

  // SEARCH MEETINGS
  const filteredMeetings = meetings.filter((meeting) =>
    `${meeting.title || ""} ${meeting.filename || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // GENERATE PROFESSIONAL PDF REPORT
  // returnBlob=true returns PDF for email attachment.
  const downloadMeetingPDF = async (
    meeting,
    returnBlob = false
  ) => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 18;
      const contentWidth = pageWidth - margin * 2;

      const navy = [18, 43, 58];
      const blue = [39, 91, 155];
      const teal = [83, 205, 167];
      const dark = [48, 58, 69];
      const muted = [110, 121, 132];
      const light = [235, 241, 246];

      let y = 22;

      // LOAD LOGO
      const loadLogo = () =>
        new Promise((resolve) => {
          const image = new Image();
          image.src = "/meetmind-logo.png";

          image.onload = () => resolve(image);
          image.onerror = () => resolve(null);
        });

      const logo = await loadLogo();

      const title = meeting.title || "Meeting Report";
      const meetingDate = formatDate(meeting.created_at);
      const safeTitle = title.replace(/[^a-z0-9_-]/gi, "_");

      // FOOTER ON EVERY PAGE
      const addFooter = () => {
        const totalPages = pdf.internal.getNumberOfPages();

        for (let page = 1; page <= totalPages; page++) {
          pdf.setPage(page);

          pdf.setDrawColor(220, 227, 233);
          pdf.setLineWidth(0.3);

          pdf.line(
            margin,
            pageHeight - 16,
            pageWidth - margin,
            pageHeight - 16
          );

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(...muted);

          pdf.text(
            "MeetMind AI | Intelligent Meeting Management",
            margin,
            pageHeight - 10
          );

          pdf.text(
            `Page ${page} of ${totalPages}`,
            pageWidth - margin,
            pageHeight - 10,
            { align: "right" }
          );
        }
      };

      // AUTOMATIC PAGE BREAK
      const ensureSpace = (height) => {
        if (y + height > pageHeight - 23) {
          pdf.addPage();
          y = 22;
        }
      };

      // SECTION HEADING
      const addSectionHeading = (heading) => {
        ensureSpace(18);

        pdf.setFillColor(...blue);

        pdf.roundedRect(
          margin,
          y,
          contentWidth,
          9,
          1.5,
          1.5,
          "F"
        );

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10.5);
        pdf.setTextColor(255, 255, 255);

        pdf.text(heading, margin + 4, y + 6.1);

        y += 15;
      };

      // PARAGRAPH WITH AUTOMATIC PAGE BREAKS
      const addParagraph = (value, options = {}) => {
        const text =
          String(value ?? "").trim() || "Not available.";

        const fontSize = options.fontSize || 9.5;
        const lineHeight = options.lineHeight || 4.8;

        pdf.setFont(
          "helvetica",
          options.bold ? "bold" : "normal"
        );

        pdf.setFontSize(fontSize);
        pdf.setTextColor(...(options.color || dark));

        const lines = pdf.splitTextToSize(
          text,
          contentWidth - 5
        );

        lines.forEach((line) => {
          ensureSpace(lineHeight + 1);
          pdf.text(line, margin + 2, y);
          y += lineHeight;
        });

        y += options.gap ?? 3;
      };

      // LIST SECTION
      const addListSection = (
        heading,
        values,
        formatter
      ) => {
        addSectionHeading(heading);

        if (!Array.isArray(values) || values.length === 0) {
          addParagraph("No information available.");
          y += 2;
          return;
        }

        values.forEach((item, index) => {
          const text = formatter
            ? formatter(item)
            : String(item ?? "");

          addParagraph(`${index + 1}. ${text}`);
        });

        y += 2;
      };

      // COVER HEADER AND BRANDING
      pdf.setFillColor(...navy);
      pdf.rect(0, 0, pageWidth, 53, "F");

      if (logo) {
        pdf.addImage(
          logo,
          "PNG",
          margin,
          10,
          58,
          30
        );
      } else {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(23);
        pdf.setTextColor(...teal);
        pdf.text("MeetMind AI", margin, 29);
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(19);
      pdf.setTextColor(...navy);

      pdf.text("MEETING REPORT", margin, 72);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...muted);

      pdf.text(
        "CONFIDENTIAL BUSINESS DOCUMENT",
        margin,
        79
      );

      pdf.setDrawColor(...teal);
      pdf.setLineWidth(1.2);

      pdf.line(
        margin,
        85,
        margin + 48,
        85
      );

      // MEETING DETAILS
      y = 99;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(...navy);

      const titleLines = pdf.splitTextToSize(
        title,
        contentWidth
      );

      pdf.text(titleLines, margin, y);

      y += titleLines.length * 7 + 7;

      pdf.setFillColor(...light);

      pdf.roundedRect(
        margin,
        y,
        contentWidth,
        43,
        2,
        2,
        "F"
      );

      y += 8;

      const detail = (label, value) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(...navy);

        pdf.text(label, margin + 5, y);

        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...dark);

        pdf.text(String(value), margin + 42, y);

        y += 7;
      };

      detail("Meeting date:", meetingDate);
      detail("Prepared by:", "RESSHMA VP");
      detail("Contact number:", "8925106998");
      detail("Email address:", "resshu2@gmail.com");

      y += 10;

      // REPORT CONTENT
      addSectionHeading("1. MEETING OVERVIEW");

      addParagraph(`Meeting title: ${title}`);

      addParagraph(
        `Original file: ${meeting.filename || "Not available"}`
      );

      addParagraph(`Meeting date: ${meetingDate}`);

      addParagraph(
        `Processing status: ${meeting.status || "Not available"}`
      );

      y += 2;

      addSectionHeading("2. EXECUTIVE SUMMARY");

      addParagraph(
        meeting.summary || "No AI summary available."
      );

      y += 2;

      addListSection(
        "3. KEY DISCUSSION POINTS",
        meeting.key_points
      );

      addListSection(
        "4. DECISIONS MADE",
        meeting.decisions
      );

      addListSection(
        "5. ACTION ITEMS",
        meeting.action_items,
        (item) => {
          if (typeof item === "string") {
            return item;
          }

          return [
            item?.task
              ? `Task: ${item.task}`
              : "Task: Not specified",
            `Owner: ${item?.owner || "Unassigned"}`,
            `Deadline: ${item?.deadline || "Not specified"}`
          ].join(" | ");
        }
      );

      addSectionHeading("6. FULL MEETING TRANSCRIPT");

      addParagraph(
        meeting.transcript || "No transcript available.",
        { lineHeight: 5 }
      );

      // ADD FOOTER
      addFooter();

      // RETURN PDF BLOB FOR EMAIL
      if (returnBlob) {
        return pdf.output("blob");
      }

      // DOWNLOAD PDF
      pdf.save(`${safeTitle}_MeetMind_AI_Report.pdf`);

      return true;

    } catch (err) {
      console.error("PDF generation error:", err);

      if (!returnBlob) {
        alert(
          "Unable to generate the meeting report. Please try again."
        );
      }

      throw err;
    }
  };

  // SEND PDF REPORT TO CLIENT
  const handleSendReport = async () => {
    const email = clientEmail.trim();

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setEmailError("Please enter a valid client email address.");
      setEmailMessage("");
      return;
    }

    if (!selectedMeeting) {
      setEmailError("Please select a meeting first.");
      return;
    }

    try {
      setEmailSending(true);
      setEmailError("");
      setEmailMessage("");

      // GENERATE PDF WITHOUT DOWNLOADING IT
      const pdfBlob = await downloadMeetingPDF(
        selectedMeeting,
        true
      );

      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error("The PDF could not be generated.");
      }

      // PREPARE EMAIL FORM DATA
      const formData = new FormData();

      formData.append("recipient_email", email);

      formData.append(
        "meeting_title",
        selectedMeeting.title || "Meeting Report"
      );

      formData.append(
        "pdf_file",
        pdfBlob,
        "MeetMind_AI_Meeting_Report.pdf"
      );

      // SEND TO FASTAPI BACKEND
      const response = await axios.post(
        `${API_URL}/api/email/send-report`,
        formData
      );

      setEmailMessage(
        response.data?.message ||
        "Meeting report sent successfully."
      );

    } catch (err) {
      console.error("Send report error:", err);

      setEmailError(
        err.response?.data?.detail ||
        "Unable to send the report. Check your backend email configuration."
      );
    } finally {
      setEmailSending(false);
    }
  };

  const analyzedCount = meetings.filter(
    (meeting) => meeting.status === "analyzed"
  ).length;

  const totalTasks = meetings.reduce(
    (total, meeting) =>
      total + (meeting.action_items?.length || 0),
    0
  );

  return (
    <div className="premium-history-page">

      {/* PAGE HEADER */}
      <section className="history-hero">
        <div className="history-hero-content">
          <div className="history-hero-label">
            <History size={15} />
            MEETING ARCHIVE
          </div>

          <h1>
            Every Conversation,
            <br />
            <span>One Organized Workspace.</span>
          </h1>

          <p>
            Revisit meeting discussions, explore AI insights,
            download reports and share outcomes with clients.
          </p>
        </div>

        <div className="history-hero-visual">
          <div className="history-orbit history-orbit-one" />
          <div className="history-orbit history-orbit-two" />

          <div className="history-hero-icon">
            <History size={62} />
          </div>

          <div className="history-floating-note">
            <FileCheck2 size={16} />
            Your meetings, organized
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="history-overview">
        <div className="history-section-heading">
          <div>
            <span className="new-section-label">
              YOUR WORKSPACE
            </span>

            <h2>Meeting Overview</h2>

            <p>
              A quick look at your saved meeting activity.
            </p>
          </div>

          <button
            className="premium-history-refresh"
            onClick={fetchMeetings}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={
                loading ? "history-refresh-spin" : ""
              }
            />
            Refresh
          </button>
        </div>

        <div className="premium-history-stats">

          <div className="premium-history-stat">
            <div className="history-stat-icon history-stat-blue">
              <History size={22} />
            </div>

            <span>Total Meetings</span>
            <h2>{loading ? "..." : meetings.length}</h2>
            <small>Saved recordings</small>
          </div>

          <div className="premium-history-stat">
            <div className="history-stat-icon history-stat-green">
              <BrainCircuit size={22} />
            </div>

            <span>Analyzed Meetings</span>
            <h2>{loading ? "..." : analyzedCount}</h2>
            <small>AI analysis completed</small>
          </div>

          <div className="premium-history-stat">
            <div className="history-stat-icon history-stat-orange">
              <ListChecks size={22} />
            </div>

            <span>Total Action Items</span>
            <h2>{loading ? "..." : totalTasks}</h2>
            <small>Tasks identified by AI</small>
          </div>

        </div>
      </section>

      {/* SEARCH TOOLBAR */}
      <section className="premium-history-toolbar">
        <div>
          <span className="new-section-label">
            YOUR RECORDINGS
          </span>

          <h2>All Meetings</h2>

          <p>
            Find and manage your previous meeting reports.
          </p>
        </div>

        <div className="premium-history-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search by meeting title or filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </section>

      {/* MEETING LIST */}
      <section className="premium-history-list">

        {loading ? (
          <div className="premium-history-empty">
            <LoaderCircle
              size={34}
              className="history-refresh-spin"
            />

            <h3>Loading your meetings...</h3>

            <p>
              Please wait while we retrieve your meeting history.
            </p>
          </div>
        ) : error ? (
          <div className="premium-history-empty">
            <X size={30} />

            <h3>Unable to load meetings</h3>

            <p>{error}</p>

            <button
              className="premium-history-primary"
              onClick={fetchMeetings}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="premium-history-empty">
            <div className="history-empty-icon">
              <History size={32} />
            </div>

            <h3>
              {search
                ? "No matching meetings"
                : "No meetings yet"}
            </h3>

            <p>
              {search
                ? "Try another title or filename."
                : "Your uploaded and analyzed meetings will appear here."}
            </p>

            {search && (
              <button
                className="premium-history-secondary"
                onClick={() => setSearch("")}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="premium-history-grid">
            {filteredMeetings.map((meeting, index) => (
              <article
                className="premium-history-card"
                key={meeting.id}
                style={{
                  animationDelay: `${index * 0.07}s`
                }}
              >
                <div className="premium-history-card-top">
                  <div className="history-card-file-icon">
                    <CalendarDays size={22} />
                  </div>

                  <span
                    className={`premium-history-status ${
                      meeting.status === "analyzed"
                        ? "history-completed"
                        : "history-pending"
                    }`}
                  >
                    <span />

                    {meeting.status === "analyzed"
                      ? "Analyzed"
                      : meeting.status || "Pending"}
                  </span>
                </div>

                <div className="premium-history-card-title">
                  <h3>
                    {meeting.title || "Untitled Meeting"}
                  </h3>

                  <p>
                    {meeting.filename || "Meeting recording"}
                  </p>
                </div>

                <div className="premium-history-date">
                  <CalendarDays size={15} />
                  {formatDate(meeting.created_at)}
                </div>

                <div className="premium-history-summary">
                  <span>MEETING SUMMARY</span>

                  <p>
                    {meeting.summary ||
                      "AI analysis has not been completed for this meeting yet."}
                  </p>
                </div>

                <div className="premium-history-card-bottom">
                  <div className="history-task-indicator">
                    <ListChecks size={16} />

                    {meeting.action_items?.length || 0}
                    {" "}Action Items
                  </div>

                  <button
                    className="premium-history-view"
                    onClick={() =>
                      openMeetingDetails(meeting.id)
                    }
                  >
                    View Details
                    <ArrowRight size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* DETAILS LOADING */}
      {detailsLoading && (
        <div className="premium-history-overlay">
          <div className="premium-history-loading-modal">
            <LoaderCircle
              size={34}
              className="history-refresh-spin"
            />

            <h3>Loading meeting details</h3>

            <p>
              Retrieving the complete meeting report...
            </p>
          </div>
        </div>
      )}

      {/* DETAILS ERROR */}
      {detailsError && (
        <div className="premium-history-overlay">
          <div className="premium-history-loading-modal">
            <div className="history-modal-error-icon">
              <X size={25} />
            </div>

            <h3>Something went wrong</h3>

            <p>{detailsError}</p>

            <button
              className="premium-history-primary"
              onClick={() => setDetailsError("")}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MEETING DETAILS MODAL */}
      {selectedMeeting && (
        <div
          className="premium-history-overlay"
          onClick={() => setSelectedMeeting(null)}
        >
          <div
            className="premium-meeting-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}
            <div className="premium-modal-header">
              <div className="premium-modal-heading-icon">
                <BrainCircuit size={25} />
              </div>

              <div className="premium-modal-title">
                <span className="new-section-label">
                  MEETING REPORT
                </span>

                <h2>{selectedMeeting.title}</h2>

                <p>
                  {formatDate(selectedMeeting.created_at)}
                </p>
              </div>

              <button
                className="premium-modal-close"
                onClick={() => setSelectedMeeting(null)}
                aria-label="Close meeting details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="premium-modal-body">

              {/* STATUS */}
              <div className="premium-modal-status">
                <span
                  className={`premium-history-status ${
                    selectedMeeting.status === "analyzed"
                      ? "history-completed"
                      : "history-pending"
                  }`}
                >
                  <span />
                  {selectedMeeting.status || "Pending"}
                </span>

                <span className="premium-modal-id">
                  Meeting ID: {selectedMeeting.id}
                </span>
              </div>

              {/* SUMMARY */}
              <section className="premium-detail-section">
                <div className="premium-detail-heading">
                  <BrainCircuit size={19} />
                  <h3>AI Meeting Summary</h3>
                </div>

                <p>
                  {selectedMeeting.summary ||
                    "No summary available."}
                </p>
              </section>

              {/* KEY POINTS */}
              <section className="premium-detail-section">
                <div className="premium-detail-heading">
                  <Target size={19} />
                  <h3>Key Discussion Points</h3>
                </div>

                {selectedMeeting.key_points?.length > 0 ? (
                  <ul className="premium-detail-list">
                    {selectedMeeting.key_points.map(
                      (point, index) => (
                        <li key={index}>{point}</li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>No key points available.</p>
                )}
              </section>

              {/* DECISIONS */}
              <section className="premium-detail-section">
                <div className="premium-detail-heading">
                  <CheckCircle2 size={19} />
                  <h3>Decisions Made</h3>
                </div>

                {selectedMeeting.decisions?.length > 0 ? (
                  <ul className="premium-detail-list">
                    {selectedMeeting.decisions.map(
                      (decision, index) => (
                        <li key={index}>{decision}</li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>No decisions recorded.</p>
                )}
              </section>

              {/* ACTION ITEMS */}
              <section className="premium-detail-section">
                <div className="premium-detail-heading">
                  <ListChecks size={19} />
                  <h3>Action Items</h3>
                </div>

                {selectedMeeting.action_items?.length > 0 ? (
                  <div className="premium-detail-tasks">
                    {selectedMeeting.action_items.map(
                      (item, index) => (
                        <div
                          className="premium-detail-task"
                          key={index}
                        >
                          <div className="premium-detail-task-number">
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          <div>
                            <strong>
                              {typeof item === "string"
                                ? item
                                : item.task || "Untitled task"}
                            </strong>

                            {typeof item !== "string" && (
                              <div className="premium-detail-task-meta">
                                <span>
                                  Owner: {item.owner || "Unassigned"}
                                </span>

                                <span>
                                  Deadline: {item.deadline || "Not specified"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p>No action items available.</p>
                )}
              </section>

              {/* PDF DOWNLOAD */}
              <section className="premium-report-action">
                <div className="premium-report-action-icon">
                  <Download size={22} />
                </div>

                <div className="premium-report-action-text">
                  <strong>Download Meeting Report</strong>
                  <span>
                    Generate a professional PDF report.
                  </span>
                </div>

                <button
                  className="premium-history-primary"
                  onClick={() =>
                    downloadMeetingPDF(selectedMeeting)
                  }
                >
                  <Download size={16} />
                  Download PDF
                </button>
              </section>

              {/* SEND EMAIL */}
              <section className="premium-email-section">
                <div className="premium-detail-heading">
                  <Send size={19} />
                  <h3>Send Report to Client</h3>
                </div>

                <p className="premium-email-description">
                  Share the generated meeting report directly
                  with your client.
                </p>

                <label
                  className="premium-email-label"
                  htmlFor="client-report-email"
                >
                  Client email address
                </label>

                <input
                  id="client-report-email"
                  className="premium-email-input"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => {
                    setClientEmail(e.target.value);
                    setEmailError("");
                    setEmailMessage("");
                  }}
                  placeholder="client@example.com"
                  disabled={emailSending}
                />

                <button
                  type="button"
                  className="premium-history-primary premium-send-button"
                  onClick={handleSendReport}
                  disabled={emailSending}
                >
                  {emailSending ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="history-refresh-spin"
                      />
                      Sending Report...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Send PDF Report
                    </>
                  )}
                </button>

                {emailMessage && (
                  <p
                    className="premium-email-success"
                    role="status"
                  >
                    <CheckCircle2 size={16} />
                    {emailMessage}
                  </p>
                )}

                {emailError && (
                  <p
                    className="premium-email-error"
                    role="alert"
                  >
                    <X size={16} />
                    {emailError}
                  </p>
                )}
              </section>

              {/* FULL TRANSCRIPT */}
              <section className="premium-detail-section">
                <div className="premium-detail-heading">
                  <FileText size={19} />
                  <h3>Full Meeting Transcript</h3>
                </div>

                <div className="premium-full-transcript">
                  {selectedMeeting.transcript ||
                    "No transcript available."}
                </div>
              </section>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MeetingHistory;
