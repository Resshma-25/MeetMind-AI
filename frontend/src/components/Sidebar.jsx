
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Mic,
  History,
  ListChecks,
  CalendarDays,
  Settings,
  BrainCircuit,
  Sparkles,
  ChevronRight
} from "lucide-react";

function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard
    },
    {
      name: "New Meeting",
      path: "/new-meeting",
      icon: Mic
    },
    {
      name: "Meeting History",
      path: "/history",
      icon: History
    },
    {
      name: "Action Items",
      path: "/action-items",
      icon: ListChecks
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: CalendarDays
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings
    }
  ];

  return (
    <aside className="sidebar">

      {/* BRAND SECTION */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <BrainCircuit size={27} />
          <span className="brand-glow" />
        </div>

        <div className="brand-text">
          <h2>
            MeetMind <span>AI</span>
          </h2>
          <p>MEETING INTELLIGENCE</p>
        </div>
      </div>

      {/* WORKSPACE LABEL */}
      <div className="sidebar-workspace">
        <span className="workspace-dot" />
        <span>WORKSPACE</span>
      </div>

      {/* NAVIGATION MENU */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon
                size={19}
                className="sidebar-menu-icon"
              />

              <span>{item.name}</span>

              <ChevronRight
                size={16}
                className="sidebar-chevron"
              />
            </NavLink>
          );
        })}
      </nav>

      {/* BOTTOM AI INFORMATION */}
      <div className="sidebar-bottom">
        <div className="sidebar-ai-card">

          <div className="ai-card-icon">
            <Sparkles size={18} />
          </div>

          <h3>AI-Powered Workspace</h3>

          <p>
            Turn every conversation into meaningful action.
          </p>

          <div className="ai-status">
            <span />
            AI Assistant Active
          </div>
        </div>

        {/* VERSION */}
        <p className="sidebar-version">
          MEETMIND AI · VERSION 1.0
        </p>
      </div>

    </aside>
  );
}

export default Sidebar;
