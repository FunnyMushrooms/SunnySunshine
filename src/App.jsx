import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core'

const HASH = '2834c295eb954847ae5538f997d4970ce4b55fc07d8ad400a73d2a7ea335de0a'
const PASS_KEY = 'demo_unlock'

const SCENES = [
  {
    key: 'lifecycle',
    insight: 'Returning players are shaped by timing, previous experience, offer relevance, and friction.',
    prompt: 'Choose a cup to test player lifecycle intuition.',
  },
  {
    key: 'provider',
    insight: 'Provider quality affects discovery, trust, and session depth.',
    prompt: 'Choose a cup to test provider influence.',
  },
  {
    key: 'kyc',
    insight: 'Verification is trust-layer logic; timing and friction directly affect conversion.',
    prompt: 'Choose a cup to test KYC judgment.',
  },
  {
    key: 'fraud',
    insight: 'Fraud hides in transitions and trusted flows, not only visible surfaces.',
    prompt: 'Click a cup or click Dealer Hand.',
    allowHand: true,
  },
  {
    key: 'bonus',
    insight: 'Bonus mechanics must balance confidence, excitement, cost, and abuse risk.',
    prompt: 'Pick a cup, then decide Keep or Switch.',
    hasSwitch: true,
  },
  {
    key: 'cashier',
    insight: 'Payment states matter: pending, approved, declined, reversed, refunded, manual review.',
    prompt: 'Choose a cup to test cashier clarity.',
  },
  {
    key: 'risk',
    insight: 'Good product logic leaves evidence: actions, ownership, states, and audit trail.',
    prompt: 'Choose a cup for risk & compliance judgment.',
  },
  {
    key: 'final',
    insight: 'The game is over. The product questions are not.',
    prompt: 'One last hand. Choose a cup.',
  },
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
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const cupsRef = useRef([])
  const ballRef = useRef(null)
  const handRef = useRef(null)

  const currentScene = useMemo(() => SCENES[sceneIndex], [sceneIndex])
  const finished = sceneIndex >= SCENES.length

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
        // handled by fallback below
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
      scene.clearColor = new Color3(0.94, 0.85, 0.67).toColor4(1)
      sceneRef.current = scene

      const camera = new ArcRotateCamera('camera', 0, 1.1, 6.2, new Vector3(0, 0.8, 0), scene)
      camera.attachControl(canvasRef.current, true)
      camera.lowerRadiusLimit = 5.4
      camera.upperRadiusLimit = 6.8
      camera.lowerBetaLimit = 0.8
      camera.upperBetaLimit = 1.3

      new HemisphericLight('warmLight', new Vector3(0, 1, 0), scene)

      const table = MeshBuilder.CreateBox('table', { width: 7, depth: 3.2, height: 0.28 }, scene)
      table.position.y = 0.2
      const wood = new StandardMaterial('wood', scene)
      wood.diffuseColor = new Color3(0.49, 0.29, 0.14)
      table.material = wood

      cupsRef.current = [-1.3, 0, 1.3].map((x, i) => {
        const cup = MeshBuilder.CreateCylinder(`cup-${i}`, {
          diameterTop: 0.58,
          diameterBottom: 0.76,
          height: 0.95,
          tessellation: 36,
        }, scene)
        cup.position = new Vector3(x, 0.82, -0.1)
        cup.metadata = { cupIndex: i }
        const cupMat = new StandardMaterial(`cup-mat-${i}`, scene)
        cupMat.diffuseColor = new Color3(0.86, 0.74, 0.55)
        cup.material = cupMat
        return cup
      })

      const ball = MeshBuilder.CreateSphere('ball', { diameter: 0.16 }, scene)
      ball.position = new Vector3(0, 0.38, -0.08)
      const ballMat = new StandardMaterial('ball-mat', scene)
      ballMat.diffuseColor = new Color3(0.92, 0.92, 0.92)
      ball.material = ballMat
      ballRef.current = ball

      const hand = MeshBuilder.CreateBox('dealer-hand', { width: 0.65, height: 0.18, depth: 0.38 }, scene)
      hand.position = new Vector3(2.35, 0.95, -0.25)
      const handMat = new StandardMaterial('hand-mat', scene)
      handMat.diffuseColor = new Color3(0.45, 0.29, 0.18)
      hand.material = handMat
      hand.metadata = { isDealerHand: true }
      handRef.current = hand

      scene.onPointerObservable.add(() => {
        if (stepState !== 'await-choice' || finished) return
        const pick = scene.pick(scene.pointerX, scene.pointerY)
        if (!pick?.hit || !pick.pickedMesh) return
        const mesh = pick.pickedMesh
        if (currentScene?.allowHand && mesh.metadata?.isDealerHand) {
          setLastResult('Dealer: “Checking my hands? Good. You watched the system, not the decoration.”')
          setStepState('resolved')
          return
        }
        if (mesh.metadata?.cupIndex !== undefined) {
          const chosen = mesh.metadata.cupIndex
          const win = (sceneIndex + 1) % 3 === chosen
          const msg = win
            ? 'Dealer: “Still sharp. I like that.”'
            : 'Dealer: “You watched the cups. I watched your attention.”'
          setLastResult(msg)
          if (currentScene?.hasSwitch) {
            setStepState('await-switch')
          } else {
            setStepState('resolved')
          }
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
    boot().then((cleanupFn) => {
      cleanupResize = cleanupFn
    })

    return () => {
      mounted = false
      cleanupResize?.()
      sceneRef.current?.dispose()
      engine?.dispose()
    }
  }, [unlocked, currentScene, finished, sceneIndex, stepState])

  const onUnlock = async (event) => {
    event.preventDefault()
    // Frontend password protection is only a demo barrier for static hosting. Do not use this for sensitive or NDA-protected information.
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
  }

  const handleSwitch = (choice) => {
    const message = choice === 'keep'
      ? 'Dealer: “Discipline. Rare quality.”'
      : 'Dealer: “Ambition. Expensive habit.”'
    setLastResult(message)
    setStepState('resolved')
  }

  if (!unlocked) {
    return (
      <div className='h-full grid place-items-center bg-gradient-to-b from-amber-100 via-amber-200 to-emerald-800/80 px-4'>
        <form onSubmit={onUnlock} className='w-full max-w-md rounded-2xl border border-white/40 bg-white/20 p-8 text-amber-50 backdrop-blur-xl'>
          <h1 className='text-3xl font-semibold'>Private Product Demo</h1>
          <p className='mt-2 text-sm'>A small shell game about iGaming product logic, risk, payments, and requirements.</p>
          <input
            type='password'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className='mt-6 w-full rounded-lg border border-amber-50/40 bg-white p-3 text-black'
            placeholder='Password'
          />
          <button className='mt-4 w-full rounded-lg bg-amber-400 p-3 font-medium text-black'>Enter</button>
          <p className='mt-3 text-xs text-amber-100'>Demo access only.</p>
          {error && <p className='mt-3 text-sm text-red-100'>{error}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className='relative h-full'>
      <canvas ref={canvasRef} className='absolute inset-0 h-full w-full' />

      <div className='absolute left-3 top-3 rounded bg-black/30 px-2 py-1 text-xs'>{rendererStatus}</div>

      {!finished && currentScene && (
        <motion.div
          key={currentScene.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='absolute right-4 top-20 max-w-sm rounded-xl bg-black/35 p-4'
        >
          <p className='text-sm text-amber-300'>{currentScene.key.toUpperCase()}</p>
          <p className='text-sm text-amber-50'>{currentScene.insight}</p>
          <p className='mt-2 text-xs text-amber-100/80'>{currentScene.prompt}</p>
        </motion.div>
      )}

      <div className='absolute bottom-6 left-1/2 w-[min(90vw,960px)] -translate-x-1/2 rounded-xl bg-black/45 p-4'>
        <p className='text-xs text-amber-200'>Dealer</p>
        <p className='text-amber-50'>
          {finished
            ? 'Take a look. Tell me if this man fits the job.'
            : lastResult || 'You’re just in time. Choose carefully.'}
        </p>
      </div>

      <div className='absolute right-4 top-4 flex gap-2'>
        {!finished && stepState === 'resolved' && (
          <button onClick={goNext} className='rounded bg-amber-400 px-4 py-2 text-black'>Continue</button>
        )}
      </div>

      {!finished && stepState === 'await-switch' && (
        <div className='absolute left-1/2 top-20 flex -translate-x-1/2 gap-2 rounded-xl bg-black/45 p-3'>
          <button onClick={() => handleSwitch('keep')} className='rounded bg-emerald-300 px-4 py-2 text-black'>Keep</button>
          <button onClick={() => handleSwitch('switch')} className='rounded bg-amber-300 px-4 py-2 text-black'>Switch</button>
        </div>
      )}

      {finished && (
        <div className='absolute inset-0 grid place-items-center p-4'>
          <div className='w-[min(92vw,760px)] rounded-xl bg-amber-50 p-6 text-black'>
            <h2 className='text-2xl font-bold'>CONFIDENTIAL · PRODUCT BA PROFILE</h2>
            <p className='mt-3'>Business Analyst / Product BA — iGaming / high-risk digital products</p>
            <p className='mt-2 text-sm'>10+ years, MSc Cybersecurity, systems thinking, KYC/compliance, fraud/abuse logic, bonus and payments domains.</p>
            <div className='mt-5 flex flex-wrap gap-2'>
              <a href='mailto:volk.na.oxote@gmail.com' className='rounded bg-emerald-500 px-4 py-2 font-medium text-white'>Send Email</a>
              <button onClick={() => { setSceneIndex(0); setStepState('await-choice'); setLastResult('') }} className='rounded bg-amber-400 px-4 py-2 font-medium text-black'>Replay Story</button>
              <button className='rounded bg-zinc-800 px-4 py-2 font-medium text-white'>Download CV placeholder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
