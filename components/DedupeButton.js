import { useState, useMemo } from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api'; // <-- same import you used elsewhere

export default function DedupeButton({
  sinceISO,
  createdByOnly = true,
  onDeleted
}) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

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
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/leads/dedupe`,
        {
          dryRun: true,
          since: effectiveSince,
          createdByOnly
        },
        { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
      );
      setPreview(data);
    } catch (err) {
      console.error('Dedupe preview failed:', err);
      alert(err?.response?.data?.message || 'Failed to check duplicates');
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!preview?.duplicatesFound) return;
    if (!confirm(`Delete ${preview.duplicatesFound} duplicate lead(s)? This cannot be undone.`)) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/leads/dedupe`,
        {
          dryRun: false,
          since: effectiveSince,
          createdByOnly
        },
        { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
      );

      alert(`Deleted ${data.deleted || 0} duplicate lead(s).`);
      setPreview(null);
      onDeleted?.(); // tell parent to refetch or reload
    } catch (err) {
      console.error('Dedupe delete failed:', err);
      alert(err?.response?.data?.message || 'Failed to delete duplicates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        className="px-3 py-2 rounded bg-indigo-600 text-white"
        onClick={check}
        disabled={loading}
        title="Scan your recent imports for duplicate phone numbers"
      >
        {loading ? 'Checking...' : 'Check Duplicates'}
      </button>

      {preview && (
        <div className="ml-2 border rounded p-2 text-sm bg-white shadow-sm">
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
              className="px-3 py-2 rounded bg-red-600 text-white"
              onClick={remove}
              disabled={loading}
            >
              Delete Duplicates
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
