import React from 'react';

export function SupabaseSetupUI() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-xl font-bold text-xl">S</div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Supabase Configuration Required</h1>
          </div>
          
          <p className="text-slate-600 leading-relaxed mb-6">
            The application has been fully upgraded to use a production-ready Supabase PostgreSQL backend. 
            However, your environment variables are currently missing.
          </p>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6">
            <h3 className="font-semibold text-slate-800 mb-3">1. Add Environment Variables</h3>
            <p className="text-sm text-slate-500 mb-3">In your AI Studio workspace or Vercel dashboard, add the following secrets:</p>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">VITE_SUPABASE_URL</span> <span className="text-slate-400">=</span> <span className="text-emerald-600">https://your-project.supabase.co</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">VITE_SUPABASE_ANON_KEY</span> <span className="text-slate-400">=</span> <span className="text-emerald-600">eyJhbG...</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-3">2. Run SQL Schema Migrations</h3>
            <p className="text-sm text-slate-500 mb-3">Execute the SQL found in <code className="bg-slate-200 px-1 py-0.5 rounded">schema.sql</code> in your Supabase SQL Editor.</p>
          </div>
        </div>
        <div className="bg-slate-100 p-4 px-8 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center font-medium">After adding the variables, restart your dev server or redeploy on Vercel.</p>
        </div>
      </div>
    </div>
  );
}
