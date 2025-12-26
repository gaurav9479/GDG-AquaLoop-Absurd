import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function MainLayout() {
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
                Industry Node
              </p>
              <p className="text-white text-xs font-medium">Factory_Alpha_01</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-aqua-surface border border-aqua-border" />
          </div>
        </nav>

        <div className="p-6 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
