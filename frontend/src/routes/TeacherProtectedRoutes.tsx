import type { JSX } from "react";
import { Navigate } from "react-router-dom";

export const TeacherProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const teacherToken = localStorage.getItem("teacherToken");
    const studentToken = localStorage.getItem("studentToken");
  
    if (!teacherToken) return <Navigate to="/teachers" replace />;
    if (studentToken) return <Navigate to="/Announcement" replace />;
  
    return children;
  };
  