"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, update } from "firebase/database";

// --- 1. DATA MASTER SISWA ---
const DATA_SEKOLAH = {
  SMP: {
    "Kelas 7A": ["Ahmad", "Budi", "Chika", "Dedi", "Eka", "Fani"],
    "Kelas 7B": ["Gita", "Hani", "Indra", "Joko", "Kiki", "Lala"],
  },
  SMK: {
    "10 RPL": ["Michael", "Nina", "Opick", "Putri", "Qori", "Rina"],
    "10 TKJ": ["Sandi", "Tono", "Umar", "Vivi", "Wawan", "Xena"],
  }
};

export default function AppRapor() {
  // --- STATE ---
  const [role, setRole] = useState(null); 
  const [jenjang, setJenjang] = useState("");
  const [kelas, setKelas] = useState("");
  
  // activeCall: Hanya dikontrol oleh GURU SEKOLAH
  const [activeCall, setActiveCall] = useState({ nama: "-", pos: "-", status: "idle" });
  
  const [progressSiswa, setProgressSiswa] = useState({}); 
  const [selectedSiswa, setSelectedSiswa] = useState("");

  // --- LOGIC: Koneksi Firebase & Notif ---
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    if (!jenjang || !kelas) return;
    const dbRef = ref(db, `sekolah/${jenjang}/${kelas}`);
    
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.active) {
            // Logic Notif Pop-up
            const newStatus = data.active.status;
            const newName = data.active.nama;
            const currentName = activeCall.nama;
            
            if (newStatus !== "idle" && newName !== "-" && role === "ORTU") {
                if (newName !== currentName || newStatus !== activeCall.status) {
                     if (document.hidden) { 
                        const title = newStatus === 'bersiap' ? "⚠️ PERSIAPAN!" : "📢 SILAKAN MASUK!";
                        const body = newStatus === 'bersiap' 
                            ? `Ananda ${newName} harap bersiap di ${data.active.pos}.` 
                            : `Giliran Ananda ${newName} masuk ruangan ${data.active.pos} sekarang!`;
                        if (Notification.permission === "granted") {
                           new Notification(title, { body: body, icon: "/icon.png", tag: "antrian" });
                        }
                    }
                }
            }
            setActiveCall(data.active);
        }
        if (data.progress) setProgressSiswa(data.progress);
      } else {
        setActiveCall({ nama: "Belum Dimulai", pos: "-", status: "idle" });
        setProgressSiswa({});
      }
    });
    return () => unsubscribe();
  }, [jenjang, kelas, role, activeCall]);

  // --- ACTIONS GURU SEKOLAH ---
  const updateActiveScreen = (nama, pos, status) => {
    update(ref(db), {
        [`sekolah/${jenjang}/${kelas}/active`]: { nama, pos, status }
    });
  };

  const btnSekolahBersiap = () => {
    if (!selectedSiswa) return alert("Pilih siswa dulu!");
    updateActiveScreen(selectedSiswa, "SEKOLAH", "bersiap");
  };
  const btnSekolahMasuk = () => {
    const nama = selectedSiswa || activeCall.nama;
    if(!nama || nama === '-') return alert("Belum ada siswa dipilih");
    updateActiveScreen(nama, "SEKOLAH", "masuk");
  };
  const btnSekolahSelesai = () => {
    const nama = activeCall.nama;
    if(nama === '-' || nama === 'MENUNGGU...') return;

    const currentStatus = progressSiswa[nama];
    let nextStatus = currentStatus === 'done_asrama' ? 'selesai_total' : 'done_sekolah';

    const updates = {};
    updates[`sekolah/${jenjang}/${kelas}/active`] = { nama: "MENUNGGU...", pos: "TRANSISI", status: "idle" };
    updates[`sekolah/${jenjang}/${kelas}/progress/${nama}`] = nextStatus;
    update(ref(db), updates);
    setSelectedSiswa("");
  };

  // --- ACTIONS GURU ASRAMA ---
  const btnAsramaCeklis = () => {
    if (!selectedSiswa) return alert("Pilih siswa yang mau ditandai selesai!");
    const nama = selectedSiswa;
    const currentStatus = progressSiswa[nama];
    let nextStatus = currentStatus === 'done_sekolah' ? 'selesai_total' : 'done_asrama';

    const updates = {};
    updates[`sekolah/${jenjang}/${kelas}/progress/${nama}`] = nextStatus;
    update(ref(db), updates);
    setSelectedSiswa(""); 
  };

  // --- FILTER DROPDOWN ---
  const getListSiswa = () => {
    const allSiswa = DATA_SEKOLAH[jenjang]?.[kelas] || [];
    if (role === 'GURU_SEKOLAH') {
      return allSiswa.filter(nama => {
        const p = progressSiswa[nama];
        return p !== 'done_sekolah' && p !== 'selesai_total';
      });
    }
    if (role === 'GURU_ASRAMA') {
      return allSiswa.filter(nama => {
        const p = progressSiswa[nama];
        return p !== 'done_asrama' && p !== 'selesai_total';
      });
    }
    return [];
  };

  // --- RENDER ---
  if (!role) return <MenuAwal setRole={setRole} />;
  if (!jenjang || !kelas) return <MenuKelas setJenjang={setJenjang} setKelas={setKelas} setRole={setRole} />;

  // 1. MONITOR / REKAP
  if (role === "MONITOR") {
    const allSiswa = DATA_SEKOLAH[jenjang]?.[kelas] || [];
    const selesaiTotal = allSiswa.filter(n => progressSiswa[n] === 'selesai_total').length;
    return (
      <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-2xl tracking-tight">📊 Rekapitulasi</h2>
                    <p className="text-slate-400 text-sm">{jenjang} - {kelas}</p>
                </div>
                <button onClick={() => setKelas("")} className="text-xs bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-full transition">Ganti Kelas</button>
            </div>
            <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-emerald-100 text-center">
                <div className="text-5xl font-extrabold text-emerald-600 mb-2">{selesaiTotal} <span className="text-2xl text-emerald-400 font-medium">/ {allSiswa.length}</span></div>
                <div className="text-sm font-bold text-emerald-700 uppercase tracking-widest">Siswa Selesai Total</div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Nama Siswa</th>
                            <th className="px-6 py-4 text-center font-semibold">Sekolah</th>
                            <th className="px-6 py-4 text-center font-semibold">Asrama</th>
                            <th className="px-6 py-4 text-center font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {allSiswa.map((nama, idx) => {
                            const status = progressSiswa[nama];
                            const doneSekolah = status === 'done_sekolah' || status === 'selesai_total';
                            const doneAsrama = status === 'done_asrama' || status === 'selesai_total';
                            return (
                                <tr key={nama} className={`hover:bg-slate-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                    <td className="px-6 py-4 font-medium text-slate-700">{nama}</td>
                                    <td className="px-6 py-4 text-center">
                                        {doneSekolah ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {doneAsrama ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {status === 'selesai_total' ? 
                                            <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-bold shadow-sm">TUNTAS</span> 
                                            : <span className="text-slate-400 text-xs italic">Belum</span>
                                        }
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    );
  }

  // 2. TAMPILAN GURU (ADMIN)
  if (role.includes("GURU")) {
    const isSekolah = role === "GURU_SEKOLAH";
    const listAvailable = getListSiswa();
    const isActiveMatch = selectedSiswa === activeCall.nama; 

    return (
      <div className={`min-h-screen p-6 font-sans text-slate-800 ${isSekolah ? 'bg-gradient-to-br from-blue-50 to-indigo-100' : 'bg-gradient-to-br from-indigo-50 to-purple-100'}`}>
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-8 bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/40">
            <button onClick={() => setKelas("")} className="text-slate-500 hover:text-slate-800 text-sm font-medium transition flex items-center gap-1">
                 ← Ganti Kelas
            </button>
            <span className={`text-xs px-3 py-1 rounded-full font-bold text-white shadow-lg
                ${isSekolah ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                {isSekolah ? "POS 1: SEKOLAH" : "POS 2: ASRAMA"}
            </span>
          </div>
          
          {isSekolah && (
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                <p className="text-xs text-blue-300 uppercase tracking-widest font-bold mb-1">Live di Layar TV</p>
                <h2 className="text-3xl font-extrabold tracking-tight mb-2 truncate">{activeCall.nama}</h2>
                <div className="flex items-center gap-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${activeCall.status === 'idle' ? 'bg-slate-500' : 'bg-green-400 animate-pulse'}`}></span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${activeCall.status === 'bersiap' ? 'bg-yellow-500 text-black' : activeCall.status === 'masuk' ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    STATUS: {activeCall.status.toUpperCase()}
                    </span>
                </div>
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50">
            <label className="block mb-3 font-bold text-slate-700 text-sm uppercase tracking-wide">
              Pilih Siswa ({listAvailable.length} Antrian):
            </label>
            
            {listAvailable.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-slate-200 text-center text-slate-400 italic mb-6 rounded-2xl">
                    🎉 Tidak ada antrian tersisa!
                </div>
            ) : (
                <div className="relative mb-6">
                    <select 
                    className="w-full p-4 pl-5 pr-10 appearance-none bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition cursor-pointer"
                    onChange={(e) => setSelectedSiswa(e.target.value)}
                    value={selectedSiswa}
                    >
                    <option value="">-- Klik untuk memilih --</option>
                    {listAvailable.map((nama) => (
                        <option key={nama} value={nama}>{nama}</option>
                    ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            )}

            {isSekolah ? (
                <div className="space-y-3">
                    <button onClick={btnSekolahBersiap} className="w-full group bg-amber-400 hover:bg-amber-300 text-amber-900 font-bold py-4 rounded-2xl shadow-lg shadow-amber-400/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                      <span>⚠️</span> PANGGIL: BERSIAP
                    </button>
                    <button onClick={btnSekolahMasuk} disabled={!isActiveMatch && activeCall.status !== 'bersiap'} className="w-full group bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                      <span>📢</span> PANGGIL: MASUK
                    </button>
                    <div className="h-px bg-slate-100 my-4"></div>
                    <button onClick={btnSekolahSelesai} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-2xl border border-slate-200 transition text-sm">
                      ✅ Selesai & Hapus Nama
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-2xl text-sm flex gap-3 items-start">
                        <span className="text-xl">ℹ️</span>
                        <p>Pilih nama siswa yang sudah menghadap Anda, lalu klik tombol di bawah.</p>
                    </div>
                    <button 
                        onClick={btnAsramaCeklis} 
                        disabled={!selectedSiswa}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-600/30 text-lg transition-all active:scale-[0.98]"
                    >
                        ✅ TANDAI SELESAI
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. ORANG TUA
  return <TampilanOrtu activeCall={activeCall} jenjang={jenjang} kelas={kelas} setKelas={setKelas} />;
}

// --- SUB COMPONENTS (Menu dengan Password Modal & Eye Toggle) ---
function MenuAwal({ setRole }) {
  const [showAuth, setShowAuth] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [inputPass, setInputPass] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State untuk Toggle Mata

  const handleMenuClick = (roleTujuan) => {
    if (roleTujuan === "ORTU" || roleTujuan === "MONITOR") {
        setRole(roleTujuan);
    } else {
        setTargetRole(roleTujuan);
        setShowAuth(true);
        setErrorMsg("");
        setInputPass("");
        setShowPassword(false); // Reset mata tertutup setiap kali buka modal
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (targetRole === "GURU_SEKOLAH" && inputPass === "sekolah2025") {
        setRole("GURU_SEKOLAH");
    } else if (targetRole === "GURU_ASRAMA" && inputPass === "asrama2025") {
        setRole("GURU_ASRAMA");
    } else {
        setErrorMsg("Password salah!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 font-sans text-slate-800 relative">
      
      {/* --- MODAL PASSWORD --- */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold mb-4 text-center">🔐 Login Guru</h3>
                <p className="text-sm text-slate-500 mb-4 text-center">
                    Masukkan kode akses untuk masuk ke menu <br/><span className="font-bold text-slate-800">{targetRole === 'GURU_SEKOLAH' ? 'Guru Sekolah' : 'Guru Asrama'}</span>
                </p>
                <form onSubmit={handleLogin}>
                    <div className="relative mb-4">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none pr-12"
                            placeholder="Ketik Kode..."
                            autoFocus
                            value={inputPass}
                            onChange={(e) => setInputPass(e.target.value)}
                        />
                        {/* Tombol Mata */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                            {showPassword ? (
                                // Icon Mata Coret (Hide)
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                // Icon Mata (Show)
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {errorMsg && <p className="text-red-500 text-sm text-center mb-4 font-bold">{errorMsg}</p>}
                    
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mb-2 transition">
                        Masuk
                    </button>
                    <button type="button" onClick={() => setShowAuth(false)} className="w-full text-slate-400 hover:text-slate-600 text-sm font-bold py-2">
                        Batal
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* --- LOGO --- */}
      <div className="mb-6">
         <img src="/logo.png" alt="Logo Sekolah" className="h-28 w-auto mx-auto object-contain drop-shadow-md hover:scale-105 transition-transform" />
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 mb-2">E-Rapor Queue</h1>
        <p className="text-slate-500 font-medium">Sistem Antrian & Checklist Realtime</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
        <button onClick={() => handleMenuClick("ORTU")} className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-xl shadow-slate-200 border border-white hover:border-blue-200 transition-all duration-300 hover:scale-[1.02] text-left">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
            <span className="text-4xl mb-3 block relative z-10">👨‍👩‍👧‍👦</span>
            <div className="relative z-10">
                <h3 className="text-xl font-bold text-slate-800">Layar Orang Tua</h3>
                <p className="text-sm text-slate-400">Untuk melihat nomor antrian</p>
            </div>
        </button>

        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleMenuClick("GURU_SEKOLAH")} className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-5 rounded-3xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all">
                <div className="text-2xl mb-1">🏫</div>
                <div className="font-bold text-sm">Guru Sekolah</div>
            </button>
            <button onClick={() => handleMenuClick("GURU_ASRAMA")} className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-5 rounded-3xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all">
                <div className="text-2xl mb-1">🕌</div>
                <div className="font-bold text-sm">Guru Asrama</div>
            </button>
        </div>

        <button onClick={() => handleMenuClick("MONITOR")} className="flex items-center justify-center gap-3 p-4 bg-slate-800 text-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-900 transition shadow-lg">
            <span>📊</span> Lihat Rekapitulasi Data
        </button>
      </div>
      
      <p className="mt-12 text-xs text-slate-300 font-medium">v2.3 - IDN Boarding School Akhwat 2025</p>
    </div>
  );
}

function MenuKelas({ setJenjang, setKelas, setRole }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          
          <button onClick={() => setRole(null)} className="text-sm text-slate-400 hover:text-blue-600 mb-6 flex items-center gap-1 transition">
             ← Kembali
          </button>
          
          <h2 className="text-2xl font-bold mb-6 text-slate-800">Pilih Kelas</h2>
          
          <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Jenjang</label>
                <div className="relative">
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none" onChange={(e) => setJenjang(e.target.value)}>
                        <option value="">-- Pilih SMP / SMK --</option>
                        {Object.keys(DATA_SEKOLAH).map((key) => <option key={key} value={key}>{key}</option>)}
                    </select>
                </div>
            </div>
            
            <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Kelas</label>
                 <div className="relative">
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none" onChange={(e) => setKelas(e.target.value)}>
                        <option value="">-- Pilih Kelas --</option>
                        <option value="Kelas 7A">Kelas 7A</option>
                        <option value="Kelas 7B">Kelas 7B</option>
                        <option value="10 RPL">10 RPL</option>
                        <option value="10 TKJ">10 TKJ</option>
                    </select>
                 </div>
            </div>
          </div>
        </div>
    </div>
  );
}

function TampilanOrtu({ activeCall, jenjang, kelas, setKelas }) {
  let bgClass = "bg-slate-50";
  let cardClass = "bg-white border-slate-100";
  let textClass = "text-slate-800";
  let statusBadge = "bg-slate-100 text-slate-400";
  let labelStatus = "MENUNGGU";
  let subText = "Silakan duduk menunggu giliran Anda";

  if (activeCall.status === "bersiap") {
    bgClass = "bg-amber-400"; 
    cardClass = "bg-white border-amber-500/50 shadow-2xl shadow-amber-900/20";
    textClass = "text-amber-950";
    statusBadge = "bg-amber-100 text-amber-700 animate-pulse";
    labelStatus = "PERSIAPAN";
    subText = "Silakan menuju ke depan pintu ruangan";
  } else if (activeCall.status === "masuk") {
    bgClass = activeCall.pos === "SEKOLAH" ? "bg-blue-600" : "bg-indigo-600";
    cardClass = "bg-white shadow-2xl shadow-black/30 transform scale-105 transition-transform";
    textClass = activeCall.pos === "SEKOLAH" ? "text-blue-900" : "text-indigo-900";
    statusBadge = activeCall.pos === "SEKOLAH" ? "bg-blue-100 text-blue-700" : "bg-indigo-100 text-indigo-700";
    labelStatus = "SILAKAN MASUK";
    subText = activeCall.pos === "SEKOLAH" ? "Temui Wali Kelas Sekarang" : "Temui Guru Asrama Sekarang";
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-700 font-sans ${bgClass}`}>
      <button onClick={() => setKelas("")} className="absolute top-6 left-6 text-xs bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white/90 hover:bg-white/30 font-bold transition">
        ← Ganti Kelas
      </button>
      
      {activeCall.status !== 'idle' && (
         <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-8">
            <span className="bg-black/20 backdrop-blur-md text-white/90 px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase shadow-lg border border-white/10">
                Panggilan Sekolah
            </span>
         </div>
      )}

      <div className="text-center w-full max-w-xl">
        <h2 className={`text-sm font-bold mb-8 uppercase tracking-[0.3em] opacity-80 ${activeCall.status === 'idle' ? 'text-slate-400' : 'text-white'}`}>
          Antrian {jenjang} • {kelas}
        </h2>
        
        <div className={`p-12 rounded-[2.5rem] transition-all duration-500 ${cardClass} ${activeCall.status === 'idle' ? 'shadow-xl shadow-slate-200' : ''}`}>
          <p className="text-slate-400 text-xs font-bold mb-4 uppercase tracking-widest">Giliran Siswa:</p>
          <h1 className={`text-5xl md:text-7xl font-black mb-8 leading-tight break-words tracking-tight ${textClass}`}>
            {activeCall.nama}
          </h1>
          <div className={`px-8 py-4 rounded-2xl font-extrabold text-2xl inline-block ${statusBadge}`}>
            {labelStatus}
          </div>
        </div>

        <p className={`mt-10 text-xl font-medium ${activeCall.status === 'idle' ? 'text-slate-400' : 'text-white/90'}`}>
          {subText}
        </p>
      </div>
    </div>
  );
}