import { useEffect, useState } from "react";
import { ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { applyAppearance, readAppearance, saveAppearance } from "../utils/appearance.js";
import "./AppearanceControl.css";

export default function AppearanceControl() {
  const [appearance, setAppearance] = useState(readAppearance);
  useEffect(() => { applyAppearance(appearance); }, [appearance]);
  const Icon = { system: Monitor, light: Sun, dark: Moon }[appearance];

  return (
    <label className="appearance-control">
      <span className="sr-only">Appearance</span>
      <Icon className="appearance-icon" size={14} strokeWidth={1.5} aria-hidden="true" />
      <select aria-label="Appearance" value={appearance} onChange={(event) => {
        setAppearance(event.target.value);
        saveAppearance(event.target.value);
      }}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <ChevronDown className="appearance-chevron" size={12} strokeWidth={1.5} aria-hidden="true" />
    </label>
  );
}
