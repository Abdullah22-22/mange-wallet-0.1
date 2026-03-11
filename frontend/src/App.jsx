import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "./context/AuthContext";
import ProtectedRoute from "./context/ProtectedRoute";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import Transactions from "./pages/Transactions/Transactions";
import Profile from "./pages/User//Profile/Profile";
import Content from "./components/Content/Content";
import AddMockCard from "./pages/AddCard/AddMockCard"
import GoalPlan from "./pages/User/GoalPlan/GoalPlan";
import ChatAi from "./pages/AI/ChatAi";
import Forgotpassword from "./pages/Forgotpassword/Forgotpassword";


function PublicRoute({ children }) {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  if (user) {
    return <Navigate to="/dashboard" replace state={{ from: location.pathname }} />;
  }
  return children;
}


function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <Forgotpassword />
          </PublicRoute>
        }
      />

      {/* Protected  */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Content />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="Profile" element={<Profile />} />
          <Route path="card" element={<AddMockCard />} />
          <Route path="USergoals" element={<GoalPlan />} />
          <Route path="ai" element={<ChatAi />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
