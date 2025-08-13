import { useState, useMemo } from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DedupeButton({
  sinceISO,
  createdByOnly = true,
  onDeleted
}) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [cooldown, setCooldown] = useState(false); // <- 5s cooldown after delete

  // Default: last 24 hours if sinceISO not provided
  const effectiveSince = useMemo(() => {
    if (sinceISO) return sinceISO;
    const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return d.toISOString();
  }, [sinceISO]);

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const check = async () => {
    setLoading(true);
    const tId = toast.loading('Scanning for duplicates...');
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/leads/dedupe`,
        { dryRun: true, since: effectiveSince, createdByOnly },
        { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
      );
      setPreview(data);
      toast.update(tId, {
        render: `Found ${data.duplicatesFound} duplicate(s).`,
        type: 'info',
        isLoading: false,
        autoClose: 3000
      });
    } catch (err) {
      console.error('Dedupe preview failed:', err);
      toast.update(tId, {
        render: err?.response?.data?.message || 'Failed to check duplicates',
        type: 'error',
        isLoading: false,
        autoClose: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!preview?.duplicatesFound) {
      toast.info('No duplicates to delete.');
      return;
    }

    // optional: confirm via toast? Keeping built-in confirm for simplicity
    if (!confirm(`Delete ${preview.duplicatesFound} duplicate lead(s)? This cannot be undone.`)) return;

    setLoading(true);
    const tId = toast.loading('Deleting duplicates...');
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/leads/dedupe`,
        { dryRun: false, since: effectiveSince, createdByOnly },
        { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
      );

      toast.update(tId, {
        render: `Deleted ${data.deleted || 0} duplicate lead(s).`,
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });

      setPreview(null);
      onDeleted?.();

      // Start 5s cooldown where buttons stay disabled and label changes
      setCooldown(true);
      setTimeout(() => setCooldown(false), 5000);
    } catch (err) {
      console.error('Dedupe delete failed:', err);
      toast.update(tId, {
        render: err?.response?.data?.message || 'Failed to delete duplicates',
        type: 'error',
        isLoading: false,
        autoClose: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || cooldown;

  return (
    <div className="flex items-start gap-2">
      <button
        className={`px-3 py-2 rounded text-white ${disabled ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        onClick={check}
        disabled={disabled}
        title="Scan your recent imports for duplicate phone numbers"
      >
        {loading ? 'Checking…' : cooldown ? 'Please wait…' : 'Check Duplicates'}
      </button>

      {preview && (
        <div className="ml-2 border rounded p-2 text-sm bg-white shadow-sm max-w-md">
          Found <b>{preview.duplicatesFound}</b> duplicate(s).
          {preview.sampleIds?.length > 0 && (
            <details className="mt-1">
              <summary className="cursor-pointer">Show sample IDs</summary>
              <pre className="text-xs bg-gray-50 p-2 mt-1 rounded overflow-x-auto">
                {JSON.stringify(preview.sampleIds, null, 2)}
              </pre>
            </details>
          )}
          <div className="mt-2 text-right">
            <button
              className={`px-3 py-2 rounded text-white ${disabled ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}
              onClick={remove}
              disabled={disabled}
            >
              {loading ? 'Deleting…' : cooldown ? 'Cooling down…' : 'Delete Duplicates'}
            </button>
          </div>
        </div>
      )}

      {/* Toast container (place once in your app; safe to keep here if this component mounts where needed) */}
      <ToastContainer position="bottom-right" newestOnTop closeOnClick pauseOnHover />
    </div>
  );
}
