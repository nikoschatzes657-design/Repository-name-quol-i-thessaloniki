// src/components/LandingPage.jsx

// src/components/LandingPage.jsx

import bgCity from "../media/mp.png";
import logoQoli from "../media/logo_qoli.png";

export default function LandingPage({ onEnter }) {
  return (
    <div className="landing-root">

      {/* Background */}
      <img
        className="landing-bg"
        src={bgCity}
        alt="Future City"
      />

      {/* Overlay */}
      <div className="landing-overlay" />

      {/* Content Card */}
      <div className="landing-card">
        <div className="landing-logo-row">
          <img
            className="landing-logo-img"
            src={logoQoli}
            alt="QuoL-i logo"
          />

          <div>
            <div className="landing-title">QuoL-i</div>
            <div className="landing-subtitle">
              Urban Quality of Life · Thessaloniki
            </div>
          </div>
        </div>

        <p className="landing-tagline">
          Διαδραστικός δείκτης ποιότητας ζωής για την Πολεοδομική Ενότητα
          Θεσσαλονίκης, με κοινωνικοοικονομικά, περιβαλλοντικά και
          χωρικά δεδομένα.
        </p>

        <div className="landing-points">
          <div className="landing-pill">⚙️ Δυναμικά βάρη δεικτών</div>
          <div className="landing-pill">🗺️ Χαρτογράφηση Δημοτικών Κοινοτήτων</div>
          <div className="landing-pill">📊 Οπτικοποίηση δεδομένων</div>
        </div>

        <div className="landing-actions">
          <button className="landing-btn-primary" onClick={onEnter}>
            Είσοδος στην εφαρμογή
          </button>
        </div>

        <div className="landing-footer">
          <span>Έκδοση: beta</span>
          <span>Ανάπτυξη: Νίκος Χατζής</span>
        </div>
      </div>
    </div>
  );
}