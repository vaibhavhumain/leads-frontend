'use client';
import { useState , useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import EnquirySummary from '@/components/EnquirySummary';
import BASE_URL from '@/utils/api';

export default function EnquiryForm() {
  const [stage, setStage] = useState(1);
  const [category, setCategory] = useState('');
  const [submittedData, setSubmittedData] = useState(null);
  const loggedInUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;


  const [formData, setFormData] = useState({
    enquiryId: `ENQ-${Date.now()}`,
    teamMember: '',
    customerName: '',
    companyDetails: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    customerPhone: '',
    customerEmail: '',
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
  
    // Luxury fields (added arrays + other fields)
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

    optionalFeatures: [],  
    fitmentProvided: [],   
  });
  
  const windowImages = {
    'Sliding Glass': '/Sliding Glass.jpg',
    'Pack Glass': '/Pack Glass.jpg',
    'Pack Slider Glass': '/Pack Sliding Glass.jpg',
  };

  const tintImages = {
    'Light Green': '/images/light-green-tint.jpg',
    'Other': '/images/other-tint.jpg',
  };

  const seatingPattern = {
    '3X2': '/3X2.jpg',
    '2X2': '/2X2.jpg',
    '2X1': '/2X1.JPG',
  };

  // Dropdown Options
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

  // ✅ Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const createdBy = user?._id; // or user?.id based on your backend

  if (!createdBy) {
    toast.error('User not logged in.');
    setLoading(false);
    return;
  }

  const combinedData = {
    ...formData,
    category,
    createdBy, 
  };

  console.log('🚀 Submitting Combined Data:', combinedData);

  try {
    const res = await fetch(`${BASE_URL}/api/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(combinedData),
    });

    const result = await res.json();

    if (res.ok) {
      toast.success(`✅ ${result.message || 'Enquiry submitted successfully!'}`);
      setSubmittedData(combinedData);
      resetForm();
    } else {
      toast.error(`❌ ${result.message || 'Submission failed.'}`);
    }
  } catch (error) {
    console.error('❌ Submission error:', error);
    toast.error('🚫 Network or server error.');
  } finally {
    setLoading(false);
  }
};


  

  const resetForm = () => {
    setFormData({
      enquiryId: `ENQ-${Date.now()}`,
      teamMember: '',
      customerName: '',
      companyDetails: '',
      address: '',
      customerPhone: '',
      customerEmail: '',
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
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Customer Enquiry Form</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {submittedData && <EnquirySummary data={submittedData} />}
        {/* Stage 1 */}
        {stage === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <InputField label="Team Member Name" name="teamMember" value={formData.teamMember} onChange={handleChange} required />
            <InputField label="Customer Name" name="customerName" value={formData.customerName} onChange={handleChange} required />
            <InputField label="Company Details" name="companyDetails" value={formData.companyDetails} onChange={handleChange} />
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Address */}
  <div>
    <label className="block text-sm font-semibold mb-1 text-gray-700">Address</label>
    <input
      type="text"
      name="address"
      value={formData.address}
      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      placeholder="Street Address"
      className="w-full border rounded p-2 text-sm"
    />
  </div>

  {/* City */}
  <div>
    <label className="block text-sm font-semibold mb-1 text-gray-700">City</label>
    <input
      type="text"
      name="city"
      value={formData.city}
      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
      placeholder="City"
      className="w-full border rounded p-2 text-sm"
    />
  </div>

  {/* State */}
  <div>
    <label className="block text-sm font-semibold mb-1 text-gray-700">State</label>
    <input
      type="text"
      name="state"
      value={formData.state}
      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
      placeholder="State"
      className="w-full border rounded p-2 text-sm"
    />
  </div>

  {/* Pincode */}
  <div>
    <label className="block text-sm font-semibold mb-1 text-gray-700">Pincode</label>
    <input
      type="text"
      name="pincode"
      value={formData.pincode}
      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
      placeholder="Pincode"
      className="w-full border rounded p-2 text-sm"
    />
  </div>
</div>

            <InputField label="Phone Number" name="customerPhone" value={formData.customerPhone} onChange={handleChange} required />
            <InputField label="Email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} type="email" />
            <SelectField label="Bus Type" name="busType" value={formData.busType} onChange={handleChange} options={['Passenger/Route', 'Tourist', 'Sleeper', 'School', 'Staff', 'Other']} />
            {formData.busType === 'Other' && (
              <InputField label="Other Bus Type" name="otherBusType" value={formData.otherBusType} onChange={handleChange} />
            )}
            <SelectField label="Feature Requirement" name="featureRequirement" value={formData.featureRequirement} onChange={handleChange} options={['Luxury', 'Sleeper', 'Semi-Deluxe', 'Other']} />
            <SelectField label="AC Preference" name="acPreference" value={formData.acPreference} onChange={handleChange} options={['Yes', 'No']} />
            <SelectField label="Have you purchased the chassis?" name="chassisBought" value={formData.chassisBought} onChange={handleChange} options={['Yes', 'No']} />
            {formData.chassisBought === 'No' && (
              <SelectField label="When will you purchase it?" name="chassisPurchaseTime" value={formData.chassisPurchaseTime} onChange={handleChange} options={['7 Days', '15 Days', 'With in a Month', 'More than a Month']} />
            )}
            <InputField label="Chassis Company Name" name="chassisCompanyName" value={formData.chassisCompanyName} onChange={handleChange} />
            <InputField label="Chassis Model" name="chassisModel" value={formData.chassisModel} onChange={handleChange} />
            <InputField label="Wheel Base" name="wheelBase" value={formData.wheelBase} onChange={handleChange} />
            <InputField label="Tyre Size" name="tyreSize" value={formData.tyreSize} onChange={handleChange} />
            <InputField label="Length" name="length" value={formData.length} onChange={handleChange} />
            <InputField label="Width" name="width" value={formData.width} onChange={handleChange} />
            <SelectField label="Seating Pattern" name="seatingPattern" value={formData.seatingPattern} onChange={handleChange} options={['3X2', '2X2', '2X1']} />
            <InputField type='number' label="Number of Seats" name="numberOfSeats" value={formData.numberOfSeats} onChange={handleChange} />
            <InputField label="Additional Note" name="additionalNote" value={formData.additionalNote} onChange={handleChange} />
            <SelectField label="How did you hear about us?" name="referralSource" value={formData.referralSource} onChange={handleChange} options={['Google/Website', 'Insta/Youtube/Facebook', 'Referral', 'Other']} />
            <div className="md:col-span-2 text-center mt-4">
              <button type="button" onClick={() => setStage(2)} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Next
              </button>
            </div>
          </motion.div>
        )}

        {/* Stage 2 */}
        {stage === 2 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
            <SelectField label="Bus Category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} options={['Luxury', 'Sleeper', 'Semi-Deluxe']} />

            {category === 'Luxury' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                

<form className="space-y-6" onSubmit={handleSubmit}>
  {/* 1. Window */}
  <div>
    <label className="block font-medium mb-1 text-gray-700">Window</label>
    <select
      name="windowType"
      onChange={handleChange}
      value={formData.windowType}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-red-400 transition"
    >
      <option value="">Select</option>
      {windowOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    {formData.windowType && windowImages[formData.windowType] && (
       <img
       src={windowImages[formData.windowType]}
       alt={formData.windowType}
       className="w-64 h-48 object-cover rounded-xl border border-gray-300 shadow-md transition-transform duration-300 hover:scale-110 hover:shadow-lg"
     />
      )}
    {formData.windowType === 'Pack Slider Glass' && (
      <input
        type="text"
        name="requiredNoEachSide"
        placeholder="Required no. of each side"
        value={formData.requiredNoEachSide}
        onChange={handleChange}
        className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-red-400 transition"
      />
    )}
  </div>

  {/* 2. Tint of Shades */}
  <div>
    <label className="block font-medium mb-1 text-gray-700">Tint of Shades</label>
    <select
      name="tintOfShades"
      onChange={handleChange}
      value={formData.tintOfShades}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-red-400 transition"
    >
      <option value="">Select</option>
      {tintOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    {formData.tintOfShades === 'Other' && (
      <input
        type="text"
        name="otherTint"
        placeholder="Specify Tint Type"
        value={formData.otherTint}
        onChange={handleChange}
        className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-red-400 transition"
      />
    )}
  </div>

  {/* Total Seats */}
  <div>
    <label className="block font-medium mb-1 text-gray-700">Total Seats</label>
    <input
      type="number"
      name="totalSeats"
      value={formData.totalSeats}
      onChange={handleChange}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-red-400 transition"
    />
  </div>

  {/* Seating Pattern */}
  <div>
    <label className="block font-medium mb-1 text-gray-700">Seating Pattern</label>
    <select
      name="seatingPattern"
      onChange={handleChange}
      value={formData.seatingPattern}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-red-400 transition"
    >
      <option value="">Select</option>
      {seatingPatternOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>

     {formData.seatingPattern && seatingPattern[formData.seatingPattern] && (
       <img
       src={seatingPattern[formData.seatingPattern]}
       alt={formData.seatingPattern}
       className="w-64 h-48 object-cover rounded-xl border border-gray-300 shadow-md transition-transform duration-300 hover:scale-110 hover:shadow-lg"
     />
      )}
  </div>

  {/* Seat Type */}
  <div>
    <label className="block font-medium mb-1 text-gray-700">Seat Type</label>
    <select
      name="seatType"
      onChange={handleChange}
      value={formData.seatType}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-red-400 transition"
    >
      <option value="">Select</option>
      {seatTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>

  {/* Seat Belt */}
  <div>
    <label className="block font-medium mb-1 text-gray-700">Seat Belt</label>
    <select
      name="seatBelt"
      onChange={handleChange}
      value={formData.seatBelt}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-red-400 transition"
    >
      <option value="">Select</option>
      {yesNoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    {formData.seatBelt === 'Yes' && (
      <select
        name="seatBeltType"
        onChange={handleChange}
        value={formData.seatBeltType}
        className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-red-400 transition"
      >
        <option value="">Select Belt Type</option>
        <option value="3 Pin">3 Pin</option>
        <option value="2 Pin">2 Pin</option>
      </select>
    )}
  </div>

  {/* Remaining Dropdowns */}
  {[
    { label: 'Seat Material', name: 'seatMaterial', options: seatMaterialOptions },
    { label: 'Curtain', name: 'curtain', options: curtainOptions },
    { label: 'Flooring Type', name: 'flooringType', options: flooringOptions },
    { label: 'Passenger Doors', name: 'passengerDoors', options: passengerDoorOptions },
    { label: 'Passenger Door Position', name: 'passengerDoorPosition', options: passengerDoorPositionOptions },
    { label: 'Door Type', name: 'doorType', options: doorTypeOptions },
    { label: 'Roof Carrier', name: 'roofCarrier', options: roofCarrierOptions },
    { label: 'Diggy Type', name: 'diggyType', options: diggyTypeOptions },
    { label: 'Side Luggage Req.', name: 'sideLuggageReq', options: yesNoOptions },
    { label: 'Diggy Flooring', name: 'diggyFlooring', options: diggyFlooringOptions },
    { label: 'Side Ladder', name: 'sideLadder', options: yesNoOptions },
    { label: 'Helper Foot Step', name: 'helperFootStep', options: yesNoOptions },
    { label: 'Rear Back Jaal', name: 'rearBackJaal', options: yesNoOptions },
    { label: 'Cabin Type', name: 'cabinType', options: cabinOptions },
  ].map(({ label, name, options }) => (
    <div key={name}>
      <label className="block font-medium mb-1 text-gray-700">{label}</label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-red-400 transition"
      >
        <option value="">Select</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  ))}

  {/* Specific Requirement */}
  <div>
    <label className="block font-medium mb-1 text-gray-700">Specific Requirement</label>
    <textarea
      name="specificRequirement"
      value={formData.specificRequirement}
      onChange={handleChange}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-red-400 transition"
      rows="3"
    />
  </div>

  {/* Suggested Model */}
  <div>
    <label className="block font-medium mb-1 text-gray-700">Suggested Model</label>
    <select
      name="suggestedModel"
      value={formData.suggestedModel}
      onChange={handleChange}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-red-400 transition"
    >
      <option value="">Select</option>
      {suggestedModels.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>

  {/* Optional Features */}
  <div>
    <label className="block font-medium mb-1 text-gray-700">Optional Features</label>
    <Select
      isMulti
      options={optionalFeaturesOptions}
      className="react-select-container"
      classNamePrefix="react-select"
      onChange={(selected) => setFormData(prev => ({
        ...prev,
        optionalFeatures: selected ? selected.map(s => s.value) : []
      }))}
    />
  </div>

  {/* Fitment Provided */}
  <div>
    <label className="block font-medium mb-1 text-gray-700">Fitment Provided</label>
    <Select
      isMulti
      options={fitmentOptions}
      className="react-select-container"
      classNamePrefix="react-select"
      onChange={(selected) => setFormData(prev => ({
        ...prev,
        fitmentProvided: selected ? selected.map(s => s.value) : []
      }))}
    />
  </div>
</form>
              </div>
            )}

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
    </div>
  );
}

// Reusable Input Field Component
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

// Reusable Select Field Component
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
