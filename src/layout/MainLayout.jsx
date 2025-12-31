import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { doc,getDoc} from "firebase/firestore";
import { auth,db } from "../services/firebase";
import Footer from "../components/Footer";
export default function MainLayout() {
  const[Username,setUsername]=useState("")
  const[IndustryNode,setIndustryNode]=useState("")
    useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;


      if (!currentUser) return;

      const userRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();


        setUsername(data.email);       
        setIndustryNode(data.role);    
      }
    };

    fetchUser();
  }, []);
  return (
    <div className="flex min-h-screen bg-aqua-dark overflow-hidden">

      <Sidebar />


      <main className="flex-1 flex flex-col h-screen overflow-y-auto">

        <nav className="h-16 border-b border-aqua-border flex items-center px-8 justify-between backdrop-blur-md sticky top-0 z-50">
          <span className="text-aqua-cyan font-black tracking-[0.3em] text-sm">
            AQUALOOP AI
          </span>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                {IndustryNode || "Industry"}
              </p>
              <p className="text-white text-xs font-medium">{Username || "Loading..."}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-aqua-surface border border-aqua-border" />{Username?.[0]?.toUpperCase() || "U"}</div>
        </nav>

        <div className="p-6 lg:p-10">
          <Outlet />
        </div>
        <div>
          <Footer/>
        </div>
      </main>
    </div>
  );
}
