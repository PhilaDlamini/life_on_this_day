import { useEffect, useState } from "react";
import { applyAppearance, readAppearance, saveAppearance } from "../utils/appearance.js";
import "./AppearanceControl.css";

export default function AppearanceControl() {
  const [appearance, setAppearance] = useState(readAppearance);
  useEffect(() => { applyAppearance(appearance); }, [appearance]);

  return (
    <label className="appearance-control">Appearance:
      <select aria-label="Appearance" value={appearance} onChange={(event) => {
        setAppearance(event.target.value);
        saveAppearance(event.target.value);
      }}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
