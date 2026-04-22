/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Clock, 
  Dog, 
  Calendar, 
  Package, 
  Wallet,
  Menu,
  X,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Phone,
  MessageCircle,
  TrendingUp,
  Info,
  Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { MOCK_PATIENTS, MOCK_VISITS, MOCK_INVENTORY } from "./mockData";
import { VisitStatus, Species, Patient, Vaccination } from "./types";
import { generateSuggestedSchedule } from "./vaxService";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

type Screen = "dashboard" | "visit" | "patients" | "schedule" | "inventory" | "billing" | "vax";

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>("dashboard");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  
  // Persistent Timer State
  const [timeElapsed, setTimeElapsed] = useState(862); // 14:22 in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const addVaxReminder = (patientId: string, vax: Partial<Vaccination>) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const newVax: Vaccination = {
          id: Math.random().toString(36).substr(2, 9),
          vaccineName: vax.vaccineName || "Unknown",
          dateAdministered: "Pending",
          manufacturer: vax.manufacturer,
          lotNumber: vax.lotNumber,
          nextDueDate: vax.nextDueDate || "",
          status: "Upcoming"
        };
        return { ...p, vaccinations: [...p.vaccinations, newVax] };
      }
      return p;
    }));
    setNotification({ 
      message: `Reminder set for ${vax.vaccineName}. Local notification synced with client WhatsApp channel.`, 
      type: 'success' 
    });
  };

  const navItems = [
    { id: "dashboard", label: "Today", icon: LayoutDashboard },
    { id: "patients", label: "Patients", icon: Dog },
    { id: "vax", label: "Vaccines", icon: CheckCircle2 },
    { id: "inventory", label: "Stock", icon: Package },
    { id: "billing", label: "Billing", icon: Wallet },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
          >
            <div className="bg-slate-900 border border-emerald-500/30 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold leading-tight">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col py-6 shrink-0">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
              V
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">VetHub</h1>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveScreen(item.id as Screen)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-400" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="mt-auto px-4">
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 text-[10px] space-y-2">
             <div className="flex justify-between text-slate-500 uppercase font-black">
                <span>Next Backup</span>
                <span>2h 40m</span>
             </div>
             <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="w-[80%] h-full bg-emerald-500" />
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 lg:h-18 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight capitalize">
              {activeScreen === "vax" ? "Vaccination Manager" : activeScreen}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">
              <span className="status-dot active-green"></span>
              M-Pesa Live
            </div>
            <img src={`https://ui-avatars.com/api/?name=Dr+Njenga&background=10b981&color=fff`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="Profile" />
          </div>
        </header>

        {/* Dynamic Screen Content */}
        <section className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
          <AnimatePresence mode="wait">
            {activeScreen === "dashboard" && (
              <DashboardScreen 
                key="dashboard" 
                patients={patients}
                timeElapsed={timeElapsed}
                isTimerRunning={isTimerRunning}
                formatTime={formatTime}
                onToggleTimer={toggleTimer}
                onStartVisit={() => setActiveScreen("visit")} 
                onVaxTool={() => setActiveScreen("vax")}
              />
            )}
            {activeScreen === "visit" && (
              <VisitFlowScreen 
                key="visit" 
                timeElapsed={timeElapsed} 
                isTimerRunning={isTimerRunning}
                formatTime={formatTime}
                onToggleTimer={toggleTimer}
                onComplete={() => setActiveScreen("dashboard")} 
              />
            )}
            {activeScreen === "vax" && (
              <VaxSchedulerScreen 
                key="vax" 
                patients={patients}
                onAddReminder={addVaxReminder}
              />
            )}
            {activeScreen !== "dashboard" && activeScreen !== "visit" && activeScreen !== "vax" && (
              <motion.div 
                key="placeholder"
                className="flex flex-col items-center justify-center h-full text-slate-400"
              >
                <Info className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm font-medium">Module coming soon</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Mobile Nav */}
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 h-16 bg-white shadow-xl rounded-2xl border border-slate-100 flex items-center justify-around px-2 z-50">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id as Screen)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[56px]",
                activeScreen === item.id ? "text-emerald-500" : "text-slate-400"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-tight uppercase">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}

function DashboardScreen({ onStartVisit, onVaxTool, patients, timeElapsed, isTimerRunning, formatTime, onToggleTimer }: { 
  onStartVisit: () => void, 
  onVaxTool: () => void, 
  patients: Patient[],
  timeElapsed: number,
  isTimerRunning: boolean,
  formatTime: (s: number) => string,
  onToggleTimer: () => void
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto grid grid-cols-12 gap-6"
    >
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* Vax Monitor Widget */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                 <Calendar className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                 <h3 className="font-bold text-slate-800">Vaccination Monitor</h3>
                 <p className="text-xs text-slate-500">2 animals overdue boosters</p>
              </div>
           </div>
           <button 
             onClick={onVaxTool}
             className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-100 transition-all"
           >
              Generate Schedule
           </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Visits Today", value: "08", sub: "3 Completed", color: "emerald" },
            { label: "Stock Alerts", value: "02", sub: "Ketamine Low Stock", color: "orange" },
            { label: "Revenue", value: "KSh 42.5k", sub: "+12% from yesterday", color: "emerald" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <p className={cn("text-2xl font-bold tracking-tight", stat.color === "orange" ? "text-orange-500" : "text-slate-800")}>{stat.value}</p>
              <p className={cn("text-[10px] font-bold mt-1", stat.color === "orange" ? "text-slate-400" : "text-emerald-500")}>{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Visit Cards */}
        <div className="space-y-4">
          {MOCK_VISITS.map(visit => {
            const patient = patients.find(p => p.id === visit.patientId);
            return (
              <div key={visit.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                        <Dog className="w-8 h-8" />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-800">{patient?.name}</h4>
                         <p className="text-xs text-slate-500">{patient?.ownerName} • {patient?.location.address}</p>
                         <div className="mt-2 flex gap-1 items-center">
                            {patient?.vaccinations.some(v => v.vaccineName === "Rabies") ? (
                               <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase">Rabies Active</span>
                            ) : (
                               <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[8px] font-black uppercase">Rabies Missing</span>
                            )}
                            {patient?.vaccinations.some(v => v.status === "Upcoming") && (
                               <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[8px] font-black uppercase">Booster Alert</span>
                            )}
                         </div>
                      </div>
                   </div>
                   <button onClick={onStartVisit} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                      Start Visit
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Visit Highlight */}
      <div className="col-span-12 lg:col-span-4 h-fit sticky top-6">
        <div className="bg-emerald-900 text-white rounded-[40px] p-8 shadow-2xl shadow-emerald-900/40 relative overflow-hidden flex flex-col min-h-[460px] border border-white/5">
          <div className="relative z-10 space-y-8 flex flex-col h-full">
            <div className="flex justify-between items-center">
               <span className="px-3 py-1 bg-emerald-400/20 rounded-full text-[10px] uppercase font-black tracking-widest border border-emerald-400/30 text-emerald-400">Live Session</span>
               <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                 <button 
                   onClick={onToggleTimer}
                   className={cn(
                     "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                     isTimerRunning ? "bg-amber-500/20 text-amber-500" : "bg-emerald-500 text-white"
                   )}
                 >
                   {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                 </button>
                 <span className={cn("text-sm font-mono font-bold tabular-nums tracking-tight", isTimerRunning ? "text-white" : "text-slate-500")}>
                    {formatTime(timeElapsed)}
                 </span>
               </div>
            </div>
            
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60 mb-2">Patient in Focus</p>
              <h2 className="text-4xl font-bold tracking-tight mb-1">Daisy (Cow)</h2>
              <p className="text-emerald-300/60 text-xs flex items-center gap-1.5">
                <MapIcon className="w-3 h-3" />
                Thika Industrial Area, Nairobi
              </p>
            </div>

            <div className="p-5 bg-white/5 rounded-[32px] border border-white/10 flex-1">
              <p className="text-[10px] uppercase opacity-30 font-black tracking-widest mb-4">Quick Checklist</p>
              <div className="space-y-4">
                {[
                  { label: "Administer PenStrep", checked: true },
                  { label: "Check Respiratory Rate", checked: false },
                  { label: "Verify Milk Withdrawal", checked: false }
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-4 cursor-pointer group">
                    <div className={cn(
                      "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                      item.checked ? "bg-emerald-400 border-emerald-400 shadow-lg shadow-emerald-400/20" : "border-white/20 group-hover:border-white/40"
                    )}>
                      {item.checked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-900 font-bold" />}
                    </div>
                    <span className={cn("text-sm font-medium transition-colors", item.checked ? "text-white/40 line-through" : "text-white")}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={onStartVisit}
              className="w-full bg-white text-emerald-900 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-50 transition-all active:scale-[0.98]"
            >
              Resume Detailed Flow
            </button>
          </div>
          
          {/* Decorative Detail */}
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />
        </div>
      </div>
    </motion.div>
  );
}

function VaxSchedulerScreen({ patients, onAddReminder }: { patients: Patient[], onAddReminder: (id: string, vax: Partial<Vaccination>) => void }) {
  const [activePatientId, setActivePatientId] = useState(patients[0].id);
  const patient = patients.find(p => p.id === activePatientId)!;
  const suggestions = generateSuggestedSchedule(patient.species, patient.ageMonths, patient.vaccinations);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Patient Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
         {patients.map(p => (
            <button 
              key={p.id}
              onClick={() => setActivePatientId(p.id)}
              className={cn(
                "px-6 py-4 rounded-2xl border transition-all shrink-0 text-left min-w-[160px]",
                activePatientId === p.id ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
              )}
            >
               <div className="flex justify-between items-start mb-1">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{p.species}</p>
                 {p.vaccinations.some(v => v.status === "Upcoming") && <div className="w-2 h-2 bg-amber-500 rounded-full" />}
               </div>
               <p className="font-bold text-lg">{p.name}</p>
            </button>
         ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* History Column */}
        <div className="col-span-12 lg:col-span-12 space-y-4">
           <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-bold text-slate-800 tracking-tight">Vaccination Roadmap</h3>
                 <div className="flex gap-2">
                    <button className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors">
                       <Plus className="w-5 h-5" />
                    </button>
                 </div>
              </div>

              {/* Suggestions Section */}
              <div className="mb-10">
                 <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4 px-2">Generated Recommendations</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestions.length > 0 ? suggestions.map((vax, i) => {
                      const isAlreadyReminded = patient.vaccinations.some(v => v.vaccineName === vax.vaccineName && v.status === "Upcoming");
                      return (
                        <div key={i} className="p-5 bg-emerald-50/50 rounded-[28px] border border-emerald-100/50 flex flex-col justify-between h-full group">
                           <div>
                              <div className="flex justify-between items-start mb-2">
                                 <h4 className="font-bold text-slate-800 text-base">{vax.vaccineName}</h4>
                                 <span className="px-2 py-1 bg-emerald-500 text-white rounded text-[8px] font-black uppercase tracking-widest">Suggested</span>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">Recommended booster based on {patient.name}'s age ({patient.ageMonths}m).</p>
                              
                              <div className="flex flex-wrap gap-2 mt-auto">
                                 {vax.manufacturer && (
                                   <div className="px-2 py-1 bg-white/50 border border-emerald-200/50 rounded-lg text-[9px] text-emerald-700 font-bold uppercase tracking-tight">
                                     Mfr: {vax.manufacturer}
                                   </div>
                                 )}
                                 {vax.lotNumber && (
                                   <div className="px-2 py-1 bg-white/50 border border-emerald-200/50 rounded-lg text-[9px] text-emerald-700 font-bold uppercase tracking-tight">
                                     Lot: {vax.lotNumber}
                                   </div>
                                 )}
                              </div>
                           </div>
                           <div className="flex items-center justify-between pt-4 border-t border-emerald-100/30 mt-4">
                              <div>
                                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Next Due</p>
                                 <p className="text-sm font-bold text-slate-800">{vax.nextDueDate}</p>
                              </div>
                              <button 
                                disabled={isAlreadyReminded}
                                onClick={() => onAddReminder(patient.id, vax)}
                                className={cn(
                                  "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-lg active:scale-95",
                                  isAlreadyReminded 
                                    ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed" 
                                    : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20"
                                )}
                              >
                                 {isAlreadyReminded ? "Reminder Set" : "Set Reminder"}
                              </button>
                           </div>
                        </div>
                      );
                    }) : (
                      <div className="col-span-full p-8 bg-slate-50 rounded-3xl text-center border border-dashed border-slate-200">
                         <p className="text-sm text-slate-400">All current protocols satisfied.</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* History Section */}
              <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Vaccination History</p>
                 <div className="space-y-3">
                    {patient.vaccinations.map(vax => (
                       <div key={vax.id} className="group p-5 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/20 transition-all rounded-[28px] border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className={cn(
                               "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border transition-colors",
                               vax.status === "Administered" ? "bg-white text-emerald-500 border-emerald-100" : "bg-white text-amber-500 border-amber-100"
                             )}>
                                {vax.status === "Administered" ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                             </div>
                             <div>
                                <h4 className="font-bold text-slate-800">{vax.vaccineName}</h4>
                                <div className="flex flex-col gap-1">
                                   <p className="text-xs text-slate-400 flex items-center gap-2">
                                      {vax.status === "Administered" ? `Administered: ${vax.dateAdministered}` : `Scheduled: ${vax.nextDueDate}`}
                                   </p>
                                   {(vax.manufacturer || vax.lotNumber) && (
                                     <p className="text-[10px] text-slate-400 font-medium">
                                       {vax.manufacturer && `Mfr: ${vax.manufacturer}`}
                                       {vax.manufacturer && vax.lotNumber && " • "}
                                       {vax.lotNumber && `Lot: ${vax.lotNumber}`}
                                     </p>
                                   )}
                                </div>
                             </div>
                          </div>
                          <div className="text-right">
                             <span className={cn(
                               "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                               vax.status === "Administered" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                             )}>
                                {vax.status === "Administered" ? "ACTIVE" : "REMINDER"}
                             </span>
                             {vax.status === "Administered" && (
                               <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">Exp: {vax.nextDueDate}</p>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Client Reminders Bar */}
           <div className="bg-slate-900 p-6 rounded-[32px] shadow-2xl flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-emerald-400" />
                 </div>
                 <div>
                    <h4 className="font-bold">WhatsApp Reminder Channel</h4>
                    <p className="text-xs text-white/50">Notify {patient.ownerName} about upcoming boosters</p>
                 </div>
              </div>
              <button 
                onClick={() => window.open(`https://wa.me/${patient.ownerPhone}?text=Hi ${patient.ownerName}, ${patient.name} is due for his vaccine on ${patient.vaccinations[0].nextDueDate}. Shall we book a visit?`)}
                className="bg-emerald-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30"
              >
                 Send WhatsApp
              </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function VisitFlowScreen({ onComplete, timeElapsed, isTimerRunning, formatTime, onToggleTimer }: { 
  onComplete: () => void,
  timeElapsed: number,
  isTimerRunning: boolean,
  formatTime: (s: number) => string,
  onToggleTimer: () => void
}) {
  const [step, setStep] = useState<"soap" | "meds" | "billing">("soap");

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Session Progress Header */}
      <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden border border-white/5">
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-[28px] flex items-center justify-center border border-emerald-500/20 shadow-inner">
              <Smartphone className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">In Field Session</p>
              <h3 className="text-3xl font-bold tracking-tight">Daisy • M. Wanjiku</h3>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-1">
            <div className="flex items-center gap-3 bg-white/5 px-6 py-4 rounded-[32px] border border-white/10 group">
              <button 
                onClick={onToggleTimer}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isTimerRunning ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30" : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                )}
              >
                {isTimerRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
              </button>
              <div className="text-right">
                <p className={cn(
                  "font-mono text-4xl font-bold tracking-tighter tabular-nums transition-colors",
                  isTimerRunning ? "text-emerald-400" : "text-slate-500"
                )}>
                  {formatTime(timeElapsed)}
                </p>
                <div className="flex items-center justify-end gap-1">
                  <span className={cn("w-1.5 h-1.5 rounded-full", isTimerRunning ? "bg-emerald-500 animate-pulse" : "bg-slate-700")} />
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{isTimerRunning ? "LIVE SESSION" : "SESSION PAUSED"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Geometric Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[120px] pointer-events-none" />
      </div>

      {/* Stepper with Sleek Style */}
      <div className="flex items-center gap-2 p-2 bg-white rounded-2xl shadow-sm border border-slate-100">
        {["soap", "meds", "billing"].map((s, i) => (
          <button 
            key={s}
            onClick={() => setStep(s as any)}
            className={cn(
               "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
               step === s ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:bg-slate-50"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {step === "soap" && (
            <motion.div 
              key="soap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-6">
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Assessment Notes</label>
                   <textarea className="w-full bg-[#f4f7f6] border border-slate-100 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none h-32" placeholder="Start typing clinical signs..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Temp (°C)", val: "38.5" },
                    { label: "Heart Rate", val: "80" }
                  ].map(stat => (
                    <div key={stat.label} className="bg-[#f4f7f6] p-4 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1">{stat.label}</span>
                      <input type="text" className="bg-transparent font-bold text-lg text-slate-800 w-full outline-none" defaultValue={stat.val} />
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setStep("meds")} className="w-full h-16 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all">
                NEXT: MEDICATIONS
              </button>
            </motion.div>
          )}

          {step === "meds" && (
            <motion.div key="meds" className="space-y-4">
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                 <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-bold text-slate-800">Administered Drugs</h4>
                    <button className="w-10 h-10 bg-emerald-50 flex items-center justify-center rounded-xl text-emerald-600 hover:bg-emerald-100 transition-all">
                      <Plus className="w-5 h-5" />
                    </button>
                 </div>
                 <div className="space-y-3">
                   <div className="p-4 bg-[#f4f7f6] rounded-2xl border border-slate-100 flex items-center justify-between">
                     <div>
                       <p className="font-bold text-slate-800">Penicillin G</p>
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">15ml • Intramuscular</p>
                     </div>
                     <p className="font-bold text-emerald-600">KES 1,200</p>
                   </div>
                 </div>
              </div>
              <button onClick={() => setStep("billing")} className="w-full h-16 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/20">
                NEXT: REVIEW & BILL
              </button>
            </motion.div>
          )}

          {step === "billing" && (
            <motion.div key="billing" className="space-y-6">
               <div className="bg-slate-900 text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8 text-white/40">
                      <p className="text-[10px] font-black uppercase tracking-widest">Client Invoice</p>
                      <img src="/api/placeholder/100/100" className="w-12 h-12 rounded-lg opacity-20 invert" alt="Logo" />
                    </div>
                    <div className="space-y-2 mb-10 pb-10 border-b border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-sm">Farm Visit Fee</span>
                        <span className="font-bold">KES 3,500</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-sm">Medications</span>
                        <span className="font-bold">KES 1,200</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Grand Total</p>
                        <p className="text-4xl font-bold tracking-tighter">KES 4,700</p>
                      </div>
                      <button className="bg-emerald-500 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all">
                        <Smartphone className="w-5 h-5" />
                        REQUEST M-PESA
                      </button>
                    </div>
                  </div>
               </div>
               <div className="flex gap-4">
                  <button onClick={onComplete} className="flex-1 h-16 bg-white text-slate-800 border border-slate-100 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all">
                    CANCEL
                  </button>
                  <button onClick={onComplete} className="flex-1 h-16 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20">
                    COMPLETE VISIT
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
