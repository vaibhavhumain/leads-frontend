import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ---------- Utility for spacing ----------
const nextY = (doc, extra = 15) =>
  doc.lastAutoTable ? doc.lastAutoTable.finalY + extra : 30;

// ---------- Common table styles ----------
const tableConfig = {
  styles: { fontSize: 10, cellPadding: 4, lineColor: [220, 220, 220], lineWidth: 0.2 },
  headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: "center" },
  bodyStyles: { valign: "middle" },
  theme: "grid",
};

// ---------- Helper to build rows ----------
const buildRows = (fields, sectionName = "") => {
  const rows = Object.entries(fields).map(([label, value]) => [label, value || "-"]);
  return sectionName
    ? [
        [
          {
            content: sectionName,
            colSpan: 2,
            styles: { halign: "center", fillColor: [230, 230, 230], fontStyle: "bold" },
          },
        ],
        ...rows,
      ]
    : rows;
};

// ---------- Core PDF builder ----------
const buildPDF = (data) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Customer Enquiry Summary", 14, 20);

  // Basic Info
  const basicInfo = buildRows(
    {
      "Enquiry ID": data.enquiryId,
      "Customer Name": data.customerName,
      "Team Member": data.teamMember,
      "Company Details": data.companyDetails,
      Phone: data.customerPhone,
      Email: data.customerEmail,
      Address: data.address,
      City: data.city,
      State: data.state,
      Pincode: data.pincode,
      "Referral Source": data.referralSource,
    },
    "Basic Info"
  );

  autoTable(doc, { startY: nextY(doc), head: [["Field", "Value"]], body: basicInfo, ...tableConfig });

  // Bus Details
  const busDetails = buildRows(
    {
      "Bus Type": data.busType,
      "Other Bus Type": data.otherBusType,
      "Feature Requirement": data.featureRequirement,
      "AC Preference": data.acPreference,
      "Suggested Model": data.suggestedModel || data.modelName,
      "Specific Requirement": data.specificRequirement,
      "Additional Note": data.additionalNote,
      "Bus Category": data.category,
    },
    "Bus Details"
  );

  autoTable(doc, { startY: nextY(doc), head: [["Field", "Value"]], body: busDetails, ...tableConfig });

  // Chassis Details
  const chassisDetails = buildRows(
    {
      "Chassis Bought": data.chassisBought,
      "Purchase Time": data.chassisPurchaseTime,
      "Chassis Company": data.chassisCompanyName,
      "Chassis Model": data.chassisModel,
      "Wheel Base": data.wheelBase,
      "Tyre Size": data.tyreSize,
      Length: data.length,
      Width: data.width,
    },
    "Chassis Details"
  );

  autoTable(doc, { startY: nextY(doc), head: [["Field", "Value"]], body: chassisDetails, ...tableConfig });

  // Seating & Window
  const seatingAndLuggage = buildRows(
    {
      "Seating Pattern": data.seatingPattern,
      "Number of Seats": data.numberOfSeats,
      "Total Seats (Luxury)": data.totalSeats,
      "Seat Type": data.seatType,
      "Seat Material": data.seatMaterial,
      Curtain: data.curtain,
      "Flooring Type": data.flooringType,
      "Window Type": data.windowType,
      "Required Each Side": data.requiredNoEachSide,
      "Tint of Shades": data.tintOfShades,
      "Other Tint": data.otherTint,
    },
    "Seating & Window"
  );

  autoTable(doc, { startY: nextY(doc), head: [["Field", "Value"]], body: seatingAndLuggage, ...tableConfig });

  // Doors & Storage
  const doorsAndStorage = buildRows(
    {
      "Passenger Doors": data.passengerDoors,
      "Door Position": data.passengerDoorPosition,
      "Door Type": data.doorType,
      "Roof Carrier": data.roofCarrier,
      "Diggy Type": data.diggyType,
      "Side Luggage Required": data.sideLuggageReq,
      "Diggy Flooring": data.diggyFlooring,
      "Side Ladder": data.sideLadder,
      "Helper Foot Step": data.helperFootStep,
      "Rear Back Jaal": data.rearBackJaal,
      "Cabin Type": data.cabinType,
    },
    "Doors & Storage"
  );

  autoTable(doc, { startY: nextY(doc), head: [["Field", "Value"]], body: doorsAndStorage, ...tableConfig });

  // Optional Features
  const optional = buildRows(
    {
      "Optional Features": Array.isArray(data.optionalFeatures)
        ? data.optionalFeatures.join(", ")
        : "-",
      "Fitment Provided": Array.isArray(data.fitmentProvided)
        ? data.fitmentProvided.join(", ")
        : "-",
    },
    "Optional Features"
  );

  autoTable(doc, { startY: nextY(doc), head: [["Field", "Value"]], body: optional, ...tableConfig });

  // Model Details (if any)
  if (data.modelName || data.suggestedModel) {
    autoTable(doc, {
      startY: nextY(doc),
      head: [["Model Details"]],
      body: [["Model Name", data.modelName || data.suggestedModel]],
      ...tableConfig,
    });
  }

  // Standard Fitments (non-luxury)
  if (Array.isArray(data.standardFitments) && data.standardFitments.length > 0) {
    autoTable(doc, {
      startY: nextY(doc),
      head: [["#", "Item", "Suggested", "Your Choice", "Other (if any)"]],
      body: data.standardFitments.map((f, idx) => [
        String(idx + 1),
        f.label || f.key || "-",
        f.suggested || "-",
        f.choice || "-",
        f.otherValue || "-",
      ]),
      ...tableConfig,
      columnStyles: { 0: { cellWidth: 12 } },
    });
  }

  // Luxury Fitments Section
  if (data.luxuryData && data.modelName && typeof getModelConfig === "function") {
    const lux = data.luxuryData;
    const modelConfig = getModelConfig(data.modelName) || {};

    if (Array.isArray(modelConfig.standardFitments)) {
      const rows = modelConfig.standardFitments.map((fit, idx) => {
        const choice = lux[`${fit.key}__Choice`] || "Suggested";
        const otherValue = lux[`${fit.key}__Other`] || "-";
        return [String(idx + 1), fit.label, fit.suggested || "-", choice, choice === "Other" ? otherValue : "-"];
      });

      autoTable(doc, {
        startY: nextY(doc),
        head: [["#", "Standard Fitment", "Suggested", "Choice", "Other Value"]],
        body: rows,
        ...tableConfig,
      });
    }
  }

  return doc;
};

// ---------- Frontend (download) ----------
export const generateEnquiryPDFDownload = (data) => {
  const doc = buildPDF(data);
  doc.save(`Enquiry_${data.enquiryId || "form"}.pdf`);
};

// ---------- Backend (attach to DB) ----------
export const generateEnquiryPDFBuffer = (data) => {
  const doc = buildPDF(data);
  return doc.output("arraybuffer"); // Buffer to save in DB
};
