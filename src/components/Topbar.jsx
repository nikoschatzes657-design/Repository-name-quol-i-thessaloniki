export default function Topbar({ onLegend, onAbout }) {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="logo" />
        <div>
          <div className="title">QuoL-i</div>
          <div className="subtitle">Urban Quality of Life • Thessaloniki</div>
        </div>
      </div>
      <div className="actions">
        <button className="btn-sm" onClick={onLegend}>🗺 Υπόμνημα</button>
        <button className="btn-sm" onClick={onAbout}>ℹ Σχετικά</button>
      </div>
    </div>
  );
}
