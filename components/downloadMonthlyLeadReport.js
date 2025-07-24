import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import BASE_URL from "../utils/api";

export default async function downloadMonthlyLeadReport(startDate, endDate, userId) {
  const token = localStorage.getItem("token");
  if (!token || !userId) {
    alert("User not logged in!");
    return;
  }

  try {
    const res = await axios.get(`${BASE_URL}/api/leads/leads-edited`, {
      params: { startDate, endDate, userId },
      headers: { Authorization: `Bearer ${token}` },
    });

    const leads = res.data.leads;
    const doc = new jsPDF();
    const marginLeft = 14;
    let yPos = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Monthly Lead Edit Report", marginLeft, yPos);
    yPos += 8;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`From: ${startDate} To: ${endDate}`, marginLeft, yPos);
    yPos += 6;
    doc.text(`User: ${leads[0]?.createdBy?.name || "N/A"}`, marginLeft, yPos);
    yPos += 10;

    let totalCalls = 0;
    let connectedCalls = 0;
    let prospects = 0;
    let factoryVisits = 0;
    let meetings = 0;
    let totalFollowUps = 0;

    leads.forEach(lead => {
      const followUps = lead.followUps || [];
      const notes = lead.notes || [];

      totalCalls += followUps.length;
      totalFollowUps += followUps.length;

      if (lead.connectionStatus === "Connected") connectedCalls++;
      if (lead.status === "Hot" || lead.status === "Warm") prospects++;

      [...followUps, ...notes].forEach(entry => {
        const text = (entry.notes || entry.text || "").toLowerCase();
        if (text.includes("factory visit")) factoryVisits++;
        if (text.includes("meeting")) meetings++;
      });
    });

    doc.setFont("helvetica", "bold");
    doc.text("Summary:", marginLeft, yPos);
    yPos += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Total Calls: ${totalCalls}`, marginLeft, yPos); yPos += 6;
    doc.text(`Connected Calls: ${connectedCalls}`, marginLeft, yPos); yPos += 6;
    doc.text(`Prospects (Hot/Warm): ${prospects}`, marginLeft, yPos); yPos += 6;
    doc.text(`Factory Visits: ${factoryVisits}`, marginLeft, yPos); yPos += 6;
    doc.text(`Meetings Generated: ${meetings}`, marginLeft, yPos); yPos += 6;
    doc.text(`Total Follow-ups: ${totalFollowUps}`, marginLeft, yPos); yPos += 10;

    const tableHead = [["S.No", "Client Name", "Status", "Location", "Follow-ups", "Notes"]];

    const tableBody = leads.map((lead, idx) => {
      const followUpsText = (lead.followUps || [])
        .map(f => `${f.date?.split("T")[0]} by ${f.by?.name || "N/A"}:\n${f.notes}`)
        .join("\n\n");
      const notesText = (lead.notes || [])
        .map(n => `${n.date?.split("T")[0]} by ${n.addedBy?.name || "N/A"}:\n${n.text}`)
        .join("\n\n");

      return [
        idx + 1,
        lead.leadDetails.clientName || "N/A",
        lead.status || "N/A",
        lead.leadDetails.location || "N/A",
        followUpsText || "-",
        notesText || "-",
      ];
    });

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: yPos,
      styles: { fontSize: 9, cellPadding: 3, valign: "top" },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: "center" },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 45 },
        5: { cellWidth: 45 },
      },
    });

    doc.save(`MonthlyLeadReport_${startDate}_to_${endDate}.pdf`);
  } catch (err) {
    console.error(err);
    alert("Could not generate monthly report. Try again!");
  }
}
