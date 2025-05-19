import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../../utils/api';
import { motion } from 'framer-motion';

const LeadDetailsPage = () => { 
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchLead = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/leads/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLead(res.data);
      } catch (err) {
        console.error('Error fetching lead:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  if (loading)
    return <p className="text-center text-gray-500 mt-10">Loading lead...</p>;
  if (!lead)
    return <p className="text-center text-red-500 mt-10">Lead not found</p>;

  const headingVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  // Define labels and corresponding values
  const fields = [
    { label: 'Name', value: lead.leadDetails?.name || '—' },
    { label: 'Phone', value: lead.leadDetails?.phone || '—' },
    { label: 'Company', value: lead.leadDetails?.company || '—' },
    { label: 'Status', value: lead.status || '—' },
    { label: 'Remarks', value: lead.remarks || '—' },
    { label: 'Date', value: lead.date ? new Date(lead.date).toLocaleDateString() : 'N/A' },
    { label: 'Created By', value: lead.createdBy?.name || '—' },
  ];

  return (
    <motion.div
      className="p-6 max-w-3xl mx-auto text-left bg-white rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-3xl font-bold mb-6 text-indigo-600 shadow-lg shadow-indigo-200 p-3 rounded-lg bg-white w-fit mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        Lead Details
      </motion.h1>

      <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
        <table className="min-w-full text-sm text-gray-700">
          <tbody>
            {fields.map(({ label, value }, i) => (
              <motion.tr
                key={label}
                className="border-b last:border-none"
                initial="hidden"
                animate="visible"
                custom={i}
                variants={headingVariants}
              >
                <th className="px-6 py-4 text-left font-semibold bg-indigo-100 text-indigo-700 w-1/3">
                  {label}
                </th>
                <td className="px-6 py-4">{value}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default LeadDetailsPage;
