
import { useState } from "react";
import axios from "axios";
import {
  Upload,
  FileAudio,
  FileVideo,
  Copy,
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  X,
  FileCheck2,
  Mic,
  ListChecks,
  Lightbulb,
  ShieldCheck,
  ArrowRight,
  LoaderCircle
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const MAX_FILE_SIZE = 500 * 1024 * 1024;

const SUPPORTED_FORMATS = [
  ".mp3", ".wav", ".m4a", ".ogg", ".webm", ".mp4"
];

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function NewMeeting() {
  const [file, setFile] = useState(null);
  const [consent, setConsent] = useState(false);
  const [meetingId, setMeetingId] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const resetResults = () => {
    setMeetingId(null);
    setTranscript("");
    setAnalysis(null);
    setError("");
    setMessage("");
    setUploadProgress(0);
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    const extension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (!SUPPORTED_FORMATS.includes(extension)) {
      setError(
        "Unsupported file. Select MP4, MP3, WAV, M4A, OGG or WEBM."
      );
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Recording must be smaller than 500 MB.");
      return false;
    }

    if (selectedFile.size === 0) {
      setError("The selected recording is empty.");
      return false;
    }

    return true;
  };

  const selectFile = (selectedFile) => {
    resetResults();

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!validateFile(selectedFile)) {
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    selectFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!loading && !analyzing) setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    if (loading || analyzing) return;

    const droppedFile = e.dataTransfer.files?.[0];
    selectFile(droppedFile);
  };

  const removeFile = () => {
    setFile(null);
    resetResults();
  };

  // Upload recording and generate transcript
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a meeting recording.");
      return;
    }

    if (!consent) {
      setError("Please confirm participant consent.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setTranscript("");
    setAnalysis(null);
    setMeetingId(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("consent_confirmed", "true");

    try {
      const response = await axios.post(
        `${API_URL}/api/meetings/transcribe`,
        formData,
        {
          onUploadProgress: (event) => {
            if (event.total) {
              setUploadProgress(
                Math.round((event.loaded * 100) / event.total)
              );
            }
          }
        }
      );

      setUploadProgress(100);
      setTranscript(response.data.transcript);
      setMeetingId(response.data.meeting_id);
      setMessage("Transcription completed successfully!");
    } catch (err) {
      console.error("Transcription error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to transcribe the recording."
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate AI insights
  const handleAnalyze = async () => {
    if (!meetingId || !transcript.trim()) {
      setError("Please generate a transcript first.");
      return;
    }

    setAnalyzing(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/meetings/analyze`,
        {
          meeting_id: meetingId,
          transcript: transcript
        }
      );

      setAnalysis(response.data.analysis);
      setMessage("AI meeting analysis completed and saved!");
    } catch (err) {
      console.error("Analysis error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to analyze the meeting."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // Copy transcript
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setMessage("Transcript copied successfully!");
    } catch {
      setError("Unable to copy transcript.");
    }
  };

  const extension = file?.name
    .substring(file.name.lastIndexOf("."))
    .toLowerCase();

  const isVideo = [".mp4", ".webm"].includes(extension);

  return (
    <div className="new-meeting-page">

      {/* PAGE INTRO */}
      <section className="new-meeting-hero">
        <div className="new-meeting-hero-content">
          <div className="new-meeting-eyebrow">
            <Sparkles size={14} />
            MEETING INTELLIGENCE
          </div>

          <h1>
            Make Every
            <br />
            Conversation <span>Count.</span>
          </h1>

          <p>
            Upload your meeting recording. Let MeetMind AI
            discover key discussions, decisions and tasks
            automatically.
          </p>

          <div className="new-meeting-benefits">
            <span><CheckCircle2 size={15} /> AI Transcription</span>
            <span><CheckCircle2 size={15} /> Smart Insights</span>
            <span><CheckCircle2 size={15} /> Action Tracking</span>
          </div>
        </div>

        <div className="new-meeting-hero-art">
          <div className="meeting-art-ring ring-one" />
          <div className="meeting-art-ring ring-two" />
          <div className="meeting-art-icon">
            <BrainCircuit size={66} strokeWidth={1.4} />
            <Sparkles size={21} className="meeting-art-sparkle" />
          </div>
          <div className="meeting-art-caption">
            <ActivityIcon />
            AI powered intelligence
          </div>
        </div>
      </section>

      {/* WORKFLOW STEPS */}
      <div className="meeting-workflow">
        <div className="workflow-step active">
          <span>01</span>
          <div>
            <strong>Upload</strong>
            <small>Add your recording</small>
          </div>
        </div>

        <div className="workflow-line" />

        <div className={`workflow-step ${transcript ? "active" : ""}`}>
          <span>02</span>
          <div>
            <strong>Transcribe</strong>
            <small>Convert speech to text</small>
          </div>
        </div>

        <div className="workflow-line" />

        <div className={`workflow-step ${analysis ? "active" : ""}`}>
          <span>03</span>
          <div>
            <strong>AI Insights</strong>
            <small>Extract meeting outcomes</small>
          </div>
        </div>
      </div>

      {/* UPLOAD SECTION */}
      <section className="meeting-upload-panel">
        <div className="meeting-panel-heading">
          <div>
            <span className="new-section-label">START HERE</span>
            <h2>Upload Meeting Recording</h2>
            <p>Choose an audio or video file from your device.</p>
          </div>

          <div className="upload-heading-icon">
            <Upload size={21} />
          </div>
        </div>

        <div
          className={`premium-dropzone ${dragActive ? "drag-active" : ""} ${
            file ? "has-file" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {file ? (
            <>
              <div className="dropzone-file-icon">
                {isVideo ? (
                  <FileVideo size={34} />
                ) : (
                  <FileAudio size={34} />
                )}
              </div>

              <h3>Recording selected!</h3>
              <p className="dropzone-description">
                Your file is ready for AI transcription.
              </p>

              <div className="premium-selected-file">
                <div className="selected-file-icon">
                  {isVideo ? (
                    <FileVideo size={22} />
                  ) : (
                    <FileAudio size={22} />
                  )}
                </div>

                <div className="selected-file-text">
                  <strong>{file.name}</strong>
                  <span>
                    {formatFileSize(file.size)} · {extension.replace(".", "").toUpperCase()}
                  </span>
                </div>

                <button
                  className="remove-file-button"
                  onClick={removeFile}
                  disabled={loading || analyzing}
                  aria-label="Remove selected file"
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>

              <label className="change-file-button">
                Choose a different file
                <input
                  type="file"
                  accept=".mp3,.wav,.m4a,.ogg,.webm,.mp4"
                  onChange={handleFileChange}
                  disabled={loading || analyzing}
                />
              </label>
            </>
          ) : (
            <>
              <div className="dropzone-icon-wrap">
                <div className="dropzone-icon-circle">
                  <Upload size={34} />
                </div>
                <span className="dropzone-icon-sparkle">
                  <Sparkles size={17} />
                </span>
              </div>

              <h3>
                {dragActive
                  ? "Drop your recording here"
                  : "Drag and drop your recording"}
              </h3>

              <p className="dropzone-description">
                Or browse files from your computer
              </p>

              <label className="browse-files-button">
                <Upload size={17} />
                Browse Files
                <input
                  type="file"
                  accept=".mp3,.wav,.m4a,.ogg,.webm,.mp4"
                  onChange={handleFileChange}
                  disabled={loading || analyzing}
                />
              </label>

              <div className="supported-file-types">
                <span>MP4</span>
                <span>MP3</span>
                <span>WAV</span>
                <span>M4A</span>
                <span>OGG</span>
                <span>WEBM</span>
              </div>
            </>
          )}
        </div>

        <div className="upload-file-note">
          <div>
            <ShieldCheck size={18} />
            <span>Secure recording upload</span>
          </div>
          <span>Maximum file size: 500 MB</span>
        </div>

        {/* CONSENT */}
        <label className={`premium-consent ${consent ? "consent-checked" : ""}`}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            disabled={loading || analyzing}
          />

          <span className="consent-custom-check">
            {consent && <CheckCircle2 size={17} />}
          </span>

          <span className="consent-text">
            <strong>Participant consent confirmation</strong>
            <small>
              I confirm that participants have been informed
              and the required consent has been obtained before
              uploading this recording.
            </small>
          </span>
          <ShieldCheck size={23} className="consent-shield" />
        </label>

        {/* UPLOAD BUTTON */}
        <button
          className="start-transcription-button"
          onClick={handleUpload}
          disabled={loading || analyzing || !file || !consent}
        >
          {loading ? (
            <>
              <LoaderCircle size={19} className="button-spinner" />
              Processing Recording...
            </>
          ) : (
            <>
              <BrainCircuit size={19} />
              Generate Transcript
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* PROGRESS */}
        {loading && (
          <div className="premium-upload-progress">
            <div className="progress-heading">
              <span>
                <LoaderCircle size={15} className="button-spinner" />
                Uploading and processing
              </span>
              <strong>{uploadProgress}%</strong>
            </div>

            <div className="premium-progress-track">
              <div
                className="premium-progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            <p>
              Your recording is being processed. Transcription may
              take some time depending on the recording length.
            </p>
          </div>
        )}

        {error && (
          <div className="premium-alert error-alert">
            <X size={18} />
            {error}
          </div>
        )}

        {message && (
          <div className="premium-alert success-alert">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}
      </section>

      {/* TRANSCRIPT */}
      {transcript && (
        <section className="premium-result-panel">
          <div className="premium-result-heading">
            <div className="result-title-icon">
              <FileCheck2 size={23} />
            </div>

            <div>
              <span className="new-section-label">TRANSCRIPTION COMPLETE</span>
              <h2>Meeting Transcript</h2>
              <p>Meeting ID: {meetingId}</p>
            </div>

            <button
              className="premium-copy-button"
              onClick={handleCopy}
            >
              <Copy size={16} />
              Copy Transcript
            </button>
          </div>

          <div className="premium-transcript-box">
            {transcript}
          </div>

          <div className="transcript-footer">
            <span>
              <CheckCircle2 size={15} />
              Transcript generated successfully
            </span>
            <span>{transcript.trim().split(/\s+/).filter(Boolean).length} words</span>
          </div>

          <button
            className="generate-insights-button"
            onClick={handleAnalyze}
            disabled={analyzing || loading}
          >
            {analyzing ? (
              <>
                <LoaderCircle size={19} className="button-spinner" />
                Analyzing Meeting...
              </>
            ) : (
              <>
                <Sparkles size={19} />
                Generate AI Insights
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {analyzing && (
            <div className="ai-processing-message">
              <div className="ai-processing-animation">
                <BrainCircuit size={28} />
              </div>
              <div>
                <strong>MeetMind AI is thinking...</strong>
                <p>Finding key points, decisions and action items.</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* AI ANALYSIS */}
      {analysis && (
        <section className="premium-analysis-panel">
          <div className="analysis-hero-heading">
            <div className="analysis-brain-icon">
              <BrainCircuit size={30} />
            </div>

            <div>
              <span className="new-section-label">AI ANALYSIS COMPLETE</span>
              <h2>Your Meeting Intelligence</h2>
              <p>Important outcomes extracted from your conversation.</p>
            </div>

            <div className="analysis-complete-tag">
              <CheckCircle2 size={15} />
              Completed
            </div>
          </div>

          <div className="analysis-summary-card">
            <div className="analysis-subheading">
              <Sparkles size={19} />
              <h3>Meeting Summary</h3>
            </div>
            <p>{analysis.summary || "No summary available."}</p>
          </div>

          <div className="analysis-detail-grid">
            <div className="analysis-detail-card">
              <div className="analysis-subheading">
                <Lightbulb size={19} />
                <h3>Key Discussion Points</h3>
              </div>

              {analysis.key_points?.length > 0 ? (
                <ul className="premium-analysis-list">
                  {analysis.key_points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              ) : (
                <p>No key points identified.</p>
              )}
            </div>

            <div className="analysis-detail-card">
              <div className="analysis-subheading">
                <CheckCircle2 size={19} />
                <h3>Decisions Made</h3>
              </div>

              {analysis.decisions?.length > 0 ? (
                <ul className="premium-analysis-list">
                  {analysis.decisions.map((decision, index) => (
                    <li key={index}>{decision}</li>
                  ))}
                </ul>
              ) : (
                <p>No decisions identified.</p>
              )}
            </div>
          </div>

          <div className="analysis-tasks-card">
            <div className="analysis-subheading">
              <ListChecks size={20} />
              <h3>Action Items</h3>
              <span className="analysis-count">
                {analysis.action_items?.length || 0} tasks
              </span>
            </div>

            {analysis.action_items?.length > 0 ? (
              <div className="premium-task-list">
                {analysis.action_items.map((item, index) => (
                  <div className="premium-task-row" key={index}>
                    <div className="task-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="premium-task-content">
                      <strong>{item.task}</strong>
                      <div className="premium-task-meta">
                        <span>Owner: {item.owner || "Not assigned"}</span>
                        <span>Deadline: {item.deadline || "Not specified"}</span>
                      </div>
                    </div>

                    <CheckCircle2 size={19} className="task-check-icon" />
                  </div>
                ))}
              </div>
            ) : (
              <p>No action items identified.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function ActivityIcon() {
  return <Sparkles size={16} />;
}

export default NewMeeting;
