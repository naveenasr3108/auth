import { useEffect, useState } from "react";
import { fetchProtected } from "../services/fetchProtected";
import { clearTokens } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import MemberManagement from "../components/MemberManagement";

export default function Dashboard() {
  const [message, setMessage] = useState("Loading...");
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState({});
  const [loadingTeamId, setLoadingTeamId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [role, setRole] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const data = await fetchProtected("/protected");
        setMessage(data.message);

        const teamData = await fetchProtected("/teams");
        setTeams(teamData);

        try {
          const dashboardData = await fetchProtected("/dashboard");

          setRole(dashboardData.role);
          setStats(dashboardData.stats);
        } catch {
          setRole("Admin");

          setStats({
            total: 10,
            completed: 4,
            pending: 6,
          });
        }

        setLoading(false);
      } catch (err) {
        setMessage("Failed to load dashboard");
        setLoading(false);
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

      // mock members for now
      const res = [
        { id: 1, name: "Navi" },
        { id: 2, name: "Alex" },
      ];

      setMembers((prev) => ({
        ...prev,
        [teamId]: res,
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to load members");
    } finally {
      setLoadingTeamId(null);
    }
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#f3f4f6",
        }}
      >
        {/* Sidebar Skeleton */}
        <div
          style={{
            width: "230px",
            background: "#111827",
          }}
        />

        {/* Content Skeleton */}
        <div
          style={{
            flex: 1,
            padding: "40px",
          }}
        >
          <div
            style={{
              width: "200px",
              height: "35px",
              background: "#d1d5db",
              borderRadius: "10px",
              marginBottom: "30px",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "40px",
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: "100px",
                  background: "#d1d5db",
                  borderRadius: "16px",
                }}
              />
            ))}
          </div>

          <div
            style={{
              height: "300px",
              background: "#d1d5db",
              borderRadius: "20px",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          width: "240px",
          background: "#111827",
          color: "white",
          padding: "35px 22px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              marginBottom: "50px",
            }}
          >
            TaskFlow
          </h1>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "22px",
            }}
          >
            <div
              style={{
                padding: "12px 14px",
                background: "#1f2937",
                borderRadius: "12px",
                cursor: "pointer",
              }}
            >
              Dashboard
            </div>

            <div
              onClick={() => navigate("/tasks")}
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                cursor: "pointer",
                opacity: 0.8,
                transition: "0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "#1f2937";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "transparent";
              }}
            >
              Tasks
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                cursor: "pointer",
                opacity: 0.8,
              }}
            >
              Teams
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "14px",
            border: "none",
            borderRadius: "12px",
            background: "#1f2937",
            color: "white",
            cursor: "pointer",
            transition: "0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "#374151";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "#1f2937";
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          padding: "40px",
        }}
      >
        {/* TOP SECTION */}
        <div
          style={{
            marginBottom: "40px",
          }}
        >
          <h1
            style={{
              fontSize: "40px",
              marginBottom: "10px",
              color: "#111827",
            }}
          >
            Dashboard
          </h1>

          <p
            style={{
              color: "#6b7280",
              fontSize: "15px",
            }}
          >
            {message}
          </p>
        </div>

        {/* STATS */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "45px",
            flexWrap: "wrap",
          }}
        >
          {[
            {
              label: "Role",
              value: role,
            },
            {
              label: "Tasks",
              value: stats.total,
            },
            {
              label: "Completed",
              value: stats.completed,
            },
            {
              label: "Pending",
              value: stats.pending,
            },
          ].map((item, index) => (
            <div
              key={index}
              style={{
                background: "white",
                padding: "20px 24px",
                borderRadius: "18px",
                minWidth: "180px",
                transition: "0.25s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 20px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "none";
              }}
            >
              <p
                style={{
                  color: "#6b7280",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                {item.label}
              </p>

              <h2
                style={{
                  color: "#111827",
                  fontSize: "30px",
                }}
              >
                {item.value}
              </h2>
            </div>
          ))}
        </div>

        {/* TEAMS SECTION */}
        <div
          style={{
            marginBottom: "50px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                color: "#111827",
              }}
            >
              Teams
            </h2>

            <button
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: "12px",
                background: "#111827",
                color: "white",
                cursor: "pointer",
              }}
            >
              + New Team
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {teams.map((team) => (
              <div
                key={team.id}
                style={{
                  background: "white",
                  padding: "22px",
                  borderRadius: "18px",
                  transition: "0.25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 20px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        marginBottom: "6px",
                        color: "#111827",
                      }}
                    >
                      {team.name}
                    </h3>

                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "14px",
                      }}
                    >
                      Active project team
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handleViewMembers(team.id)
                    }
                    style={{
                      padding: "10px 16px",
                      border: "none",
                      borderRadius: "12px",
                      background: "#eef2ff",
                      color: "#3730a3",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    {loadingTeamId === team.id
                      ? "Loading..."
                      : "View Members"}
                  </button>
                </div>

                {members[team.id] && (
                  <div
                    style={{
                      marginTop: "18px",
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    {members[team.id].map(
                      (member) => (
                        <div
                          key={member.id}
                          style={{
                            background: "#f3f4f6",
                            padding:
                              "8px 14px",
                            borderRadius: "30px",
                            fontSize: "14px",
                          }}
                        >
                          {member.name}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* MEMBER MANAGEMENT */}
        <MemberManagement />

        {/* ACTION BUTTON */}
        <div
          style={{
            marginTop: "45px",
          }}
        >
          <button
            onClick={() => navigate("/tasks")}
            style={{
              padding: "15px 24px",
              border: "none",
              borderRadius: "14px",
              background: "#111827",
              color: "white",
              cursor: "pointer",
              fontSize: "15px",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "#374151";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "#111827";
            }}
          >
            Open Task Board
          </button>
        </div>
      </div>
    </div>
  );
}