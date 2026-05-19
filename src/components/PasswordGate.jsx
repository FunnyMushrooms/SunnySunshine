import { useState } from 'react'
import { Lock } from 'lucide-react'
import { sha256 } from '../utils/crypto'

const HASH = '2834c295eb954847ae5538f997d4970ce4b55fc07d8ad400a73d2a7ea335de0a'

export default function PasswordGate({ onUnlock }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    // Frontend password protection is only a demo barrier for static hosting. Do not use this for sensitive or NDA-protected information.
    const hashed = await sha256(value)
    if (hashed === HASH) {
      sessionStorage.setItem('cv_demo_unlocked', '1')
      onUnlock()
      return
    }
    setError('Wrong cup. Wrong password. Product risk detected.')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#fef3c7_0,#dbeafe_35%,#dcfce7_70%,#f8fafc_100%)] flex items-center justify-center p-6">
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.8)_50%,transparent_100%)] animate-pulse" />
      <form onSubmit={submit} className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-2xl p-8">
        <div className="flex items-center gap-3 text-slate-800 mb-3"><Lock /> <h1 className="text-2xl font-semibold">Private Product Demo</h1></div>
        <p className="text-sm text-slate-600 mb-6">A small shell game about iGaming product logic, risk, payments, and requirements.</p>
        <label htmlFor="password" className="text-sm font-medium text-slate-700">Access password</label>
        <input id="password" type="password" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" value={value} onChange={(e)=>setValue(e.target.value)} />
        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        <button className="mt-5 w-full rounded-xl bg-slate-900 text-white py-3">Enter table</button>
        <p className="mt-4 text-xs text-slate-500">Demo access only.</p>
      </form>
    </div>
  )
}
