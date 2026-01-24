"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase"; 
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../../components/Navbar";

export default function BrowsePage() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [typeFilter, setTypeFilter] = useState("All Types"); // Lost vs Found

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // 1. Fetch ALL Open Items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(
          collection(db, "items"),
          where("status", "==", "OPEN"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(data);
        setFilteredItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // 2. Filter Logic
  useEffect(() => {
    let result = items;

    // Search Filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.description.toLowerCase().includes(lowerSearch) ||
        item.location.toLowerCase().includes(lowerSearch) ||
        item.category?.toLowerCase().includes(lowerSearch)
      );
    }

    // Category Filter
    if (category !== "All Categories") {
      result = result.filter(item => item.category === category);
    }

    // Type Filter (Lost vs Found)
    if (typeFilter !== "All Types") {
        if (typeFilter === "Lost Items") {
            result = result.filter(item => item.type === "LOST");
        } else {
            // Found items might be "FOUND" or missing type (legacy)
            result = result.filter(item => item.type !== "LOST");
        }
    }

    setFilteredItems(result);
  }, [searchTerm, category, typeFilter, items]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Items</h1>
          <p className="text-gray-500 mt-1">Search through lost and found items in your area</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 mb-8">
            
            {/* Search Input */}
            <div className="flex-1 relative">
                <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                    type="text" 
                    placeholder="Search items..." 
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Category Dropdown */}
            <div className="w-full md:w-48">
                <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 cursor-pointer"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option>All Categories</option>
                    <option>Electronics</option>
                    <option>Clothing</option>
                    <option>Accessories</option>
                    <option>Documents</option>
                    <option>Bags</option>
                    <option>Personal Items</option>
                    <option>Other</option>
                </select>
            </div>

            {/* Type Dropdown */}
            <div className="w-full md:w-48">
                <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 cursor-pointer"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option>All Types</option>
                    <option>Lost Items</option>
                    <option>Found Items</option>
                </select>
            </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-500 mb-6">Showing <span className="font-bold text-gray-900">{filteredItems.length}</span> items</p>

        {/* Grid */}
        {loading ? (
             <div className="text-center py-20 text-gray-400">Loading library...</div>
        ) : filteredItems.length === 0 ? (
             <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
               <p className="text-gray-500 text-lg">No items match your search.</p>
               <button onClick={() => {setSearchTerm(""); setCategory("All Categories"); setTypeFilter("All Types")}} className="text-blue-600 font-bold mt-2 hover:underline">Clear Filters</button>
             </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredItems.map((item) => (
                    <BrowseCard key={item.id} item={item} />
                ))}
            </div>
        )}

      </div>
    </div>
  );
}

// --- CARD COMPONENT ---
function BrowseCard({ item }: { item: any }) {
  const isLost = item.type === "LOST";
  const badgeColor = isLost ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700";
  const badgeText = isLost ? "LOST" : "FOUND";

  // WRAPPED IN LINK 👇
  return (
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
  
          {/* Footer Info */}
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