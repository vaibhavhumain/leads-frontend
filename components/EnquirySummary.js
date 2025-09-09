import Navbar from './Navbar';

const EnquirySummary = ({ data }) => {
  const handleDownloadExcel = () => {
    // Replace with your backend API route
    const url = `/api/enquiry/excel/${data.enquiryId}`;
    window.open(url, '_blank'); // open/download Excel
  };

  return (
    <div>
      <Navbar />
      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <div id="enquiry-summary">
          <h2 className="text-2xl font-bold mb-4">Enquiry Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><strong>Customer Name:</strong> {data.customerName}</div>
            <div><strong>Phone:</strong> {data.customerPhone}</div>
            <div><strong>Email:</strong> {data.customerEmail}</div>
            <div><strong>City:</strong> {data.city}</div>
            <div><strong>Bus Type:</strong> {data.busType}</div>
            <div><strong>Feature Requirement:</strong> {data.featureRequirement}</div>
            <div><strong>Total Seats:</strong> {data.totalSeats}</div>
            <div><strong>Seating Pattern:</strong> {data.seatingPattern}</div>
          </div>
        </div>
      </div>

      <button
        onClick={handleDownloadExcel}
        className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Download Excel
      </button>
    </div>
  );
};

export default EnquirySummary;
