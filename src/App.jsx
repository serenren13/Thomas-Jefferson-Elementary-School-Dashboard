import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Students from "./pages/students"

function Home() {
  return <h1>Home Page</h1>;
}

function ClassesDashboard() {
  return <h1>Classes Dashboard</h1>;
}

function ClassHome() {
  return <h1>Class Home</h1>;
}

function TeacherDashboard() {
  return <h1>Teacher Dashboard</h1>;
}

function Teachers() {
  return <h1>Teacher Directory</h1>;
}

function Calendar() {
  return <h1>Calendar</h1>;
}

function App() {
  return (
    <Router>
      <Navbar />

      <div style={{ padding: "24px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/classes-dashboard" element={<ClassesDashboard />} />
          <Route path="/class-home" element={<ClassHome />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;