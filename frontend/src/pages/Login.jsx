import { useNavigate } from "react-router-dom";
import { useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const validateInputs = () => {
    if (!email || !password) {
      return "Email and password are required";
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return "Invalid email format";
    }

    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }

    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // ✅ Frontend validation
    const error = validateInputs();
    if (error) {
      setMessage(error);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // ✅ for future CSRF/cookies
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Login failed");
        return;
      }

      // ✅ store tokens safely
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      setMessage("Login successful ✅");

      // ✅ clean navigation
      navigate("/dashboard");

    } catch (err) {
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
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

      <p>{message}</p>
    </div>
  );
}