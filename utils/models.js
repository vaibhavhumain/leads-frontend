const BASE_STANDARD_FITMENTS = [
  { key: "Structure Material", label: "Structure Material", suggested: "GI Tubes as per ISI : 4923" },
  { key: "Main Pillars", label: "Main Pillars", suggested: "60x40x2 mm" },
  { key: "Channel", label: "Channel", suggested: "100x50" },
  { key: "Chassis & Body Anchoring", label: "Chassis & Body Anchoring", suggested: "Plates" },
  { key: "Roof Panel", label: "Roof Panel", suggested: "GPSP Sheet as per IS:277 (Thickness 1mm)" },
  { key: "Stretch Panels", label: "Stretch Panels", suggested: "GPSP Sheet as per IS:277 (Thickness 1mm)" },
  { key: "Skirt Panels", label: "Skirt Panels", suggested: "GPSP Sheet as per IS:277 (Thickness 1.2mm)" },
  { key: "Front", label: "Front", suggested: "FRP Reinforced with GI Tubes" },
  { key: "Rear", label: "Rear", suggested: "FRP Reinforced with GI Tubes" },
  { key: "Belly Dickey", label: "Belly Dickey (AAR PAAR Dickey)", suggested: "Chequered Plates (Thickness 1.2mm)" },
  { key: "Front Glass", label: "Front Glass", suggested: "74\" Laminated Glass pasted with sealant" },
  { key: "Back Glass", label: "Back Glass", suggested: "5mm Toughened Glass pasted with sealant" },
  { key: "Colour of Side Glass", label: "Colour of Side Glass", suggested: "Light Green" },
  { key: "Side Glasses", label: "Side Glasses (Tillies + Frames)", suggested: "" },
  { key: "RVM", label: "RVM", suggested: "Motorised" },
  { key: "Passenger Door", label: "Passenger Door", suggested: "Pneumatic" },
  { key: "Head Lights", label: "Head Lights", suggested: "Projector Lights" },
  { key: "Seats", label: "Seats", suggested: "Push Back" },
  { key: "Parking Lights", label: "Parking Lights", suggested: "" },
  { key: "Side Marker", label: "Side marker (Indicators)", suggested: "" },
  { key: "Tail Lights", label: "Tail Lights", suggested: "" },
  { key: "Interior", label: "Interior", suggested: "Fully ABS Finish" },
  { key: "Flooring", label: "Flooring", suggested: "Raised Gallery with Kit ply + PVC Mat" },
  { key: "Wiper Motors", label: "Wiper Motors", suggested: "" },
  { key: "Seat Numbers", label: "Seat Numbers", suggested: "" },
  { key: "LED Lights", label: "LED Lights", suggested: "" },
  { key: "AC Louvers with Reading Lamps", label: "AC louvers with Reading Lamps", suggested: "" },
  { key: "Fans on every Pillar", label: "Fans on every Pillar", suggested: "" },
  { key: "Tool Box in Driver Cabin", label: "Tool Box in Driver Cabin", suggested: "" },
  { key: "Dashboard", label: "Dashboard", suggested: "" },
];

// ---- Optional fitments (you can customize per model) ----
const BASE_OPTIONAL_FITMENTS = [
  "Music System",
  "GPS",
  "Rear Camera",
  "Alloy Wheels",
  "Ambient Lighting",
  "Inverter",
  "Extra Luggage Racks",
];

export const MODELS = {
  Spider: {
    standardFitments: [...BASE_STANDARD_FITMENTS],
    optionalFitments: [...BASE_OPTIONAL_FITMENTS],
  },
  Arrow: {
    standardFitments: [...BASE_STANDARD_FITMENTS],
    optionalFitments: [...BASE_OPTIONAL_FITMENTS],
  },
  Tourista: {
    standardFitments: [...BASE_STANDARD_FITMENTS],
    optionalFitments: [...BASE_OPTIONAL_FITMENTS],
  },
  Hymer: {
    standardFitments: [...BASE_STANDARD_FITMENTS],
    optionalFitments: [...BASE_OPTIONAL_FITMENTS],
  },
  Kasper: {
    standardFitments: [...BASE_STANDARD_FITMENTS],
    optionalFitments: [...BASE_OPTIONAL_FITMENTS],
  },
};

// Safe getter so pages never crash if a key is missing.
export const getModelConfig = (name) =>
  MODELS[name] ?? { standardFitments: [], optionalFitments: [] };

export const EXTRA_COST_FITMENTS = [
  { key: "EXTRA::AC", label: "A/C" },
  { key: "EXTRA::AC_BY_CUSTOMER", label: "A/C TO BE SENT BY CUSTOMER" },
  { key: "EXTRA::PNEUMATIC_FOOT_STEP", label: "PNEUMATIC FOOT STEP" },
  { key: "EXTRA::JHALLAR_PHOTO", label: "JHALLAR/PHOTO" },
  { key: "EXTRA::REVERSE_CAMERA", label: "REVERSE CAMERA  With Screen on dashboard 7\"" },
  { key: "EXTRA::LED_ROUTE_BOARD", label: "LED ROUTE BOARD" },
  { key: "EXTRA::ROOF_HATCH_IF_SLIDING", label: "ROOF HATCH IF SLIDING GLASS" },
  { key: "EXTRA::BRANDED_SPEAKERS", label: "BRANDED SPEAKERS IN HAT RACK" },
  { key: "EXTRA::FULL_CHEQUERED_PLATES", label: "FULL CHEQRED PLATES IN DICKIES" },
  { key: "EXTRA::CCTV_CAMERAS", label: "CCTV CAMERAS" },
  { key: "EXTRA::AMPLIFIER", label: "AMPLIFIER" },
  { key: "EXTRA::INVERTER", label: "INVERTER" },
  { key: "EXTRA::LED_TV", label: "LED TV" },
  { key: "EXTRA::ANNOUNCEMENT_MIC", label: "MIKE FOR ANNOUCEMENT" },
  { key: "EXTRA::PANIC_BUTTON", label: "PANIC BUTTON" },
  { key: "EXTRA::PASSENGER_DOOR_PRESSURE", label: "PASSENGER DOOR PRESSURE PUSH BUTTON" },
];
