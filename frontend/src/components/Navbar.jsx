
import {
  Bell,
  Search,
  UserCircle,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const pageTitles = {
    "/": "Dashboard",
    "/new-meeting": "New Meeting",
    "/history": "Meeting History",
    "/action-items": "Action Items",
    "/settings": "Settings"
  };

  const pageDescriptions = {
    "/": "Your meeting intelligence overview",
    "/new-meeting": "Transform conversations into insights",
    "/history": "Explore your previous meetings",
    "/action-items": "Track tasks and team commitments",
    "/settings": "Manage your workspace preferences"
  };

  const currentPage = pageTitles[location.pathname] || "MeetMind AI";
  const description =
    pageDescriptions[location.pathname] ||
    "Welcome to your meeting workspace";

  return (
    <header className="top-navbar">
      <div className="navbar-title">
        <div className="navbar-breadcrumb">
          <span>WORKSPACE</span>
          <span className="breadcrumb-divider">/</span>
          <strong>{currentPage}</strong>
        </div>

        <h2>{currentPage}</h2>
        <p>{description}</p>
      </div>

      <div className="navbar-actions">
        <div className="navbar-ai-status">
          <Sparkles size={15} />
          <span>AI Powered</span>
        </div>

        <button
          className="navbar-icon"
          aria-label="Search"
          title="Search"
          onClick={() =>
            document.querySelector(".action-search input, .history-search input")?.focus()
          }
        >
          <Search size={19} />
        </button>

        <button
          className="navbar-icon notification-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={19} />
          <span className="notification-dot" />
        </button>

        <div className="navbar-profile">
          <div className="profile-avatar">
            <UserCircle size={25} />
          </div>

          <div className="profile-info">
            <strong>My Workspace</strong>
            <span>Administrator</span>
          </div>

          <ChevronDown size={16} className="profile-chevron" />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
