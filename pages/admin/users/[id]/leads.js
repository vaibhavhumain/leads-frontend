import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import BASE_URL from "../../../../utils/api";
import AdminNavbar from "../../../../components/AdminNavbar";
import { toast } from "react-toastify";

const UserLeadsPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [leads, setLeads] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const me = await axios.get(`${BASE_URL}/api/users/me`, { headers });
        setLoggedInUser(me.data);

        const res = await axios.get(`${BASE_URL}/api/leads/user/${id}`, {
          headers,
        });
        setLeads(res.data);
      } catch (err) {
        console.error("Error fetching leads:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [id]);

  const nextLead = () => {
    if (currentIndex < leads.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const prevLead = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  // 🔹 Delete lead
  const deleteLead = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`${BASE_URL}/api/leads/${leadId}`, { headers });

      toast.success("Lead deleted successfully");

      // Remove from list
      const updatedLeads = leads.filter((l) => l._id !== leadId);
      setLeads(updatedLeads);

      // Adjust index
      if (currentIndex >= updatedLeads.length && updatedLeads.length > 0) {
        setCurrentIndex(updatedLeads.length - 1);
      } else if (updatedLeads.length === 0) {
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error("Error deleting lead:", err);
      toast.error("Failed to delete lead");
    }
  };

  // 🔹 Modern loading animation
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-indigo-600 font-medium text-lg">
          Fetching leads...
        </p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-gray-500">
        <p className="text-lg">No leads found for this user.</p>
      </div>
    );
  }

  const lead = leads[currentIndex];

  return (
    <>
      <AdminNavbar loggedInUser={loggedInUser} />
      <div className="p-6 flex flex-col items-center bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">User Leads</h1>

        {/* Lead Card */}
        <div className="w-full max-w-4xl p-6 border rounded-2xl shadow-lg bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-indigo-700">
              {lead.leadDetails?.clientName || "N/A"}
            </h2>
            <button
              onClick={() => deleteLead(lead._id)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded shadow text-sm"
            >
              Delete Lead
            </button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <p><b>Company:</b> {lead.leadDetails?.companyName || "N/A"}</p>
            <p><b>Location:</b> {lead.leadDetails?.location || "N/A"}</p>
            <p><b>Email:</b> {lead.leadDetails?.email || "N/A"}</p>
            <p><b>Status:</b> {lead.status}</p>
            <p><b>Connection:</b> {lead.connectionStatus}</p>
            <p><b>Lifecycle:</b> {lead.lifecycleStatus}</p>
            <p><b>Created At:</b> {new Date(lead.createdAt).toLocaleString()}</p>
          </div>

          {/* Contacts */}
          <Section title="Contacts">
            {lead.leadDetails?.contacts?.length > 0 ? (
              <ul className="space-y-1">
                {lead.leadDetails.contacts.map((c, i) => (
                  <li key={i} className="flex items-center">
                    <span>{c.number}</span>
                    <span className="ml-2 text-gray-500">({c.label})</span>
                    {c.isPrimary && (
                      <span className="ml-2 px-2 py-0.5 bg-green-200 text-green-800 text-xs rounded">
                        Primary
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty text="No contacts" />
            )}
          </Section>

          {/* Follow Ups */}
          <Section title="Follow Ups">
            {lead.followUps?.length > 0 ? (
              <div className="space-y-2">
                {lead.followUps.map((f, i) => (
                  <div key={i} className="p-3 border rounded bg-indigo-50">
                    <p><b>Date:</b> {new Date(f.date).toLocaleString()}</p>
                    <p><b>Notes:</b> {f.notes}</p>
                    <p><b>By:</b> {f.by?.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="No follow ups" />
            )}
          </Section>

          {/* Notes */}
          <Section title="Notes">
            {lead.notes?.length > 0 ? (
              <div className="space-y-2">
                {lead.notes.map((n, i) => (
                  <div key={i} className="p-3 border rounded bg-yellow-50">
                    <p>{n.text}</p>
                    <p className="text-sm text-gray-500">
                      By {n.addedBy?.name} at{" "}
                      {new Date(n.date || n.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="No notes" />
            )}
          </Section>

          {/* Action Plans */}
          <Section title="Action Plans">
            {lead.actionPlans?.length > 0 ? (
              <div className="space-y-2">
                {lead.actionPlans.map((a, i) => (
                  <div key={i} className="p-3 border rounded bg-blue-50">
                    <p>{a.text}</p>
                    <p className="text-sm text-gray-500">
                      Added by {a.addedBy?.name} at{" "}
                      {new Date(a.date || a.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="No action plans" />
            )}
          </Section>

          {/* Activities */}
          <Section title="Activities">
            {lead.activities?.length > 0 ? (
              <div className="space-y-2">
                {lead.activities.map((act, i) => (
                  <div key={i} className="p-3 border rounded bg-green-50">
                    <p><b>Type:</b> {act.type}</p>
                    <p><b>Date:</b> {new Date(act.date).toLocaleString()}</p>
                    <p><b>Location:</b> {act.location || "N/A"}</p>
                    <p><b>Remarks:</b> {act.remarks || "N/A"}</p>
                    <p><b>Outcome:</b> {act.outcome || "N/A"}</p>
                    <p className="text-sm text-gray-500">
                      By {act.conductedBy?.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="No activities" />
            )}
          </Section>

          {/* Remarks History */}
          <Section title="Remarks History">
            {lead.remarksHistory?.length > 0 ? (
              <div className="space-y-2">
                {lead.remarksHistory.map((r, i) => (
                  <div key={i} className="p-3 border rounded bg-gray-50">
                    <p>{r.remarks}</p>
                    <p className="text-sm text-gray-500">
                      By {r.updatedBy?.name} at{" "}
                      {new Date(r.date).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="No remarks history" />
            )}
          </Section>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={prevLead}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={nextLead}
            disabled={currentIndex === leads.length - 1}
            className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <p className="mt-4 text-gray-500">
          Showing {currentIndex + 1} of {leads.length}
        </p>
      </div>
    </>
  );
};

// 🔹 Reusable Section component
const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-2 text-indigo-700">{title}</h3>
    {children}
  </div>
);

// 🔹 Empty placeholder
const Empty = ({ text }) => (
  <p className="text-gray-500 italic">{text}</p>
);

export default UserLeadsPage;
