import { useState } from 'react'
import { motion } from 'framer-motion'
import { sha256 } from '../utils/crypto'

const HASH = '2834c295eb954847ae5538f997d4970ce4b55fc07d8ad400a73d2a7ea335de0a'

export default function PasswordGate({ onUnlock }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const check = async (e) => {
    e.preventDefault()
    // Frontend password protection is only a demo barrier for static hosting. Do not use this for sensitive or NDA-protected information.
    const hashed = await sha256(value)
    if (hashed === HASH) {
      sessionStorage.setItem('cv_demo_unlocked', '1')
      onUnlock()
    } else setError('Wrong cup. Wrong password. Product risk detected.')
  }

  return <div className='min-h-screen grid place-items-center bg-gradient-to-b from-amber-100 to-orange-200 p-4'>
    <motion.form onSubmit={check} className='w-full max-w-lg rounded-2xl bg-black/35 backdrop-blur-xl p-8 text-amber-50 border border-amber-200/40'>
      <h1 className='text-3xl font-semibold'>Private Product Demo</h1>
      <p className='mt-2 text-amber-100/90'>A small shell game about iGaming product logic, risk, payments, and requirements.</p>
      <input type='password' value={value} onChange={(e)=>setValue(e.target.value)} className='mt-6 w-full rounded-xl bg-white/15 px-4 py-3 outline-none border border-amber-100/40' placeholder='Password' />
      {error && <p className='mt-3 text-red-200'>{error}</p>}
      <p className='mt-3 text-xs text-amber-100/80'>Demo access only.</p>
      <button className='mt-5 rounded-xl bg-amber-300 text-stone-900 font-semibold px-5 py-2'>Enter Table</button>
    </motion.form>
  </div>
}
