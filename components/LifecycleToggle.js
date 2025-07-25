import { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LifecycleToggle = ({ lead, onDead }) => {
  const [status, setStatus] = useState(lead.lifecycleStatus || 'active');
  const [lifecycleDate, setLifecycleDate] = useState(lead.lifecycleUpdatedAt);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

 const updateLifecycleStatus = async (newStatus, redirect = false) => {
  setUpdating(true);
  try {
    const token = localStorage.getItem('token');
    const res = await axios.put(
      `${BASE_URL}/api/leads/${lead._id}/lifecycle`,
      { lifecycleStatus: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setStatus(newStatus);

    if (newStatus === 'dead') {
      setLifecycleDate(res.data.lead.lifecycleUpdatedAt);
      toast.success(`✅ Lead marked as DEAD`);

      if (onDead) onDead(lead._id);

      // 👇 Automatically revert to ACTIVE after 3 seconds
      setTimeout(async () => {
        try {
          const revertRes = await axios.put(
            `${BASE_URL}/api/leads/${lead._id}/lifecycle`,
            { lifecycleStatus: 'active' },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setStatus('active');
          setLifecycleDate(null);
          toast.info("🔄 Automatically reverted to ACTIVE");
        } catch (revertError) {
          console.error("❌ Error reverting to active:", revertError);
          toast.error("❌ Failed to revert to active");
        }
      }, 3000);
    } else {
      setLifecycleDate(null);
      toast.success(`✅ Lead marked as ACTIVE`);
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

      {status === 'dead' && lifecycleDate && (
        <div className="text-sm text-red-600 mt-1">
          🪦 Marked as Dead on: <strong>{new Date(lifecycleDate).toLocaleDateString('en-IN')}</strong>
        </div>
      )}
    </div>
  );
};

export default LifecycleToggle;
