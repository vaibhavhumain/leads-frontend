// components/DeleteMyLeadsButton.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api';

export default function DeleteMyLeadsButton() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setIsDeveloper(u?.role === 'developer');
    } catch { setIsDeveloper(false); }
  }, []);

  const check = async () => {
    if (!isDeveloper) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.delete(`${BASE_URL}/api/leads/developer`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: { dryRun: true }
      });
      setPreview(data);
    } catch (err) {
      alert('Failed to preview leads: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!isDeveloper || !preview?.totalCandidates) return;
    if (!confirm(`Delete ${preview.totalCandidates} of your leads? This cannot be undone.`)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.delete(`${BASE_URL}/api/leads/developer`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: { dryRun: false }
      });
      alert(`Deleted ${data.deleted || 0} lead(s).`);
      setPreview(null);
      if (typeof window !== 'undefined') window.location.reload();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        className={`px-3 py-2 rounded text-sm ${isDeveloper ? 'bg-red-700 text-white' : 'bg-gray-400 text-white cursor-not-allowed'}`}
        onClick={check}
        disabled={loading || !isDeveloper}
        title={isDeveloper ? 'Delete your leads (with preview)' : 'Only developers can delete their own leads'}
      >
        {loading ? 'Checking...' : 'Delete My Leads'}
      </button>

      {isDeveloper && preview && (
        <div className="ml-2 border rounded p-2 text-sm bg-white shadow-sm">
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
              className="px-3 py-1 rounded bg-red-600 text-white text-xs"
              onClick={remove}
              disabled={loading}
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
