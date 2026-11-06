
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import NewMeeting from "./pages/NewMeeting";
import MeetingHistory from "./pages/MeetingHistory";
import ActionItems from "./pages/ActionItems";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";

import "./App.css";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);

  const revealSidebar = () => {
    if (!sidebarPinned) setSidebarOpen(true);
  };

  const hideSidebar = () => {
    if (!sidebarPinned) setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    if (sidebarPinned) {
      setSidebarPinned(false);
      setSidebarOpen(false);
    } else {
      setSidebarPinned(true);
      setSidebarOpen(true);
    }
  };

  return (
    <div className="app-layout">

      <button
        className={`sidebar-edge-trigger ${sidebarOpen ? "is-open" : ""}`}
        onMouseEnter={revealSidebar}
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={sidebarOpen}
        title={sidebarPinned ? "Unpin sidebar" : "Open navigation"}
      >
        {sidebarOpen ? (
          <PanelLeftClose size={19} />
        ) : (
          <PanelLeftOpen size={19} />
        )}
      </button>

      <div
        className={`sidebar-shell ${sidebarOpen ? "open" : ""}`}
        onMouseEnter={revealSidebar}
        onMouseLeave={hideSidebar}
      >
        <Sidebar />
      </div>

      <div className="main-area">
        <Navbar />

        <main className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-meeting" element={<NewMeeting />} />
            <Route path="/history" element={<MeetingHistory />} />
            <Route path="/action-items" element={<ActionItems />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
