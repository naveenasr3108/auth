import { useEffect, useState } from "react";
import { fetchProtected } from "../services/fetchProtected";
import { clearTokens } from "../utils/auth";

export default function Dashboard() {
  const [message, setMessage] = useState("Loading protected data...");

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchProtected("/protected");
        setMessage(data.message);
      } catch (err) {
        setMessage("Failed to load protected data");
      }
    };

    loadData();
  }, []);

  const handleLogout = () => {
    clearTokens();
    window.location.href = "/login";
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Dashboard 🔐</h1>
      <p>{message}</p>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}