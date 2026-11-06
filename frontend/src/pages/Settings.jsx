
import { useEffect, useState } from "react";
import axios from "axios";
import {
  UserCircle,
  BrainCircuit,
  Server,
  ShieldCheck,
  RefreshCw,
  Info,
  Database,
  Mic,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Cpu,
  FileAudio,
  LockKeyhole,
  Activity,
  ArrowUpRight,
  ListChecks
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Settings() {
  const [backendStatus, setBackendStatus] = useState("checking");
  const [checking, setChecking] = useState(false);

  const checkBackend = async () => {
    try {
      setChecking(true);
      setBackendStatus("checking");

      const response = await axios.get(`${API_URL}/api/health`);

      setBackendStatus(
        response.data.status === "healthy"
          ? "connected"
          : "disconnected"
      );
    } catch {
      setBackendStatus("disconnected");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  const statusLabel = {
    checking: "Checking connection",
    connected: "Connected",
    disconnected: "Disconnected"
  };

  return (
    <div className="premium-settings-page">

      {/* HERO */}
      <section className="settings-hero">
        <div className="settings-hero-content">
          <div className="settings-hero-label">
            <Sparkles size={15} />
            WORKSPACE CONFIGURATION
          </div>

          <h1>
            Application <span>Settings.</span>
          </h1>

          <p>
            Everything about your MeetMind AI workspace,
            system configuration and application health
            in one place.
          </p>

          <div className="settings-hero-status">
            <span className="settings-live-dot" />
            Your workspace configuration
          </div>
        </div>

        <div className="settings-hero-art">
          <div className="settings-orbit settings-orbit-one" />
          <div className="settings-orbit settings-orbit-two" />
          <div className="settings-hero-icon">
            <BrainCircuit size={58} />
          </div>
          <div className="settings-floating-tag">
            <ShieldCheck size={16} />
            Secure Workspace
          </div>
        </div>
      </section>

      {/* PAGE HEADING */}
      <div className="settings-section-heading">
        <div>
          <span>YOUR WORKSPACE</span>
          <h2>Configuration Overview</h2>
          <p>Review your application settings and services.</p>
        </div>

        <div className={`settings-overall-status ${backendStatus}`}>
          {backendStatus === "connected"
            ? <CheckCircle2 size={16} />
            : backendStatus === "disconnected"
            ? <AlertCircle size={16} />
            : <RefreshCw size={16} className="settings-spinning" />
          }
          {statusLabel[backendStatus]}
        </div>
      </div>

      {/* SETTINGS GRID */}
      <div className="settings-grid">

        {/* WORKSPACE */}
        <section className="premium-settings-card">
          <div className="settings-card-heading">
            <div className="settings-card-icon workspace-icon">
              <UserCircle size={23} />
            </div>

            <div>
              <h2>Workspace Information</h2>
              <p>Your MeetMind AI workspace details</p>
            </div>

            <ArrowUpRight className="settings-card-arrow" size={18} />
          </div>

          <div className="settings-profile-banner">
            <div className="settings-profile-avatar">
              <BrainCircuit size={28} />
            </div>

            <div>
              <strong>MeetMind AI</strong>
              <span>Meeting Intelligence Workspace</span>
            </div>
          </div>

          <div className="settings-info-row">
            <span>Workspace Name</span>
            <strong>My Workspace</strong>
          </div>

          <div className="settings-info-row">
            <span>Application</span>
            <strong>MeetMind AI</strong>
          </div>

          <div className="settings-info-row">
            <span>Version</span>
            <strong>1.0.0</strong>
          </div>
        </section>

        {/* SYSTEM STATUS */}
        <section className="premium-settings-card">
          <div className="settings-card-heading">
            <div className="settings-card-icon server-icon">
              <Server size={23} />
            </div>

            <div>
              <h2>System Status</h2>
              <p>Backend connection monitoring</p>
            </div>

            <Activity className="settings-card-arrow" size={18} />
          </div>

          <div className={`settings-connection-banner ${backendStatus}`}>
            <div className="settings-connection-icon">
              {backendStatus === "connected"
                ? <CheckCircle2 size={23} />
                : backendStatus === "disconnected"
                ? <AlertCircle size={23} />
                : <RefreshCw size={23} className="settings-spinning" />
              }
            </div>

            <div>
              <strong>{statusLabel[backendStatus]}</strong>
              <span>FastAPI Backend</span>
            </div>

            <span className="settings-connection-dot" />
          </div>

          <div className="settings-info-row settings-url-row">
            <span>Backend URL</span>
            <strong title={API_URL}>{API_URL}</strong>
          </div>

          <button
            className="settings-check-button"
            onClick={checkBackend}
            disabled={checking}
          >
            <RefreshCw
              size={16}
              className={checking ? "settings-spinning" : ""}
            />
            {checking ? "Checking Connection..." : "Check Connection"}
          </button>
        </section>

        {/* AI CONFIGURATION */}
        <section className="premium-settings-card">
          <div className="settings-card-heading">
            <div className="settings-card-icon ai-icon">
              <BrainCircuit size={23} />
            </div>

            <div>
              <h2>AI Configuration</h2>
              <p>Artificial intelligence services</p>
            </div>

            <Sparkles className="settings-card-arrow" size={18} />
          </div>

          <div className="settings-service-banner">
            <div className="settings-service-logo">
              <Sparkles size={25} />
            </div>

            <div>
              <strong>Google Gemini</strong>
              <span>AI Service Provider</span>
            </div>

            <span className="settings-active-tag">ACTIVE</span>
          </div>

          <div className="settings-info-row">
            <span>AI Provider</span>
            <strong>Google Gemini</strong>
          </div>

          <div className="settings-info-row">
            <span>AI Model</span>
            <strong>gemini-2.5-flash</strong>
          </div>

          <div className="settings-info-row">
            <span>AI Features</span>
            <strong>Transcription & Analysis</strong>
          </div>
        </section>

        {/* DATABASE */}
        <section className="premium-settings-card">
          <div className="settings-card-heading">
            <div className="settings-card-icon database-icon">
              <Database size={23} />
            </div>

            <div>
              <h2>Database</h2>
              <p>Meeting information storage</p>
            </div>

            <HardDrive className="settings-card-arrow" size={18} />
          </div>

          <div className="settings-database-banner">
            <div className="settings-database-visual">
              <Database size={28} />
            </div>

            <div>
              <strong>MySQL Database</strong>
              <span>Application data storage</span>
            </div>
          </div>

          <div className="settings-info-row">
            <span>Database Type</span>
            <strong>MySQL</strong>
          </div>

          <div className="settings-info-row">
            <span>Database Name</span>
            <strong>meetmind_ai</strong>
          </div>

          <div className="settings-info-row">
            <span>Stored Information</span>
            <strong>Meetings, Transcripts & Tasks</strong>
          </div>
        </section>

        {/* PRIVACY */}
        <section className="premium-settings-card settings-privacy-card">
          <div className="settings-card-heading">
            <div className="settings-card-icon privacy-icon">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h2>Privacy & Consent</h2>
              <p>Recording and data protection information</p>
            </div>

            <LockKeyhole className="settings-card-arrow" size={18} />
          </div>

          <div className="settings-privacy-notice">
            <Info size={21} />
            <p>
              Always inform meeting participants and obtain
              the required consent before uploading or
              processing a recording. Only upload recordings
              that you are authorized to use.
            </p>
          </div>

          <div className="settings-info-row">
            <span>Maximum Upload Size</span>
            <strong>500 MB</strong>
          </div>

          <div className="settings-info-row">
            <span>Supported Formats</span>
            <strong>MP3, WAV, M4A, OGG, WEBM, MP4</strong>
          </div>

          <div className="settings-security-note">
            <ShieldCheck size={17} />
            Participant consent confirmation is required.
          </div>
        </section>

        {/* MEETING FEATURES */}
        <section className="premium-settings-card">
          <div className="settings-card-heading">
            <div className="settings-card-icon meeting-icon">
              <Mic size={23} />
            </div>

            <div>
              <h2>Meeting Features</h2>
              <p>Available workspace capabilities</p>
            </div>

            <Cpu className="settings-card-arrow" size={18} />
          </div>

          <div className="settings-feature-list">
            <div>
              <span className="settings-feature-symbol">
                <FileAudio size={17} />
              </span>
              <span>Audio & Video Transcription</span>
              <CheckCircle2 size={17} />
            </div>

            <div>
              <span className="settings-feature-symbol">
                <BrainCircuit size={17} />
              </span>
              <span>AI Meeting Summaries</span>
              <CheckCircle2 size={17} />
            </div>

            <div>
              <span className="settings-feature-symbol">
                <ListChecks size={17} />
              </span>
              <span>Action Item Extraction</span>
              <CheckCircle2 size={17} />
            </div>

            <div>
              <span className="settings-feature-symbol">
                <Database size={17} />
              </span>
              <span>Meeting History</span>
              <CheckCircle2 size={17} />
            </div>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="premium-settings-footer">
        <div>
          <BrainCircuit size={20} />
          <strong>MeetMind AI</strong>
        </div>

        <span>
          Autonomous Meeting Intelligence Agent · Version 1.0.0
        </span>
      </footer>
    </div>
  );
}

export default Settings;
