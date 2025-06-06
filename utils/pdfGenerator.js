import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateEnquiryPDF = (data) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Customer Enquiry Summary', 14, 20);

  const buildRows = (fields, sectionName = '') => {
    const rows = Object.entries(fields).map(([label, value]) => [label, value || '-']);
    return sectionName ? [[{ content: sectionName, colSpan: 2, styles: { halign: 'center', fillColor: [220, 220, 220] } }], ...rows] : rows;
  };

  const basicInfo = buildRows({
    'Enquiry ID': data.enquiryId,
    'Customer Name': data.customerName,
    'Team Member': data.teamMember,
    'Company Details': data.companyDetails,
    'Phone': data.customerPhone,
    'Email': data.customerEmail,
    'Address': data.address,
    'City': data.city,
    'State': data.state,
    'Pincode': data.pincode,
    'Referral Source': data.referralSource,
  }, 'Basic Info');

  const busDetails = buildRows({
    'Bus Type': data.busType,
    'Other Bus Type': data.otherBusType,
    'Feature Requirement': data.featureRequirement,
    'AC Preference': data.acPreference,
    'Suggested Model': data.suggestedModel,
    'Specific Requirement': data.specificRequirement,
    'Additional Note': data.additionalNote,
    'Bus Category': data.category,
  }, 'Bus Details');

  const chassisDetails = buildRows({
    'Chassis Bought': data.chassisBought,
    'Purchase Time': data.chassisPurchaseTime,
    'Chassis Company': data.chassisCompanyName,
    'Chassis Model': data.chassisModel,
    'Wheel Base': data.wheelBase,
    'Tyre Size': data.tyreSize,
    'Length': data.length,
    'Width': data.width,
  }, 'Chassis Details');

  const seatingAndLuggage = buildRows({
    'Seating Pattern': data.seatingPattern,
    'Number of Seats': data.numberOfSeats,
    'Total Seats (Luxury)': data.totalSeats,
    'Seat Type': data.seatType,
    'Seat Material': data.seatMaterial,
    'Curtain': data.curtain,
    'Flooring Type': data.flooringType,
    'Window Type': data.windowType,
    'Required Each Side': data.requiredNoEachSide,
    'Tint of Shades': data.tintOfShades,
    'Other Tint': data.otherTint,
  }, 'Seating & Window');

  const doorsAndStorage = buildRows({
    'Passenger Doors': data.passengerDoors,
    'Door Position': data.passengerDoorPosition,
    'Door Type': data.doorType,
    'Roof Carrier': data.roofCarrier,
    'Diggy Type': data.diggyType,
    'Side Luggage Required': data.sideLuggageReq,
    'Diggy Flooring': data.diggyFlooring,
    'Side Ladder': data.sideLadder,
    'Helper Foot Step': data.helperFootStep,
    'Rear Back Jaal': data.rearBackJaal,
    'Cabin Type': data.cabinType,
  }, 'Doors & Storage');

  const optional = buildRows({
  'Optional Features': Array.isArray(data.optionalFeatures) ? data.optionalFeatures.join(', ') : '-',
  'Fitment Provided': Array.isArray(data.fitmentProvided) ? data.fitmentProvided.join(', ') : '-',
}, 'Optional Features');


  const allSections = [
    ...basicInfo,
    ...busDetails,
    ...chassisDetails,
    ...seatingAndLuggage,
    ...doorsAndStorage,
    ...optional,
  ];

  autoTable(doc, {
    startY: 30,
    head: [['Field', 'Value']],
    body: allSections,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  doc.save(`Enquiry_${data.enquiryId || 'form'}.pdf`);
};
