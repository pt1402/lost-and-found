"use client";
import { useState, useEffect } from "react";
import { auth, db, googleProvider } from "../lib/firebase"; 
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Recent Items (Last 4)
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        // Fetch items sorted by newest first
        const q = query(
          collection(db, "items"), 
          where("status", "==", "OPEN"),
          orderBy("createdAt", "desc"), 
          limit(4)
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentItems(items);
      } catch (error) {
        console.error("Error fetching recent items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const handleLogin = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const scrollToBrowse = () => {
    document.getElementById("browse-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100">
      
      {/* --- NAVBAR --- */}
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="bg-white border-b border-gray-100 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <p className="text-sm font-bold text-blue-600 tracking-wider uppercase mb-2">Campus Recovery System</p>
              <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight">
                WELCOME <br/>
                <span className="text-blue-600">{user ? user.displayName?.split(" ")[0] : "STUDENT"}!</span>
              </h1>
              <p className="text-xl text-gray-500 mt-6 leading-relaxed max-w-lg">
                Have you lost or found something recently? Report it immediately or browse our community listings to reunite with your belongings.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button onClick={scrollToBrowse} className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Browse Items
              </button>
              <Link href="/report-item">
                <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition flex items-center gap-2">
                  Report an Item
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
              </Link>
            </div>

            {user && (
              <Link href="/dashboard" className="inline-flex items-center text-blue-600 font-semibold hover:underline mt-4 group">
                Go to Dashboard 
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            )}
          </div>

          {/* Right Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <FeatureCard 
               icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
               title="Smart Search"
               desc="Find lost items quickly with powerful filters by category, location, and date."
             />
             <FeatureCard 
               icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
               title="Verified Claims"
               desc="Multi-step verification ensures items are returned to rightful owners."
             />
             <FeatureCard 
               icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
               title="Privacy First"
               desc="Personal details are hidden until ownership is verified and approved."
             />
             <FeatureCard 
               icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
               title="Track Progress"
               desc="Monitor your reports and claim statuses in real-time."
             />
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-16">Our streamlined process ensures safe and verified item recovery for everyone on campus.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gray-200 -z-10"></div>

            <StepCard number="01" title="Report Item" desc="Submit a detailed report of your lost or found item with images." icon="📝" />
            <StepCard number="02" title="Browse & Match" desc="Search through listings using filters to find matches." icon="🔍" />
            <StepCard number="03" title="Verify Ownership" desc="Answer security questions to prove the item is yours." icon="🛡️" />
            <StepCard number="04" title="Safe Recovery" desc="Connect securely with the finder to arrange item return." icon="🤝" />
          </div>
        </div>
      </section>

      {/* --- RECENT LISTINGS --- */}
      <section id="browse-section" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Recent Listings</h2>
              <p className="text-gray-500">Browse the latest lost and found reports from our community</p>
            </div>
            <Link href="/browse" className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1 transition">
              View All <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>

          {loading ? (
             <div className="text-center py-20 text-gray-400">Loading listings...</div>
          ) : recentItems.length === 0 ? (
             <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
               <p className="text-gray-500 text-lg">No items listed yet.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentItems.map((item) => (
                <ListingCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <span className="text-lg font-bold">Lost & Found</span>
          </div>
          <p className="text-gray-400 text-sm">© 2026 Campus Recovery System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// --- SUB COMPONENTS ---

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition">
      <div className="shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StepCard({ number, title, desc, icon }: { number: string, title: string, desc: string, icon: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative group hover:-translate-y-1 transition duration-300">
      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm absolute -top-5 left-1/2 -translate-x-1/2 ring-4 ring-white">
        {number}
      </div>
      <div className="w-16 h-16 bg-blue-50 text-3xl flex items-center justify-center rounded-2xl mx-auto mb-6 group-hover:scale-110 transition">
        {icon}
      </div>
      <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function ListingCard({ item }: { item: any }) {
  const isLost = item.type === "LOST";
  const badgeColor = isLost ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700";
  const badgeText = isLost ? "LOST" : "FOUND";

  return (
    // WRAPPED IN LINK
    <Link href={`/items/${item.id}`} className="block h-full"> 
      <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition duration-300 flex flex-col h-full">
        {/* Image Area */}
        <div className="h-56 bg-gray-100 relative overflow-hidden">
          <img 
            src={item.imageUrl || "https://placehold.co/400x300?text=No+Image"} 
            alt={item.description} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${badgeColor}`}>
            ● {badgeText}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-2">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              {item.category || "General Item"}
            </p>
            <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1 group-hover:text-blue-600 transition">
              {item.description}
            </h3>
          </div>

          <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1">
            {item.details || item.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-4 mt-auto">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="truncate max-w-[80px]">{item.location}</span>
            </div>
            <div className="flex items-center gap-1">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               <span>{item.date || new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}