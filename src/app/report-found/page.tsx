"use client";
import { useState, useEffect } from "react";
// Relative import
import { auth, db, storage } from "../../lib/firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ReportPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Form States
  const [image, setImage] = useState<File | null>(null);
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/"); 
      else setUser(u);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !desc || !answer) {
      alert("Please upload an image and fill all fields.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload Image
      const imageRef = ref(storage, `found_items/${Date.now()}-${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      // 2. Save Data to Firestore
      await addDoc(collection(db, "items"), {
        uid: user.uid,
        type: "FOUND",
        description: desc,
        location: location,
        securityQuestion: question,
        securityAnswer: answer.toLowerCase().trim(),
        imageUrl: imageUrl,
        status: "OPEN",
        createdAt: serverTimestamp(),
      });

      alert("Success! Item reported.");
      router.push("/");
    } catch (error: any) {
      console.error("CRITICAL ERROR:", error);
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
          <h2 className="text-2xl font-bold text-blue-700">Report Found Item</h2>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">Cancel</Link>
        </div>

        <p className="text-gray-500 text-sm mb-6">
          Help return this item to its owner.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && setImage(e.target.files[0])}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 transition"
            />
          </div>

          {/* Details - NOW WITH LABELS */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">What did you find?</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="e.g. Black Dell Keyboard"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Where did you find it?</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="e.g. Lab D203, Desk 4"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <hr className="border-gray-200 my-4" />
          
          {/* Security Section */}
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-800 uppercase mb-3 tracking-wide flex items-center gap-2">
              🛡️ Verification Setup
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-blue-900 mb-1">Security Question</label>
                <input
                  className="w-full p-2 border border-blue-200 rounded text-gray-900 placeholder-gray-400 focus:border-blue-500 outline-none text-sm bg-white"
                  placeholder="e.g. What is the serial number?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-blue-900 mb-1">Hidden Answer</label>
                <input
                  className="w-full p-2 border border-blue-200 rounded text-gray-900 placeholder-gray-400 focus:border-blue-500 outline-none text-sm bg-white"
                  placeholder="e.g. CN-12345"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <p className="text-[10px] text-blue-600 mt-1">
                  * This answer is hidden from everyone except the system.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400 shadow-md"
          >
            {loading ? "Uploading..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}