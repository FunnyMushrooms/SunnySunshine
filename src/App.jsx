import { useState } from 'react'
import PasswordGate from './components/PasswordGate'
import StoryController from './components/StoryController'

export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('cv_demo_unlocked') === '1')
  return unlocked ? <StoryController /> : <PasswordGate onUnlock={() => setUnlocked(true)} />
}
