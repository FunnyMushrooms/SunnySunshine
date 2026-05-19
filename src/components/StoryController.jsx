import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { rounds } from '../data/rounds'
import { cvDocuments } from '../data/cvDocuments'

const stages = ['intro', 'round1', 'lesson1', 'round2', 'lesson2', 'round3', 'lesson3', 'docs']
const cupSlots = ['20%', '50%', '80%']

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
    setSelected(null); setResult(null); setMixing(true)
    const nextMap = randomMap(); setCupMap(nextMap); setBallCup(Math.floor(Math.random() * 3))
    const t = setTimeout(() => setMixing(false), reduce ? 400 : 1800)
    return () => clearTimeout(t)
  }, [stage, reduce])

  const onChoose = (slot) => {
    if (mixing || result) return
    const cupIndex = cupMap[slot]
    const correct = stage === 'round3' ? false : cupIndex === ballCup
    setSelected(slot)
    if (stage === 'round1') { setResult(correct ? 'correct' : 'wrong'); setMoney((m) => Math.max(1, m + (correct ? 1 : -1))) }
    if (stage === 'round2') { setResult(correct ? 'paid' : 'pending'); setMoney((m) => Math.max(1, m + (correct ? 2 : -1))) }
  }

  const fraudCatch = (caught) => {
    setResult(caught ? 'caught' : 'missed')
    setMoney((m) => Math.max(1, m + (caught ? 2 : -2)))
  }

  const roundNum = stage.startsWith('round') ? Number(stage.replace('round', '')) : null

  return <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(circle_at_15%_10%,#fef9c3,#dbeafe_35%,#dcfce7_70%,#f8fafc)]">
    <div className="absolute inset-0 backdrop-blur-[1px]" />
    <main className="relative z-10 p-4 md:p-8 max-w-6xl mx-auto">
      <div className="h-[70vh] rounded-3xl p-4 md:p-8 [perspective:1200px] bg-white/25 border border-white/50 shadow-2xl">
        <div className="relative h-full rounded-[2rem] bg-gradient-to-b from-emerald-100/70 to-amber-200/40 overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-[62%] rounded-t-[30%] bg-gradient-to-b from-amber-700 to-amber-900 [transform:rotateX(18deg)] origin-bottom shadow-inner" />
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({length: money}).map((_,i)=><motion.div key={i} layout className="absolute bottom-16 left-[10%] w-8 h-4 rounded bg-green-200 border border-green-500 shadow" style={{x:i*6,y:-(i%3)*4, rotate:(i%2?4:-3)}} />)}
          </div>
          {roundNum && <p className="absolute top-4 left-4 text-sm font-semibold text-slate-700">Round {roundNum} / 3</p>}
          {stage==='intro' && <Card title="Business Analyst / Product BA candidate for iGaming" body="I connect product goals, user behavior, technical delivery, and risk logic." bullets={['10+ years in complex technical environments','Master’s degree in Cybersecurity','B2 English','NDA-safe communication style']} action="Begin Round 1" onAction={()=>setStageIndex(1)} />}
          {stage.startsWith('round') && <>
            <motion.div className="absolute top-12 left-1/2 -translate-x-1/2 text-slate-800 font-semibold">{rounds[roundNum-1].title}</motion.div>
            {[0,1,2].map(slot=>{
              const cupIndex=cupMap[slot]; const hasBall = cupIndex===ballCup
              return <motion.button aria-label={`Cup ${slot+1}`} key={slot} className="absolute top-[42%] -translate-x-1/2 w-20 h-24 md:w-24 md:h-28 rounded-b-[40%] rounded-t-[45%] bg-gradient-to-b from-slate-100 to-slate-400 border border-slate-300 shadow-2xl" style={{left:cupSlots[slot]}} animate={mixing?{x:[0,(slot-1)*90,0],y:[0,-14,0]}:{x:0,y:selected===slot?-40:0}} transition={{duration:1.2,delay:slot*0.1}} onClick={()=>stage!=='round3'&&onChoose(slot)} disabled={mixing||stage==='round3'}>
                <span className="absolute top-1 left-1/2 -translate-x-1/2 w-14 h-2 rounded-full bg-white/70" />
                {selected===slot && hasBall && stage!=='round3' && <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-blue-400 shadow-[0_0_16px_4px_rgba(59,130,246,.55)]"/>}
              </motion.button>
            })}
            {mixing && <DealerHand />}
            {!mixing && !result && stage!=='round3' && <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm">Choose a cup.</p>}
            {!mixing && stage==='round3' && <FraudBall onDone={fraudCatch} />}
            {result && <ResultOverlay stage={stage} result={result} onContinue={()=>setStageIndex((s)=>s+1)} text={rounds[roundNum-1].sarcasm} />}
          </>}
          {stage.startsWith('lesson') && <Card title={`${rounds[Number(stage.at(-1))-1].title} — Lesson`} body={rounds[Number(stage.at(-1))-1].recruiter} bullets={rounds[Number(stage.at(-1))-1].lesson} action="Continue" onAction={()=>setStageIndex((s)=>s+1)} />}
          {stage==='docs' && <DocsDeck doc={doc} setDoc={setDoc} onReplay={()=>{setStageIndex(0);setDoc(0);setMoney(6)}} />}
        </div>
      </div>
    </main>
  </div>
}

function DealerHand(){return <motion.div initial={{y:-130,opacity:0}} animate={{y:0,opacity:1,x:[0,70,-50,0]}} exit={{opacity:0}} transition={{duration:1.5}} className="absolute top-20 left-1/2 -translate-x-1/2 w-56 h-20 rounded-full bg-gradient-to-r from-rose-200 to-amber-100 border border-rose-300/50 shadow-lg"/>}
function Card({title, body, bullets, action, onAction}){return <div className="absolute inset-0 grid place-items-center p-4"><div className="max-w-2xl rounded-2xl border border-white/60 bg-white/70 backdrop-blur p-5 md:p-7"><h2 className="text-xl font-semibold mb-2">{title}</h2><p className="mb-3 text-slate-700">{body}</p><ul className="list-disc ml-5 text-sm space-y-1">{bullets.map(b=><li key={b}>{b}</li>)}</ul><button onClick={onAction} className="mt-5 px-4 py-2 rounded-lg bg-slate-900 text-white">{action}</button></div></div>}
function ResultOverlay({text,onContinue,result,stage}){const map={correct:'Correct. Optimism met mathematics for once.',wrong:'Optimism clicked faster than mathematics. Acquisition approves.',paid:'Correct. Product, finance, and expectation shook hands.',pending:'No payout. Welcome to pending state and support tickets.',caught:'Caught in time. Suspicious flow intercepted.',missed:'The ball vanished into abuse logic. Cups are empty.'}; return <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-x-0 bottom-0 p-4"><div className="mx-auto max-w-2xl rounded-xl bg-slate-900/85 text-white p-4"><p className="font-semibold">{map[result]}</p><p className="text-sm text-slate-200 mt-1">{text}</p>{stage==='round3'&&result==='missed'&&<p className="text-xs mt-1">All cups checked. All empty. Money removed.</p>}<button onClick={onContinue} className="mt-3 rounded bg-white text-slate-900 px-3 py-1.5">Continue</button></div></motion.div>}
function FraudBall({onDone}){const [done,setDone]=useState(false); useEffect(()=>{const t=setTimeout(()=>{if(!done){setDone(true);onDone(false)}},2200); return()=>clearTimeout(t)},[done,onDone]); return <><div className="absolute top-16 right-4 w-32 h-2 rounded bg-red-200"><motion.div className="h-full bg-red-500" initial={{width:'100%'}} animate={{width:'0%'}} transition={{duration:2.2}}/></div><motion.button aria-label="Catch the falling ball" onClick={()=>{if(!done){setDone(true);onDone(true)}}} initial={{x:0,y:0}} animate={{x:-280,y:230}} transition={{duration:2}} className="absolute top-32 right-20 w-8 h-8 rounded-full bg-blue-400 shadow-[0_0_18px_6px_rgba(59,130,246,.6)]"/><p className="absolute top-10 right-4 text-xs text-red-700 font-semibold">Risk alert: catch the ball now.</p></>}
function DocsDeck({doc,setDoc,onReplay}){const current=cvDocuments[Math.min(doc,cvDocuments.length-1)]; return <div className="absolute inset-0 grid place-items-center p-4"><div className="relative w-full max-w-2xl h-[26rem]"><div className="absolute inset-0 rounded-3xl bg-amber-900/35"/><AnimatePresence mode="wait"><motion.div key={doc} initial={{x:80,rotate:2,opacity:0}} animate={{x:0,rotate:-1,opacity:1}} exit={{x:-120,opacity:0}} className="absolute inset-6 rounded-2xl bg-white p-6 shadow-xl"><h3 className="text-xl font-semibold">Product BA Profile Unlocked — {current.title}</h3><ul className="mt-4 list-disc ml-6 text-sm space-y-1">{current.items.map(i=><li key={i}>{i}</li>)}</ul>{current.title==='Contact'&&<div className="mt-5 flex gap-3"><button className="rounded-lg bg-slate-900 text-white px-3 py-2">Contact</button><button className="rounded-lg border px-3 py-2">Download CV (placeholder)</button></div>}</motion.div></AnimatePresence><div className="absolute bottom-2 right-2 flex gap-2"><button onClick={()=>setDoc((d)=>Math.min(cvDocuments.length-1,d+1))} className="rounded bg-slate-900 text-white px-3 py-2">Next document</button><button onClick={onReplay} className="rounded border bg-white/80 px-3 py-2">Replay story</button></div></div></div>}
