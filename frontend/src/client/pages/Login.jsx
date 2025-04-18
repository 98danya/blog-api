import { useState } from "react";
import { loginUser, getUserProfile } from "../../utils/api";
import "../components/Login.css";

const Login = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const data = await loginUser(email, password);
    localStorage.setItem("token", data.token);

    const profile = await getUserProfile(data.token);

    if (onSuccess) onSuccess(profile);
  } catch (err) {
    setError("Login failed. Please try again.");
    console.error(err);
  }
};

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;