import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PointLight,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core'

const HASH = '2834c295eb954847ae5538f997d4970ce4b55fc07d8ad400a73d2a7ea335de0a'
const PASS_KEY = 'demo_unlock'
const CUP_X = [-1.7, 0, 1.7]

const SCENES = [
  { key: 'lifecycle', insight: 'Returning players are shaped by timing, previous experience, offer relevance, and friction.', prompt: 'Choose a cup to test player lifecycle intuition.' },
  { key: 'provider', insight: 'Provider quality affects discovery, trust, and session depth.', prompt: 'Choose a cup to test provider influence.' },
  { key: 'kyc', insight: 'Verification is trust-layer logic; timing and friction directly affect conversion.', prompt: 'Choose a cup to test KYC judgment.' },
  { key: 'fraud', insight: 'Fraud hides in transitions and trusted flows, not only visible surfaces.', prompt: 'Click a cup or click Dealer Hand.', allowHand: true },
  { key: 'bonus', insight: 'Bonus mechanics must balance confidence, excitement, cost, and abuse risk.', prompt: 'Pick a cup, then decide Keep or Switch.', hasSwitch: true },
  { key: 'cashier', insight: 'Payment states matter: pending, approved, declined, reversed, refunded, manual review.', prompt: 'Choose a cup to test cashier clarity.' },
  { key: 'risk', insight: 'Good product logic leaves evidence: actions, ownership, states, and audit trail.', prompt: 'Choose a cup for risk & compliance judgment.' },
  { key: 'final', insight: 'The game is over. The product questions are not.', prompt: 'One last hand. Choose a cup.' },
]

async function sha256(value) {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function App() {
  const [unlocked, setUnlocked] = useState(sessionStorage.getItem(PASS_KEY) === '1')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [rendererStatus, setRendererStatus] = useState('Initializing renderer...')
  const [sceneIndex, setSceneIndex] = useState(0)
  const [lastResult, setLastResult] = useState('')
  const [stepState, setStepState] = useState('await-choice')
  const [playerBank, setPlayerBank] = useState(500)
  const [dealerBank, setDealerBank] = useState(500)
  const [transferLabel, setTransferLabel] = useState('')

  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const cupsRef = useRef([])
  const ballRef = useRef(null)
  const handRef = useRef(null)
  const stateRef = useRef({ sceneIndex: 0, stepState: 'await-choice', finished: false, currentScene: SCENES[0] })
  const shuffleRef = useRef({ active: true, start: 0 })

  const currentScene = useMemo(() => SCENES[sceneIndex], [sceneIndex])
  const finished = sceneIndex >= SCENES.length

  useEffect(() => {
    stateRef.current = { sceneIndex, stepState, finished, currentScene }
    if (!finished) {
      shuffleRef.current = { active: true, start: performance.now() }
    }
  }, [sceneIndex, stepState, finished, currentScene])

  useEffect(() => {
    if (!unlocked || !canvasRef.current) return undefined
    let mounted = true
    let engine

    const boot = async () => {
      try {
        if (Engine.IsSupported && navigator.gpu) {
          const webGpuEngine = new Engine(canvasRef.current, true, { adaptToDeviceRatio: true }, true)
          await webGpuEngine.initAsync()
          engine = webGpuEngine
          setRendererStatus('WebGPU mode')
        }
      } catch {
        // Fallback to WebGL engine when WebGPU init fails.
      }

      if (!engine) {
        if (!Engine.IsSupported) {
          setRendererStatus('Your browser cannot run this private table. Try a modern desktop browser.')
          return
        }
        engine = new Engine(canvasRef.current, true)
        setRendererStatus('WebGL fallback mode')
      }

      const scene = new Scene(engine)
      scene.clearColor = new Color3(0.02, 0.03, 0.05).toColor4(1)
      sceneRef.current = scene

      const camera = new ArcRotateCamera('camera', 0, 1.2, 8.5, new Vector3(0, 0.9, 0), scene)
      camera.inputs.clear()
      camera.lowerRadiusLimit = 8.5
      camera.upperRadiusLimit = 8.5

      new HemisphericLight('warmLight', new Vector3(0, 1, 0), scene).intensity = 0.55
      const topLight = new PointLight('topLight', new Vector3(0, 3.2, -1), scene)
      topLight.intensity = 1.35

      const table = MeshBuilder.CreateBox('table', { width: 12.2, depth: 5.4, height: 0.34 }, scene)
      table.position.y = 0.2
      const wood = new StandardMaterial('wood', scene)
      wood.diffuseColor = new Color3(0.36, 0.19, 0.08)
      table.material = wood

      const felt = MeshBuilder.CreateBox('felt', { width: 11.4, depth: 4.8, height: 0.04 }, scene)
      felt.position = new Vector3(0, 0.39, 0)
      const feltMat = new StandardMaterial('felt-mat', scene)
      feltMat.diffuseColor = new Color3(0.05, 0.31, 0.2)
      felt.material = feltMat

      cupsRef.current = CUP_X.map((x, i) => {
        const cup = MeshBuilder.CreateCylinder(`cup-${i}`, { diameterTop: 0.58, diameterBottom: 0.76, height: 0.95, tessellation: 36 }, scene)
        cup.position = new Vector3(x, 0.9, -0.18)
        cup.metadata = { cupIndex: i }
        const cupMat = new StandardMaterial(`cup-mat-${i}`, scene)
        cupMat.diffuseColor = new Color3(0.74, 0.52, 0.31)
        cup.material = cupMat
        return cup
      })

      const ball = MeshBuilder.CreateSphere('ball', { diameter: 0.18 }, scene)
      ball.position = new Vector3(0, 0.44, -0.18)
      const ballMat = new StandardMaterial('ball-mat', scene)
      ballMat.diffuseColor = new Color3(0.9, 0.9, 0.88)
      ball.material = ballMat
      ballRef.current = ball

      const hand = MeshBuilder.CreateBox('dealer-hand', { width: 0.65, height: 0.18, depth: 0.38 }, scene)
      hand.position = new Vector3(2.65, 1.05, -0.25)
      const handMat = new StandardMaterial('hand-mat', scene)
      handMat.diffuseColor = new Color3(0.46, 0.29, 0.18)
      hand.material = handMat
      hand.metadata = { isDealerHand: true }
      handRef.current = hand

      for (let i = 0; i < 8; i += 1) {
        const chip = MeshBuilder.CreateCylinder(`chip-${i}`, { diameter: 0.23, height: 0.06, tessellation: 24 }, scene)
        chip.position = new Vector3(-4.3 + i * 0.18, 0.45 + (i % 3) * 0.05, 1.25)
      }

      scene.onPointerObservable.add(() => {
        const state = stateRef.current
        if (state.stepState !== 'await-choice' || state.finished) return
        const pick = scene.pick(scene.pointerX, scene.pointerY)
        if (!pick?.hit || !pick.pickedMesh) return
        const mesh = pick.pickedMesh
        if (state.currentScene?.allowHand && mesh.metadata?.isDealerHand) {
          setLastResult('Dealer: “Checking my hands? Good. You watched the system, not the decoration.”')
          setStepState('resolved')
          return
        }
        if (mesh.metadata?.cupIndex !== undefined) {
          const chosen = mesh.metadata.cupIndex
          const win = (state.sceneIndex + 1) % 3 === chosen
          setPlayerBank((prev) => prev + (win ? 50 : -50))
          setDealerBank((prev) => prev + (win ? -50 : 50))
          setTransferLabel(win ? '+$50 to Player' : '+$50 to Dealer')
          const msg = win ? 'Dealer: “Still sharp. I like that.”' : 'Dealer: “You watched the cups. I watched your attention.”'
          setLastResult(msg)
          shuffleRef.current = { active: false, start: performance.now() }
          if (state.currentScene?.hasSwitch) setStepState('await-switch')
          else setStepState('resolved')
        }
      })

      scene.registerBeforeRender(() => {
        const now = performance.now()
        const shuffle = shuffleRef.current
        if (!shuffle.active || stateRef.current.stepState !== 'await-choice') return
        const t = (now - shuffle.start) * 0.0025
        cupsRef.current.forEach((cup, i) => {
          cup.position.x = CUP_X[i] + Math.sin(t + i * 2) * 0.6
          cup.rotation.y = Math.sin(t * 1.7 + i) * 0.2
          cup.position.y = 0.9 + Math.sin(t * 2 + i) * 0.08
        })
        if (ballRef.current) {
          ballRef.current.isVisible = Math.sin(t * 4) > 0
          ballRef.current.position.x = Math.sin(t * 2.6) * 1.2
        }
      })

      engine.runRenderLoop(() => {
        if (mounted) scene.render()
      })

      const onResize = () => engine?.resize()
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }

    let cleanupResize
    boot().then((cleanupFn) => { cleanupResize = cleanupFn })

    return () => {
      mounted = false
      cleanupResize?.()
      sceneRef.current?.dispose()
      engine?.dispose()
    }
  }, [unlocked])

  const onUnlock = async (event) => {
    event.preventDefault()
    const digest = await sha256(password)
    if (digest === HASH) {
      sessionStorage.setItem(PASS_KEY, '1')
      setUnlocked(true)
      setError('')
      return
    }
    setError('Wrong cup. Wrong password. Product risk detected.')
  }

  const goNext = () => {
    setSceneIndex((v) => v + 1)
    setStepState('await-choice')
    setLastResult('')
    setTransferLabel('')
  }

  const handleSwitch = (choice) => {
    const keep = choice === 'keep'
    setPlayerBank((prev) => prev + (keep ? 20 : -20))
    setDealerBank((prev) => prev + (keep ? -20 : 20))
    setTransferLabel(keep ? '+$20 to Player' : '+$20 to Dealer')
    setLastResult(keep ? 'Dealer: “Discipline. Rare quality.”' : 'Dealer: “Ambition. Expensive habit.”')
    setStepState('resolved')
  }

  if (!unlocked) {
    return <div className='h-full grid place-items-center bg-gradient-to-b from-slate-900 via-slate-800 to-emerald-950 px-4'><form onSubmit={onUnlock} className='w-full max-w-md rounded-2xl border border-white/40 bg-white/10 p-8 text-amber-50 backdrop-blur-xl'><h1 className='text-3xl font-semibold'>Private Product Demo</h1><p className='mt-2 text-sm'>A shell game about iGaming logic, risk, payments, and requirements.</p><input type='password' value={password} onChange={(event) => setPassword(event.target.value)} className='mt-6 w-full rounded-lg border border-amber-50/40 bg-white p-3 text-black' placeholder='Password' /><button className='mt-4 w-full rounded-lg bg-amber-400 p-3 font-medium text-black'>Enter</button>{error && <p className='mt-3 text-sm text-red-100'>{error}</p>}</form></div>
  }

  return (
    <div className='relative h-full bg-slate-950'>
      <canvas ref={canvasRef} className='absolute inset-0 h-full w-full' />
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(255,154,56,0.22),transparent_35%),radial-gradient(circle_at_15%_10%,rgba(32,92,76,0.32),transparent_35%),linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.45))]' />
      <div className='absolute left-3 top-3 rounded border border-amber-400/30 bg-black/55 px-2 py-1 text-xs text-amber-100'>{rendererStatus}</div>
      <div className='absolute left-4 top-10 w-[min(92vw,1000px)] rounded-xl border border-amber-500/30 bg-black/45 p-4 backdrop-blur-sm'>
        <h1 className='text-3xl font-semibold tracking-wide text-amber-200'>GUESS THE CUP. READ THE PRODUCT.</h1>
        <p className='mt-1 text-sm text-amber-100/90'>First-person, tropical noir table test with subtle stats and money flow.</p>
      </div>

      {!finished && currentScene && (
        <motion.div key={currentScene.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='absolute bottom-28 left-1/2 w-[min(92vw,1000px)] -translate-x-1/2 rounded-xl border border-amber-400/30 bg-black/65 p-4 backdrop-blur'>
          <p className='text-sm font-semibold tracking-[0.2em] text-amber-300'>{currentScene.key.replace(/-/g, ' ').toUpperCase()}</p>
          <p className='text-sm text-amber-50'>{currentScene.insight}</p>
          <p className='mt-2 text-xs text-amber-100/90'>{currentScene.prompt}</p>
        </motion.div>
      )}

      <div className='absolute right-4 top-4 rounded-lg border border-emerald-300/40 bg-black/70 px-3 py-2 text-xs text-emerald-100'>Player ${playerBank} · Dealer ${dealerBank}</div>

      <div className='absolute bottom-4 left-1/2 w-[min(92vw,1000px)] -translate-x-1/2 rounded-xl border border-amber-400/30 bg-black/70 p-4'>
        <p className='text-xs uppercase tracking-[0.2em] text-amber-300'>Dealer subtitles</p>
        <p className='text-amber-50'>{finished ? 'Take a look. Tell me if this man fits the job.' : lastResult || 'You’re just in time. Choose carefully.'}</p>
        {transferLabel && <p className='mt-1 text-xs text-emerald-300'>Money transfer: {transferLabel}</p>}
      </div>

      <div className='absolute right-4 top-16 flex gap-2'>
        {!finished && stepState === 'resolved' && <button onClick={goNext} className='rounded bg-amber-400 px-4 py-2 text-black'>Continue</button>}
      </div>

      {!finished && stepState === 'await-switch' && <div className='absolute left-1/2 top-8 flex -translate-x-1/2 gap-2 rounded-xl bg-black/65 p-3'><button onClick={() => handleSwitch('keep')} className='rounded bg-emerald-300 px-4 py-2 text-black'>Keep</button><button onClick={() => handleSwitch('switch')} className='rounded bg-amber-300 px-4 py-2 text-black'>Switch</button></div>}

      {finished && <div className='absolute inset-0 grid place-items-center p-4'><div className='w-[min(92vw,760px)] rounded-xl border border-amber-300/40 bg-amber-50/95 p-6 text-black'><h2 className='text-2xl font-bold'>CONFIDENTIAL · PRODUCT BA PROFILE</h2><p className='mt-3'>Business Analyst / Product BA — iGaming / high-risk digital products</p><p className='mt-2 text-sm'>10+ years, MSc Cybersecurity, systems thinking, KYC/compliance, fraud/abuse logic, bonus and payments domains.</p><div className='mt-5 flex flex-wrap gap-2'><a href='mailto:volk.na.oxote@gmail.com' className='rounded bg-emerald-500 px-4 py-2 font-medium text-white'>Send Email</a><button onClick={() => { setSceneIndex(0); setStepState('await-choice'); setLastResult(''); setPlayerBank(500); setDealerBank(500); setTransferLabel('') }} className='rounded bg-amber-400 px-4 py-2 font-medium text-black'>Replay Story</button><button className='rounded bg-zinc-800 px-4 py-2 font-medium text-white'>Download CV placeholder</button></div></div></div>}
    </div>
  )
}
