import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const LuxuryBusForm = () => {
  const router = useRouter();
  const [luxuryData, setLuxuryData] = useState({});
  const [isClient, setIsClient] = useState(false); // Ensure SSR safety

  // Run only on client to access localStorage
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('luxuryForm');
    if (saved) {
      setLuxuryData(JSON.parse(saved));
    }
  }, []);

  // Save form data to localStorage on every update
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('luxuryForm', JSON.stringify(luxuryData));
    }
  }, [luxuryData, isClient]);

  const handleChange = (field, value) => {
    setLuxuryData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Luxury Data Submitted:', luxuryData);
    alert('Luxury details submitted successfully ✅');
    localStorage.removeItem('luxuryForm');
  };

  if (!isClient) return null;

  return (
  <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 py-8 bg-white shadow-lg rounded-xl space-y-8">
    <h1 className="text-4xl font-bold text-center text-blue-700 mb-6">🛋️ Luxury Bus Inquiry Form</h1>

    {/* Window & Seat Info */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg shadow-sm">
      <div>
        <label className="block font-medium mb-1">Window Type</label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={luxuryData["Window Type"] || ""}
          onChange={(e) => handleChange("Window Type", e.target.value)}
        >
          <option value="">Select</option>
          <option value="Sliding Glass">Sliding Glass</option>
          <option value="Pack Glass">Pack Glass</option>
          <option value="Pack Slider Glass">Pack Slider Glass</option>
        </select>
      </div>
      <input
        type="text"
        placeholder="Tint Shade"
        className="border border-gray-300 rounded px-3 py-2 w-full"
        value={luxuryData["Tint Shade"] || ""}
        onChange={(e) => handleChange("Tint Shade", e.target.value)}
      />
      <input
        type="number"
        placeholder="Total Seats"
        className="border border-gray-300 rounded px-3 py-2 w-full"
        value={luxuryData["Total Seats"] || ""}
        onChange={(e) => handleChange("Total Seats", e.target.value)}
      />
    </div>

    {/* Seating Pattern & Type */}
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-4">
      <div>
        <label className="block font-medium mb-1">Seating Pattern</label>
        <div className="flex gap-4">
          {["3 x 2", "2 x 2", "2 x 1"].map((p) => (
            <label key={p} className="flex items-center gap-2">
              <input type="radio" name="seatingPattern" checked={luxuryData["Seating Pattern"] === p} onChange={() => handleChange("Seating Pattern", p)} />
              {p}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-medium mb-1">Seat Type</label>
        <div className="flex gap-4">
          {["High Back", "Push Back"].map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input type="radio" name="seatType" checked={luxuryData["Seat Type"] === type} onChange={() => handleChange("Seat Type", type)} />
              {type}
            </label>
          ))}
        </div>
      </div>
    </div>

    {/* Belt, Curtain, Flooring */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg shadow-sm">
      <div>
        <label className="font-semibold">Seat Belt:</label>
<div className="flex flex-wrap items-center gap-4">
  {["Yes", "No"].map((opt) => (
    <label key={opt} className="flex items-center gap-2">
      <input
        type="radio"
        name="seatBelt"
        checked={luxuryData["Seat Belt"] === opt}
        onChange={() => {
          handleChange("Seat Belt", opt);
          if (opt === "No") handleChange("Belt Type", ""); // reset belt type if No
        }}
      />
      {opt}
    </label>
  ))}

  {/* Conditionally show belt type options */}
  {luxuryData["Seat Belt"] === "Yes" && (
    <div className="flex items-center gap-4 ml-4">
      <span className="font-medium text-sm">Type:</span>
      {["3 PIN", "2 PIN"].map((type) => (
        <label key={type} className="flex items-center gap-2">
          <input
            type="radio"
            name="beltType"
            checked={luxuryData["Belt Type"] === type}
            onChange={() => handleChange("Belt Type", type)}
          />
          {type}
        </label>
      ))}
    </div>
    )}
    </div>
        </div>
      <div>
        <label className="block font-medium mb-1">Seat Material</label>
        <div className="flex gap-4">
          {["Rexine", "Fabric", "Jacquard"].map((mat) => (
            <label key={mat} className="flex items-center gap-2">
              <input type="radio" name="material" checked={luxuryData["Seat Material"] === mat} onChange={() => handleChange("Seat Material", mat)} />
              {mat}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-medium mb-1">Curtain</label>
        <div className="flex gap-4">
          {["Normal", "Roller"].map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <input type="radio" name="curtain" checked={luxuryData["Curtain"] === opt} onChange={() => handleChange("Curtain", opt)} />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-medium mb-1">Flooring Type</label>
        <div className="flex gap-4">
          {["Flat Floor", "Gallery"].map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <input type="radio" name="flooring" checked={luxuryData["Flooring Type"] === opt} onChange={() => handleChange("Flooring Type", opt)} />
              {opt}
            </label>
          ))}
        </div>
      </div>
    </div>

    {/* Add-ons and Signatures */}
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-4">
      <input type="text" placeholder="Diggy Flooring" className="input w-full" value={luxuryData["Diggy Flooring"] || ""} onChange={(e) => handleChange("Diggy Flooring", e.target.value)} />
      <textarea rows="3" placeholder="Add-ons" className="input w-full" value={luxuryData["Add-ons"] || ""} onChange={(e) => handleChange("Add-ons", e.target.value)} />
      <input type="text" placeholder="Form Verifier Name" className="input w-full" value={luxuryData["Form Verifier Name"] || ""} onChange={(e) => handleChange("Form Verifier Name", e.target.value)} />
      <input type="text" placeholder="Designation" className="input w-full" value={luxuryData["Verifier Designation"] || ""} onChange={(e) => handleChange("Verifier Designation", e.target.value)} />
      <input type="text" placeholder="Customer Signature" className="input w-full" value={luxuryData["Customer Signature"] || ""} onChange={(e) => handleChange("Customer Signature", e.target.value)} />
    </div>

    {/* Buttons */}
    <div className="flex flex-col sm:flex-row gap-4 mt-6">
      <button type="button" onClick={() => router.push("/EnquiryForm")} className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 w-full">
        ⬅️ Back to Enquiry Form
      </button>
      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full">
        Submit Luxury Inquiry
      </button>
    </div>
  </form>
);
};

export default LuxuryBusForm;
