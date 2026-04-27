import { useState, useEffect } from "react";

export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOffline(!window.navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-9999 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="bg-slate-900 border-2 border-red-500/50 p-8 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.2)] max-w-sm text-center">
        <div className="text-6xl mb-4 animate-bounce">📡</div>
        <h2 className="text-2xl font-bold text-white mb-3">Sin Conexión a Internet</h2>
        <p className="text-slate-400 mb-6">
          Tu respuesta no se puede guardar. Por favor, verifica el Wi-Fi o el cable de red para continuar.
        </p>
        <div className="flex items-center justify-center gap-2 text-red-400 font-bold uppercase text-xs tracking-widest">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          Esperando señal...
        </div>
      </div>
    </div>
  );
}