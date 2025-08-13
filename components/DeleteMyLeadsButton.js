import { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DeleteMyLeadsButton() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [cooldown, setCooldown] = useState(false); // <- 5s cooldown after delete

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setIsDeveloper(u?.role === 'developer');
    } catch {
      setIsDeveloper(false);
    }
  }, []);

  const check = async () => {
    if (!isDeveloper) return;
    setLoading(true);
    const tId = toast.loading('Scanning your leads…');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.delete(`${BASE_URL}/api/leads/developer`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: { dryRun: true }
      });
      setPreview(data);
      toast.update(tId, {
        render: `Found ${data.totalCandidates || 0} lead(s) you created.`,
        type: 'info',
        isLoading: false,
        autoClose: 3000
      });
    } catch (err) {
      toast.update(tId, {
        render: 'Failed to preview leads: ' + (err.response?.data?.message || err.message),
        type: 'error',
        isLoading: false,
        autoClose: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!isDeveloper || !preview?.totalCandidates) {
      toast.info('No leads to delete.');
      return;
    }
    if (!confirm(`Delete ${preview.totalCandidates} of your leads? This cannot be undone.`)) return;

    setLoading(true);
    const tId = toast.loading('Deleting your leads…');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.delete(`${BASE_URL}/api/leads/developer`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: { dryRun: false }
      });

      toast.update(tId, {
        render: `Deleted ${data.deleted || 0} lead(s).`,
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });

      // reset preview & start cooldown
      setPreview(null);
      setCooldown(true);
      setTimeout(() => {
        setCooldown(false);
        // Optional: reload AFTER cooldown so the 5s state is visible
        // if (typeof window !== 'undefined') window.location.reload();
      }, 5000);
    } catch (err) {
      toast.update(tId, {
        render: 'Delete failed: ' + (err.response?.data?.message || err.message),
        type: 'error',
        isLoading: false,
        autoClose: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || cooldown || !isDeveloper;

  return (
    <div className="flex items-start gap-2">
      <button
        className={`px-3 py-2 rounded text-sm text-white 
          ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-700 hover:bg-red-800'}`}
        onClick={check}
        disabled={disabled}
        title={isDeveloper ? 'Delete your leads (with preview)' : 'Only developers can delete their own leads'}
      >
        {loading ? 'Checking…' : cooldown ? 'Please wait…' : 'Delete My Leads'}
      </button>

      {isDeveloper && preview && (
        <div className="ml-2 border rounded p-2 text-sm bg-white shadow-sm max-w-md">
          Found <b>{preview.totalCandidates}</b> lead(s) you created.
          {preview.sample?.length > 0 && (
            <details className="mt-1">
              <summary className="cursor-pointer">Show sample</summary>
              <pre className="text-xs bg-gray-50 p-2 mt-1 rounded overflow-x-auto">
                {JSON.stringify(preview.sample, null, 2)}
              </pre>
            </details>
          )}
          <div className="mt-2 text-right">
            <button
              className={`px-3 py-1 rounded text-white text-xs
                ${loading || cooldown ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
              onClick={remove}
              disabled={loading || cooldown}
            >
              {loading ? 'Deleting…' : cooldown ? 'Cooling down…' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      )}
      <ToastContainer position="bottom-right" newestOnTop closeOnClick pauseOnHover />
    </div>
  );
}
