"use client";
import { useState, useEffect } from "react";
import { auth, db, storage } from "../../lib/firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ReportLostPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Form States
  const [image, setImage] = useState<File | null>(null);
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/"); 
      else setUser(u);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !location || !contact) {
      alert("Please fill in the description, location, and contact info.");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = "";

      if (image) {
        const imageRef = ref(storage, `lost_requests/${Date.now()}-${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "items"), {
        uid: user.uid,
        type: "LOST", 
        description: desc,
        location: location,
        contactInfo: contact,
        imageUrl: imageUrl || "https://placehold.co/400x300?text=No+Image",
        status: "OPEN",
        createdAt: serverTimestamp(),
      });

      alert("Lost Item Request Posted!");
      router.push("/");
    } catch (error: any) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-500">Verifying access...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-red-600">Report Lost Item</h2>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">Cancel</Link>
        </div>
        
        <p className="text-gray-500 text-sm mb-6">
          Post a public request. If someone finds it, they can contact you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Details */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">What did you lose?</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 outline-none transition"
              placeholder="e.g. Red Water Bottle"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Where did you last see it?</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 outline-none transition"
              placeholder="e.g. Library, Table 4"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Info (Phone/Email)</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 outline-none transition"
              placeholder="e.g. Call 999-888-7777"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          {/* Optional Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Reference Photo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && setImage(e.target.files[0])}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:bg-gray-400 shadow-md"
          >
            {loading ? "Posting..." : "Post Lost Request"}
          </button>
        </form>
      </div>
    </div>
  );
}