import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import PasswordGate from './components/PasswordGate'
import SceneCanvas from './components/SceneCanvas'
import SubtitleBar from './components/SubtitleBar'
import InsightCard from './components/InsightCard'
import CVFolder from './components/CVFolder'
import { cvPages } from './data/cvPages'
import { scenes, storyOrder } from './data/storyScenes'

export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('cv_demo_unlocked') === '1')
  const [idx, setIdx] = useState(0)
  const [lineIdx, setLineIdx] = useState(0)
  const [result, setResult] = useState('')
  const [bonusMode, setBonusMode] = useState(false)
  const [cvPage, setCvPage] = useState(0)
  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />
  const id = storyOrder[idx]
  const scene = scenes[id]
  const line = scene.lines[lineIdx] ?? scene.lines.at(-1)
  const gameplay = ['lifecycle','provider','kyc','fraud','bonus','payments','risk','finalHand'].includes(id)

  const chooseCup = (slot) => {
    if (id === 'fraud') return setResult('You watched the cups. I watched your attention.')
    if (id === 'bonus' && !bonusMode) { setBonusMode(true); return setResult('Keep your choice or switch. Discipline vs ambition.') }
    const ok = Math.random() > 0.5
    setResult(ok ? 'Still sharp. I like that.' : 'Ambition sends invoices.')
  }

  const next = () => {
    if (lineIdx < scene.lines.length - 1) return setLineIdx(lineIdx + 1)
    setLineIdx(0); setResult(''); setBonusMode(false)
    if (id === 'cvReveal') return
    setIdx((n) => Math.min(storyOrder.length - 1, n + 1))
  }

  return <div className='min-h-screen tropical text-amber-50 p-2 md:p-6'>
    <div className='relative mx-auto max-w-6xl h-[86vh] rounded-3xl overflow-hidden border border-amber-100/30 shadow-2xl'>
      <SceneCanvas camera={id === 'arrival' ? -120 : 0} cupsEnabled={gameplay} onCup={chooseCup} handEnabled={id==='fraud'} onHand={()=>setResult('Good. You were watching the system, not the decoration.')} />
      <div className='absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-amber-100/10 pointer-events-none' />
      <InsightCard insight={useMemo(()=> result ? {title: scene.insight.title, text: result.includes('system') ? 'Fraud often happens outside obvious paths: behavior, timing, anomalies.' : scene.insight.text} : scene.insight,[scene,result])} />
      <SubtitleBar line={line} />
      {id === 'bonus' && bonusMode && <div className='absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2'><button className='btn' onClick={()=>setResult('Discipline. Rare quality.')}>Keep</button><button className='btn' onClick={()=>setResult('Ambition. Expensive habit.')}>Switch</button></div>}
      {id === 'cvReveal' ? <CVFolder page={cvPage} setPage={setCvPage} pages={cvPages} onReplay={()=>{setIdx(0);setLineIdx(0);setCvPage(0)}}/> : <motion.button whileHover={{scale:1.04}} className='btn absolute top-4 left-4' onClick={next}>{lineIdx < scene.lines.length - 1 ? 'Continue Dialogue' : gameplay && !result ? 'Choose a Cup' : 'Continue'}</motion.button>}
    </div>
  </div>
}
