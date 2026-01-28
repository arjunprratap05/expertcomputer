import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem("isAdminAuthenticated") === "true";
    const token = localStorage.getItem("adminToken");
    
    // Redirect to login if credentials or token are missing
    return (isAuthenticated && token) ? children : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;