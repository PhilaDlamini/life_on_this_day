import "./Waveform.css";

// Decorative amplitude bars supplied by the entry, with fewer bars in a calendar tile.
export default function Waveform({ values = [], compact = false }) {
  const bars = compact ? values.filter((_, index) => index % 2 === 0) : values;

  return (
    <span className="waveform" aria-hidden="true">
      {bars.map((height, index) => (
        <span key={index} style={{ height: `${height}%` }} />
      ))}
    </span>
  );
}
