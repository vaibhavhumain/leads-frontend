import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import BASE_URL from '../utils/api'; // Adjust path if needed

const LeadForm = ({ onLeadCreated, closeModal }) => {
  const [leadDetails, setLeadDetails] = useState({
    name: '',
    company: '',
    email: '',
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

      const payload = { leadDetails };

      const response = await axios.post(
        `${BASE_URL}/api/leads/create`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onLeadCreated(response.data.lead);
      setLeadDetails({ name: '', phone: '', company: '', email: '' });
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
    <div className="p-4 bg-gray-100 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Create New Lead</h2>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Name:</label>
          <input
            type="text"
            name="name"
            className="w-full p-2 border rounded"
            value={leadDetails.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block font-medium">Email:</label>
          <input
            type="email"
            name="email"
            className="w-full p-2 border rounded"
            value={leadDetails.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block font-medium">Company:</label>
          <input
            type="text"
            name="company"
            className="w-full p-2 border rounded"
            value={leadDetails.company}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Lead'}
        </button>
      </form>
    </div>
  );
};

export default LeadForm;
