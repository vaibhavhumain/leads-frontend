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
    // ✅ Fetch user name using userId
    const userRes = await axios.get(`${BASE_URL}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userName = userRes.data?.name || "N/A";

    // ✅ Fetch leads edited by user on given date
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
    doc.text(`User: ${userName}`, marginLeft, yPos);
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

      // ⏱️ Correct: Use log.duration (not pausedDuration)
      const totalSeconds = (lead.timerLogs || []).reduce((total, log) => {
        return total + (log.duration || 0);
      }, 0);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const timeTakenFormatted =
        totalSeconds > 0
          ? `${hours > 0 ? `${hours}h ` : ""}${minutes > 0 ? `${minutes}m ` : ""}${seconds}s`
          : "-";

      return [
        idx + 1,
        lead.leadDetails?.clientName || "N/A",
        lead.status || "N/A",
        lead.leadDetails?.location || "N/A",
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
        overflow: "linebreak",
      },
      useCss: true,
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
        5: { cellWidth: 25 },
        6: { cellWidth: 60, overflow: "linebreak" },
        7: { cellWidth: 50, overflow: "linebreak" },
      },
    });

    // ✅ Save with user name in filename
    doc.save(`LeadReport_${date}_${userName}.pdf`);
  } catch (err) {
    console.error(err);
    alert("Could not generate report. Try again!");
  }
}
