"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../../lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"; // Added deleteDoc
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Link from "next/link";

export default function ItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Claim Logic State
  const [guess, setGuess] = useState("");
  const [showContact, setShowContact] = useState(false);

  // ADMIN CONFIG
  const ADMIN_EMAIL = "prathameshtandale724@gmail.com"; 

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "items", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setItem({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert("Item not found");
          router.push("/browse");
        }
      } catch (error) {
        console.error("Error fetching item:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, router]);

  // DELETE FUNCTION (For Owner or Admin)
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to PERMANENTLY delete this listing?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "items", item.id));
      alert("Item deleted successfully.");
      router.push("/browse"); // Send them back to the feed
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete item.");
    }
  };

  const handleClaim = async () => {
    if (!user) {
      alert("Please sign in to claim this item.");
      return;
    }

    if (item.type !== "LOST") {
        if (guess.toLowerCase().trim() === item.securityAnswer?.toLowerCase().trim()) {
            if (confirm("✅ Correct Answer! Reserve this item?")) {
                await updateDoc(doc(db, "items", item.id), {
                    status: "PENDING",
                    claimedBy: user.email,
                    claimedAt: new Date().toISOString()
                });
                alert("Item Reserved! Visit the Admin Desk.");
                window.location.reload(); 
            }
        } else {
            alert("❌ Incorrect Answer. Please try again.");
        }
    } else {
        setShowContact(true);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!item) return null;

  const isLost = item.type === "LOST";
  const badgeColor = isLost ? "bg-orange-100 text-orange-800" : "bg-emerald-100 text-emerald-800";

  // CHECK PERMISSIONS
  const isOwner = user && user.uid === item.uid;
  const isAdmin = user && user.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        
        <Link href="/browse" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Browse
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN (Details) */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-black rounded-2xl overflow-hidden shadow-sm aspect-video relative group">
                    <img 
                        src={item.imageUrl || "https://placehold.co/800x600?text=No+Image"} 
                        className="w-full h-full object-contain bg-gray-900" 
                        alt={item.description}
                    />
                    <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${badgeColor}`}>
                        ● {item.type || "FOUND"}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <div className="mb-6">
                        <span className="text-blue-600 font-bold text-sm uppercase tracking-wide">{item.category}</span>
                        <h1 className="text-3xl font-bold text-gray-900 mt-2">{item.description}</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase">Location</p>
                                <p className="text-gray-900 font-semibold">{item.location}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase">Date Reported</p>
                                <p className="text-gray-900 font-semibold">{item.date || new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed mb-8">
                        {item.details || item.description}
                    </p>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 items-start">
                        <svg className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        <div>
                            <p className="text-sm font-bold text-blue-900">Privacy Protected</p>
                            <p className="text-sm text-blue-800 mt-1">
                                {isLost 
                                    ? "Contact information is hidden until you click reveal." 
                                    : "Security answers are hidden. You must prove ownership to claim this item."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN (Action Sidebar) */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* --- MANAGEMENT CARD (Only for Owner or Admin) --- */}
                {(isOwner || isAdmin) ? (
                    <div className="bg-white rounded-2xl p-6 border-2 border-red-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-red-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            <h3 className="font-bold">Manage Listing</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                            {isOwner ? "You posted this item." : "You are viewing this as Admin."} 
                            <br/>You can remove it if it has been resolved.
                        </p>
                        <button 
                            onClick={handleDelete}
                            className="w-full bg-white border border-red-200 text-red-600 py-3 rounded-xl font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Delete Listing
                        </button>
                    </div>
                ) : (
                    // --- STANDARD CLAIM CARD (For everyone else) ---
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                            <h3 className="font-bold text-gray-900">
                                {isLost ? "Have you found this?" : "Is this yours?"}
                            </h3>
                        </div>

                        <p className="text-sm text-gray-500 mb-6">
                            {isLost 
                                ? "If you found this item, please contact the owner to arrange a return." 
                                : "If you believe this item belongs to you, submit a claim to begin the verification process."}
                        </p>
                        
                        {item.status !== "OPEN" ? (
                            <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-bold text-center">
                                Item {item.status}
                            </div>
                        ) : isLost ? (
                            !showContact ? (
                                <button 
                                    onClick={() => setShowContact(true)}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                                >
                                    Contact Owner
                                </button>
                            ) : (
                                <div className="bg-gray-100 p-4 rounded-xl text-center animate-in fade-in">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Owner Contact</p>
                                    <p className="text-lg font-bold text-gray-900 select-all">{item.contactInfo}</p>
                                </div>
                            )
                        ) : (
                            <div className="space-y-3">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-xs font-bold text-blue-800 uppercase mb-1">Security Question</p>
                                    <p className="text-sm text-blue-900 font-medium">{item.securityQuestion}</p>
                                </div>
                                <input 
                                    type="text"
                                    placeholder="Type your answer..."
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                                    value={guess}
                                    onChange={(e) => setGuess(e.target.value)}
                                />
                                <button 
                                    onClick={handleClaim}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                                >
                                    Submit Claim
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* HELP CARD */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-blue-100 text-blue-600 p-1 rounded-full">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm">Need Help?</h4>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                        Contact our support team if you have questions about the claim process.
                    </p>
                    <button 
                        onClick={() => window.location.href = 'mailto:prathameshtandale724@gmail.com'}
                        className="text-blue-600 text-xs font-bold hover:underline"
                    >
                        Get Support →
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}