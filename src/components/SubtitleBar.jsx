import { motion } from 'framer-motion'
export default function SubtitleBar({ line }) { if(!line) return null; return <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className='absolute bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-3xl rounded-xl bg-black/45 backdrop-blur p-3 text-amber-50'><span className='text-amber-300 mr-2'>{line.speaker}:</span>{line.text}</motion.div> }
