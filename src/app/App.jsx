import { useMemo, useRef, useState, useEffect } from "react";
import "./App.css";

import Topbar from "../components/Topbar.jsx"; // αν δεν το χρησιμοποιείς, μπορείς να το σβήσεις
import LegendPanel from "../components/LegendPanel.jsx";
import WeightsPanel from "../components/WeightsPanel.jsx";
import BottomPanel from "../components/BottomPanel.jsx";
import MapView from "../components/MapView.jsx";
import LandingPage from "../components/LandingPage.jsx";

import { useMapCommunities } from "../hooks/useMapCommunities.js";
import {
  BREAKS,
  RDYLGN,
  DEFAULT_WEIGHTS_OT,
  DEFAULT_WEIGHTS_DK,
  formatRange,
} from "src/lib/constants.js";

export default function App() {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  const [selectedProps, setSelectedProps] = useState(null);
  const [showDynamic, setShowDynamic] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [bottomTab, setBottomTab] = useState("dist");
  const [selectedBin, setSelectedBin] = useState(null);
  const [analysisLevel, setAnalysisLevel] = useState("dk");

  // Landing state
  const [showLanding, setShowLanding] = useState(true);

  const [weightsOT, setWeightsOT] = useState(DEFAULT_WEIGHTS_OT);
  const [weightsDK, setWeightsDK] = useState(DEFAULT_WEIGHTS_DK);

  const weights = analysisLevel === "dk" ? weightsDK : weightsOT;
  const setWeights = analysisLevel === "dk" ? setWeightsDK : setWeightsOT;

  const [lockSumToOne, setLockSumToOne] = useState(true);

  const { geojson, allGeojson} = useMapCommunities({
    level: analysisLevel,
    weights,
  });

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="brand">
          <div className="logo" />
          <div>
            <div className="title">QuoL-i</div>
            <div className="subtitle">Urban Quality of Life · Thessaloniki</div>
          </div>
        </div>

        <div className="actions">
          
          <span className="level-badge">
            Δημοτικές Κοινότητες
          </span>

          <button className="btn-sm" onClick={() => setShowLegend(true)}>
            ΥΠΟΜΝΗΜΑ
          </button>

          <button className="btn-sm" onClick={() => setShowAbout(true)}>
            ΜΕΘΟΔΟΛΟΓΙΑ
          </button>
        </div>
      </div>

      {/* WEIGHTS PANEL (δεξιά) */}
      <WeightsPanel
        level={analysisLevel}
        weights={weights}
        setWeights={setWeights}
        lockSumToOne={lockSumToOne}
        setLockSumToOne={setLockSumToOne}
        showDynamic={showDynamic}
        setShowDynamic={setShowDynamic}
      />

      {/* Κεντρικό layout: Map + Bottom με scroll */}
      <div className="main-layout">
        <MapView
          mapRef={mapRef}
          containerRef={containerRef}
          showDynamic={showDynamic}
          setSelectedProps={setSelectedProps}
          setSelectedBin={setSelectedBin}
          selectedBin={selectedBin}
          geojson={geojson || allGeojson}
          level={analysisLevel}
        />

        <BottomPanel
          bottomTab={bottomTab}
          setBottomTab={setBottomTab}
          propsObj={selectedProps}
          geojson={geojson || allGeojson}
          allGeojson={allGeojson}
          weights={weights}
          selectedBin={selectedBin}
          onSelectBin={setSelectedBin}
          level={analysisLevel}
        />
      </div>

      {/* LEGEND MODAL */}
      {showLegend && (
        <LegendPanel
          onClose={() => setShowLegend(false)}
          breaks={BREAKS}
          colors={RDYLGN}
          title="ΥΠΟΜΝΗΜΑ (Score 0–1)"
          formatRange={formatRange}
        />
      )}

      {/* METHODOLOGY MODAL */}
{showAbout && (
  <div className="modal" onClick={() => setShowAbout(false)}>
    <div className="modal-card methodology-modal" onClick={(e) => e.stopPropagation()}>
      <button
        className="btn-sm close"
        onClick={() => setShowAbout(false)}
      >
        Κλείσιμο
      </button>

      <h3>Μεθοδολογία υπολογισμού του δείκτη QoL-i</h3>

      <p className="methodology-intro">
        Η εφαρμογή QuoL-i αποτελεί διαδραστικό εργαλείο χαρτογραφικής
        απεικόνισης και διερεύνησης ενός σύνθετου δείκτη ποιότητας ζωής
        για την Πολεοδομική Ενότητα Θεσσαλονίκης. Ο δείκτης βασίζεται σε
        αντικειμενικά γεωχωρικά, κοινωνικοοικονομικά και περιβαλλοντικά
        δεδομένα, τα οποία έχουν μετασχηματιστεί σε κοινή κλίμακα
        αξιολόγησης.
      </p>

      <div className="methodology-section">
        <h4>1. Χωρικές μονάδες ανάλυσης</h4>
        <p>
          <p>
        Η εφαρμογή εστιάζει στην ανάλυση του σύνθετου δείκτη ποιότητας ζωής
        σε επίπεδο Δημοτικών Κοινοτήτων. Η επιλογή της Δημοτικής Κοινότητας
        ως τελικής χωρικής μονάδας επιτρέπει τη σύνθεση κοινωνικοοικονομικών,
        περιβαλλοντικών και δεικτών προσβασιμότητας σε ενιαίο χωρικό επίπεδο.
        Οι δείκτες προσβασιμότητας έχουν υπολογιστεί σε λεπτομερέστερη χωρική
        κλίμακα και στη συνέχεια ενσωματώθηκαν στο επίπεδο των Δημοτικών
        Κοινοτήτων.
      </p>
        </p>
      </div>

      <div className="methodology-section">
        <h4>2. Θεματικές διαστάσεις του δείκτη</h4>
        <p>
          Ο τελικός δείκτης QoL-i συγκροτείται από τρεις βασικές θεματικές
          διαστάσεις: κοινωνικοοικονομική διάσταση, περιβαλλοντική διάσταση
          και διάσταση προσβασιμότητας. Κάθε διάσταση περιλαμβάνει επιμέρους
          δείκτες, οι οποίοι εκφράζουν διαφορετικές όψεις της αστικής ποιότητας
          ζωής.
        </p>

        <ul>
          <li>
            <b>Κοινωνικοοικονομικοί δείκτες:</b> εκπαίδευση, ανεργία,
            συμμετοχή στην αγορά εργασίας και πληθυσμιακή εξάρτηση.
          </li>
          <li>
            <b>Περιβαλλοντικοί δείκτες:</b> θερμοκρασία επιφάνειας,
            πράσινες επιφάνειες και δομημένες επιφάνειες.
          </li>
          <li>
            <b>Δείκτες προσβασιμότητας:</b> εγγύτητα σε σχολεία,
            νοσοκομεία, φαρμακεία, μετρό, παιδικές χαρές, αθλητικές
            εγκαταστάσεις και καθημερινές υπηρεσίες.
          </li>
        </ul>
      </div>

      <div className="methodology-section">
        <h4>3. Κανονικοποίηση τιμών</h4>
        <p>
          Όλοι οι δείκτες μετασχηματίζονται στην κοινή κλίμακα 0–1, ώστε να
          είναι συγκρίσιμοι μεταξύ τους. Η τιμή 0 αντιστοιχεί σε δυσμενέστερη
          συνθήκη, ενώ η τιμή 1 σε ευνοϊκότερη συνθήκη. Για δείκτες με αρνητική
          επίδραση στην ποιότητα ζωής, όπως η ανεργία ή η υψηλή θερμοκρασία
          επιφάνειας, εφαρμόζεται αντίστροφη κανονικοποίηση.
        </p>
      </div>

      <div className="methodology-section">
        <h4>4. Στάθμιση και σύνθεση</h4>
        <p>
          Η σύνθεση του τελικού δείκτη γίνεται με γραμμικό σταθμισμένο άθροισμα.
          Τα βάρη των βασικών θεματικών διαστάσεων έχουν προκύψει μέσω της
          Αναλυτικής Ιεραρχικής Διαδικασίας, ενώ εντός κάθε θεματικής ομάδας
          τα επιμέρους κριτήρια κατανέμονται σύμφωνα με τη μεθοδολογική λογική
          της εργασίας.
        </p>

        <div className="methodology-formula">
          QoL-i = w<sub>socio</sub> · Socio + w<sub>env</sub> · Env + w<sub>access</sub> · Access
        </div>

        <p>
          Στην προεπιλεγμένη εκδοχή της εφαρμογής χρησιμοποιούνται τα βάρη της
          πτυχιακής εργασίας. Ο χρήστης μπορεί να τα τροποποιήσει δυναμικά,
          ώστε να εξετάσει εναλλακτικά σενάρια στάθμισης.
        </p>
      </div>

      <div className="methodology-section">
        <h4>5. Ερμηνεία χρωματικών κατηγοριών</h4>
        <p>
          Οι τιμές του δείκτη ταξινομούνται σε πέντε κατηγορίες, με ίσα
          διαστήματα εύρους 0,20. Η ταξινόμηση χρησιμοποιείται στον χάρτη,
          στο υπόμνημα, στο ιστόγραμμα και στα αναδυόμενα παράθυρα των
          περιοχών.
        </p>

        <div className="methodology-classes">
          <div><span className="class-swatch c1" /> 0.00–0.20 · Πολύ χαμηλή</div>
          <div><span className="class-swatch c2" /> 0.20–0.40 · Χαμηλή</div>
          <div><span className="class-swatch c3" /> 0.40–0.60 · Μέτρια</div>
          <div><span className="class-swatch c4" /> 0.60–0.80 · Υψηλή</div>
          <div><span className="class-swatch c5" /> 0.80–1.00 · Πολύ υψηλή</div>
        </div>
      </div>

      <div className="methodology-section">
        <h4>6. Διαδραστική διερεύνηση</h4>
        <p>
          Η εφαρμογή επιτρέπει την αλλαγή των βαρών, την προβολή κατανομών,
          τη σύγκριση περιοχών μέσω γραφημάτων και την κατάταξη των περιοχών
          με βάση την τιμή του δείκτη. Με αυτόν τον τρόπο λειτουργεί ως
          εργαλείο διερεύνησης χωρικών ανισοτήτων και όχι απλώς ως στατικός
          θεματικός χάρτης.
        </p>
      </div>

      <p className="methodology-footer">
        Έκδοση: beta · Ανάπτυξη: Νίκος Χατζής
      </p>
    </div>
  </div>
)}
    </>
  );
}
