"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reports" | "claims">("reports");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/");
      else {
        setUser(u);
        fetchUserData(u);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchUserData = async (currentUser: any) => {
    try {
      // 1. Fetch My Reports (Items I posted)
      const qReports = query(collection(db, "items"), where("uid", "==", currentUser.uid));
      const reportsSnap = await getDocs(qReports);
      const reportsList = reportsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(reportsList);

      // 2. Fetch My Claims (Items I tried to claim)
      const qClaims = query(collection(db, "items"), where("claimedBy", "==", currentUser.email));
      const claimsSnap = await getDocs(qClaims);
      const claimsList = claimsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClaims(claimsList);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await deleteDoc(doc(db, "items", itemId));
      // Refresh local state
      setReports(reports.filter(item => item.id !== itemId));
    } catch (error) {
      alert("Error deleting item.");
    }
  };

  // Helper to calculate stats
  const lostCount = reports.filter(r => r.type === "LOST").length;
  const foundCount = reports.filter(r => r.type !== "LOST").length; // "FOUND" or undefined (legacy)
  const activeClaimsCount = claims.length;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Items</h1>
            <p className="text-gray-500 mt-1">Manage your reports and track your claims</p>
          </div>
          <div className="flex gap-3">
             <Link href="/" className="px-4 py-2 text-gray-600 font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Home
             </Link>
             <Link href="/report-item">
                <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm">
                    + Report New Item
                </button>
             </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Lost Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{lostCount}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Found Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{foundCount}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Active Claims</p>
                    <p className="text-2xl font-bold text-gray-900">{activeClaimsCount}</p>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button 
                onClick={() => setActiveTab("reports")}
                className={`pb-3 px-1 font-semibold text-sm transition ${activeTab === "reports" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
                My Reports
            </button>
            <button 
                onClick={() => setActiveTab("claims")}
                className={`pb-3 px-1 font-semibold text-sm transition ${activeTab === "claims" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
                My Claims
            </button>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Item</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {(activeTab === "reports" ? reports : claims).length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                No items found in this category.
                            </td>
                        </tr>
                    ) : (activeTab === "reports" ? reports : claims).map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <img src={item.imageUrl} className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{item.description}</p>
                                        <p className="text-xs text-gray-500">{item.location}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {item.status === "OPEN" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">● Open</span>}
                                {item.status === "PENDING" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">● Pending</span>}
                                {item.status === "CLAIMED" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">● Closed</span>}
                            </td>
                            <td className="px-6 py-4">
                                {item.type === "LOST" ? (
                                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">LOST REPORT</span>
                                ) : (
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">FOUND ITEM</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    {/* Only show Delete for Reports */}
                                    {activeTab === "reports" && (
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="text-gray-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-full"
                                            title="Delete"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    )}
                                    {/* View Button (Placeholder for now) */}
                                    <button 
                                        className="text-gray-400 hover:text-blue-600 transition p-2 hover:bg-blue-50 rounded-full"
                                        title="View Details"
                                        onClick={() => alert(`Details:\n${item.description}\nLocation: ${item.location}`)}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}