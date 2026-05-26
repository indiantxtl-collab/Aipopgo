import { useNavigate, Routes, Route, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Settings, BarChart2, Users, FileText, Heart, TrendingUp, Sparkles, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';

function DashboardMenu() {
  const { currentUser, systemData } = useAuth();
  const navigate = useNavigate();
  if (!systemData) {
    return (
      <div className="w-full flex-col flex items-center bg-slate-50 min-h-screen justify-center">
         <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4" />
      </div>
    );
  }
  const db = systemData;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 200 } }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] pb-32 pt-6 relative px-5 max-w-md mx-auto">
      {/* Background ambients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl" />
      <div className="absolute top-40 left-0 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl" />
      
      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 w-full">
        
        <motion.div variants={item} className="flex gap-4 items-center mb-8 glass-panel rounded-[2.5rem] p-5 relative overflow-hidden border border-white">
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <Sparkles className="w-32 h-32 text-pink-500" />
          </div>
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-2 border-pink-300 animate-pulse-glow" style={{ transform: 'scale(1.15)' }}></div>
            <img src={currentUser?.avatarUrl || undefined} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-white shadow-md relative z-10" />
          </div>
          <div>
            <h1 className="text-[22px] font-display font-black text-slate-900 tracking-tight flex items-center gap-1.5">
               Creator Studio
               <Sparkles className="w-4 h-4 text-pink-400" />
            </h1>
            <p className="text-[13px] text-pink-500 font-bold tracking-wide">Welcome back, {currentUser?.name}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div variants={item} className="bg-gradient-to-br from-pink-500 to-yellow-400 rounded-[2rem] p-6 shadow-xl shadow-pink-200/50 text-white relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-20 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
               <Heart className="w-24 h-24 fill-white" />
            </div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                 <Heart className="w-4 h-4 fill-white" />
              </div>
              <span className="font-bold text-[11px] tracking-widest uppercase">Total Votes</span>
            </div>
            <div className="text-4xl font-display font-black mt-1 relative z-10 drop-shadow-sm">{db.totalVotes.toLocaleString()}</div>
          </motion.div>
          
          <motion.div variants={item} className="glass-card rounded-[2rem] p-6 shadow-sm border border-white relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] transform group-hover:scale-110 transition-transform duration-500">
               <TrendingUp className="w-24 h-24 text-slate-900" />
            </div>
            <div className="flex items-center gap-2 mb-3 relative z-10 text-pink-500">
              <div className="p-2 bg-pink-50 rounded-xl">
                 <Users className="w-4 h-4" />
              </div>
              <span className="font-bold text-[11px] tracking-widest uppercase text-slate-400">Followers</span>
            </div>
            <div className="text-4xl font-display font-black text-slate-900 mt-1 relative z-10 tracking-tight">{currentUser?.followersCount.toLocaleString()}</div>
          </motion.div>
        </div>

        <motion.h2 variants={item} className="font-display font-black text-xl text-slate-900 mb-4 px-2">Management</motion.h2>
        <motion.div variants={item} className="glass-panel rounded-[2rem] shadow-sm border border-white p-2 flex flex-col gap-1 relative overflow-hidden">
          {[
            { icon: BarChart2, label: 'Analytics & Insights', desc: 'View detailed performance', color: 'text-yellow-600', iconColor: 'text-yellow-500', bg: 'bg-yellow-50', path: '/creator/analytics' },
            { icon: FileText, label: 'Manage Studio Content', desc: 'Edit and review your posts', color: 'text-pink-600', iconColor: 'text-pink-500', bg: 'bg-pink-50', path: '/creator/posts' },
            { icon: Users, label: 'Top Supporters List', desc: 'See who cheers for you', color: 'text-blue-600', iconColor: 'text-blue-500', bg: 'bg-blue-50', path: '/creator/supporters' },
            { icon: Settings, label: 'Profile Configurations', desc: 'Update details and settings', color: 'text-slate-600', iconColor: 'text-slate-500', bg: 'bg-slate-50', path: '/settings' },
          ].map((btn, i) => (
            <motion.button 
              key={i} 
              onClick={() => navigate(btn.path)}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between p-4 rounded-3xl hover:bg-white/60 transition-all border border-transparent hover:border-white/80 group"
            >
              <div className="flex items-center gap-4">
                <div className={`${btn.bg} p-3.5 rounded-2xl ${btn.iconColor} shadow-inner group-hover:scale-105 transition-transform`}>
                  <btn.icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="font-black text-[15px] text-slate-800 tracking-tight">{btn.label}</span>
                  <span className="font-medium text-[12px] text-slate-400">{btn.desc}</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-pink-500 transition-colors shadow-sm">
                 <ChevronRight className="w-5 h-5" />
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

function GenericCreatorPage({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-[calc(100vh-56px)] pb-32 pt-6 relative px-5 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="font-display font-black text-xl text-slate-900">{title}</h1>
        </div>
        <Sparkles className="w-5 h-5 text-pink-400" />
      </div>

      <div className="space-y-4">
         {/* Analytics Graph Mock */}
         <div className="glass-panel p-6 rounded-[2rem] border border-white">
            <h3 className="font-bold text-slate-700 mb-6">Past 7 Days</h3>
            <div className="flex items-end justify-between h-32 gap-2 mb-4">
              {[40, 70, 45, 90, 60, 100, 80].map((h, i) => (
                <div key={i} className="w-full bg-pink-100 rounded-t-xl group relative">
                   <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-gradient-to-t from-pink-400 to-yellow-400 rounded-t-xl group-hover:from-pink-500 group-hover:to-orange-400 transition-colors cursor-pointer" />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
               <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
         </div>
      </div>
    </div>
  );
}

export function CreatorDashboard() {
  return (
    <Routes>
      <Route path="/" element={<DashboardMenu />} />
      <Route path="analytics" element={<GenericCreatorPage title="Analytics" />} />
      <Route path="posts" element={<GenericCreatorPage title="Content Studio" />} />
      <Route path="supporters" element={<GenericCreatorPage title="Top Supporters" />} />
    </Routes>
  );
}
