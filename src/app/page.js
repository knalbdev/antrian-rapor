"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, update, set } from "firebase/database";

// --- 1. DATA MASTER SISWA ---
const DATA_SEKOLAH = {
  SMP: {
    "Kelas 7A": ["Aima Ellovin", "Aluna Azka", "Chila Nasyitha", "Eavelyn Aurelia", "Fazila Izzati", "Ilma Fadhilah", "Kayyisah Almeera", "Mahira Anindya", "Naura Azmi", "Rayana Adelia", "Siti Hilwa Malikah", "Tisya Nisrina", "Zhafirah Ramadhani"],
    "Kelas 7B": ["Aisyah Zafirah", "Chaira Alessia", "Dia Almahyra", "Fathiyya Naura", "Haura Fairuz", "Kayla Vania", "Kayyisah Binbas", "Kimberly Delova", "Maila Arina", "Raina Farisha", "Safira Nauli", "Suhailah", "Syakirah Sidqia", "Tri Athifa Putri"],
    "Kelas 8A": ["Aisyah Rahma", "Aisyah Zaahirah", "Faiza Raidah", "Louiza Zivana", "Joanne Chen", "Kafiya Faida", "Makayla Haura", "Mikayla Defti", "Nafisa Hanun", "Naura Qaireen", "Navilata Radhiti", "Nirmala Sopian", "Zhafira Putri"],
    "Kelas 8B": ["Afreen Nafila", "Aisya Adnina", "Almira Rahmadhisa", "Amira Syahla", "Anna Luthfiyah", "Calistanindya Shafa", "Faiza Andinar", "Khansa Kamila", "Lubna Malika", "Mutia Azkayra", "Nirvana Sopian", "Puri Sabrina", "Rozanah", "Zahra Nusaybah"],
    "Kelas 9A": ["Aisyah Imany", "Almaira Muazara", "Arasy Wahyuningjati", "Asiyah", "Dirgahayu Shofwatun Nisa", "Kharima Albany", "Mahaira Qurani", "Marsya Hanna", "Ratu Ainun", "Rayya Fakhirah", "Tsabita Khalisha", "Yiesha Zahira"],
    "Kelas 9B": ["Aisyah", "Alesha Bellvania", "Alya Nurmaliha", "Bintang Ilmi", "Chaizarani Qisya", "Dayana Batrisyia", "Hasna Nafisah", "Khaira Andani", "Khansa Janeeta", "Qiana Zahra", "Sri Dewi Saraswati", "Zianka Innaya"]
  },
  SMK: {
    "10 DKV": ["Aisha Lananahdhah", "Aisha Latifa", "Almayra Rafifa", "Anjali Sakhi Zada", "Asy Syifa Ummu Hanifah", "Audia Silmi", "Aura Cinta", "Daiva Ashila", "Dian Anggita", "Elina Syifaul Qolby", "Khansa Humairo", "Luh Dayu Aqiarasya", "Nadine Malca", "Shaqeela Allya", "Zaura Khay Lila", "Zhafira Quinn Hara"],
    "10 RPL": ["Adzkia Amada", "Afifa Quisha", "Aisyah", "Dinna Rafiza", "Elmira Hanani", "Faiha Wanda", "Fauza Alifa", "Kayyasa Azzahra", "Kayyisa Malihah", "Khallista Agnya", "Mariska Thasya", "Mutiara Khansa", "Najwa Naqiyya", "Nasywah Nabilah", "Queenshafa Rania"],
    "11 DKV": ["Adzkiya Jannatu", "Aira An Nafi", "Assyifa Karima", "Athiyah Humaira", "Ayesha Aisyah", "Ayumi Maydira", "Azkia Humairah", "Balqis Faiha", "Dzakiyah Hasna", "Fatimah Ramadhan", "Hasna Azizah", "Kalila Princessa", "Kanza Hasinah", "Karinne Asmaya", "Kaysa Khuzaimah", "Marwa Arina", "Nurita Zaida", "Qonita Nur Hasanah", "Raisya Azzahra", "Sabrina Syahla"],
    "11 RPL": ["Aluna Ekin", "Azka Syakirah", "Azwa Khalisa", "Dhia Nufah", "Emiliana Olivia", "Chalila Nurdiana", "Fiorenza", "Hana Anladiva", "Hilwa Ilham", "Khansa Syahidah", "Nael Muna", "Naila Putri", "Najla Nafisah", "Nasyrah Latifa", "Nisrina Asad", "Pelangi Pagi", "Quaneisha", "Raisa Amanda", "Siti Yasmin Jinan", "Sri Mulyani", "Tanzani Akasyah", "Vanda Nakeysha"]
  }
};

export default function AppRapor() {
  const [role, setRole] = useState(null); 
  const [jenjang, setJenjang] = useState("");
  const [kelas, setKelas] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState({ nama: "-", pos: "-", status: "idle" });
  const [progressSiswa, setProgressSiswa] = useState({}); 
  const [selectedSiswa, setSelectedSiswa] = useState("");
  
  const prevDataRef = useRef({ nama: "-", status: "idle" });

  useEffect(() => {
    try {
        const savedRole = localStorage.getItem("rapor_role");
        const savedJenjang = localStorage.getItem("rapor_jenjang");
        const savedKelas = localStorage.getItem("rapor_kelas");
        if (savedRole) setRole(savedRole);
        if (savedJenjang) setJenjang(savedJenjang);
        if (savedKelas) setKelas(savedKelas);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  const saveState = (key, value) => localStorage.setItem(key, value);

  const handleGantiKelas = () => {
    localStorage.removeItem("rapor_jenjang"); localStorage.removeItem("rapor_kelas");
    setJenjang(""); setKelas("");
  };
  const handleMenuUtama = () => {
    localStorage.clear(); setRole(null); setJenjang(""); setKelas("");
  };

  // --- HELPER KHUSUS: CARI SUARA INDONESIA ---
  const speakIndonesian = (text, volume = 1.0) => {
    if (typeof window === "undefined" || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Reset antrian suara

    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'id-ID';
    u.rate = 0.9;
    u.volume = volume;

    // TRIK IOS: Cari suara spesifik Bahasa Indonesia
    const voices = window.speechSynthesis.getVoices();
    // Prioritas: Cari yang lang 'id-ID' atau namanya mengandung 'Indonesia'
    const indoVoice = voices.find(v => v.lang === 'id-ID' || v.lang === 'id_ID');
    
    if (indoVoice) {
        u.voice = indoVoice; // Paksa pakai suara Indo
    }

    window.speechSynthesis.speak(u);
  };

  // --- TRIGGER EFFECT (Updated dengan Voice Helper) ---
  const triggerEffect = (name, status, pos) => {
    // 1. Getar (Android Only)
    if (typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate([500, 200, 500]); } catch(e){}
    }

    // 2. Suara (iOS & Android) - Pakai Helper Baru
    const text = status === 'bersiap' 
        ? `Mohon perhatian. Ananda ${name}, harap bersiap.` 
        : `Panggilan untuk Ananda ${name}, silakan masuk.`;
    
    speakIndonesian(text);

    // 3. Notifikasi System (Background)
    if (document.hidden && Notification.permission === "granted") {
        const title = status === 'bersiap' ? "⚠️ PERSIAPAN!" : "📢 MASUK SEKARANG!";
        const notif = new Notification(title, { body: `Giliran: ${name}`, icon: "/icon.png" });
        notif.onclick = () => { 
            window.focus(); 
            // Ulangi suara saat notif diklik
            speakIndonesian(`Giliran Ananda ${name}`);
        };
    }
  };

  // --- LISTENER FIREBASE ---
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted") Notification.requestPermission();
    if (!jenjang || !kelas) return;
    
    // Pre-load voices (Penting untuk iOS agar list suara ready)
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
    }

    const dbRef = ref(db, `sekolah/${jenjang}/${kelas}`);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.active) {
            setActiveCall(data.active);
            
            if (role === "ORTU") {
                const isNewData = data.active.nama !== prevDataRef.current.nama || data.active.status !== prevDataRef.current.status;
                const isRealName = data.active.nama !== "-" && !data.active.nama.includes("MENUNGGU");
                
                if (isNewData && isRealName) {
                    prevDataRef.current = data.active;
                    triggerEffect(data.active.nama, data.active.status, data.active.pos);
                }
            }
        }
        if (data.progress) setProgressSiswa(data.progress);
      } else {
        setActiveCall({ nama: "Belum Dimulai", pos: "-", status: "idle" }); setProgressSiswa({});
      }
    });
    return () => unsubscribe();
  }, [jenjang, kelas, role]); 

  // --- ACTIONS GURU ---
  const updateActiveScreen = (nama, pos, status) => update(ref(db), { [`sekolah/${jenjang}/${kelas}/active`]: { nama, pos, status } });
  const btnSekolahBersiap = () => { if (!selectedSiswa) return alert("Pilih siswa!"); updateActiveScreen(selectedSiswa, "SEKOLAH", "bersiap"); };
  const btnSekolahMasuk = () => { if (!selectedSiswa && activeCall.nama ==='-') return alert("Pilih siswa!"); updateActiveScreen(selectedSiswa || activeCall.nama, "SEKOLAH", "masuk"); };
  
  const btnSekolahSelesai = () => {
    const namaSiswa = activeCall.nama;
    if (!namaSiswa || namaSiswa === '-' || namaSiswa.includes("MENUNGGU")) return;
    const currentStatus = progressSiswa[namaSiswa];
    let nextStatus = currentStatus === 'done_asrama' ? 'selesai_total' : 'done_sekolah';
    const updates = {};
    updates[`sekolah/${jenjang}/${kelas}/active`] = { nama: "MENUNGGU...", pos: "TRANSISI", status: "idle" };
    updates[`sekolah/${jenjang}/${kelas}/progress/${namaSiswa}`] = nextStatus;
    update(ref(db), updates); setSelectedSiswa("");
  };

  const btnAsramaCeklis = () => {
    if (!selectedSiswa) return alert("Pilih siswa!");
    const nextStatus = progressSiswa[selectedSiswa] === 'done_sekolah' ? 'selesai_total' : 'done_asrama';
    update(ref(db), { [`sekolah/${jenjang}/${kelas}/progress/${selectedSiswa}`]: nextStatus }); setSelectedSiswa(""); 
  };

  const getListSiswa = () => {
    const all = DATA_SEKOLAH[jenjang]?.[kelas] || [];
    if (role === 'GURU_SEKOLAH') return all.filter(n => !['done_sekolah','selesai_total'].includes(progressSiswa[n]));
    if (role === 'GURU_ASRAMA') return all.filter(n => !['done_asrama','selesai_total'].includes(progressSiswa[n]));
    return [];
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Memuat data...</div>;
  if (!role) return <MenuAwal setRole={setRole} saveState={saveState} />;
  if (!jenjang || !kelas) return <MenuKelas setJenjang={setJenjang} setKelas={setKelas} setRole={setRole} saveState={saveState} handleMenuUtama={handleMenuUtama} />;

  if (role === "MONITOR") {
    const allSiswa = DATA_SEKOLAH[jenjang]?.[kelas] || [];
    const selesaiTotal = allSiswa.filter(n => progressSiswa[n] === 'selesai_total').length;
    return (
      <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 p-4 sm:p-6 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
                <div><h2 className="font-bold text-2xl">📊 Rekapitulasi</h2><p className="text-slate-400 text-sm">{jenjang} - {kelas}</p></div>
                <div className="flex gap-2"><button onClick={handleGantiKelas} className="text-xs bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-full transition">← Ganti Kelas</button><button onClick={handleMenuUtama} className="text-xs bg-red-600 hover:bg-red-500 px-4 py-2 rounded-full transition">🏠 Menu Utama</button></div>
            </div>
            <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-emerald-100 text-center">
                <div className="text-5xl font-extrabold text-emerald-600 mb-2">{selesaiTotal} <span className="text-2xl text-emerald-400 font-medium">/ {allSiswa.length}</span></div>
                <div className="text-sm font-bold text-emerald-700 uppercase tracking-widest">Siswa Selesai Total</div>
            </div>
            <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b"><tr><th className="px-6 py-4">Nama</th><th className="px-6 py-4 text-center">Sekolah</th><th className="px-6 py-4 text-center">Asrama</th><th className="px-6 py-4 text-center">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{allSiswa.map((nama, idx) => { const st = progressSiswa[nama]; return (<tr key={nama} className={idx%2===0?'bg-white':'bg-slate-50/50'}><td className="px-6 py-4 font-medium">{nama}</td><td className="px-6 py-4 text-center">{['done_sekolah','selesai_total'].includes(st)?'✅':'-'}</td><td className="px-6 py-4 text-center">{['done_asrama','selesai_total'].includes(st)?'✅':'-'}</td><td className="px-6 py-4 text-center">{st==='selesai_total'?<span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">TUNTAS</span>:'-'}</td></tr>);})}</tbody></table></div>
        </div>
      </div>
    );
  }

  if (role.includes("GURU")) {
    const isSekolah = role === "GURU_SEKOLAH"; const listAvailable = getListSiswa();
    return (
      <div className={`min-h-screen p-6 font-sans text-slate-800 ${isSekolah ? 'bg-gradient-to-br from-blue-50 to-indigo-100' : 'bg-gradient-to-br from-indigo-50 to-purple-100'}`}>
        <div className="max-w-lg mx-auto">
          <div className="flex flex-wrap justify-between items-center mb-6 bg-white/60 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-white/40 gap-2">
            <div className="flex gap-2"><button onClick={handleGantiKelas} className="text-slate-600 hover:text-blue-600 text-xs font-bold bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-200">← Kelas</button><button onClick={handleMenuUtama} className="text-red-500 hover:text-red-700 text-xs font-bold bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-200">🏠 Menu</button></div>
            <span className={`text-xs px-3 py-1 rounded-full font-bold text-white shadow-lg ${isSekolah ? 'bg-blue-600' : 'bg-indigo-600'}`}>{isSekolah ? "POS 1: SEKOLAH" : "POS 2: ASRAMA"}</span>
          </div>
          {isSekolah && (<div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl mb-6 relative overflow-hidden"><p className="text-xs text-blue-300 uppercase tracking-widest font-bold mb-1">Live di Layar TV</p><h2 className="text-3xl font-extrabold tracking-tight mb-2 truncate">{activeCall.nama}</h2><span className={`text-xs font-bold px-2 py-1 rounded-md ${activeCall.status === 'bersiap' ? 'bg-yellow-500 text-black' : activeCall.status === 'masuk' ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'}`}>STATUS: {activeCall.status.toUpperCase()}</span></div>)}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50">
            <label className="block mb-3 font-bold text-slate-700 text-sm uppercase tracking-wide">Pilih Siswa ({listAvailable.length} Antrian):</label>
            {listAvailable.length === 0 ? <div className="p-6 bg-slate-50 border border-slate-200 text-center text-slate-400 italic mb-6 rounded-2xl">🎉 Tidak ada antrian!</div> : (<div className="relative mb-6"><select className="w-full p-4 pl-5 pr-10 appearance-none bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer" onChange={(e) => setSelectedSiswa(e.target.value)} value={selectedSiswa}><option value="">-- Klik untuk memilih --</option>{listAvailable.map((nama) => (<option key={nama} value={nama}>{nama}</option>))}</select></div>)}
            {isSekolah ? (<div className="space-y-3"><button onClick={btnSekolahBersiap} className="w-full bg-amber-400 hover:bg-amber-300 text-amber-900 font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition">⚠️ PANGGIL: BERSIAP</button><button onClick={btnSekolahMasuk} disabled={activeCall.status !== 'bersiap'} className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition">📢 PANGGIL: MASUK</button><div className="h-px bg-slate-100 my-4"></div><button onClick={btnSekolahSelesai} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-2xl border border-slate-200 transition text-sm">✅ Selesai & Hapus</button></div>) : (<button onClick={btnAsramaCeklis} disabled={!selectedSiswa} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-5 rounded-2xl shadow-xl text-lg active:scale-[0.98] transition">✅ TANDAI SELESAI</button>)}
          </div>
        </div>
      </div>
    );
  }
  return <TampilanOrtu activeCall={activeCall} jenjang={jenjang} kelas={kelas} handleGantiKelas={handleGantiKelas} handleMenuUtama={handleMenuUtama} />;
}

// --- MENU AWAL (Dengan Silent Audio Unlock & Helper) ---
function MenuAwal({ setRole, saveState }) {
  const [showAuth, setShowAuth] = useState(false); const [targetRole, setTargetRole] = useState(""); const [inputPass, setInputPass] = useState(""); const [errorMsg, setErrorMsg] = useState(""); const [showPassword, setShowPassword] = useState(false);

  // Fungsi helper untuk berbicara (digunakan untuk unlock & notif)
  const speakIndonesian = (text, volume = 0.0) => {
    if (typeof window === "undefined" || !('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'id-ID'; u.volume = volume;
    const voices = window.speechSynthesis.getVoices();
    const indoVoice = voices.find(v => v.lang === 'id-ID' || v.lang === 'id_ID');
    if (indoVoice) u.voice = indoVoice;
    window.speechSynthesis.speak(u);
  };

  const handleMenuClick = (roleTujuan) => {
    speakIndonesian(" "); // Unlocking Audio Context
    if (roleTujuan === "ORTU" || roleTujuan === "MONITOR") {
        setRole(roleTujuan); saveState("rapor_role", roleTujuan);
    } else {
        setTargetRole(roleTujuan); setShowAuth(true); setErrorMsg(""); setInputPass(""); setShowPassword(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if ((targetRole === "GURU_SEKOLAH" && inputPass === "sekolah2025") || (targetRole === "GURU_ASRAMA" && inputPass === "asrama2025")) {
        setRole(targetRole); saveState("rapor_role", targetRole);
    } else { setErrorMsg("Password salah!"); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 font-sans text-slate-800 relative">
      {showAuth && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200"><div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm"><h3 className="text-xl font-bold mb-4 text-center">🔐 Login Guru</h3><p className="text-sm text-slate-500 mb-4 text-center">Masukkan kode akses <span className="font-bold text-slate-800">{targetRole==='GURU_SEKOLAH'?'Guru Sekolah':'Guru Asrama'}</span></p><form onSubmit={handleLogin}><div className="relative mb-4"><input type={showPassword ? "text" : "password"} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none pr-12" placeholder="Ketik Kode..." autoFocus value={inputPass} onChange={(e) => setInputPass(e.target.value)} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none">{showPassword ? '🙈' : '🐵'}</button></div>{errorMsg && <p className="text-red-500 text-sm text-center mb-4 font-bold">{errorMsg}</p>}<button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mb-2 transition">Masuk</button><button type="button" onClick={() => setShowAuth(false)} className="w-full text-slate-400 hover:text-slate-600 text-sm font-bold py-2">Batal</button></form></div></div>)}
      <div className="mb-6"><img src="/logo.png" alt="Logo Sekolah" className="h-28 w-auto mx-auto object-contain drop-shadow-md hover:scale-105 transition-transform" /></div>
      <div className="text-center mb-10"><h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 mb-2">E-Rapor Queue</h1><p className="text-slate-500 font-medium">Sistem Antrian & Checklist Realtime</p></div>
      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
        <button onClick={() => handleMenuClick("ORTU")} className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-xl shadow-slate-200 border border-white hover:border-blue-200 transition-all duration-300 hover:scale-[1.02] text-left"><div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div><span className="text-4xl mb-3 block relative z-10">𐦂𖨆𐀪𖠋</span><div className="relative z-10"><h3 className="text-xl font-bold text-slate-800">Layar Orang Tua</h3><p className="text-sm text-slate-400">Untuk melihat nomor antrian</p></div></button>
        <div className="grid grid-cols-2 gap-4"><button onClick={() => handleMenuClick("GURU_SEKOLAH")} className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-5 rounded-3xl shadow-lg hover:-translate-y-1 transition-all"><div className="text-2xl mb-1">🏫</div><div className="font-bold text-sm">Guru Sekolah</div></button><button onClick={() => handleMenuClick("GURU_ASRAMA")} className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-5 rounded-3xl shadow-lg hover:-translate-y-1 transition-all"><div className="text-2xl mb-1">🕌</div><div className="font-bold text-sm">Guru Asrama</div></button></div>
        <button onClick={() => handleMenuClick("MONITOR")} className="flex items-center justify-center gap-3 p-4 bg-slate-800 text-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-900 transition shadow-lg"><span>📊</span> Lihat Rekapitulasi Data</button>
      </div>
      <p className="mt-12 text-xs text-slate-300 font-medium">v6.0 • IDN Boarding School Akhwat 2025</p>
    </div>
  );
}

function MenuKelas({ setJenjang, setKelas, setRole, saveState, handleMenuUtama }) {
  const pilihJenjang = (val) => { setJenjang(val); saveState("rapor_jenjang", val); };
  const pilihKelas = (val) => { setKelas(val); saveState("rapor_kelas", val); };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div><button onClick={handleMenuUtama} className="text-sm text-slate-400 hover:text-red-500 mb-6 flex items-center gap-1 transition">← Kembali ke Menu Utama</button><h2 className="text-2xl font-bold mb-6 text-slate-800">Pilih Kelas</h2><div className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Jenjang</label><div className="relative"><select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none" onChange={(e) => pilihJenjang(e.target.value)}><option value="">-- Pilih SMP / SMK --</option>{Object.keys(DATA_SEKOLAH).map((key) => <option key={key} value={key}>{key}</option>)}</select></div></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Kelas</label><div className="relative"><select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none" onChange={(e) => pilihKelas(e.target.value)}><option value="">-- Pilih Kelas --</option><option value="Kelas 7A">7A</option><option value="Kelas 7B">7B</option><option value="Kelas 8A">8A</option><option value="Kelas 8B">8B</option><option value="Kelas 9A">9A</option><option value="Kelas 9B">9B</option><option value="10 RPL">10 RPL</option><option value="10 DKV">10 DKV</option><option value="11 RPL">11 RPL</option><option value="11 DKV">11 DKV</option></select></div></div></div></div>
    </div>
  );
}

// --- FIX: ONE-TIME OVERLAY (Agar suara jalan kalau di-refresh) & Voice Helper ---
function TampilanOrtu({ activeCall, jenjang, kelas, handleGantiKelas, handleMenuUtama }) {
  const [audioReady, setAudioReady] = useState(false); 

  // Gunakan helper yang sama untuk konsistensi
  const speakIndonesian = (text, volume = 1.0) => {
    if (typeof window === "undefined" || !('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'id-ID'; u.volume = volume;
    const voices = window.speechSynthesis.getVoices();
    const indoVoice = voices.find(v => v.lang === 'id-ID' || v.lang === 'id_ID');
    if (indoVoice) u.voice = indoVoice;
    window.speechSynthesis.speak(u);
  };

  const enableAudioOverlay = () => {
    speakIndonesian("Audio Siap", 0); // Pancingan silent
    setAudioReady(true);
  };

  let bgClass = "bg-slate-50"; let cardClass = "bg-white border-slate-100"; let textClass = "text-slate-800"; let statusBadge = "bg-slate-100 text-slate-400"; let labelStatus = "MENUNGGU"; let subText = "Silakan duduk menunggu giliran Anda";
  const isIdle = activeCall.status === 'idle';
  const btnStyle = isIdle ? "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-md" : "bg-white/20 text-white border border-white/20 hover:bg-white/30 backdrop-blur-md shadow-sm";

  if (activeCall.status === "bersiap") {
    bgClass = "bg-amber-400"; cardClass = "bg-white border-amber-500/50 shadow-2xl shadow-amber-900/20"; textClass = "text-amber-950"; statusBadge = "bg-amber-100 text-amber-700 animate-pulse"; labelStatus = "PERSIAPAN"; subText = "Silakan menuju ke depan pintu ruangan";
  } else if (activeCall.status === "masuk") {
    bgClass = activeCall.pos === "SEKOLAH" ? "bg-blue-600" : "bg-indigo-600"; cardClass = "bg-white shadow-2xl shadow-black/30 transform scale-105 transition-transform"; textClass = activeCall.pos === "SEKOLAH" ? "text-blue-900" : "text-indigo-900"; statusBadge = activeCall.pos === "SEKOLAH" ? "bg-blue-100 text-blue-700" : "bg-indigo-100 text-indigo-700"; labelStatus = "SILAKAN MASUK"; subText = activeCall.pos === "SEKOLAH" ? "Temui Wali Kelas Sekarang" : "Temui Guru Asrama Sekarang";
  }

  return (
    <div className={`min-h-screen flex flex-col p-4 transition-colors duration-700 font-sans ${bgClass} relative`}>
      
      {/* --- OVERLAY KHUSUS (Hanya muncul jika audio belum siap) --- */}
      {!audioReady && (
        <div 
            onClick={enableAudioOverlay}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white text-center p-6 cursor-pointer animate-in fade-in"
        >
            <div className="bg-white/10 p-6 rounded-full mb-4 animate-pulse border border-white/20">
                <span className="text-4xl">👆</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Ketuk Layar Sekali</h2>
            <p className="text-white/70 text-sm">Agar suara pemanggilan bisa terdengar</p>
        </div>
      )}

      <div className="w-full max-w-xl mx-auto flex justify-between items-start z-20 mb-4">
        <div className="flex flex-wrap gap-2">
            <button onClick={handleGantiKelas} className={`text-xs px-4 py-2 rounded-full font-bold transition ${btnStyle}`}>← Ganti Kelas</button>
            <button onClick={handleMenuUtama} className={`text-xs px-4 py-2 rounded-full font-bold transition ${btnStyle} ${isIdle ? 'text-red-500 border-red-100 hover:bg-red-50' : 'text-red-100 hover:bg-red-500/40'}`}>🏠 Menu</button>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xl mx-auto -mt-10">
          {activeCall.status !== 'idle' && (<div className="mb-8"><span className="bg-black/20 backdrop-blur-md text-white/90 px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase shadow-lg border border-white/10">Panggilan Sekolah</span></div>)}
          <h2 className={`text-sm font-bold mb-8 uppercase tracking-[0.3em] opacity-80 ${activeCall.status === 'idle' ? 'text-slate-400' : 'text-white'}`}>Antrian {jenjang} • {kelas}</h2>
          <div className={`p-12 rounded-[2.5rem] w-full transition-all duration-500 text-center ${cardClass} ${activeCall.status === 'idle' ? 'shadow-xl shadow-slate-200' : ''}`}>
            <p className="text-slate-400 text-xs font-bold mb-4 uppercase tracking-widest">Giliran Siswa:</p>
            <h1 className={`text-5xl md:text-7xl font-black mb-8 leading-tight break-words tracking-tight ${textClass}`}>{activeCall.nama}</h1>
            <div className={`px-8 py-4 rounded-2xl font-extrabold text-2xl inline-block ${statusBadge}`}>{labelStatus}</div>
          </div>
          <p className={`mt-10 text-xl font-medium text-center ${activeCall.status === 'idle' ? 'text-slate-400' : 'text-white/90'}`}>{subText}</p>
      </div>
    </div>
  );
}