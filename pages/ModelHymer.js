// pages/ArrowBusForm.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getModelConfig, EXTRA_COST_FITMENTS } from "../utils/models";
import BASE_URL from "../utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
 
const otherKey = (key) => `${key}__Other`;

const FieldLabel = ({ children }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const Section = ({ title, subtitle, children }) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
    <div className="px-5 py-4 border-b border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

export default function HymerBusForm() {
  const router = useRouter();

  // keep leadId from query or localStorage, and persist it
  const [leadId, setLeadId] = useState("");
  useEffect(() => {
    if (!router.isReady) return;

    const fromLead = router.query.leadId ? String(router.query.leadId) : "";
    const storedLead =
      typeof window !== "undefined" ? localStorage.getItem("leadId") || "" : "";
    const lead = fromLead || storedLead;
    if (fromLead) localStorage.setItem("leadId", fromLead);
    setLeadId(lead);
  }, [router.isReady, router.query.leadId]);

  const [isClient, setIsClient] = useState(false);
  const [luxuryData, setLuxuryData] = useState({});

  const MODEL_NAME = "Hymer";
  const modelConfig = getModelConfig(MODEL_NAME); 

  const customExtras = Array.isArray(luxuryData["EXTRA::CUSTOM_LIST"])
    ? luxuryData["EXTRA::CUSTOM_LIST"]
    : [];

  // load saved form
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem("luxuryForm");
      if (saved) setLuxuryData(JSON.parse(saved));
    } catch {}
  }, []);

  // persist form
  useEffect(() => {
    if (isClient) localStorage.setItem("luxuryForm", JSON.stringify(luxuryData));
  }, [luxuryData, isClient]);

  const handleChange = (field, value) =>
    setLuxuryData((prev) => ({ ...prev, [field]: value }));

  const addCustomExtra = () => {
    const next = [...customExtras, { name: "", desc: "" }];
    handleChange("EXTRA::CUSTOM_LIST", next);
  };

  const updateCustomExtra = (idx, key, value) => {
    const next = customExtras.map((row, i) =>
      i === idx ? { ...row, [key]: value } : row
    );
    handleChange("EXTRA::CUSTOM_LIST", next);
  };

  const removeCustomExtra = (idx) => {
    const next = customExtras.filter((_, i) => i !== idx);
    handleChange("EXTRA::CUSTOM_LIST", next);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!leadId) {
      alert("❌ No leadId found. Please go back and start from Enquiry form.");
      return;
    }

    const payload = {
      modelName: MODEL_NAME,
      standardFitments: (getModelConfig(MODEL_NAME).standardFitments || []).map(
        (f) => ({
          key: f.key,
          label: f.label,
          suggested: f.suggested,
          choice: luxuryData[`${f.key}__Choice`] || "Suggested",
          otherValue: luxuryData[`${f.key}__Other`] || "",
        })
      ),
      optionalFitmentsSelected: luxuryData.optionalFitmentsSelected || [],
      extraCostFitments: EXTRA_COST_FITMENTS.map((f) => ({
        key: f.key,
        label: f.label,
        checked: !!luxuryData[`${f.key}__Checked`],
        company: luxuryData[`${f.key}__Company`] || "",
      })),
      customExtras: luxuryData["EXTRA::CUSTOM_LIST"] || [],
      luxuryData,
    };

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/enquiry/luxury/${leadId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save luxury data");
toast.success("Luxury details saved ✅");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("❌ Failed to save luxury details");

    }
  };

  if (!isClient) return null;

  // --- renderer for standard fitments ---
  const renderStandardFitmentRow = ({ key, label, suggested }) => {
    const choice =
      luxuryData[`${key}__Choice`] || (suggested ? "Suggested" : "Other");
    return (
      <div key={key} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="font-medium text-gray-800">{label}</div>
          <div className="flex items-center gap-4 text-sm">
            {suggested && (
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name={`${key}__Choice`}
                  checked={choice === "Suggested"}
                  onChange={() => handleChange(`${key}__Choice`, "Suggested")}
                />
                Use Suggested
              </label>
            )}
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name={`${key}__Choice`}
                checked={choice === "Other"}
                onChange={() => handleChange(`${key}__Choice`, "Other")}
              />
              Other
            </label>
          </div>
        </div>

        {suggested && (
          <div
            className={`mt-2 text-sm ${
              choice === "Suggested"
                ? "text-gray-700"
                : "text-gray-400 line-through"
            }`}
          >
            <span className="font-semibold">Suggested:</span> {suggested || "-"}
          </div>
        )}

        <input
          type="text"
          placeholder="Other (specify)"
          className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={choice === "Other" ? luxuryData[otherKey(key)] || "" : ""}
          onChange={(e) => handleChange(otherKey(key), e.target.value)}
          disabled={choice !== "Other"}
        />
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} className="max-w-6xl mx-auto px-5 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Luxury Bus Inquiry Form
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Standard & optional fitments for <b>{MODEL_NAME}</b>.
          </p>
        </div>
        <div className="flex gap-3">
          {/* keep leadId on return */}
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
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow"
          >
            Save
          </button>
        </div>
      </div>

      {/* Standard Fitments */}
      <Section
        title={`Standard Fitments — ${MODEL_NAME}`}
        subtitle='Choose “Other” to override any suggested spec.'
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(modelConfig.standardFitments ?? []).map(renderStandardFitmentRow)}
        </div>
      </Section>

      {/* Optional Fitment at Extra Cost */}
      <Section
        title="Optional Fitment at Extra Cost"
        subtitle="Select items to include and add the Company / Description for clarity."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {EXTRA_COST_FITMENTS.map(({ key, label }, idx) => {
            const checked = !!luxuryData[`${key}__Checked`];
            return (
              <div
                key={key}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <label className="flex items-center gap-3 font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        handleChange(`${key}__Checked`, e.target.checked)
                      }
                    />
                    <span className="leading-tight">
                      <span className="mr-2 text-xs text-gray-500">
                        #{String(idx + 1).padStart(2, "0")}
                      </span>
                      {label}
                    </span>
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Company / Description"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={luxuryData[`${key}__Company`] || ""}
                  onChange={(e) =>
                    handleChange(`${key}__Company`, e.target.value)
                  }
                  disabled={!checked}
                />
              </div>
            );
          })}
        </div>

        {/* Custom rows */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">Other (Custom) Items</h4>
            <button
              type="button"
              onClick={addCustomExtra}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              + Add Row
            </button>
          </div>

          {customExtras.length === 0 && (
            <p className="text-sm text-gray-500">No custom items added yet.</p>
          )}

          <div className="space-y-3">
            {customExtras.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3"
              >
                <div className="md:col-span-5">
                  <FieldLabel>Particular</FieldLabel>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter item name"
                    value={row.name}
                    onChange={(e) => updateCustomExtra(i, "name", e.target.value)}
                  />
                </div>
                <div className="md:col-span-6">
                  <FieldLabel>Company / Description</FieldLabel>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter company or description"
                    value={row.desc}
                    onChange={(e) => updateCustomExtra(i, "desc", e.target.value)}
                  />
                </div>
                <div className="md:col-span-1 flex md:items-end">
                  <button
                    type="button"
                    onClick={() => removeCustomExtra(i)}
                    className="w-full md:w-auto px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-end gap-3">
        {/* Back to Luxury form, keep leadId */}
        <button
          type="button"
          onClick={() =>
            router.push(
              leadId
                ? `/LuxuryBusForm?leadId=${encodeURIComponent(leadId)}`
                : "/LuxuryBusForm"
            )
          }
          className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
        >
          ← Go Back to Luxury Form
        </button>
        <ToastContainer position="top-right" autoClose={3000} pauseOnHover={false} theme="colored" />
      </div>
    </form>
    
  );
}
