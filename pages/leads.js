import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Link from "next/link";

import {
  FiChevronLeft,
  FiChevronRight,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiSearch,
} from "react-icons/fi";
import ProtectedRoute from "../components/ProtectedRoute";
import BASE_URL from "../utils/api";

const LS_SELECTED_ID_KEY = 'leads:selectedId';

const LeadsPage = () => {
  const [allLeads, setAllLeads] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [query, setQuery] = useState("");
  const [lifecycle, setLifecycle] = useState("active"); // active | dead | all
  const [user, setUser] = useState(null);
  const router = useRouter();

  // ----- helpers -----
  const tokenHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const current = filtered[idx] || null;

  // ----- fetch my leads -----
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const me = await axios.get(`${BASE_URL}/api/users/me`, {
          headers: tokenHeaders(),
        });
        setUser(me.data);

        // admins can see all; others see only their active leads
        let leadsRes;
        if (me.data?.role === "admin") {
          leadsRes = await axios.get(`${BASE_URL}/api/leads/all`, {
            headers: tokenHeaders(),
          });
        } else {
          leadsRes = await axios.get(`${BASE_URL}/api/leads/my-leads`, {
            headers: tokenHeaders(),
          });
        }
        setAllLeads(leadsRes.data || []);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to fetch leads");
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- lifecycle filter + search -----
  useEffect(() => {
    if (!allLeads.length) {
      setFiltered([]);
      setIdx(0);
      return;
    }

    let base = allLeads;

    // lifecycle
    if (lifecycle !== "all") {
      const want = lifecycle === "dead" ? "dead" : "active";
      base = base.filter((l) =>
        want === "dead"
          ? l.lifecycleStatus === "dead"
          : l.lifecycleStatus !== "dead"
      );
    }

    // query (phone, client, company)
    const q = query.trim().toLowerCase();
    if (q) {
      base = base.filter((l) => {
        const name = l?.leadDetails?.clientName || "";
        const company = l?.leadDetails?.companyName || "";
        const contacts = (l?.leadDetails?.contacts || [])
          .map((c) => c?.number)
          .join(" ");
        return (
          name.toLowerCase().includes(q) ||
          company.toLowerCase().includes(q) ||
          contacts.toLowerCase().includes(q)
        );
      });
    }

    // set filtered first
    setFiltered(base);

    // try to restore selection using saved id
    const savedId =
      typeof window !== "undefined"
        ? localStorage.getItem(LS_SELECTED_ID_KEY)
        : null;

    if (savedId) {
      const foundAt = base.findIndex((l) => String(l?._id) === String(savedId));
      if (foundAt >= 0) {
        setIdx(foundAt);
      } else {
        setIdx(0);
      }
    } else {
      setIdx(0);
    }
  }, [allLeads, lifecycle, query]);

  // ----- persist current selection (by leadId) -----
  useEffect(() => {
    if (!current?._id) return;
    try {
      localStorage.setItem(LS_SELECTED_ID_KEY, String(current._id));
    } catch {}
  }, [current?._id]);

  // ----- actions -----
  const onGo = async () => {
    if (!query.trim()) {
      toast.info("Type a phone / name / company, then press Go.");
      return;
    }
    try {
      const res = await axios.get(
        `${BASE_URL}/api/leads/search?phone=${encodeURIComponent(
          query.trim()
        )}`,
        { headers: tokenHeaders() }
      );
      if (Array.isArray(res.data) && res.data.length) {
        setFiltered(res.data);
        // restore selection after search too
        const savedId =
          typeof window !== "undefined"
            ? localStorage.getItem(LS_SELECTED_ID_KEY)
            : null;
        if (savedId) {
          const foundAt = res.data.findIndex((l) => String(l?._id) === String(savedId));
          setIdx(foundAt >= 0 ? foundAt : 0);
        } else {
          setIdx(0);
        }
      } else {
        toast.info("No results from server search. Showing local filter.");
      }
    } catch {
      toast.error("Server search failed, showing local matches.");
    }
  };

  const checkDuplicates = () => {
    if (!filtered.length) {
      toast.info("No leads to check.");
      return;
    }
    const map = new Map(); // phone -> leads[]
    for (const l of filtered) {
      const num = (l?.leadDetails?.contacts?.[0]?.number || "").trim();
      if (!num) continue;
      map.set(num, (map.get(num) || []).concat(l));
    }
    const dups = [...map.entries()].filter(([, arr]) => arr.length > 1);
    if (!dups.length) {
      toast.success("No duplicates found ✅");
      return;
    }
    const msg = dups
      .map(
        ([num, arr]) =>
          `${num} (${arr.length}) – ${arr
            .map((a) => a?.leadDetails?.clientName || "Unnamed")
            .join(", ")}`
      )
      .slice(0, 6)
      .join("\n");
    toast.warn(`Possible duplicates:\n${msg}`);
  };

  const deleteMyLeads = async () => {
    toast.info("This button is a placeholder. Add backend route to enable.");
  };

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(filtered.length - 1, i + 1));

  // ----- UI -----
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#eef4ff]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 py-8">
          {/* search row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Go to lead by number, name or company"
                className="w-full pl-10 pr-3 h-12 rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={onGo}
              className="h-12 px-5 rounded-xl bg-[#2f6fed] text-white font-medium shadow-sm hover:brightness-105"
            >
              Go
            </button>
            <button
              onClick={checkDuplicates}
              className="h-12 px-5 rounded-xl bg-[#5a43ff] text-white font-medium shadow-sm hover:brightness-105"
            >
              Check Duplicates
            </button>
            <button
              onClick={deleteMyLeads}
              className="h-12 px-5 rounded-xl bg-slate-400/80 text-white font-medium cursor-not-allowed"
              title="Wire to backend to enable"
            >
              Delete My Leads
            </button>
          </div>

          {/* card */}
          <div className="mt-6 rounded-3xl bg-white shadow-[0_10px_30px_rgba(17,24,39,0.08)] p-6 sm:p-8">
            {loading ? (
              <div className="text-slate-500">Loading…</div>
            ) : !current ? (
              <div className="text-slate-500">No leads found.</div>
            ) : (
              <>
                <h2 className="text-2xl font-extrabold text-slate-800">
                  {current?.leadDetails?.clientName || "Unnamed"}
                </h2>

                <div className="mt-3 space-y-2 text-slate-700">
                  <div className="flex items-start gap-2">
                    <FiBriefcase className="mt-1 text-slate-500" />
                    <span>{current?.leadDetails?.companyName || "—"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiMapPin className="mt-1 text-rose-500" />
                    <span>{current?.leadDetails?.location || "—"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiPhone className="mt-1 text-indigo-600" />
                    <span className="font-semibold">
                      {current?.leadDetails?.contacts?.[0]?.number || "—"}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href={{
                      pathname: '/EnquiryForm',
                      query: { leadId: current?._id },
                    }}
                    passHref
                    legacyBehavior
                  >
                    <a className="bg-amber-700 text-white px-4 py-2 rounded-lg shadow cursor-pointer hover:bg-amber-800 transition">
                      📃 Enquiry Form
                    </a>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* view details */}
          <div className="mt-5">
            {current && (
              <Link href={`/LeadDetails?leadId=${current?._id}`}>
                <button className="text-lg font-semibold text-white mb-4 mt-4 bg-blue-500 px-6 py-2 rounded-xl shadow hover:bg-blue-600 transition w-full sm:w-auto">
                  View Lead Details
                </button>
              </Link>
            )}
          </div>

          {/* pagination + lifecycle */}
          <div className="mt-8 flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                disabled={idx === 0}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                  idx === 0
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-white hover:bg-slate-50"
                } `}
              >
                <FiChevronLeft /> Previous
              </button>

              <div className="text-slate-700 text-sm">
                Showing{" "}
                <span className="font-semibold">
                  {filtered.length ? idx + 1 : 0}
                </span>{" "}
                of <span className="font-semibold">{filtered.length}</span>
              </div>

              <button
                onClick={next}
                disabled={idx >= filtered.length - 1}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white ${
                  idx >= filtered.length - 1
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-[#2f6fed] hover:brightness-105"
                }`}
              >
                Next <FiChevronRight />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600">Lifecycle:</span>
              <select
                value={lifecycle}
                onChange={(e) => setLifecycle(e.target.value)}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3"
              >
                <option value="active">Active</option>
                <option value="dead">Dead</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default LeadsPage;
