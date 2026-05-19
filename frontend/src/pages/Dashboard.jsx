import { useEffect, useState } from "react";
import { fetchProtected } from "../services/fetchProtected";
import { clearTokens } from "../utils/auth";

export default function Dashboard() {
  const [message, setMessage] = useState("Loading...");
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState({});
  const [loadingTeamId, setLoadingTeamId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchProtected("/protected");
        setMessage(data.message);

        const teamData = await fetchProtected("/teams");
        setTeams(teamData);
      } catch (err) {
        setMessage("Failed to load data");
      }
    };

    loadData();
  }, []);

  const handleLogout = () => {
    clearTokens();
    window.location.href = "/login";
  };

  const handleViewMembers = async (teamId) => {
    try {
      setLoadingTeamId(teamId);

      const res = await fetchProtected(`/teams/${teamId}/members`);

      setMembers((prev) => ({
        ...prev,
        [teamId]: res,
      }));
    } catch (err) {
      console.error("Failed to load members");
    } finally {
      setLoadingTeamId(null);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Dashboard</h1>
      <p>{message}</p>

      <h2>My Teams</h2>

      {teams.map((team) => (
        <div key={team.id} style={{ marginBottom: "20px" }}>
          <p><strong>{team.name}</strong></p>

          <button onClick={() => handleViewMembers(team.id)}>
            {loadingTeamId === team.id ? "Loading..." : "View Members"}
          </button>

          {members[team.id] && (
            <ul style={{ marginTop: "10px" }}>
              {members[team.id].map((member) => (
                <li key={member.id}>{member.name}</li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <button onClick={handleLogout} style={{ marginTop: "20px" }}>
        Logout
      </button>
    </div>
  );
}