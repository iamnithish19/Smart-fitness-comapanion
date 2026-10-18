import React, { useState, useEffect } from 'react';
import { Clock, Calendar, ShieldCheck, Sun, Moon, Sunrise, Sunset, Globe, Sparkles } from 'lucide-react';

export default function RealTimeClockWidget({ user }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const displayHours = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formatted12 = `${String(displayHours).padStart(2, '0')}:${minutes}:${seconds}`;
  const formatted24 = `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;

  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';

  // Dynamic greeting & icon based on real time of day
  let greeting = 'Good Morning';
  let GreetingIcon = Sunrise;
  let greetingColor = 'text-amber-500';

  if (hours >= 12 && hours < 17) {
    greeting = 'Good Afternoon';
    GreetingIcon = Sun;
    greetingColor = 'text-yellow-500';
  } else if (hours >= 17 && hours < 21) {
    greeting = 'Good Evening';
    GreetingIcon = Sunset;
    greetingColor = 'text-orange-500';
  } else if (hours >= 21 || hours < 5) {
    greeting = 'Good Night';
    GreetingIcon = Moon;
    greetingColor = 'text-indigo-400';
  }

  const userName = user?.name || 'Member';

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl mb-6">
      {/* Decorative background glow elements */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Column: Greeting & Access Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              REAL-TIME ACCESS PORTAL
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              CONNECTED
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <GreetingIcon className={`w-8 h-8 ${greetingColor} animate-bounce`} />
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {greeting}, {userName.split(' ')[0]}!
              </h2>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Authorized Real-Time Session Active
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: High Precision Live Ticking Clock & Date Card */}
        <div className="bg-slate-800/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-700/80 flex flex-col items-center sm:items-end justify-center min-w-[260px] shadow-inner">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>LIVE REAL-TIME CLOCK</span>
          </div>

          {/* Big Digital Clock Display */}
          <div className="font-mono tabular-nums text-3xl sm:text-4xl font-black text-amber-400 tracking-tight flex items-baseline gap-1">
            <span>{formatted12}</span>
            <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">{ampm}</span>
          </div>

          {/* Date & Timezone */}
          <div className="mt-2 text-xs font-medium text-slate-300 flex items-center gap-2 wrap justify-end">
            <span className="flex items-center gap-1 text-slate-200 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {dayOfWeek}, {fullDate}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-400 border border-slate-600">
              {timezone}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
