import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import BASE_URL from '../utils/api';

const LeadForm = ({ onLeadCreated, closeModal }) => {
  const [leadDetails, setLeadDetails] = useState({
    clientName: '',
    contact: '',
    companyName: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setLeadDetails({
      ...leadDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Unauthorized: Please log in.');
      setLoading(false);
      return;
    }
    const leadPayload = {
  clientName: leadDetails.clientName,
  companyName: leadDetails.companyName,
  location: leadDetails.location,
};

if (leadDetails.contact && leadDetails.contact.trim() !== '') {
  leadPayload.contacts = [{ number: leadDetails.contact.trim(), label: 'Primary' }];
}

const payload = { leadDetails: leadPayload };


    const response = await axios.post(
      `${BASE_URL}/api/leads/create`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    localStorage.setItem('leadId', response.data.lead._id);
    onLeadCreated(response.data.lead);
    setLeadDetails({
      clientName: '',
      contact: '',
      companyName: '',
      location: '',
    });
    toast.success('Lead created successfully!');
    if (closeModal) closeModal();
  } catch (err) {
    console.error('Lead creation error:', err.response?.data || err.message);
    setError(err.response?.data?.message || 'Error creating lead. Please try again.');
    toast.error('Failed to create lead.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create New Lead</h2>

      {error && (
        <p className="text-red-500 text-sm mb-4 text-center bg-red-100 px-3 py-2 rounded">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
          <input
            type="text"
            name="clientName"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={leadDetails.clientName}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
          <input
            type="tel"
            name="contact"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={leadDetails.contact}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input
            type="text"
            name="companyName"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={leadDetails.companyName}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            name="location"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={leadDetails.location}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className={`w-full py-2 px-4 text-white rounded-lg transition duration-300 ${
            loading
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Lead'}
        </button>
      </form>
    </div>
  );
};

export default LeadForm;
