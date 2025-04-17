import { useContext } from "react";
import { DarkModeContext } from "../../context/DarkModeContext";
import "../components/DarkModeToggle.css";

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

  return (
    <div className="darkmode-toggle">
      <label className="switch">
        <input
          type="checkbox"
          checked={darkMode}
          onChange={toggleDarkMode}
        />
        <span className="slider" />
      </label>
    </div>
  );
};

export default DarkModeToggle;