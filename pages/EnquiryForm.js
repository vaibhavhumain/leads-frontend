'use client';
import { useState , useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import BASE_URL from '../utils/api';
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar';

export default function EnquiryForm() {
  const [stage, setStage] = useState(1);
  const [category, setCategory] = useState('');
  const [submittedData, setSubmittedData] = useState(null);
  const router = useRouter();
  const leadId = router.query.leadId || (typeof window !== 'undefined' ? localStorage.getItem('leadId') : null);

  function generateEnquiryId(userName) {
    const initials = userName ? userName.substring(0, 3).toUpperCase() : "USR";
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `GC-${initials}-${yyyy}${mm}${dd}`;
  }

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    city: '',
    teamMember: '',
    companyDetails: '',
    enquiryId: generateEnquiryId(
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user"))?.name || "USR"
        : "USR"
    ),
    busType: '',
    otherBusType: '',
    featureRequirement: '',
    acPreference: '',
    chassisBought: '',
    chassisPurchaseTime: '',
    chassisCompanyName: '',
    chassisModel: '',
    wheelBase: '',
    tyreSize: '',
    length: '',
    width: '',
    seatingPattern: '',
    numberOfSeats: '',
    additionalNote: '',
    referralSource: '',
    windowType: '',
    requiredNoEachSide: '',
    tintOfShades: '',
    otherTint: '',
    totalSeats: '',
    seatType: '',
    seatMaterial: '',
    curtain: '',
    flooringType: '',
    passengerDoors: '',
    passengerDoorPosition: '',
    doorType: '',
    roofCarrier: '',
    diggyType: '',
    sideLuggageReq: '',
    diggyFlooring: '',
    sideLadder: '',
    helperFootStep: '',
    rearBackJaal: '',
    cabinType: '',
    specificRequirement: '',
    suggestedModel: '',
    businessTypeOfBuses: '',
    businessNumberOfBuses: '',
    businessPreviousBodyBuilder: '',
    businessBusesPerYear: '',
    businessEmployees: '',
    businessExpertiseArea: '',
    education: '',
    hobbies: '',
    behavior: '',
    customerType: '',
    optionalFeatures: [],
    fitmentProvided: [],
  });

  useEffect(() => {
    if (!router.isReady || !leadId) return;

    const fetchLead = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/api/leads/${leadId}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!data?.lead || !data.lead.leadDetails) return;

        const lead = data.lead;
        setFormData((prev) => ({
          ...prev,
          customerName: lead.leadDetails.clientName || '',
          customerPhone: lead.leadDetails.contacts?.[0]?.number || '',
          customerEmail: lead.leadDetails.email || '',
          city: lead.leadDetails.location || '',
          teamMember: lead.createdBy?.name || '',
          companyDetails: lead.leadDetails.companyName || '',
        }));
      } catch (error) {
        console.error("❌ Error fetching lead:", error);
      }
    };

    fetchLead();
  }, [router.isReady, leadId]);

  const windowOptions = ['Sliding Glass', 'Pack Glass', 'Pack Slider Glass'];
  const tintOptions = ['Light Green', 'Other'];
  const seatingPatternOptions = ['3X2', '2X2', '2X1'];
  const seatTypeOptions = ['High Back', 'Push Back'];
  const yesNoOptions = ['Yes', 'No'];
  const seatMaterialOptions = ['Rexine', 'Fabric', 'Jacquard'];
  const curtainOptions = ['Normal', 'Roller'];
  const flooringOptions = ['Flat Floor', 'Gallery'];
  const passengerDoorOptions = ['1', '2'];
  const passengerDoorPositionOptions = ['Front', 'Rear', 'Both'];
  const doorTypeOptions = ['In Swing', 'Out Swing'];
  const roofCarrierOptions = ['Half', 'Full'];
  const diggyTypeOptions = ['Belly Diggy', 'Normal Diggy'];
  const diggyFlooringOptions = ['Chaquad Plate', 'Carpet Mat'];
  const cabinOptions = ['Full Cabin', 'Half Cabin', 'Without Cabin'];
  const suggestedModels = ['Spider', 'Hymer', 'Kasper', 'Arrow', 'Tourista', 'Victor'];

  const optionalFeaturesOptions = [
    { value: 'Music System', label: 'Music System' },
    { value: 'CCTV Camera', label: 'CCTV Camera' },
    { value: 'LCD', label: 'LCD' },
    { value: 'AC', label: 'AC' },
    { value: 'Speaker', label: 'Speaker' },
    { value: 'Invertor', label: 'Invertor' },
    { value: 'Battery', label: 'Battery' },
    { value: 'Additional Horn', label: 'Additional Horn' },
    { value: 'Others', label: 'Others' },
  ];

  const fitmentOptions = [
    { value: 'Wiper Motor', label: 'Wiper Motor' },
    { value: 'Fan', label: 'Fan' },
    { value: 'Digital Seat Number', label: 'Digital Seat Number' },
    { value: '3 Pin Charger', label: '3 Pin Charger' },
    { value: 'Curtain', label: 'Curtain' },
    { value: 'Normal Roof Hatch in Driver Cabin(Not in Victor Model)', label: 'Normal Roof Hatch in Driver Cabin(Not in Victor Model)' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const user = JSON.parse(localStorage.getItem('user'));
    const createdBy = user?._id;

    if (!createdBy) {
      toast.error('User not logged in.');
      setLoading(false);
      return;
    }

    let theLeadId = localStorage.getItem('leadId');
    if (!theLeadId || theLeadId === 'null' || theLeadId === '') {
      const leadDetails = {
        clientName: formData.customerName,
        companyName: formData.companyDetails,
        contacts: [{ number: formData.customerPhone, label: 'Primary' }],
        location: formData.city,
        email: formData.customerEmail,
      };
      try {
        const token = localStorage.getItem('token');
        const leadRes = await fetch(`${BASE_URL}/api/leads/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ leadDetails }),
        });
        const leadResult = await leadRes.json();
        if (leadRes.ok) {
          theLeadId = leadResult.lead._id;
          localStorage.setItem('leadId', theLeadId);
        } else {
          toast.error("Failed to create lead. " + leadResult.message);
          setLoading(false);
          return;
        }
      } catch (error) {
        toast.error("Failed to create lead.");
        setLoading(false);
        return;
      }
    }

    const combinedData = {
  ...formData,
  enquiryId: formData.enquiryId || generateEnquiryId(user?.name),
  category,
  createdBy,
  leadId: theLeadId,
};


    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/enquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(combinedData),
      });

      const result = await res.json();
      if (res.ok) {
  toast.success(`✅ ${result.message || 'Enquiry submitted successfully!'}`);

  if (result.leadId) localStorage.setItem("leadId", result.leadId);
if (result.enquiryId) localStorage.setItem("enquiryId", result.enquiryId);

setSubmittedData({
  ...combinedData,
  leadId: result.leadId,
  enquiryId: result.enquiryId,
});

 if (category === "Luxury") {
  router.push(`/LuxuryBusForm?leadId=${result.leadId}&enquiryId=${result.enquiryId}`);
} else {
  router.push(`/enquiry/pdf/${result.leadId}?enquiryId=${result.enquiryId}`);
}
  resetForm();
}
 else {
        toast.error(`❌ ${result.message || result.error || 'Submission failed.'}`);
      }
    } catch (error) {
      console.error('❌ Submission error:', error);
      toast.error('🚫 Network or server error.');
    } finally {
      setLoading(false);
    }
  };

  // add this new function
const handleStage1Next = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const createdBy = user?._id;
  if (!createdBy) {
    toast.error("User not logged in.");
    return;
  }

  let theLeadId = leadId || localStorage.getItem("leadId");
  if (!theLeadId) {
    toast.error("Lead ID missing.");
    return;
  }

  const dataToSave = {
    ...formData,
    createdBy,
    leadId: theLeadId,
  };

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/enquiry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(dataToSave),
    });
    const result = await res.json();
    if (res.ok) {
      localStorage.setItem("enquiryId", result.enquiryId);
      toast.success("Stage 1 saved ✅");
      setStage(2);
    } else {
      toast.error(result.error || "Failed to save Stage 1");
    }
  } catch (err) {
    console.error(err);
    toast.error("Server error while saving Stage 1");
  }
};


  // when category changes, send to separate luxury page
  const handleCategoryChange = (e) => {
    const next = e.target.value;
    setCategory(next);

    localStorage.setItem("enquiryDraft", JSON.stringify({ formData, leadId }));

    if (next === "Luxury") {
      const q = leadId ? `?leadId=${encodeURIComponent(leadId)}` : "";
      router.push(`/LuxuryBusForm${q}`);
    }
  };

  const resetForm = () => {
    setFormData({
      enquiryId: generateEnquiryId(
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("user"))?.name || "USR"
          : "USR"
      ),
      busType: '',
      otherBusType: '',
      featureRequirement: '',
      acPreference: '',
      chassisBought: '',
      chassisPurchaseTime: '',
      chassisCompanyName: '',
      chassisModel: '',
      wheelBase: '',
      tyreSize: '',
      length: '',
      width: '',
      seatingPattern: '',
      numberOfSeats: '',
      additionalNote: '',
      referralSource: '',
      windowType: '',
      requiredNoEachSide: '',
      tintOfShades: '',
      otherTint: '',
      totalSeats: '',
      seatType: '',
      seatMaterial: '',
      curtain: '',
      flooringType: '',
      passengerDoors: '',
      passengerDoorPosition: '',
      doorType: '',
      roofCarrier: '',
      diggyType: '',
      sideLuggageReq: '',
      diggyFlooring: '',
      sideLadder: '',
      helperFootStep: '',
      rearBackJaal: '',
      cabinType: '',
      specificRequirement: '',
      suggestedModel: '',
      fitmentProvided: '',
    });
    setCategory('');
    setStage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Customer Enquiry Form</h2>

        {submittedData?.leadId && (
  <div className="mt-6 text-center">
    <button
      onClick={() => router.push(`/PdfViewer?leadId=${submittedData.leadId}`)}
      className="inline-block bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
    >
      View All PDFs
    </button>
  </div>
)}

        <form onSubmit={handleSubmit} className="space-y-6">
          {stage === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <h3 className="md:col-span-2 text-xl font-semibold mt-4 mb-2">Lead Details</h3>

              <InputField label="Client Name" name="customerName" value={formData.customerName} onChange={handleChange} required />
              <InputField label="Phone Number" name="customerPhone" value={formData.customerPhone} onChange={handleChange} required />
              <InputField label="Email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} />
              <InputField label="Company Name" name="companyDetails" value={formData.companyDetails} onChange={handleChange} />
              <InputField label="City" name="city" value={formData.city} onChange={handleChange} />
              <InputField label="Team Member (Created By)" name="teamMember" value={formData.teamMember} onChange={handleChange} readOnly />

              <h3 className="md:col-span-2 text-xl font-semibold mt-8 mb-2">Personal Details</h3>
              <InputField label="Education" name="education" value={formData.education} onChange={handleChange} />
              <InputField label="Hobbies" name="hobbies" value={formData.hobbies} onChange={handleChange} />
              <InputField label="Behavior" name="behavior" value={formData.behavior} onChange={handleChange} />

              <h3 className="md:col-span-2 text-xl font-semibold mt-8 mb-2">Business Details</h3>
              <InputField label="Type of Buses in Fleet" name="businessTypeOfBuses" value={formData.businessTypeOfBuses} onChange={handleChange} />
              <InputField label="Number of Buses in Fleet" name="businessNumberOfBuses" value={formData.businessNumberOfBuses} onChange={handleChange} type="number" />
              <InputField label="Previous Bus Body Builder" name="businessPreviousBodyBuilder" value={formData.businessPreviousBodyBuilder} onChange={handleChange} />
              <InputField label="Number of Buses Made in a Year" name="businessBusesPerYear" value={formData.businessBusesPerYear} onChange={handleChange} type="number" />
              <InputField label="Number of Employees" name="businessEmployees" value={formData.businessEmployees} onChange={handleChange} type="number" />
              <InputField label="Area of Expertise" name="businessExpertiseArea" value={formData.businessExpertiseArea} onChange={handleChange} />

              <SelectField
                label="Customer Type"
                name="customerType"
                value={formData.customerType}
                onChange={handleChange}
                options={['Amazing','Bread winning','Convenience','Dangerous']}
              />

              <InputField label="Phone Number" name="customerPhone" value={formData.customerPhone} onChange={handleChange} required />
              <InputField label="Email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} type="email" />
              <SelectField label="Bus Type" name="busType" value={formData.busType} onChange={handleChange} options={['Passenger/Route','Tourist','Sleeper','School','Staff','Other']} />
              {formData.busType === 'Other' && (
                <InputField label="Other Bus Type" name="otherBusType" value={formData.otherBusType} onChange={handleChange} />
              )}
              <SelectField label="Feature Requirement" name="featureRequirement" value={formData.featureRequirement} onChange={handleChange} options={['Luxury','Sleeper','Semi-Deluxe','Other']} />
              <SelectField label="AC Preference" name="acPreference" value={formData.acPreference} onChange={handleChange} options={['Yes','No']} />
              <SelectField label="Have you purchased the chassis?" name="chassisBought" value={formData.chassisBought} onChange={handleChange} options={['Yes','No']} />
              {formData.chassisBought === 'No' && (
                <SelectField label="When will you purchase it?" name="chassisPurchaseTime" value={formData.chassisPurchaseTime} onChange={handleChange} options={['7 Days','15 Days','With in a Month','More than a Month']} />
              )}
              <InputField label="Chassis Company Name" name="chassisCompanyName" value={formData.chassisCompanyName} onChange={handleChange} />
              <InputField label="Chassis Model" name="chassisModel" value={formData.chassisModel} onChange={handleChange} />
              <InputField label="Wheel Base" name="wheelBase" value={formData.wheelBase} onChange={handleChange} />
              <InputField label="Tyre Size" name="tyreSize" value={formData.tyreSize} onChange={handleChange} />
              <InputField label="Length" name="length" value={formData.length} onChange={handleChange} />
              <InputField label="Width" name="width" value={formData.width} onChange={handleChange} />
              <SelectField label="Seating Pattern" name="seatingPattern" value={formData.seatingPattern} onChange={handleChange} options={['3X2','2X2','2X1']} />
              <InputField type='number' label="Number of Seats" name="numberOfSeats" value={formData.numberOfSeats} onChange={handleChange} />
              <InputField label="Additional Note" name="additionalNote" value={formData.additionalNote} onChange={handleChange} />
              <SelectField label="How did you hear about us?" name="referralSource" value={formData.referralSource} onChange={handleChange} options={['Google/Website','Insta/Youtube/Facebook','Referral','Other']} />

              <div className="md:col-span-2 text-center mt-4">
                <button
  type="button"
  onClick={handleStage1Next}
  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
>
  Next
</button>

              </div>
            </motion.div>
          )}

          {stage === 2 && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Bus Category</label>
                <select
                  name="category"
                  value={category}
                  onChange={handleCategoryChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Sleeper">Sleeper</option>
                  <option value="Semi-Deluxe">Semi-Deluxe</option>
                </select>
              </div>

              {/* No inline luxury form here anymore */}

              <div className="flex justify-between mt-4">
                <button type="button" onClick={() => setStage(1)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition">
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 rounded transition 
                    ${loading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8h-4l3 3 3-3h-4a8 8 0 01-8 8z"></path>
                      </svg>
                      Submitting...
                    </div>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </form>

        <ToastContainer position="top-right" autoClose={3000} pauseOnHover={false} theme="colored" />

        {submittedData?.enquiryId && (
          <div className="mt-6 text-center">
           <a
  href={`/api/enquiry/pdf/${submittedData.enquiryId}`}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-block bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
>
  View Enquiry PDF
</a>

          </div>
        )}
      </div>
    </div>
  );
}

const InputField = ({ label, name, value, onChange, type = 'text', required = false }) => (
  <div>
    <label className="block text-sm font-semibold mb-1 text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-semibold mb-1 text-gray-700">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);
