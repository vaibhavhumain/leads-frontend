import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import BASE_URL from "../utils/api";  // <-- Make sure this exists!

export default async function downloadDailyLeadReport(date, userId) {
  const token = localStorage.getItem("token");
  if (!token || !userId) {
    alert("User not logged in!");
    return;
  }
  try {
    const res = await axios.get(`${BASE_URL}/api/leads/leads-edited`, {
      params: { date, userId },
      headers: { Authorization: `Bearer ${token}` },
    });
    const leads = res.data.leads;

    const doc = new jsPDF();

    doc.text(`Daily Lead Edit Report for ${date}`, 14, 20);
    doc.text(`User: ${leads[0]?.createdBy?.name || ""}`, 14, 30);

    leads.forEach((lead, idx) => {
      doc.setFontSize(12);
      doc.text(`${idx + 1}. ${lead.leadDetails.clientName}`, 14, 40 + idx * 50);
      doc.text(`Status: ${lead.status}`, 14, 46 + idx * 50);
      doc.text(`Location: ${lead.leadDetails.location || ""}`, 14, 52 + idx * 50);

      // Follow-ups
      if (lead.followUps?.length) {
        doc.text("Follow-ups:", 14, 58 + idx * 50);
        lead.followUps.forEach((fup, j) => {
          doc.text(
            `  - ${fup.date?.split("T")[0]} by ${fup.by?.name || ""}: ${fup.notes}`,
            16,
            64 + idx * 50 + j * 6
          );
        });
      }

      // Notes
      if (lead.notes?.length) {
        doc.text("Notes:", 14, 70 + idx * 50 + (lead.followUps?.length || 0) * 6);
        lead.notes.forEach((note, j) => {
          doc.text(
            `  - ${note.date?.split("T")[0]} by ${note.addedBy?.name || ""}: ${note.text}`,
            16,
            76 + idx * 50 + j * 6 + (lead.followUps?.length || 0) * 6
          );
        });
      }
    });

    doc.save(`LeadReport_${date}.pdf`);
  } catch (err) {
    alert("Could not generate report. Try again!");
  }
}
