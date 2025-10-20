import type { JSX } from "react";
import { Navigate } from "react-router-dom";

export const StudentProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const studentToken = localStorage.getItem("studentToken");
    const teacherToken = localStorage.getItem("teacherToken"); 
  
    if (!studentToken) return <Navigate to="/login" replace />;
    if (teacherToken) return <Navigate to="/teacher" replace />;
  
    return children;
  };