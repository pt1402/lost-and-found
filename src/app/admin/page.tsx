"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // REPLACE THIS WITH YOUR REAL EMAIL
  const ADMIN_EMAIL = "prathameshtandale724@gmail.com"; 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/");
      } else if (u.email !== ADMIN_EMAIL) {
        alert("ACCESS DENIED: You are not an admin.");
        router.push("/");
      } else {
        setUser(u);
        fetchPendingItems();
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchPendingItems = async () => {
    try {
      // Fetch items waiting for approval
      const q = query(collection(db, "items"), where("status", "==", "PENDING"));
      const querySnapshot = await getDocs(q);
      const itemsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPendingItems(itemsList);
    } catch (error) {
      console.error("Error fetching admin items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveHandover = async (itemId: string) => {
    const confirm = window.confirm("Confirm that you have verified the student's ID and handed over the item?");
    if (!confirm) return;

    try {
      const itemRef = doc(db, "items", itemId);
      await updateDoc(itemRef, {
        status: "CLAIMED", // Final status (History)
        handedOverAt: new Date().toISOString()
      });
      alert("Item marked as CLOSED.");
      fetchPendingItems(); 
    } catch (error) {
      alert("Error updating item.");
    }
  };

  const handleRejectClaim = async (itemId: string) => {
    const confirm = window.confirm("Reject this claim? The item will be publicly visible again.");
    if (!confirm) return;

    try {
      const itemRef = doc(db, "items", itemId);
      await updateDoc(itemRef, {
        status: "OPEN",   // Send back to public feed
        claimedBy: null,  // Wipe the claimer info
        claimedAt: null
      });
      alert("Claim rejected. Item is OPEN for others again.");
      fetchPendingItems(); 
    } catch (error) {
      alert("Error rejecting item.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl">👮‍♂️</span>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 transition">
            <span>←</span> Back to Home
          </Link>
        </div>

        {/* Main Content Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b border-gray-100 pb-4">
            Pending Handovers
          </h2>
          
          {pendingItems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <p className="text-gray-500 text-lg">No items waiting for verification.</p>
              <p className="text-gray-400 text-sm mt-1">Great job! All claims are processed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingItems.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-6 items-start bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  {/* Image Thumbnail */}
                  <img 
                    src={item.imageUrl} 
                    alt={item.description}
                    className="w-32 h-32 object-cover rounded-lg bg-gray-100 border border-gray-200" 
                  />
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-bold text-2xl text-gray-900">{item.description}</h3>
                      <p className="text-gray-600 flex items-center gap-2 mt-1">
                        📍 {item.location}
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm space-y-2">
                      <p className="flex gap-2">
                        <span className="font-semibold text-blue-900">Claimed By:</span> 
                        <span className="text-blue-700 font-medium break-all">{item.claimedBy}</span>
                      </p>
                      <p className="flex gap-2">
                        <span className="font-semibold text-blue-900">Question:</span> 
                        <span className="text-gray-700">{item.securityQuestion}</span>
                      </p>
                      <p className="flex gap-2">
                        <span className="font-semibold text-blue-900">Answer Given:</span> 
                        <span className="font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">{item.securityAnswer}</span>
                      </p>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
                    <button 
                      onClick={() => handleApproveHandover(item.id)}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      ✅ Confirm Handover
                    </button>
                    
                    <button 
                      onClick={() => handleRejectClaim(item.id)}
                      className="bg-white text-red-600 border border-red-200 px-6 py-3 rounded-lg font-bold hover:bg-red-50 hover:border-red-300 transition-colors flex items-center justify-center gap-2"
                    >
                      ❌ Reject Claim
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}