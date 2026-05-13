import { useState } from "react";
import { login } from "../services/api";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const data = await login(email, password);
    console.log("✅ SUCCESS 👉", data);
  } catch (err) {
    console.log("❌ ERROR 👉", err);
  }
};

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ color: "red" }}>LOGIN PAGE WORKING</h1>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}