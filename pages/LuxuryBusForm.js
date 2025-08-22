'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import BASE_URL from "../utils/api";
const Radio = ({ name, value, current, onChange, children }) => (
  <label className="inline-flex items-center gap-2 mr-4 text-sm text-gray-700">
    <input
      type="radio"
      name={name}
      value={value}
      checked={current === value}
      onChange={(e) => onChange(e.target.value)}
      className="accent-blue-600"
    />
    {children}
  </label>
);

const Select = (props) => (
  <select
    {...props}
    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className || ""}`}
  />
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className || ""}`}
  />
);

const Field = ({ label, children, labelClass = "" }) => (
  <div>
    <label className={`block text-sm font-medium text-gray-700 mb-1 ${labelClass}`}>
      {label}
    </label>
    {children}
  </div>
);

export default function LuxuryBusForm() {
  const MODELS = ["Spider", "Hymer", "Kasper", "Arrow", "Tourista"];
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [lastEnquiryId, setLastEnquiryId] = useState(""); 
  const [data, setData] = useState({
    suggestedModel: "",
    windowType: "",
    requiredNoEachSide: "",
    tintOfShades: "",
    otherTint: "",
    totalSeats: "",
    seatingPattern: "",
    seatType: "",
    seatBelt: "",
    seatBeltType: "",
    seatMaterial: "",
    curtain: "",
    flooringType: "",
    passengerDoors: "",
    passengerDoorPosition: "",
    doorType: "",
    roofCarrier: "",
    diggyType: "",
    sideLuggageRequirement: "",
    diggyFlooring: "",
    diggyFlooringOther: "",
    sideLadder: "",
    helperFootStep: "",
    rearBackJaal: "",
    cabinType: "",
  });

  // mount/load
  useEffect(() => {
    setIsClient(true);

    // --- Lead ID ---
    const fromQueryLead = router.query.leadId ? String(router.query.leadId) : "";
    const storedLead = typeof window !== "undefined" ? localStorage.getItem("leadId") || "" : "";
    const id = fromQueryLead || storedLead;
    if (fromQueryLead) localStorage.setItem("leadId", fromQueryLead);
    setLeadId(id);

    // --- Enquiry ID ---
    const fromQueryEnq = router.query.enquiryId ? String(router.query.enquiryId) : "";
    const storedEnq = typeof window !== "undefined" ? localStorage.getItem("enquiryId") || "" : "";
    const enqId = fromQueryEnq || storedEnq;

    if (enqId) {                            
      localStorage.setItem("enquiryId", enqId);
      setLastEnquiryId(enqId);
    }

    const saved = localStorage.getItem("luxuryForm");
    if (saved) setData(JSON.parse(saved));
  }, [router.query.leadId, router.query.enquiryId]);

  // persist draft
  useEffect(() => {
    if (isClient) localStorage.setItem("luxuryForm", JSON.stringify(data));
  }, [data, isClient]);

  const set = (key, value) => setData((p) => ({ ...p, [key]: value }));

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadPdf = async (enquiryId, fresh = false) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in again.");

    const url = `${BASE_URL}/api/enquiry/pdf/${encodeURIComponent(enquiryId)}${fresh ? "?fresh=1" : ""}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("PDF fetch error:", err);
      alert(err.error || err.message || "Failed to download PDF");
      return;
    }
    const blob = await res.blob();
    downloadBlob(blob, `${enquiryId}${fresh ? "-fresh" : ""}.pdf`);
  };

const onSubmit = async (e) => {
  e.preventDefault();

  const id = leadId || localStorage.getItem("leadId");
  if (!id) {
    alert("Lead is missing. Please start from the Enquiry form so we can link this to a Lead.");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("You are not logged in. Please log in and try again.");
    return;
  }

  const luxuryPayload = {
  modelName: data.suggestedModel || "",
  luxuryData: {
    windowType: data.windowType || "",
    requiredNoEachSide: data.requiredNoEachSide || "",
    tintOfShades: data.tintOfShades || "",
    otherTint: data.otherTint || "",
    totalSeats: data.totalSeats || "",
    seatingPattern: data.seatingPattern || "",
    seatType: data.seatType || "",
    seatBelt: data.seatBelt || "",
    seatBeltType: data.seatBeltType || "",
    seatMaterial: data.seatMaterial || "",
    curtain: data.curtain || "",
    flooringType: data.flooringType || "",
    passengerDoors: data.passengerDoors || "",
    passengerDoorPosition: data.passengerDoorPosition || "",
    doorType: data.doorType || "",
    roofCarrier: data.roofCarrier || "",
    diggyType: data.diggyType || "",
    sideLuggageRequirement: data.sideLuggageRequirement || "",
    diggyFlooring:
      data.diggyFlooring === "other"
        ? `other: ${data.diggyFlooringOther || ""}`
        : data.diggyFlooring || "",
    sideLadder: data.sideLadder || "",
    helperFootStep: data.helperFootStep || "",
    rearBackJaal: data.rearBackJaal || "",
    cabinType: data.cabinType || "",
  },
  category: "Luxury",
};
  try {
    // ✅ Save luxury details
    const res = await fetch(`${BASE_URL}/api/enquiry/luxury/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(luxuryPayload),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error("❌ Save error:", result);
      alert(result.message || result.error || "Failed to save luxury details.");
      return;
    }

    alert(result.message || "Luxury details saved ✅");
    // after successful save
router.push(`/EnquiryForm?leadId=${id}`);

    // ✅ Immediately fetch the latest PDF for this lead
    if (result.enquiry?.enquiryId) {
      const enquiryId = result.enquiry.enquiryId;

      const pdfRes = await fetch(`${BASE_URL}/api/enquiry/pdf/${encodeURIComponent(enquiryId)}?fresh=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (pdfRes.ok) {
        const blob = await pdfRes.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${enquiryId}-fresh.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("❌ PDF fetch failed");
        alert("Luxury details saved but PDF download failed.");
      }
    }

    // keep leadId in query string for next steps
    const q = new URLSearchParams(router.query);
    q.set("leadId", id);
    router.replace(`${router.pathname}?${q.toString()}`, undefined, { shallow: true });

  } catch (err) {
    console.error("❌ Network/Server error:", err);
    alert("Network or server error.");
  }
};


  const handleModelSelect = (e) => {
    const model = e.target.value;
    set("suggestedModel", model);
    const draft = { ...data, suggestedModel: model };
    localStorage.setItem("luxuryForm", JSON.stringify(draft));

    const storedEnquiryId = lastEnquiryId || localStorage.getItem("enquiryId") || "";
    const q = new URLSearchParams();
    if (leadId) q.set("leadId", leadId);
    if (storedEnquiryId) q.set("enquiryId", storedEnquiryId);

    if (model) {
      router.push(`/Model${model}?${q.toString()}`);
    }
  };

  if (!isClient) return null;

  return (
    <form onSubmit={onSubmit} className="max-w-6xl mx-auto px-5 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Luxury Bus Inquiry Form
          </h1>
          {lastEnquiryId && (
            <p className="text-xs text-gray-500 mt-1">
              Last enquiry ID: <span className="font-mono">{lastEnquiryId}</span>
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              router.push(
                leadId
                  ? `/EnquiryForm?leadId=${encodeURIComponent(leadId)}`
                  : "/EnquiryForm"
              )
            }
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            ← Back to Enquiry
          </button>

          {/* On-demand download of latest PDF */}
          <button
            type="button"
            onClick={() => {
              if (!lastEnquiryId) return alert("No enquiry yet. Please submit first.");
              downloadPdf(lastEnquiryId, true); // fresh=1
            }}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Download Latest PDF
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow"
          >
            Submit Enquiry
          </button>
        </div>
      </div>

      {/* Suggested Model */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-6">
        <Field label="Suggested Model">
          <Select value={data.suggestedModel} onChange={handleModelSelect}>
            <option value="">Select</option>
            {MODELS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
        </Field>
      </div>

      {/* WINDOW + TINT + TOTAL SEATS + SEATING PATTERN + SEAT TYPE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="Window">
            <Select
              value={data.windowType}
              onChange={(e) => set("windowType", e.target.value)}
            >
              <option value="">Select</option>
              <option value="Sliding Glass">Sliding Glass</option>
              <option value="Pack Glass">Pack Glass</option>
              <option value="Pack slider glass">Pack slider glass</option>
            </Select>
          </Field>

          {data.windowType === "Pack slider glass" && (
            <Field label="If Pack slider glass, required no. of each side">
              <Input
                placeholder="e.g. Left 4 / Right 4"
                value={data.requiredNoEachSide}
                onChange={(e) => set("requiredNoEachSide", e.target.value)}
              />
            </Field>
          )}

          <Field label="Tint of Shades">
            <div className="flex flex-wrap items-center gap-4">
              <Radio
                name="tint"
                value="Light Green"
                current={data.tintOfShades}
                onChange={(v) => set("tintOfShades", v)}
              >
                Light Green
              </Radio>
              <Radio
                name="tint"
                value="other"
                current={data.tintOfShades}
                onChange={(v) => set("tintOfShades", v)}
              >
                other
              </Radio>
            </div>
            {data.tintOfShades === "other" && (
              <Input
                className="mt-2"
                placeholder="Specify tint"
                value={data.otherTint}
                onChange={(e) => set("otherTint", e.target.value)}
              />
            )}
          </Field>

          <Field label="Total Seat">
            <Input
              type="number"
              min="1"
              value={data.totalSeats}
              onChange={(e) => set("totalSeats", e.target.value)}
              placeholder="e.g. 45"
            />
          </Field>

          <Field label="Seating Pattern">
            <div className="flex flex-wrap items-center gap-4">
              <Radio name="seatPattern" value="3x2" current={data.seatingPattern} onChange={(v) => set("seatingPattern", v)}>3 x 2</Radio>
              <Radio name="seatPattern" value="2x2" current={data.seatingPattern} onChange={(v) => set("seatingPattern", v)}>2 x 2</Radio>
              <Radio name="seatPattern" value="2x1" current={data.seatingPattern} onChange={(v) => set("seatingPattern", v)}>2 x 1</Radio>
            </div>
          </Field>

          <Field label="Types of Seats">
            <div className="flex flex-wrap items-center gap-4">
              <Radio name="seatType" value="High Back" current={data.seatType} onChange={(v) => set("seatType", v)}>High Back</Radio>
              <Radio name="seatType" value="Push Back" current={data.seatType} onChange={(v) => set("seatType", v)}>Push Back</Radio>
            </div>
          </Field>
        </div>
      </div>

      {/* BELTS / MATERIAL / CURTAIN / FLOORING */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Field label="Seat Belt">
            <div className="flex flex-wrap items-center gap-4">
              <Radio name="belt" value="YES" current={data.seatBelt} onChange={(v) => set("seatBelt", v)}>YES</Radio>
              <Radio name="belt" value="NO" current={data.seatBelt} onChange={(v) => set("seatBelt", v)}>NO</Radio>
            </div>
            {data.seatBelt === "YES" && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">Type</div>
                <div className="flex items-center gap-4">
                  <Radio name="beltType" value="3 PIN" current={data.seatBeltType} onChange={(v) => set("seatBeltType", v)}>3 PIN</Radio>
                  <Radio name="beltType" value="2 PIN" current={data.seatBeltType} onChange={(v) => set("seatBeltType", v)}>2 PIN</Radio>
                </div>
              </div>
            )}
          </Field>

          <Field label="Seat Material">
            <div className="flex flex-wrap items-center gap-4">
              <Radio name="seatMat" value="REXINE" current={data.seatMaterial} onChange={(v) => set("seatMaterial", v)}>REXINE</Radio>
              <Radio name="seatMat" value="FABRIC" current={data.seatMaterial} onChange={(v) => set("seatMaterial", v)}>FABRIC</Radio>
              <Radio name="seatMat" value="JACQUARD" current={data.seatMaterial} onChange={(v) => set("seatMaterial", v)}>JACQUARD</Radio>
            </div>
          </Field>

          <Field label="Curtain">
            <div className="flex flex-wrap items-center gap-4">
              <Radio name="curtain" value="NORMAL" current={data.curtain} onChange={(v) => set("curtain", v)}>NORMAL</Radio>
              <Radio name="curtain" value="ROLLER" current={data.curtain} onChange={(v) => set("curtain", v)}>ROLLER</Radio>
            </div>
          </Field>

          <Field label="Flooring Type">
            <div className="flex flex-wrap items-center gap-4">
              <Radio name="flooring" value="FLAT FLOOR" current={data.flooringType} onChange={(v) => set("flooringType", v)}>FLAT FLOOR</Radio>
              <Radio name="flooring" value="GALLERY" current={data.flooringType} onChange={(v) => set("flooringType", v)}>GALLERY</Radio>
            </div>
          </Field>
        </div>
      </div>

      {/* DOORS / ROOF / DIGGY */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="No. of Passenger Door">
            <div className="flex items-center gap-4">
              <Radio name="doors" value="1" current={data.passengerDoors} onChange={(v) => set("passengerDoors", v)}>1</Radio>
              <Radio name="doors" value="2" current={data.passengerDoors} onChange={(v) => set("passengerDoors", v)}>2</Radio>
            </div>
          </Field>

          <Field label="Position of Passenger Door">
            <div className="flex flex-wrap items-center gap-4">
              <Radio name="doorPos" value="Front" current={data.passengerDoorPosition} onChange={(v) => set("passengerDoorPosition", v)}>Front</Radio>
              <Radio name="doorPos" value="Rear" current={data.passengerDoorPosition} onChange={(v) => set("passengerDoorPosition", v)}>Rear</Radio>
              <Radio name="doorPos" value="Both" current={data.passengerDoorPosition} onChange={(v) => set("passengerDoorPosition", v)}>Both</Radio>
            </div>
          </Field>

          <Field label="Types of Door">
            <div className="flex items-center gap-4">
              <Radio name="doorType" value="In Swing" current={data.doorType} onChange={(v) => set("doorType", v)}>In Swing</Radio>
              <Radio name="doorType" value="Out Swing" current={data.doorType} onChange={(v) => set("doorType", v)}>Out Swing</Radio>
            </div>
          </Field>

          <Field label="Roof Luggage Carrier">
            <div className="flex items-center gap-4">
              <Radio name="roof" value="Half" current={data.roofCarrier} onChange={(v) => set("roofCarrier", v)}>Half</Radio>
              <Radio name="roof" value="Full" current={data.roofCarrier} onChange={(v) => set("roofCarrier", v)}>Full</Radio>
            </div>
          </Field>

          <Field label="Diggy">
            <div className="flex items-center gap-4">
              <Radio name="diggy" value="Belly Diggy" current={data.diggyType} onChange={(v) => set("diggyType", v)}>Belly Diggy</Radio>
              <Radio name="diggy" value="Normal Diggy" current={data.diggyType} onChange={(v) => set("diggyType", v)}>Normal Diggy</Radio>
            </div>
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Any specific requirement for Side Luggage / Tools / Battery Box">
            <textarea
              rows={3}
              value={data.sideLuggageRequirement}
              onChange={(e) => set("sideLuggageRequirement", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type here…"
            />
          </Field>
        </div>
      </div>

      {/* LOWER GRID */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Field label="Diggy Flooring">
            <div className="flex flex-wrap items-center gap-4">
              <Radio name="diggyFloor" value="Chaquad plate" current={data.diggyFlooring} onChange={(v) => set("diggyFlooring", v)}>Chaquad plate</Radio>
              <Radio name="diggyFloor" value="Carpet mat" current={data.diggyFlooring} onChange={(v) => set("diggyFlooring", v)}>Carpet mat</Radio>
              <Radio name="diggyFloor" value="other" current={data.diggyFlooring} onChange={(v) => set("diggyFlooring", v)}>other</Radio>
            </div>
            {data.diggyFlooring === "other" && (
              <Input
                className="mt-2"
                placeholder="Specify"
                value={data.diggyFlooringOther}
                onChange={(e) => set("diggyFlooringOther", e.target.value)}
              />
            )}
          </Field>

          <Field label="Side Ladder">
            <div className="flex items-center gap-4">
              <Radio name="ladder" value="YES" current={data.sideLadder} onChange={(v) => set("sideLadder", v)}>YES</Radio>
              <Radio name="ladder" value="NO" current={data.sideLadder} onChange={(v) => set("sideLadder", v)}>NO</Radio>
              <Radio name="ladder" value="SINGLE" current={data.sideLadder} onChange={(v) => set("sideLadder", v)}>SINGLE</Radio>
            </div>
          </Field>

          <Field label="Helper Foot Step for Passenger Door">
            <div className="flex items-center gap-4">
              <Radio name="footstep" value="YES" current={data.helperFootStep} onChange={(v) => set("helperFootStep", v)}>YES</Radio>
              <Radio name="footstep" value="NO" current={data.helperFootStep} onChange={(v) => set("helperFootStep", v)}>NO</Radio>
            </div>
          </Field>

          <Field label="Rear Back Jal">
            <div className="flex items-center gap-4">
              <Radio name="rearJal" value="YES" current={data.rearBackJaal} onChange={(v) => set("rearBackJaal", v)}>YES</Radio>
              <Radio name="rearJal" value="NO" current={data.rearBackJaal} onChange={(v) => set("rearBackJaal", v)}>NO</Radio>
            </div>
          </Field>

          <Field label="Cabin">
            <div className="flex flex-wrap items-center gap-4">
              <Radio name="cabin" value="FULL CABIN" current={data.cabinType} onChange={(v) => set("cabinType", v)}>FULL CABIN</Radio>
              <Radio name="cabin" value="HALF CABIN" current={data.cabinType} onChange={(v) => set("cabinType", v)}>HALF CABIN</Radio>
              <Radio name="cabin" value="WITHOUT CABIN" current={data.cabinType} onChange={(v) => set("cabinType", v)}>WITHOUT CABIN</Radio>
            </div>
          </Field>
        </div>
      </div>
    </form>
  );
}
