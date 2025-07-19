import { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LifecycleToggle = ({ lead, onDead }) => {
  const [status, setStatus] = useState(lead.lifecycleStatus || 'active');
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const updateLifecycleStatus = async (newStatus, redirect = false) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/api/leads/${lead._id}/lifecycle`,
        { lifecycleStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus(newStatus);
      toast.success(`✅ Lead marked as ${newStatus}`);

      if (newStatus === 'dead') {
        if (onDead) onDead(lead._id); // inform parent to remove from list
        if (redirect) setTimeout(() => router.push('/dead-leads'), 1000);
      }
    } catch (error) {
      console.error("❌ Error updating lifecycle:", error);
      toast.error("❌ Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (e) => {
    const newStatus = e.target.value;
    updateLifecycleStatus(newStatus);
  };

  const handleSendToDeadZone = () => {
    updateLifecycleStatus('dead', true);
  };

  return (
    <div className="mb-4 space-y-2">
      <label className="text-sm font-medium mr-2">Lifecycle:</label>
      <select
        value={status}
        onChange={handleChange}
        disabled={updating}
        className="border rounded px-2 py-1"
      >
        <option value="active">Active</option>
        <option value="dead">Dead</option>
      </select>

      {status === 'dead' && (
        <button
          onClick={handleSendToDeadZone}
          disabled={updating}
          className="block mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
        >
          🪦 Send to Dead Zone
        </button>
      )}
    </div>
  );
};

export default LifecycleToggle;
