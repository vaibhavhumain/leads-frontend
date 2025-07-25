import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
}

const downloadLeadReport = (lead, timerLogs = [], activities = []) => {
  if (!lead) {
    alert("No lead loaded!");
    return;
  }

  const basicInfo = {
    "Client Name": lead.leadDetails?.clientName || "",
    "Company Name": lead.leadDetails?.companyName || "",
    "Location": lead.leadDetails?.location || "",
    "Email": lead.leadDetails?.email || "",
    "Contacts": (lead.leadDetails?.contacts || []).map(c => c.number).join(", "),
    "Status": lead.status || "",
    "Connection": lead.connectionStatus || "",
    "Created At": lead.createdAt ? new Date(lead.createdAt).toLocaleString("en-IN") : "",
    "Updated At": lead.updatedAt ? new Date(lead.updatedAt).toLocaleString("en-IN") : "",
    "Lifecycle Status": lead.lifecycleStatus || "",
    "Last Edited At": lead.lastEditedAt
      ? new Date(lead.lastEditedAt).toLocaleString("en-IN")
      : "",
  };
  const basicArr = Object.entries(basicInfo).map(([key, value]) => ({
    Property: key,
    Value: value,
  }));

  const timerLogsSheet = timerLogs.length
    ? [
        ["Time", "By", "At"],
        ...timerLogs.map(log => [
          formatTime(log.duration),
          log.stoppedByName,
          log.stoppedAt ? new Date(log.stoppedAt).toLocaleString("en-IN") : "",
        ]),
      ]
    : [["No timer logs"]];

  const notesArr = Array.isArray(lead.notes) && lead.notes.length
    ? [
        ["Date", "By", "Note"],
        ...lead.notes.map(note => [
          note.date ? new Date(note.date).toLocaleDateString("en-IN") : "",
          note.addedBy?.name || "",
          note.text || "",
        ]),
      ]
    : [["No notes"]];

  const followUpsArr = Array.isArray(lead.followUps) && lead.followUps.length
    ? [
        ["Date", "By", "Notes"],
        ...lead.followUps.map(fu => [
          fu.date ? fu.date.split("T")[0] : "",
          fu.by?.name || "",
          fu.notes || "",
        ]),
      ]
    : [["No follow-ups"]];

  const activitiesArr = Array.isArray(activities) && activities.length
    ? [
        ["Type", "By", "Date", "Location", "Outcome", "Remarks"],
        ...activities.map(act => [
          act.type === "factory_visit" ? "Factory Visit" : "In-Person Meeting",
          act.conductedBy?.name || "",
          act.date ? new Date(act.date).toLocaleDateString("en-IN") : "",
          act.location || "",
          act.outcome || "",
          act.remarks || "",
        ]),
      ]
    : [["No activities"]];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(basicArr), "Basic Info");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(timerLogsSheet), "Timer Logs");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(notesArr), "Notes");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(followUpsArr), "Follow-Ups");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(activitiesArr), "Activities");
  const blob = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([blob]),
    `Lead_Report_${lead.leadDetails?.clientName?.replace(/[^a-z0-9]/gi, "_") || lead._id}.xlsx`
  );
};

export default downloadLeadReport;
