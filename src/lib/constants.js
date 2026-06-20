// src/lib/constants.js

/* ====== Χρωματική παλέτα & διαστήματα ====== */
export const RDYLGN = [
  "#d73027",
  "#fdae61",
  "#ffffbf",
  "#a6d96a",
  "#1a9850"
];

export const BREAKS = [0, 0.2, 0.4, 0.6, 0.8, 1];
export const QOL_CLASSES = [
  {
    min: 0.0,
    max: 0.2,
    label: "Πολύ χαμηλή",
  },
  {
    min: 0.2,
    max: 0.4,
    label: "Χαμηλή",
  },
  {
    min: 0.4,
    max: 0.6,
    label: "Μέτρια",
  },
  {
    min: 0.6,
    max: 0.8,
    label: "Υψηλή",
  },
  {
    min: 0.8,
    max: 1.0,
    label: "Πολύ υψηλή",
  },
];

export function getQoLClass(value) {
  const v = Number(value);

  if (!Number.isFinite(v)) {
    return {
      label: "Μη διαθέσιμη",
      range: "–",
      index: -1,
    };
  }

  const clamped = Math.max(0, Math.min(1, v));

  const idx = QOL_CLASSES.findIndex((c, i) => {
    const isLast = i === QOL_CLASSES.length - 1;
    return isLast
      ? clamped >= c.min && clamped <= c.max
      : clamped >= c.min && clamped < c.max;
  });

  const klass = QOL_CLASSES[idx] ?? QOL_CLASSES[0];

  return {
    label: klass.label,
    range: `${klass.min.toFixed(2)}–${klass.max.toFixed(2)}`,
    index: idx,
  };
}

/* ====== OT (flat proximity indicators) ====== */
export const GROUPS_OT = [
  {
    title: "Εκπαίδευση",
    icon: "edu",
    items: [
      { id: "m_nhpiagwg", label: "Νηπιαγωγεία", keys: ["m_nhpiagwg"] },
      { id: "m_dhmotika", label: "Δημοτικά", keys: ["m_dhmotika"] },
      { id: "m_gymnasia", label: "Γυμνάσια", keys: ["m_gymnasia"] },
      { id: "m_lykeia", label: "Λύκεια", keys: ["m_lykeia"] },
    ],
  },
  {
    title: "Υγεία, μεταφορές και καθημερινές υπηρεσίες",
    icon: "health",
    items: [
      { id: "m_nosokome", label: "Νοσοκομεία", keys: ["m_nosokome"] },
      { id: "m_farmakei", label: "Φαρμακεία", keys: ["m_farmakei"] },
      { id: "m_supermmar", label: "Super Market", keys: ["m_supermmar"] },
      { id: "m_metro", label: "Μετρό", keys: ["m_metro"] },
    ],
  },
  {
    title: "Αναψυχή και δημόσιες υποδομές",
    icon: "infra",
    items: [
      { id: "m_paidikes", label: "Παιδικές χαρές", keys: ["m_paidikes"] },
      { id: "m_athlitik", label: "Αθλητικές εγκαταστάσεις", keys: ["m_athlitik"] },
    ],
  },
];

export const FLAT_OT = GROUPS_OT.flatMap(g => g.items);
export const DEFAULT_WEIGHTS_OT = Object.fromEntries(
  FLAT_OT.map(it => [it.id, 0.5])
);

/* ====== DK (flat sliders, 3 θεματικές ενότητες) ======
   Όλα normalized 0–1. Τα (invert) αντιστρέφονται στο scoring: v' = 1 - v.
*/
export const DK_GROUPS = [
  {
    title: "Κοινωνικοοικονομικοί Δείκτες",
    items: [
      { id: "norm_dependency",   label: "Δείκτης εξάρτησης πληθυσμού (ανεστραμμένο)" },
      { id: "norm_unemployment", label: "Ανεργία (ανεστραμμένο)" },
      { id: "norm_participation", label: "Συμμετοχή στην αγορά εργασίας" },
      { id: "norm_tertiary",     label: "Τριτοβάθμια εκπαίδευση" },
    ],
  },
  {
    title: "Περιβαλλοντικοί Δείκτες",
    items: [
      { id: "invnorm",  label: "Θερμοκρασία επιφάνειας (ανεστραμμένο)" },
      { id: "normpct_03", label: "Πράσινες επιφάνειες" },
      { id: "normpct_01", label: "Δομημένες επιφάνειες (ανεστραμμένο)" },
    ],
  },
  {
    title: "Δείκτες Προσβασιμότητας",
    items: [
      { id: "a_athlitik",   label: "Αθλητικές εγκαταστάσεις" },
      { id: "a_dhmotika",     label: "Δημοτικά" },
      { id: "a_gymnasia",     label: "Γυμνάσια" },
      { id: "a_lykeia",       label: "Λύκεια" },
      { id: "a_nosokome",     label: "Νοσοκομεία" },
      { id: "a_farmakei",     label: "Φαρμακεία" },
      { id: "a_supermmar", label: "Super Market" },
      { id: "a_metro",        label: "Μετρό" },
      { id: "a_paidikes",     label: "Παιδικές χαρές" },
      { id: "a_nhpiagwg", label: "Νηπιαγωγεία" },
    ],
  },
];

export const DK_INDICATORS = DK_GROUPS.flatMap(g => g.items);

/* ====== AHP βάρη πτυχιακής (DK) ======
   Θεματικές:
   - Κοινωνικοοικονομικοί: 0.412599
   - Περιβαλλοντικοί:      0.32748
   - Εγγύτητα / Πρόσβαση:  0.259921
   Εντός κάθε θεματικής: ίσα βάρη ανά δείκτη.
*/
const AHP_GROUP_IDS_DK = {
  socio: [
    "norm_dependency",
    "norm_unemployment",
    "norm_participation",
    "norm_tertiary",
  ],
  env: [
    "invnorm",
    "normpct_03",
    "normpct_01",
  ],
  access: [
    "a_athlitik",
    "a_dhmotika",
    "a_gymnasia",
    "a_lykeia",
    "a_nosokome",
    "a_farmakei",
    "a_supermmar",
    "a_metro",
    "a_paidikes",
    "a_nhpiagwg",
  ],
};

const AHP_GROUP_WEIGHTS_DK = {
  socio: 0.412599,
  env:   0.32748,
  access: 0.259921,
};

export const AHP_WEIGHTS_DK = (() => {
  const result = {};
  for (const [groupKey, ids] of Object.entries(AHP_GROUP_IDS_DK)) {
    const gw = AHP_GROUP_WEIGHTS_DK[groupKey] ?? 0;
    const perItem = ids.length ? gw / ids.length : 0;
    ids.forEach(id => {
      result[id] = perItem;
    });
  }
  // ό,τι υπάρχει σε DK_INDICATORS αλλά δεν πήρε τιμή, παίρνει 0
  DK_INDICATORS.forEach(it => {
    if (!(it.id in result)) result[it.id] = 0;
  });
  return result;
})();

/* Default βάρη DK = AHP πτυχιακής */
export const DEFAULT_WEIGHTS_DK = AHP_WEIGHTS_DK;

/* Προφίλ βαρών DK (για dropdown στο WeightsPanel) */
export const DK_WEIGHT_PROFILES = [
  {
    id: "thesis",
    label: "Βάρη πτυχιακής εργασίας (AHP)",
    weights: AHP_WEIGHTS_DK,
  },

  {
    id: "env_only",
    label: "Μόνο περιβαλλοντικοί δείκτες",
    weights: {
      // Κοινωνικοοικονομικοί
      norm_dependency: 0,
      norm_unemployment: 0,
      norm_participation: 0,
      norm_tertiary: 0,

      // Περιβαλλοντικοί
      invnorm: 1 / 3,     // LST inverse normalized
      normpct_01: 1 / 3,  // NDBI
      normpct_03: 1 / 3,  // NDVI

      // Εγγύτητα / Προσβασιμότητα
      a_nhpiagwg: 0,
      a_dhmotika: 0,
      a_gymnasia: 0,
      a_lykeia: 0,
      a_nosokome: 0,
      a_farmakei: 0,
      a_metro: 0,
      a_paidikes: 0,
      a_athlitik: 0,
      a_supermmar: 0,
    },
  },

  {
    id: "socio_only",
    label: "Μόνο κοινωνικοοικονομικοί δείκτες",
    weights: {
      // Κοινωνικοοικονομικοί
      norm_dependency: 1 / 4,
      norm_unemployment: 1 / 4,
      norm_participation: 1 / 4,
      norm_tertiary: 1 / 4,

      // Περιβαλλοντικοί
      invnorm: 0,
      normpct_01: 0,
      normpct_03: 0,

      // Εγγύτητα / Προσβασιμότητα
      a_nhpiagwg: 0,
      a_dhmotika: 0,
      a_gymnasia: 0,
      a_lykeia: 0,
      a_nosokome: 0,
      a_farmakei: 0,
      a_metro: 0,
      a_paidikes: 0,
      a_athlitik: 0,
      a_supermmar: 0,
    },
  },

  {
    id: "access_only",
    label: "Μόνο δείκτες προσβασιμότητας",
    weights: {
      // Κοινωνικοοικονομικοί
      norm_dependency: 0,
      norm_unemployment: 0,
      norm_participation: 0,
      norm_tertiary: 0,

      // Περιβαλλοντικοί
      invnorm: 0,
      normpct_01: 0,
      normpct_03: 0,

      // Εγγύτητα / Προσβασιμότητα
      a_nhpiagwg: 1 / 10,
      a_dhmotika: 1 / 10,
      a_gymnasia: 1 / 10,
      a_lykeia: 1 / 10,
      a_nosokome: 1 / 10,
      a_farmakei: 1 / 10,
      a_metro: 1 / 10,
      a_paidikes: 1 / 10,
      a_athlitik: 1 / 10,
      a_supermmar: 1 / 10,
    },
  },

  {
    id: "custom",
    label: "Χειροκίνητη προσαρμογή βαρών",
    weights: null,
  },
];

/* ====== DK popup fields (info) ====== */
export const DK_POPUP_FIELDS = [
  { id: "_score",             label: "Σταθμισμένος δείκτης ποιότητας ζωής" },
  { id: "norm_participation", label: "Συμμετοχή στην αγορά εργασίας" },
  { id: "norm_tertiary",      label: "Τριτοβάθμια εκπαίδευση" },
  { id: "norm_unemployment",  label: "Ανεργία(ανεστραμμένο)" },
  { id: "norm_dependency",    label: "Δείκτης εξάρτησης πληθυσμού(ανεστραμμένο)" },

  // περιβαλλοντικοί
  { id: "invnorm",   label: "Θερμοκρασία επιφάνειας(ανεστραμμένο)" },
  { id: "normpct_03",  label: "Πράσινες επιφάνειες" },
  { id: "normpct_01",  label: "Δομημένες επιφάνειες(ανεστραμμένο)" },

  // access indicators
  { id: "a_athlitik",   label: "Αθλητικές εγκαταστάσεις" },
  { id: "a_dhmotika",     label: "Δημοτικά" },
  { id: "a_gymnasia",     label: "Γυμνάσια" },
  { id: "a_lykeia",       label: "Λύκεια" },
  { id: "a_nosokome",     label: "Νοσοκομεία" },
  { id: "a_farmakei",     label: "Φαρμακεία" },
  { id: "a_supermmar", label: "Super Market" },
  { id: "a_metro",        label: "Μετρό" },
  { id: "a_paidikes",     label: "Παιδικές χαρές" },
  { id: "a_nhpiagwg", label: "Νηπιαγωγεία" },
];

/* ====== Helpers ====== */
export const formatRange = (a, b) =>
  `${a.toFixed(1)}–${b.toFixed(1)}`;
