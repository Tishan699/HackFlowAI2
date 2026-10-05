import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Hackathons from "./pages/Hackathons";
import HackathonDetails from "./pages/HackathonDetails";
import Teams from "./pages/Teams";
import Submissions from "./pages/Submissions";
import Judges from "./pages/Judges";
import Mentors from "./pages/Mentors";
import Attendance from "./pages/Attendance";
import Certificates from "./pages/Certificates";
import Analytics from "./pages/Analytics";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AISupportBot from "./components/AISupportBot";

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Dashboard Routes with DashboardLayout */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hackathons" element={<Hackathons />} />
          <Route path="/hackathons/:id" element={<HackathonDetails />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/submissions" element={<Submissions />} />
          <Route path="/judges" element={<Judges />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>

      {/* Global AI Platform Support Assistant Bot */}
      <AISupportBot />
    </>
  );
}

export default App;
