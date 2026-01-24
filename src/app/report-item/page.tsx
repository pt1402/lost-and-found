"use client";
import { useState, useEffect } from "react";
import { auth, db, storage } from "../../lib/firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar"; // Import the Navbar

export default function ReportItemPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<"LOST" | "FOUND">("LOST"); 
  const router = useRouter();

  // Shared Form States
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Electronics"); 
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState<File | null>(null);

  // Specific States
  const [contactInfo, setContactInfo] = useState(""); 
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
    setLoading(true);

    try {
      if (!itemName || !description || !location || !date) {
        alert("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      if (reportType === "FOUND" && (!image || !question || !answer)) {
         alert("Found items require an image and security question.");
         setLoading(false);
         return;
      }

      if (reportType === "LOST" && !contactInfo) {
          alert("Please provide contact info so people can reach you.");
          setLoading(false);
          return;
      }

      let imageUrl = "";
      if (image) {
        const folder = reportType === "LOST" ? "lost_requests" : "found_items";
        const imageRef = ref(storage, `${folder}/${Date.now()}-${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      } else if (reportType === "LOST") {
          imageUrl = "https://placehold.co/400x300?text=No+Image";
      }

      const itemData: any = {
        uid: user.uid,
        type: reportType,
        description: itemName, 
        details: description,  
        category: category,
        location: location,
        date: date,
        imageUrl: imageUrl,
        status: "OPEN",
        createdAt: serverTimestamp(),
      };

      if (reportType === "LOST") {
        itemData.contactInfo = contactInfo;
      } else {
        itemData.securityQuestion = question;
        itemData.securityAnswer = answer.toLowerCase().trim();
      }

      await addDoc(collection(db, "items"), itemData);

      alert(`${reportType === "LOST" ? "Lost Request" : "Found Item"} Reported Successfully!`);
      router.push("/dashboard");

    } catch (error: any) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-500">Verifying access...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* 1. Navbar stays at top, full width */}
      <Navbar />

      {/* 2. Page Content centered below */}
      <div className="flex justify-center p-6">
        <div className="w-full max-w-3xl">
          
          {/* Header */}
          <div className="mb-8 flex justify-between items-center mt-4">
              <div>
                  <h1 className="text-3xl font-bold text-gray-900">Report an Item</h1>
                  <p className="text-gray-500">Help reunite lost items with their owners</p>
              </div>
              
              {/* FIXED CANCEL BUTTON: Uses router.back() */}
              <button 
                onClick={() => router.back()} 
                className="text-gray-500 hover:text-gray-700 font-semibold px-4 py-2 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
          </div>

          {/* Toggle Switch */}
          <div className="bg-gray-100 p-1 rounded-lg flex mb-8">
              <button 
                  onClick={() => setReportType("LOST")}
                  className={`flex-1 py-3 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    reportType === "LOST" 
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-200"
                  }`}
              >
                  <span className="text-lg">⚠️</span> I Lost Something
              </button>
              <button 
                  onClick={() => setReportType("FOUND")}
                  className={`flex-1 py-3 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    reportType === "FOUND" 
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-200"
                  }`}
              >
                  <span className="text-lg">🙌</span> I Found Something
              </button>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${reportType === "LOST" ? "bg-red-500" : "bg-blue-500"}`}></span>
                <h2 className="text-xl font-bold text-gray-900">
                    {reportType === "LOST" ? "Report Lost Item" : "Report Found Item"}
                </h2>
              </div>
              <p className="text-sm text-gray-500 mb-6 ml-4">
                  {reportType === "LOST" 
                      ? "Provide as much detail as possible to help identify your item" 
                      : "Thank you for helping! Please provide details about the item you found."}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Row 1: Name & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name *</label>
                          <input 
                              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                              placeholder={reportType === "LOST" ? "e.g., iPhone 14 Pro" : "e.g., Brown Leather Wallet"}
                              value={itemName}
                              onChange={(e) => setItemName(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                          <select 
                              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition"
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                          >
                              <option>Electronics</option>
                              <option>Clothing</option>
                              <option>Accessories</option>
                              <option>Documents</option>
                              <option>Bags</option>
                              <option>Personal Items</option>
                              <option>Other</option>
                          </select>
                      </div>
                  </div>

                  {/* Description */}
                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                      <textarea 
                          className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition h-32 resize-none"
                          placeholder="Describe the item in detail (color, brand, size, distinguishing marks...)"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                      />
                  </div>

                  {/* Row 2: Location & Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                              {reportType === "LOST" ? "Last Known Location *" : "Where Found *"}
                          </label>
                          <input 
                              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                              placeholder="e.g., Central Library, Table 4"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                              {reportType === "LOST" ? "Date Lost *" : "Date Found *"}
                          </label>
                          <input 
                              type="date"
                              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                          />
                      </div>
                  </div>

                  {/* CONDITIONAL SECTIONS */}
                  
                  {reportType === "LOST" ? (
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Info (Phone/Email) *</label>
                          <input 
                              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                              placeholder="e.g., Call 999-888-7777"
                              value={contactInfo}
                              onChange={(e) => setContactInfo(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">This will be visible to people who find your item.</p>
                      </div>
                  ) : (
                      <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                          <p className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
                              🛡️ Verification Setup (Anti-Fraud)
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-semibold text-blue-900 mb-1">Security Question</label>
                                  <input
                                      className="w-full p-2 border border-blue-200 rounded text-gray-900 text-sm focus:border-blue-500 outline-none"
                                      placeholder="e.g. What is the wallpaper?"
                                      value={question}
                                      onChange={(e) => setQuestion(e.target.value)}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-blue-900 mb-1">Hidden Answer</label>
                                  <input
                                      className="w-full p-2 border border-blue-200 rounded text-gray-900 text-sm focus:border-blue-500 outline-none"
                                      placeholder="e.g. A dog"
                                      value={answer}
                                      onChange={(e) => setAnswer(e.target.value)}
                                  />
                              </div>
                          </div>
                      </div>
                  )}

                  {/* Image Upload */}
                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Image {reportType === "LOST" ? "(Optional)" : "(Required)"}
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative">
                          <input 
                              type="file" 
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => e.target.files && setImage(e.target.files[0])}
                          />
                          <div className="flex flex-col items-center">
                              {image ? (
                                  <p className="text-green-600 font-bold">Selected: {image.name}</p>
                              ) : (
                                  <>
                                      <span className="text-4xl mb-2 text-gray-300">📷</span>
                                      <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                                  </>
                              )}
                          </div>
                      </div>
                  </div>

                  <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-4 rounded-xl font-bold text-white shadow-md transition-all ${reportType === "LOST" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
                  >
                      {loading ? "Submitting..." : `Submit ${reportType === "LOST" ? "Lost Item" : "Found Item"} Report`}
                  </button>

              </form>
          </div>
        </div>
      </div>
    </div>
  );
}