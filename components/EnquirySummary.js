// components/EnquirySummary.js
import { generateEnquiryPDF } from '@/utils/pdfGenerator';

const EnquirySummary = ({ data }) => {
  return (
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
          {/* Add more fields as needed */}
        </div>
      </div>

      <button
        onClick={() => generateEnquiryPDF(data)}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Download PDF
      </button>
    </div>
  );
};

export default EnquirySummary;
 