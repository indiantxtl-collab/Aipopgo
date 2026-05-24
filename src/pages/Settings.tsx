import React, { useState } from 'react';
import { useNavigate, Routes, Route, Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  User, Bell, Shield, Palette, Globe, Lock, Ban, 
  Bookmark, HelpCircle, Info, FileText, Trash2, LogOut,
  ChevronRight, ArrowLeft, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

const SETTING_ITEMS = [
  { id: 'account', icon: User, label: 'Account Settings', path: '/settings/account' },
  { id: 'privacy', icon: Shield, label: 'Privacy Settings', path: '/settings/privacy' },
  { id: 'notifications', icon: Bell, label: 'Notifications', path: '/settings/notifications' },
  { id: 'appearance', icon: Palette, label: 'Appearance', path: '/settings/appearance' },
  { id: 'language', icon: Globe, label: 'Language', path: '/settings/language' },
  { id: 'security', icon: Lock, label: 'Security', path: '/settings/security' },
  { id: 'blocked', icon: Ban, label: 'Blocked Users', path: '/settings/blocked' },
  { id: 'saved', icon: Bookmark, label: 'Saved Posts', path: '/settings/saved' },
  { id: 'help', icon: HelpCircle, label: 'Help & Support', path: '/settings/help' },
  { id: 'about', icon: Info, label: 'About App', path: '/settings/about' },
  { id: 'terms', icon: FileText, label: 'Terms & Privacy', path: '/settings/terms' },
];

function SettingsMenu() {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20">
      <div className="bg-white px-4 py-3 sticky top-16 z-30 border-b border-slate-100 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-50">
             <ArrowLeft className="w-5 h-5 text-slate-600" />
           </button>
           <h1 className="font-display font-black text-xl text-slate-900">Settings</h1>
         </div>
      </div>

      <div className="px-4 py-6">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-6">
          {SETTING_ITEMS.slice(0, 6).map((item, i) => (
            <Link 
              key={item.id} 
              to={item.path}
              className={`flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors ${i !== 5 ? 'border-b border-slate-50' : ''}`}
            >
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                   <item.icon className="w-5 h-5 text-slate-600" />
                 </div>
                 <span className="font-bold text-slate-700 text-[15px]">{item.label}</span>
               </div>
               <ChevronRight className="w-5 h-5 text-slate-300" />
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-6">
          {SETTING_ITEMS.slice(6).map((item, i) => (
            <Link 
              key={item.id} 
              to={item.path}
              className={`flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors ${i !== 4 ? 'border-b border-slate-50' : ''}`}
            >
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                   <item.icon className="w-5 h-5 text-slate-600" />
                 </div>
                 <span className="font-bold text-slate-700 text-[15px]">{item.label}</span>
               </div>
               <ChevronRight className="w-5 h-5 text-slate-300" />
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
           <button onClick={handleLogout} className="flex items-center w-full p-4 bg-white hover:bg-red-50 transition-colors border-b border-slate-50 group">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-red-50 group-hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center">
                   <LogOut className="w-5 h-5 text-red-500" />
                 </div>
                 <span className="font-bold text-red-500 text-[15px]">Log Out</span>
               </div>
           </button>
           <button onClick={() => toast.error('Account deletion requested')} className="flex items-center w-full p-4 bg-white hover:bg-slate-50 transition-colors group">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                   <Trash2 className="w-5 h-5 text-slate-400" />
                 </div>
                 <span className="font-bold text-slate-500 text-[15px]">Delete Account</span>
               </div>
           </button>
        </div>
      </div>
    </div>
  );
}

function GenericSettingsPage({ title, items }: { title: string, items: string[] }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [values, setValues] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map((item) => [item, false])),
  );
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    const section = title.toLowerCase().replace(/\s+/g, '_');
    const res = await api.updateSettings(currentUser.id, section, values);
    setSaving(false);
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    toast.success('Settings saved');
  };
  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20">
      <div className="bg-white px-4 py-3 sticky top-16 z-30 border-b border-slate-100 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-50">
             <ArrowLeft className="w-5 h-5 text-slate-600" />
           </button>
           <h1 className="font-display font-black text-xl text-slate-900">{title}</h1>
         </div>
      </div>
      <div className="p-4 space-y-6">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
           {items.map((item, i) => (
             <div key={i} className={`flex items-center justify-between p-5 bg-white ${i !== items.length - 1 ? 'border-b border-slate-50' : ''}`}>
               <span className="font-bold text-slate-700 text-[15px]">{item}</span>
               <button className={`w-12 h-6 ${values[item] ? 'bg-pink-500' : 'bg-slate-200'} rounded-full relative cursor-pointer`} onClick={() => setValues((prev) => ({ ...prev, [item]: !prev[item] }))}>
                 <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm transition-transform" style={{ transform: values[item] ? 'translateX(24px)' : 'translateX(0px)' }} />
               </button>
             </div>
           ))}
        </div>
        <div className="px-4 text-center">
           <button disabled={saving} onClick={onSave} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl disabled:opacity-60">
             Save Changes
           </button>
        </div>
      </div>
    </div>
  );
}

const SETTINGS_CONTENT: Record<string, string[]> = {
  account: ['Public Profile', 'Show Activity Status', 'Allow Tagging'],
  privacy: ['Private Account', 'Hide Online Status', 'Disable Read Receipts'],
  notifications: ['Push Notifications', 'Email Digests', 'In-App Sounds'],
  appearance: ['Dark Mode', 'High Contrast', 'Reduce Motion'],
  security: ['Two-Factor Auth', 'Login Alerts', 'Save Login Info'],
  blocked: ['Block strangers from messaging', 'Block comments from non-followers'],
  saved: ['Save posts to local device', 'Sync saved posts to cloud'],
  help: ['Send Crash Reports', 'Help us improve'],
  about: ['Automatic Updates'],
  terms: ['Agree to Data Processing'],
};

function LanguageSettings() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20">
      <div className="bg-white px-4 py-3 sticky top-16 z-30 border-b border-slate-100 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-50">
             <ArrowLeft className="w-5 h-5 text-slate-600" />
           </button>
           <h1 className="font-display font-black text-xl text-slate-900">Language</h1>
         </div>
      </div>
      <div className="p-4">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          {LANGUAGES.map((lang, i) => (
             <button 
               key={lang.code}
               onClick={() => {
                 setLanguage(lang.code);
                 toast.success('Language updated');
               }}
               className={`w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors ${i !== LANGUAGES.length - 1 ? 'border-b border-slate-50' : ''}`}
             >
               <span className="font-bold text-slate-700 text-[15px]">{lang.label}</span>
               {language === lang.code && (
                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center">
                   <Check className="w-4 h-4" />
                 </motion.div>
               )}
             </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <Routes>
      <Route path="/" element={<SettingsMenu />} />
      <Route path="language" element={<LanguageSettings />} />
      {SETTING_ITEMS.filter(i => i.id !== 'language').map(item => (
         <Route key={item.id} path={item.id} element={<GenericSettingsPage title={item.label} items={SETTINGS_CONTENT[item.id] || ['Enable feature']} />} />
      ))}
    </Routes>
  );
}
