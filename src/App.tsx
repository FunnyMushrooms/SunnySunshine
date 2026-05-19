import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Coins, Lock, ShieldAlert } from 'lucide-react';

const PASSWORD_HASH = '2834c295eb954847ae5538f997d4970ce4b55fc07d8ad400a73d2a7ea335de0a';

const rounds = [
  {
    title: 'Round 1: Acquisition & Player Psychology',
    sarcastic: '“A 3-cup choice starts as a 33.3% probability problem. Product teams call it a user journey.”',
    lesson:
      'I map user motivation, conversion points, friction, and measurable outcomes so acquisition is not just traffic—it is behavior designed with responsible UX.',
  },
  {
    title: 'Round 2: Cashier & Payments',
    sarcastic: '“The user remembers the withdrawal delay longer than the welcome bonus banner.”',
    lesson:
      'I structure cashier requirements across deposits, withdrawals, states (pending/approved/declined/reversed/refunded), reconciliation, KYC dependencies, and trust-critical failure handling.',
  },
  {
    title: 'Round 3: Fraud & Abuse Logic',
    sarcastic:
      '“Fraud prevention is the art of noticing the product is being played by people who read the rules better than the product team.”',
    lesson:
      'I model abuse paths: promo abuse, multi-accounting, suspicious patterns, chargebacks, bot behavior, and investigation flows tied to product controls.',
  },
];

const slides = [
  ['Profile', ['Business Analyst / Product BA for iGaming and high-risk digital products', '10+ years in complex technical environments', 'Master’s degree in Cybersecurity', 'B2 English', 'NDA-safe communication style']],
  ['What I bring to iGaming', ['Systems thinking', 'Product risk thinking', 'Requirements clarity', 'Abuse-case analysis', 'Stakeholder alignment', 'Delivery ownership']],
  ['Product domains', ['Acquisition and player journey', 'Cashier and payments', 'KYC/compliance workflows', 'Fraud and abuse logic', 'Backoffice/admin tools', 'Metrics and reporting']],
  ['Delivery style', ['Convert ambiguity into structured requirements', 'Write acceptance criteria', 'Build diagrams and stakeholder-readable decisions', 'Adapt when requirements, deadlines, scope, or team capacity change', 'Responsible for decisions and delivery outcomes']],
];

const hashPassword = async (v: string) => {
  const data = new TextEncoder().encode(v);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

export function App() {
  const [unlocked, setUnlocked] = useState(sessionStorage.getItem('demo_unlocked') === '1');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [caught, setCaught] = useState(false);
  const [slide, setSlide] = useState(0);

  const winningCup = useMemo(() => (round + 1) % 3, [round]);

  useEffect(() => {
    if (round !== 2 || picked !== null) return;
    const timeout = setTimeout(() => setCaught(false), 1900);
    return () => clearTimeout(timeout);
  }, [round, picked]);

  const unlock = async () => {
    // Frontend password protection is only a demo barrier for static hosting. Do not use this for sensitive or NDA-protected information.
    const hash = await hashPassword(pwd);
    if (hash === PASSWORD_HASH) {
      sessionStorage.setItem('demo_unlocked', '1');
      setUnlocked(true);
      setError('');
      return;
    }
    setError('Wrong cup. Wrong password. Product risk detected.');
  };

  if (!unlocked) {
    return <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6"><div className="board w-full max-w-xl rounded-3xl p-8"><h1 className="text-3xl font-bold">Private Product Demo</h1><p className="mt-2 text-slate-300">A first-person shell-game board about iGaming product logic, risk, payments, and requirements.</p><div className="mt-6 flex gap-3"><input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3" placeholder="Enter password" /><button onClick={unlock} className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3 font-semibold">Unlock</button></div><p className="mt-2 text-xs text-amber-300">Demo access only.</p>{error && <p className="mt-3 text-red-400">{error}</p>}</div></div>;
  }

  const done = round >= rounds.length;

  return <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-4 md:p-8"><div className="max-w-6xl mx-auto space-y-6">
    <section className="board rounded-3xl p-6">
      <h2 className="text-2xl font-bold">Guess the Cup. Read the Product.</h2>
      <p className="text-slate-300 mt-2">Business Analyst / Product BA candidate for iGaming · 10+ years in complex environments · Cybersecurity Master’s · B2 English.</p>
    </section>

    {!done ? <section className="game-table rounded-3xl p-6">
      <div className="board rounded-2xl p-4 mb-6">
        <h3 className="text-xl font-semibold">{rounds[round].title}</h3>
        <p className="text-sm text-slate-300 mt-2">First-person table view: watch hands shuffle the cups, then choose one.</p>
      </div>

      <div className="table-surface">
        {picked === null && <>
          <motion.div aria-hidden="true" className="real-hand real-hand-left" animate={{ x: [0, 18, 0, 12, 0], rotate: [0, 10, -8, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div aria-hidden="true" className="real-hand real-hand-right" animate={{ x: [0, -18, 0, -12, 0], rotate: [0, -10, 8, -6, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
        </>}

        <div className="cup-lane">{[0, 1, 2].map((i) => <motion.button key={i} whileTap={{ scale: 0.97 }} animate={picked === null ? { x: [0, i === 1 ? 20 : -16, 0, i === 1 ? -20 : 16, 0] } : { x: 0 }} transition={picked === null ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.15 }} onClick={() => setPicked(i)} disabled={picked !== null} className="real-cup" aria-label={`Pick cup ${i + 1}`} />)}</div>
      </div>

      {round === 2 && picked === null && <motion.button onClick={() => { setCaught(true); setPicked(winningCup); }} initial={{ y: -10 }} animate={{ y: [0, 210] }} transition={{ duration: 1.8 }} className="mx-auto mt-4 block text-3xl">⚪</motion.button>}

      {picked !== null && <div className="board mt-6 rounded-2xl p-4"><p className="font-semibold">{rounds[round].sarcastic}</p><p className="mt-2 text-slate-300">{rounds[round].lesson}</p><div className="mt-3 flex items-center gap-2 text-sm">{round === 1 && picked === winningCup && <><Coins size={16} /> Correct cup: cashier trust retained.</>}{round === 2 && (caught ? <><Lock size={16} /> Ball caught. Money leakage contained.</> : <><ShieldAlert size={16} /> Missed catch. All cups went empty.</>)}</div><button onClick={() => { setRound((r) => r + 1); setPicked(null); setCaught(false); }} className="mt-4 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2">Next round</button></div>}
    </section> :
      <section className="board rounded-3xl p-6"><h3 className="text-xl font-semibold">CV Deck Unlocked</h3><AnimatePresence mode="wait"><motion.div key={slide} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="mt-4 rounded-2xl bg-slate-800/70 p-5"><h4 className="font-bold text-lg">{slides[slide][0]}</h4><ul className="mt-3 space-y-2 text-slate-300">{(slides[slide][1] as string[]).map((it) => <li key={it}>• {it}</li>)}</ul></motion.div></AnimatePresence><div className="mt-4 flex justify-between"><button onClick={() => setSlide((s) => Math.max(0, s - 1))} className="rounded-xl bg-slate-700 px-4 py-2">Prev</button><button onClick={() => setSlide((s) => Math.min(slides.length - 1, s + 1))} className="rounded-xl bg-blue-600 px-4 py-2">Next</button></div></section>}

    <div className="board rounded-xl text-xs text-slate-400 flex items-center gap-2 p-3"><AlertTriangle size={14} /> Static demo for GitHub Pages.</div></div></main>;
}
