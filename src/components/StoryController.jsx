import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { rounds } from '../data/rounds'
import { cvDocuments } from '../data/cvDocuments'

const stages = ['intro', 'round1', 'lesson1', 'round2', 'lesson2', 'round3', 'lesson3', 'docs']
const cupSlots = ['28%', '50%', '72%']
const randomMap = () => [0, 1, 2].sort(() => Math.random() - 0.5)

export default function StoryController() {
  const [stageIndex, setStageIndex] = useState(0)
  const [mixing, setMixing] = useState(true)
  const [cupMap, setCupMap] = useState([0, 1, 2])
  const [ballCup, setBallCup] = useState(1)
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [money, setMoney] = useState(6)
  const [doc, setDoc] = useState(0)
  const reduce = useReducedMotion()
  const stage = stages[stageIndex]

  useEffect(() => {
    if (!stage.startsWith('round')) return
    setSelected(null)
    setResult(null)
    setMixing(true)
    setCupMap(randomMap())
    setBallCup(Math.floor(Math.random() * 3))
    const t = setTimeout(() => setMixing(false), reduce ? 350 : 1650)
    return () => clearTimeout(t)
  }, [stage, reduce])

  const onChoose = (slot) => {
    if (mixing || result) return
    const correct = cupMap[slot] === ballCup
    setSelected(slot)
    if (stage === 'round1') { setResult(correct ? 'correct' : 'wrong'); setMoney((m) => Math.max(1, m + (correct ? 1 : -1))) }
    if (stage === 'round2') { setResult(correct ? 'paid' : 'pending'); setMoney((m) => Math.max(1, m + (correct ? 2 : -1))) }
  }

  const fraudCatch = (caught) => {
    setResult(caught ? 'caught' : 'missed')
    setMoney((m) => Math.max(1, m + (caught ? 2 : -2)))
  }

  const roundNum = stage.startsWith('round') ? Number(stage.replace('round', '')) : null

  return <div className="min-h-screen text-amber-50 shell-bg">
    <main className="max-w-[1500px] mx-auto p-3 md:p-6">
      <section className="glass-frame rounded-2xl overflow-hidden">
        <div className="grid lg:grid-cols-[220px_1fr_360px] min-h-[80vh]">
          <aside className="panel p-5 hidden lg:block border-r border-amber-200/20">
            <h3 className="text-sm tracking-wide mb-3">STORY PROGRESS</h3>
            <ul className="space-y-1 text-sm text-amber-100/90">{stages.filter(s=>!s.startsWith('lesson')).map((s,i)=><li key={s} className={i===stageIndex-stageIndex%2?'text-amber-300':''}>○ {s.toUpperCase()}</li>)}</ul>
          </aside>

          <div className="relative table-scene">
            <div className="table-backdrop" />
            <div className="godray" />
            <div className="vignette" />
            <div className="table-surface" />
            <Hands />
            <MoneyStack money={money} />
            <TableNote />
            {roundNum && <p className="absolute top-4 left-5 text-xs tracking-widest">ROUND {roundNum} / 3</p>}
            {stage === 'intro' && <Card title="ABOUT THE CANDIDATE" body="Business Analyst / Product BA candidate for iGaming" bullets={['10+ years in complex technical environments', 'Master’s in Cybersecurity', 'B2 English', 'Experience with delivery ownership and abuse-case logic']} action="START THE DEMO" onAction={() => setStageIndex(1)} />}
            {stage.startsWith('round') && <>
              <p className="absolute top-5 left-1/2 -translate-x-1/2 text-sm md:text-base font-semibold tracking-wide">{rounds[roundNum - 1].title}</p>
              {[0, 1, 2].map(slot => {
                const hasBall = cupMap[slot] === ballCup
                return <motion.button key={slot} aria-label={`Cup ${slot + 1}`} className="cup" style={{ left: cupSlots[slot] }} animate={mixing ? { x: [0, (slot - 1) * 80, 0], y: [0, -12, 0] } : { x: 0, y: selected === slot ? -34 : 0 }} transition={{ duration: 1.15, delay: slot * 0.08 }} onClick={() => stage !== 'round3' && onChoose(slot)} disabled={mixing || stage === 'round3'}>
                  <span className="cup-rim" />
                  {selected === slot && hasBall && stage !== 'round3' && <span className="ball" />}
                </motion.button>
              })}
              {mixing && <DealerHand />}
              {!mixing && !result && stage !== 'round3' && <p className="hint">Choose wisely</p>}
              {!mixing && stage === 'round3' && <FraudBall onDone={fraudCatch} />}
              {result && <ResultOverlay stage={stage} result={result} onContinue={() => setStageIndex((s) => s + 1)} text={rounds[roundNum - 1].sarcasm} />}
            </>}
            {stage.startsWith('lesson') && <Card title="LESSON CARD" body={rounds[Number(stage.at(-1)) - 1].recruiter} bullets={rounds[Number(stage.at(-1)) - 1].lesson} action="Continue" onAction={() => setStageIndex((s) => s + 1)} />}
            {stage === 'docs' && <DocsDeck doc={doc} setDoc={setDoc} onReplay={() => { setStageIndex(0); setDoc(0); setMoney(6) }} />}
          </div>

          <aside className="panel p-5 border-l border-amber-200/20">
            <h3 className="text-sm tracking-wide mb-3">VISUAL STYLE & ATMOSPHERE</h3>
            <ul className="space-y-2 text-sm text-amber-100/95"><li>• Tropical</li><li>• Warm</li><li>• Cinematic depth</li><li>• First-person table view</li><li>• Real objects on table</li></ul>
          </aside>
        </div>
      </section>
    </main>
  </div>
}

function MoneyStack({ money }) { return <div className="absolute left-8 bottom-8 flex items-end gap-2 z-20">
  <div className="cash" />
  {Array.from({ length: money }).map((_, i) => <motion.div key={i} layout className="chip" style={{ y: -(i % 3) * 3 }} />)}
</div> }
function Hands() { return <div className="hands"><span className="hand hand-left" /><span className="hand hand-right" /><span className="watch" /></div> }
function TableNote() { return <div className="table-note">WELCOME<br/>Money moves physically. Choose cups under pressure.</div> }
function DealerHand() { return <motion.div initial={{ y: -120, opacity: 0 }} animate={{ y: 0, opacity: 1, x: [0, 75, -45, 0] }} transition={{ duration: 1.5 }} className="dealer" /> }
function Card({ title, body, bullets, action, onAction }) { return <div className="absolute inset-0 grid place-items-center p-4"><div className="panel max-w-xl p-6"><h2 className="text-xl mb-2">{title}</h2><p className="text-amber-100/90 mb-3">{body}</p><ul className="list-disc ml-5 space-y-1 text-sm">{bullets.map(b => <li key={b}>{b}</li>)}</ul><button onClick={onAction} className="mt-5 gold-btn">{action}</button></div></div> }
function ResultOverlay({ text, onContinue, result, stage }) { const map = { correct: 'Correct choice, money increases.', wrong: 'Wrong choice, money decreases.', paid: 'Correct. Product and finance align.', pending: 'No payout. Pending state appears.', caught: 'Caught in time. Flow intercepted.', missed: 'Missed. Dealer takes money.' }; return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-x-0 bottom-0 p-4"><div className="panel p-4 max-w-2xl mx-auto"><p className="font-semibold">{map[result]}</p><p className="text-sm text-amber-100/85 mt-1">{text}</p>{stage === 'round3' && result === 'missed' && <p className="text-xs mt-1">All cups empty. Money moved physically.</p>}<button onClick={onContinue} className="mt-3 gold-btn">Continue</button></div></motion.div> }
function FraudBall({ onDone }) { const [done, setDone] = useState(false); useEffect(() => { const t = setTimeout(() => { if (!done) { setDone(true); onDone(false) } }, 2200); return () => clearTimeout(t) }, [done, onDone]); return <><div className="absolute top-8 right-4 w-36 h-2 rounded bg-red-200/40"><motion.div className="h-full bg-red-500" initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: 2.2 }} /></div><motion.button aria-label="Catch the falling ball" onClick={() => { if (!done) { setDone(true); onDone(true) } }} animate={{ x: -250, y: 210 }} transition={{ duration: 2 }} className="absolute top-20 right-20 w-8 h-8 rounded-full bg-zinc-200 shadow-[0_0_14px_4px_rgba(255,255,255,.4)]" /></> }
function DocsDeck({ doc, setDoc, onReplay }) { const current = cvDocuments[Math.min(doc, cvDocuments.length - 1)]; return <div className="absolute inset-0 grid place-items-center p-4"><div className="panel p-6 w-full max-w-4xl"><h3 className="text-xl mb-3">CV PRESENTATION AS DOCUMENTS — {current.title}</h3><ul className="list-disc ml-6 text-sm space-y-1">{current.items.map(i => <li key={i}>{i}</li>)}</ul><div className="mt-5 flex gap-2"><button onClick={() => setDoc((d) => Math.min(cvDocuments.length - 1, d + 1))} className="gold-btn">Next document</button><button onClick={onReplay} className="border border-amber-100/30 rounded px-3 py-2">Replay</button></div></div></div> }
