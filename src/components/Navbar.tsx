"use client";
import Link from "next/link";
import { auth, googleProvider } from "../lib/firebase"; // Added googleProvider
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 font-sans">
       <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          {/* LEFT: LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
             <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform shadow-blue-200 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">Lost & Found</span>
          </Link>

          {/* CENTER: LINKS */}
          <div className="hidden md:flex items-center gap-8">
             <NavLink href="/" label="Home" isActive={pathname === "/"} />
             <NavLink href="/browse" label="Browse Items" isActive={pathname === "/browse"} />
             
             {/* Only show these if logged in */}
             {user && (
               <>
                 <NavLink href="/report-item" label="Report Item" isActive={pathname === "/report-item"} />
                 <NavLink href="/dashboard" label="Dashboard" isActive={pathname === "/dashboard"} />
               </>
             )}
          </div>

          {/* RIGHT: ACTIONS */}
          <div className="flex items-center gap-6">
             
             {user ? (
               // LOGGED IN VIEW
               <>
                 <Link href="/admin">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold shadow-md shadow-blue-100 transition-all transform hover:-translate-y-0.5 text-sm">
                       Admin
                    </button>
                 </Link>

                 <div className="h-6 w-px bg-gray-200"></div>

                 <div className="flex items-center gap-3 group relative">
                    <div className="relative cursor-pointer">
                        <img
                          src={user.photoURL || "https://ui-avatars.com/api/?name=User"}
                          alt="Profile"
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100 hover:ring-blue-100 transition"
                        />
                        
                        {/* Tooltip */}
                        <div className="absolute top-12 right-0 w-64 bg-white shadow-xl rounded-xl border border-gray-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                            <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-50">
                                <img src={user.photoURL} className="w-10 h-10 rounded-full bg-gray-100" />
                                <div className="overflow-hidden">
                                    <p className="text-gray-900 font-bold text-sm truncate">{user.displayName}</p>
                                    <p className="text-gray-400 text-xs truncate">{user.email}</p>
                                </div>
                            </div>
                            <p className="text-xs text-center text-blue-600 font-semibold">Student ID Verified</p>
                        </div>
                    </div>

                    <button onClick={() => signOut(auth)} className="text-red-500 font-medium text-sm hover:text-red-600 transition">
                      Sign Out
                    </button>
                 </div>
               </>
             ) : (
               // LOGGED OUT VIEW
               <button 
                 onClick={handleLogin}
                 className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition shadow-sm"
               >
                 Sign In
               </button>
             )}
          </div>
       </div>
    </nav>
  );
}

function NavLink({ href, label, isActive }: { href: string, label: string, isActive: boolean }) {
    return (
        <Link 
            href={href} 
            className={`text-[15px] font-medium transition-colors ${
                isActive ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-blue-600'
            }`}
        >
            {label}
        </Link>
    )
}