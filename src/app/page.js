"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, update } from "firebase/database";

// --- 1. DATA MASTER SISWA ---
const DATA_SEKOLAH = {
  SMP: {
    "Kelas 7A": [
      "Aima Ellovin Jiran Meliana",
      "Aluna Azka Inamullah",
      "Chila Nasyitha",
      "Eavelyn Aurelia Maheswari",
      "Fazila Izzati Kusumawardhani",
      "Ilma Fadhilah Mumtazah",
      "Kayyisah Almeera Aufar",
      "Mahira Anindya Maheswari",
      "Naura Azmi Rinjani",
      "Rayana Adelia Utami",
      "Siti Hilwa Malikah Tadzally",
      "Tisya Nisrina",
      "Zhafirah Ramadhani Husna"
    ],
    "Kelas 7B": [
      "Aisyah Zafirah Ghani",
      "Chaira Alessia Olivari",
      "Dia Almahyra Munandar",
      "Fathiyya Naura Khalisha",
      "Haura Fairuz Dwins",
      "Kayla Vania Rivelino",
      "Kayyisah Binbas Abdullah",
      "Kimberly Delova Yudha",
      "Maila Arina Agustin",
      "Raina Farisha Ariakirana",
      "Safira Nauli Siregar",
      "Suhailah",
      "Syakirah Sidqia Mahilah",
      "Tri Athifa Putri Kusuma"
    ],
    "Kelas 8A": [
      "Aisyah Rahma Kamila",
      "Aisyah Zaahirah Ramadhani Riyadi",
      "Faiza Raidah Ashshabira",
      "Louiza Zivana Karasya",
      "Joanne Chen Valen",
      "Kafiya Faida Azmi",
      "Makayla Haura Radiasa",
      "Mikayla Defti Namiyah",
      "Nafisa Hanun Mufti",
      "Naura Qaireen Imtinan Binti Rahmatsyah",
      "Navilata Radhiti Kusumawardhani",
      "Nirmala Sopian",
      "Zhafira Putri Aryanti"
    ],
    "Kelas 8B": [
      "Afreen Nafila Zatta Yumni Wibowo",
      "Aisya Adnina",
      "Almira Rahmadhisa Wargadipura",
      "Amira Syahla Adina Aulia",
      "Anna Luthfiyah Khansa",
      "Calistanindya Shafa Wardhana",
      "Faiza Andinar Mulia",
      "Khansa Kamila",
      "Lubna Malika Lu'lu",
      "Mutia Azkayra Althafunisa",
      "Nirvana Sopian",
      "Puri Sabrina Gayatri",
      "Rozanah Al Atsariyah",
      "Zahra Nusaybah"
    ],
    "Kelas 9A": [
      "Aisyah Imany",
      "Almaira Muazara",
      "Arasy Wahyuningjati",
      "Asiyah",
      "Dirgahayu Shofwatun Nisa Armadhani",
      "Kharima Albany Abdullah",
      "Mahaira Qurani Arsya",
      "Marsya Hanna Faradisa",
      "Ratu Ainun Tertia Amarta",
      "Rayya Fakhirah Aimar",
      "Tsabita Khalisha",
      "Yiesha Zahira Khani"
    ],
    "Kelas 9B": [
      "Aisyah",
      "Alesha Bellvania Mahestri",
      "Alya Nurmaliha Rachman",
      "Bintang Ilmi Khairunnisa",
      "Chaizarani Qisya",
      "Dayana Batrisyia Mujianto",
      "Hasna Nafisah",
      "Khaira Andani Soeyatwoko",
      "Khansa Janeeta",
      "Qiana Zahra Adzkia",
      "Sri Dewi Saraswati",
      "Zianka Innaya"
    ]
  },
  SMK: {
    "10 DKV": [
      "Aisha Lananahdhah Machmudi",
      "Aisha Latifa Ariadi",
      "Almayra Rafifa Elwidodo",
      "Anjali Sakhi Zada Adhigana",
      "Asy Syifa Ummu Hanifah",
      "Audia Silmi Avani Hsb",
      "Aura Cinta Arfani",
      "Daiva Ashila Pangukir",
      "Dian Anggita",
      "Elina Syifaul Qolby",
      "Khansa Humairo",
      "Luh Dayu Aqiarasya Hermawan",
      "Nadine Malca Zafira As'ad",
      "Shaqeela Allya Jasmine Rofik",
      "Zaura Khay Lila",
      "Zhafira Quinn Hara"
    ],
    "10 RPL": [
      "Adzkia Amada Raissa",
      "Afifa Quisha Syakira",
      "Aisyah",
      "Dinna Rafiza Az Zahra",
      "Elmira Hanani",
      "Faiha Wanda Nabilah",
      "Fauza Alifa Zahra",
      "Kayyasa Azzahra",
      "Kayyisa Malihah Karin",
      "Khallista Agnya Shalihah",
      "Mariska Thasya Alzena",
      "Mutiara Khansa Abdillah",
      "Najwa Naqiyya Azkal 'Azkia",
      "Nasywah Nabilah Harahap",
      "Queenshafa Rania Bilqis"
    ],
    "11 DKV": [
      "Adzkiya Jannatu Syauqiya",
      "Aira An Nafi Putri Rachmani",
      "Assyifa Karima Humaira",
      "Athiyah Humaira Khairani",
      "Ayesha Aisyah Khuzayma",
      "Ayumi Maydira Zahra",
      "Azkia Humairah Tanua",
      "Balqis Faiha Lubna",
      "Dzakiyah Hasna Citrahayi Anjali",
      "Fatimah Ramadhan",
      "Hasna Azizah Safinatunnajah",
      "Kalila Princessa Yunanda",
      "Kanza Hasinah",
      "Karinne Asmaya Girly",
      "Kaysa Khuzaimah 'Arsya",
      "Marwa Arina Zahira",
      "Nurita Zaida Aprilisa",
      "Qonita Nur Hasanah",
      "Raisya Azzahra Putri Defa",
      "Sabrina Syahla Sahira"
    ],
    "11 RPL": [
      "Aluna Ekin Kehara",
      "Azka Syakirah",
      "Azwa Khalisa Melantika",
      "Dhia Nufah",
      "Emiliana Olivia Carlene",
      "Fadya Ismy Chalila Nurdiana",
      "Fiorenza Kinanti Prashanda",
      "Hana Anladiva Suhandi",
      "Hilwa Ilham",
      "Khansa Syahidah Aulia",
      "Nael Muna",
      "Naila Putri Syarifa",
      "Najla Nafisah",
      "Nasyrah Latifa Putri",
      "Nisrina Asad Alkatiri",
      "Pelangi Pagi",
      "Quaneisha Syifa Nida",
      "Raisa Amanda Utami",
      "Siti Yasmin Jinan Chumaira",
      "Sri Mulyani Tarihoran",
      "Tanzani Akasyah",
      "Vanda Nakeysha"
    ]
  }
};

export default function AppRapor() {
  // --- STATE ---
  const [role, setRole] = useState(null); 
  const [jenjang, setJenjang] = useState("");
  const [kelas, setKelas] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [activeCall, setActiveCall] = useState({ nama: "-", pos: "-", status: "idle" });
  const [progressSiswa, setProgressSiswa] = useState({}); 
  const [selectedSiswa, setSelectedSiswa] = useState("");

  // Ref untuk melacak status sebelumnya agar suara tidak spam saat re-connect
  const prevDataRef = useRef({ nama: "-", status: "idle" });

  // --- LOGIC 1: AUTO-RESTORE ---
  useEffect(() => {
    try {
        const savedRole = localStorage.getItem("rapor_role");
        const savedJenjang = localStorage.getItem("rapor_jenjang");
        const savedKelas = localStorage.getItem("rapor_kelas");

        if (savedRole) setRole(savedRole);
        if (savedJenjang) setJenjang(savedJenjang);
        if (savedKelas) setKelas(savedKelas);
    } catch (e) {
        console.error("Storage error", e);
    }
    setLoading(false);
  }, []);

  const saveState = (key, value) => {
    localStorage.setItem(key, value);
  };

  // --- FUNGSI NAVIGASI ---
  const handleGantiKelas = () => {
    localStorage.removeItem("rapor_jenjang");
    localStorage.removeItem("rapor_kelas");
    setJenjang("");
    setKelas("");
  };

  const handleMenuUtama = () => {
    localStorage.clear();
    setRole(null);
    setJenjang("");
    setKelas("");
  };

  // --- LOGIC 2: REALTIME LISTENER & NOTIFIKASI ---
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    if (!jenjang || !kelas) return;
    const dbRef = ref(db, `sekolah/${jenjang}/${kelas}`);
    
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // 1. Update Layar
        if (data.active) {
            setActiveCall(data.active);
            
            // LOGIC SUARA & GETAR (Hanya untuk ORTU)
            if (role === "ORTU") {
                const isNewData = data.active.nama !== prevDataRef.current.nama || data.active.status !== prevDataRef.current.status;
                const isRealName = data.active.nama !== "-" && !data.active.nama.includes("MENUNGGU"); // Jangan baca kalau status Menunggu

                if (isNewData && isRealName) {
                    // Simpan data baru ke ref
                    prevDataRef.current = data.active;

                    // Jalankan efek
                    triggerEffect(data.active.nama, data.active.status, data.active.pos);
                }
            }
        }
        // 2. Update Progress
        if (data.progress) setProgressSiswa(data.progress);
      } else {
        setActiveCall({ nama: "Belum Dimulai", pos: "-", status: "idle" });
        setProgressSiswa({});
      }
    });
    return () => unsubscribe();
  }, [jenjang, kelas, role]); 

  // --- HELPER: AUDIO & GETAR (AMAN DARI CRASH) ---
  const triggerEffect = (name, status, pos) => {
    try {
        // A. Jika Layar Aktif -> Langsung Bunyi & Getar
        if (!document.hidden) {
            // Getar
            if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate([500, 200, 500]);
            }
            // Suara
            if (typeof window !== "undefined" && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel(); 
                const text = status === 'bersiap' 
                    ? `Mohon perhatian. Ananda ${name}, harap bersiap.` 
                    : `Panggilan untuk Ananda ${name}, silakan masuk.`;
                const u = new SpeechSynthesisUtterance(text);
                u.lang = 'id-ID'; u.rate = 0.9;
                window.speechSynthesis.speak(u);
            }
        } 
        // B. Jika Layar Mati/Background -> Kirim Notifikasi Sistem
        else if (Notification.permission === "granted") {
            const title = status === 'bersiap' ? "⚠️ PERSIAPAN!" : "📢 MASUK SEKARANG!";
            const body = `Giliran: ${name}`;
            const notif = new Notification(title, { body, icon: "/icon.png", tag: "antrian" });
            
            // Kalau notif diklik, buka web dan ngomong ulang
            notif.onclick = () => {
                window.focus();
                if (typeof window !== "undefined" && 'speechSynthesis' in window) {
                     const text = `Giliran Ananda ${name}`;
                     const u = new SpeechSynthesisUtterance(text);
                     u.lang = 'id-ID';
                     window.speechSynthesis.speak(u);
                }
            };
        }
    } catch (err) {
        console.log("Audio/Vibrate blocked by browser:", err);
    }
  };

  // --- ACTIONS GURU (DENGAN PERBAIKAN CRASH FIREBASE) ---
  const updateActiveScreen = (nama, pos, status) => {
    update(ref(db), { [`sekolah/${jenjang}/${kelas}/active`]: { nama, pos, status } });
  };

  const btnSekolahBersiap = () => { if (!selectedSiswa) return alert("Pilih siswa!"); updateActiveScreen(selectedSiswa, "SEKOLAH", "bersiap"); };
  const btnSekolahMasuk = () => { if (!selectedSiswa && activeCall.nama ==='-') return alert("Pilih siswa!"); updateActiveScreen(selectedSiswa || activeCall.nama, "SEKOLAH", "masuk"); };
  
  // FIX: MENCEGAH CRASH KARNA TITIK DI "MENUNGGU..."
  const btnSekolahSelesai = () => {
    const namaSiswa = activeCall.nama;
    
    // VALIDASI PENTING: Jangan simpan jika nama kosong atau berisi "MENUNGGU..."
    // Ini mencegah error "Invalid Key" di Firebase
    if (!namaSiswa || namaSiswa === '-' || namaSiswa.includes("MENUNGGU")) {
        return; 
    }

    const currentStatus = progressSiswa[namaSiswa];
    let nextStatus = currentStatus === 'done_asrama' ? 'selesai_total' : 'done_sekolah';

    const updates = {};
    // Reset layar jadi MENUNGGU... (ini aman karena masuk ke 'active', bukan jadi key)
    updates[`sekolah/${jenjang}/${kelas}/active`] = { nama: "MENUNGGU...", pos: "TRANSISI", status: "idle" };
    
    // Simpan progress siswa (Nama siswa wajib valid, tidak boleh ada titik)
    updates[`sekolah/${jenjang}/${kelas}/progress/${namaSiswa}`] = nextStatus;

    update(ref(db), updates).catch(err => alert("Gagal update: " + err.message));
    setSelectedSiswa("");
  };

  const btnAsramaCeklis = () => {
    if (!selectedSiswa) return alert("Pilih siswa!");
    const nextStatus = progressSiswa[selectedSiswa] === 'done_sekolah' ? 'selesai_total' : 'done_asrama';
    update(ref(db), { [`sekolah/${jenjang}/${kelas}/progress/${selectedSiswa}`]: nextStatus });
    setSelectedSiswa(""); 
  };

  const getListSiswa = () => {
    const all = DATA_SEKOLAH[jenjang]?.[kelas] || [];
    if (role === 'GURU_SEKOLAH') return all.filter(n => !['done_sekolah','selesai_total'].includes(progressSiswa[n]));
    if (role === 'GURU_ASRAMA') return all.filter(n => !['done_asrama','selesai_total'].includes(progressSiswa[n]));
    return [];
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Memuat data...</div>;

  // --- RENDER ---
  if (!role) return <MenuAwal setRole={setRole} saveState={saveState} />;
  if (!jenjang || !kelas) return <MenuKelas setJenjang={setJenjang} setKelas={setKelas} setRole={setRole} saveState={saveState} handleMenuUtama={handleMenuUtama} />;

  // 1. MONITOR VIEW
  if (role === "MONITOR") {
    const allSiswa = DATA_SEKOLAH[jenjang]?.[kelas] || [];
    const selesaiTotal = allSiswa.filter(n => progressSiswa[n] === 'selesai_total').length;
    return (
      <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 p-4 sm:p-6 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
                <div><h2 className="font-bold text-2xl">📊 Rekapitulasi</h2><p className="text-slate-400 text-sm">{jenjang} - {kelas}</p></div>
                <div className="flex gap-2">
                    <button onClick={handleGantiKelas} className="text-xs bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-full transition">← Ganti Kelas</button>
                    <button onClick={handleMenuUtama} className="text-xs bg-red-600 hover:bg-red-500 px-4 py-2 rounded-full transition">🏠 Menu Utama</button>
                </div>
            </div>
            <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-emerald-100 text-center">
                <div className="text-5xl font-extrabold text-emerald-600 mb-2">{selesaiTotal} <span className="text-2xl text-emerald-400 font-medium">/ {allSiswa.length}</span></div>
                <div className="text-sm font-bold text-emerald-700 uppercase tracking-widest">Siswa Selesai Total</div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                        <tr><th className="px-6 py-4">Nama</th><th className="px-6 py-4 text-center">Sekolah</th><th className="px-6 py-4 text-center">Asrama</th><th className="px-6 py-4 text-center">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {allSiswa.map((nama, idx) => {
                            const st = progressSiswa[nama];
                            return (
                                <tr key={nama} className={idx%2===0?'bg-white':'bg-slate-50/50'}>
                                    <td className="px-6 py-4 font-medium">{nama}</td>
                                    <td className="px-6 py-4 text-center">{['done_sekolah','selesai_total'].includes(st)?'✅':'-'}</td>
                                    <td className="px-6 py-4 text-center">{['done_asrama','selesai_total'].includes(st)?'✅':'-'}</td>
                                    <td className="px-6 py-4 text-center">{st==='selesai_total'?<span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">TUNTAS</span>:'-'}</td>
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

  // 2. GURU VIEW
  if (role.includes("GURU")) {
    const isSekolah = role === "GURU_SEKOLAH";
    const listAvailable = getListSiswa();
    return (
      <div className={`min-h-screen p-6 font-sans text-slate-800 ${isSekolah ? 'bg-gradient-to-br from-blue-50 to-indigo-100' : 'bg-gradient-to-br from-indigo-50 to-purple-100'}`}>
        <div className="max-w-lg mx-auto">
          <div className="flex flex-wrap justify-between items-center mb-6 bg-white/60 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-white/40 gap-2">
            <div className="flex gap-2">
                <button onClick={handleGantiKelas} className="text-slate-600 hover:text-blue-600 text-xs font-bold bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-200">← Kelas</button>
                <button onClick={handleMenuUtama} className="text-red-500 hover:text-red-700 text-xs font-bold bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-200">🏠 Menu</button>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-bold text-white shadow-lg ${isSekolah ? 'bg-blue-600' : 'bg-indigo-600'}`}>{isSekolah ? "POS 1: SEKOLAH" : "POS 2: ASRAMA"}</span>
          </div>
          
          {isSekolah && (
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl mb-6 relative overflow-hidden">
                <p className="text-xs text-blue-300 uppercase tracking-widest font-bold mb-1">Live di Layar TV</p>
                <h2 className="text-3xl font-extrabold tracking-tight mb-2 truncate">{activeCall.nama}</h2>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${activeCall.status === 'bersiap' ? 'bg-yellow-500 text-black' : activeCall.status === 'masuk' ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'}`}>STATUS: {activeCall.status.toUpperCase()}</span>
            </div>
          )}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50">
            <label className="block mb-3 font-bold text-slate-700 text-sm uppercase tracking-wide">Pilih Siswa ({listAvailable.length} Antrian):</label>
            {listAvailable.length === 0 ? <div className="p-6 bg-slate-50 border border-slate-200 text-center text-slate-400 italic mb-6 rounded-2xl">🎉 Tidak ada antrian!</div> : (
                <div className="relative mb-6">
                    <select className="w-full p-4 pl-5 pr-10 appearance-none bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer" onChange={(e) => setSelectedSiswa(e.target.value)} value={selectedSiswa}>
                    <option value="">-- Klik untuk memilih --</option>{listAvailable.map((nama) => (<option key={nama} value={nama}>{nama}</option>))}
                    </select>
                </div>
            )}
            {isSekolah ? (
                <div className="space-y-3">
                    <button onClick={btnSekolahBersiap} className="w-full bg-amber-400 hover:bg-amber-300 text-amber-900 font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition">⚠️ PANGGIL: BERSIAP</button>
                    <button onClick={btnSekolahMasuk} disabled={activeCall.status !== 'bersiap'} className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition">📢 PANGGIL: MASUK</button>
                    <div className="h-px bg-slate-100 my-4"></div>
                    <button onClick={btnSekolahSelesai} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-2xl border border-slate-200 transition text-sm">✅ Selesai & Hapus</button>
                </div>
            ) : (
                <button onClick={btnAsramaCeklis} disabled={!selectedSiswa} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-5 rounded-2xl shadow-xl text-lg active:scale-[0.98] transition">✅ TANDAI SELESAI</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. ORANG TUA VIEW
  return <TampilanOrtu activeCall={activeCall} jenjang={jenjang} kelas={kelas} handleGantiKelas={handleGantiKelas} handleMenuUtama={handleMenuUtama} />;
}

// --- SUB COMPONENTS ---

function MenuAwal({ setRole, saveState }) {
  const [showAuth, setShowAuth] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [inputPass, setInputPass] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleMenuClick = (roleTujuan) => {
    if (roleTujuan === "ORTU" || roleTujuan === "MONITOR") {
        setRole(roleTujuan);
        saveState("rapor_role", roleTujuan);
    } else {
        setTargetRole(roleTujuan); setShowAuth(true); setErrorMsg(""); setInputPass(""); setShowPassword(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if ((targetRole === "GURU_SEKOLAH" && inputPass === "sekolah2025") || (targetRole === "GURU_ASRAMA" && inputPass === "asrama2025")) {
        setRole(targetRole);
        saveState("rapor_role", targetRole);
    } else { setErrorMsg("Password salah!"); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 font-sans text-slate-800 relative">
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
                <h3 className="text-xl font-bold mb-4 text-center">🔐 Login Guru</h3>
                <p className="text-sm text-slate-500 mb-4 text-center">Masukkan kode akses <span className="font-bold text-slate-800">{targetRole==='GURU_SEKOLAH'?'Guru Sekolah':'Guru Asrama'}</span></p>
                <form onSubmit={handleLogin}>
                    <div className="relative mb-4">
                        <input type={showPassword ? "text" : "password"} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none pr-12" placeholder="Ketik Kode..." autoFocus value={inputPass} onChange={(e) => setInputPass(e.target.value)} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none">
                            {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                        </button>
                    </div>
                    {errorMsg && <p className="text-red-500 text-sm text-center mb-4 font-bold">{errorMsg}</p>}
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mb-2 transition">Masuk</button>
                    <button type="button" onClick={() => setShowAuth(false)} className="w-full text-slate-400 hover:text-slate-600 text-sm font-bold py-2">Batal</button>
                </form>
            </div>
        </div>
      )}
      <div className="mb-6"><img src="/logo.png" alt="Logo Sekolah" className="h-28 w-auto mx-auto object-contain drop-shadow-md hover:scale-105 transition-transform" /></div>
      <div className="text-center mb-10"><h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 mb-2">E-Rapor Queue</h1><p className="text-slate-500 font-medium">Sistem Antrian & Checklist Realtime</p></div>
      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
        <button onClick={() => handleMenuClick("ORTU")} className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-xl shadow-slate-200 border border-white hover:border-blue-200 transition-all duration-300 hover:scale-[1.02] text-left">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
            <span className="text-4xl mb-3 block relative z-10">👨‍👩‍👧‍👦</span>
            <div className="relative z-10"><h3 className="text-xl font-bold text-slate-800">Layar Orang Tua</h3><p className="text-sm text-slate-400">Untuk melihat nomor antrian</p></div>
        </button>
        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleMenuClick("GURU_SEKOLAH")} className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-5 rounded-3xl shadow-lg hover:-translate-y-1 transition-all"><div className="text-2xl mb-1">🏫</div><div className="font-bold text-sm">Guru Sekolah</div></button>
            <button onClick={() => handleMenuClick("GURU_ASRAMA")} className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-5 rounded-3xl shadow-lg hover:-translate-y-1 transition-all"><div className="text-2xl mb-1">🕌</div><div className="font-bold text-sm">Guru Asrama</div></button>
        </div>
        <button onClick={() => handleMenuClick("MONITOR")} className="flex items-center justify-center gap-3 p-4 bg-slate-800 text-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-900 transition shadow-lg"><span>📊</span> Lihat Rekapitulasi Data</button>
      </div>
      <p className="mt-12 text-xs text-slate-300 font-medium">v3.4 • IDN Boarding School Akhwat</p>
    </div>
  );
}

function MenuKelas({ setJenjang, setKelas, setRole, saveState, handleMenuUtama }) {
  const pilihJenjang = (val) => { setJenjang(val); saveState("rapor_jenjang", val); };
  const pilihKelas = (val) => { setKelas(val); saveState("rapor_kelas", val); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <button onClick={handleMenuUtama} className="text-sm text-slate-400 hover:text-red-500 mb-6 flex items-center gap-1 transition">← Kembali ke Menu Utama</button>
          <h2 className="text-2xl font-bold mb-6 text-slate-800">Pilih Kelas</h2>
          <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Jenjang</label>
                <div className="relative">
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none" onChange={(e) => pilihJenjang(e.target.value)}>
                        <option value="">-- Pilih SMP / SMK --</option>{Object.keys(DATA_SEKOLAH).map((key) => <option key={key} value={key}>{key}</option>)}
                    </select>
                </div>
            </div>
            <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Kelas</label>
                 <div className="relative">
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none" onChange={(e) => pilihKelas(e.target.value)}>
                        <option value="">-- Pilih Kelas --</option>
                        <option value="Kelas 7A">7A</option>
                        <option value="Kelas 7B">7B</option>
                        <option value="Kelas 8A">8A</option>
                        <option value="Kelas 8B">8B</option>
                        <option value="Kelas 9A">9A</option>
                        <option value="Kelas 9B">9B</option>
                        <option value="10 RPL">10 RPL</option>
                        <option value="10 DKV">10 DKV</option>
                        <option value="11 RPL">11 RPL</option>
                        <option value="11 DKV">11 DKV</option>
                    </select>
                 </div>
            </div>
          </div>
        </div>
    </div>
  );
}

function TampilanOrtu({ activeCall, jenjang, kelas, handleGantiKelas, handleMenuUtama }) {
  let bgClass = "bg-slate-50"; let cardClass = "bg-white border-slate-100"; let textClass = "text-slate-800"; let statusBadge = "bg-slate-100 text-slate-400"; let labelStatus = "MENUNGGU"; let subText = "Silakan duduk menunggu giliran Anda";
  
  // LOGIC WARNA TOMBOL
  const isIdle = activeCall.status === 'idle';
  const btnStyle = isIdle 
    ? "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-md" 
    : "bg-white/20 text-white border border-white/20 hover:bg-white/30 backdrop-blur-md shadow-sm";

  if (activeCall.status === "bersiap") {
    bgClass = "bg-amber-400"; 
    cardClass = "bg-white border-amber-500/50 shadow-2xl shadow-amber-900/20"; textClass = "text-amber-950"; statusBadge = "bg-amber-100 text-amber-700 animate-pulse"; labelStatus = "PERSIAPAN"; subText = "Silakan menuju ke depan pintu ruangan";
  } else if (activeCall.status === "masuk") {
    bgClass = activeCall.pos === "SEKOLAH" ? "bg-blue-600" : "bg-indigo-600";
    cardClass = "bg-white shadow-2xl shadow-black/30 transform scale-105 transition-transform"; textClass = activeCall.pos === "SEKOLAH" ? "text-blue-900" : "text-indigo-900"; statusBadge = activeCall.pos === "SEKOLAH" ? "bg-blue-100 text-blue-700" : "bg-indigo-100 text-indigo-700"; labelStatus = "SILAKAN MASUK"; subText = activeCall.pos === "SEKOLAH" ? "Temui Wali Kelas Sekarang" : "Temui Guru Asrama Sekarang";
  }

  return (
    <div className={`min-h-screen flex flex-col p-4 transition-colors duration-700 font-sans ${bgClass}`}>
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