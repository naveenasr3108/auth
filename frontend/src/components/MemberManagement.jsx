export default function MemberManagement() {
  const members = [
    {
      id: 1,
      name: "Navi",
      email: "navi@gmail.com",
      role: "Admin",
    },
    {
      id: 2,
      name: "Alex",
      email: "alex@gmail.com",
      role: "Member",
    },
  ];

  const containerStyle = {
    marginTop: "30px",
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "12px",
  };

  const memberCardStyle = {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  };

  const badgeStyle = (role) => ({
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    color: "white",
    background: role === "Admin" ? "#ff4d4f" : "#1890ff",
    marginLeft: "10px",
  });

  return (
    <div style={containerStyle}>
      <h2>Team Members</h2>

      {members.map((member) => (
        <div key={member.id} style={memberCardStyle}>
          <div>
            <strong>{member.name}</strong>
            <p>{member.email}</p>
          </div>

          <div>
            <span style={badgeStyle(member.role)}>
              {member.role}
            </span>

            <button
              style={{
                marginLeft: "10px",
                padding: "6px 10px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}