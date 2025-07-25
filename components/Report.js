import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import BASE_URL from "../utils/api";

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
    const doc = new jsPDF("landscape", "mm", "a4"); 
    const marginLeft = 14;
    let yPos = 20;

    // 🧾 Report Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Daily Lead Edit Report`, marginLeft, yPos);
    yPos += 8;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${date}`, marginLeft, yPos);
    yPos += 6;
    doc.text(`User: ${leads[0]?.createdBy?.name || "N/A"}`, marginLeft, yPos);
    yPos += 10;

    // 📋 Table Definition
    const tableHead = [
      [
        "S.No",
        "Client Name",
        "Status",
        "Location",
        "Lifecycle",
        "Time Taken",
        "Follow-ups",
        "Notes",
      ],
    ];

    const tableBody = leads.map((lead, idx) => {
      const followUpsText = (lead.followUps || [])
        .map(
          (fup) =>
            `${fup.date?.split("T")[0]} by ${fup.by?.name || "N/A"}:\n${fup.notes}`
        )
        .join("\n--------------------\n");

      const notesText = (lead.notes || [])
        .map(
          (note) =>
            `${note.date?.split("T")[0]} by ${note.addedBy?.name || "N/A"}:\n${note.text}`
        )
        .join("\n--------------------\n");

      const lifecycle = lead.lifecycleStatus || "N/A";

      // ⏱️ Calculate Total Time
      const totalTimeMinutes = (lead.timerLogs || []).reduce((total, log) => {
        return total + (log.pausedDuration || 0);
      }, 0);
      const timeTakenFormatted = totalTimeMinutes > 0 ? `${totalTimeMinutes} min` : "-";

      return [
        idx + 1,
        lead.leadDetails.clientName || "N/A",
        lead.status || "N/A",
        lead.leadDetails.location || "N/A",
        lifecycle,
        timeTakenFormatted,
        followUpsText || "-",
        notesText || "-",
      ];
    });

    // 📑 AutoTable Rendering
    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: yPos,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        valign: "top",
        overflow:"linebreak",
      },
      useCss:true,
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 30 },
        2: { cellWidth: 22 },
        3: { cellWidth: 28 },
        4: { cellWidth: 20 },
        5: { cellWidth: 22 },
        6: { cellWidth: 60, overflow: "linebreak" },
        7: { cellWidth: 50, overflow: "linebreak" },
      },
    });

    doc.save(`LeadReport_${date}.pdf`);
  } catch (err) {
    console.error(err);
    alert("Could not generate report. Try again!");
  }
}
