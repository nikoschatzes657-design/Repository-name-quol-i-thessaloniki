// src/components/BottomPanel.jsx
import DistPanel from "./panels/DistPanel.jsx";
import RadarPanel from "./panels/RadarPanel.jsx";
import RankingPanel from "./panels/RankingPanel.jsx";


export default function BottomPanel({
  bottomTab, setBottomTab,
  propsObj,
  geojson, allGeojson,
  weights,
  selectedBin, onSelectBin,
  level = "dk",
}) {
  return (
    <div className="bottom-panel">
      <div className="tabs">
        <button
          className={bottomTab === "dist" ? "tab active" : "tab"}
          onClick={() => setBottomTab("dist")}
        >
          Κατανομή
        </button>
        <button
          className={bottomTab === "radar" ? "tab active" : "tab"}
          onClick={() => setBottomTab("radar")}
        >
          Radar
        </button>
        <button
          className={bottomTab === "ranking" ? "tab active" : "tab"}
          onClick={() => setBottomTab("ranking")}
        >
          Κατάταξη
        </button>
        
      </div>

      <div className="panel-body">
        {bottomTab === "dist" && (
          <DistPanel
            geojson={geojson}
            allGeojson={allGeojson}
            weights={weights}
            selectedBin={selectedBin}
            onSelectBin={onSelectBin}
            level={level}
          />
        )}

        {bottomTab === "radar" && (
          <RadarPanel
            propsObj={propsObj}
            level={level}
            weights={weights}
          />
        )}
        {bottomTab === "ranking" && (
          <RankingPanel
            geojson={geojson}
            allGeojson={allGeojson}
            weights={weights}
            level={level}
          />
)}

  
      </div>
    </div>
  );
}
