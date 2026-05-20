import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TaskBoard from "./pages/TaskBoard";
import CreateTask from "./pages/CreateTask";

import { getAccessToken } from "./utils/auth";

import ErrorBoundary from "./components/ErrorBoundary";

// Protected Route
function ProtectedRoute({ children }) {
  const token = getAccessToken();

  return token ? (
    children
  ) : (
    <Navigate to="/login" />
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />
          <ToastContainer
  position="top-right"
  autoClose={2500}
/>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TaskBoard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-task"
            element={
              <ProtectedRoute>
                <CreateTask />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <Navigate to="/login" />
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;