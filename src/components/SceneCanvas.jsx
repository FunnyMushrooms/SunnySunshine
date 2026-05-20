import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'

export default function SceneCanvas({ cupsEnabled, onCup, handEnabled, onHand, reveal, camera }) {
  const ref = useRef(null)
  useEffect(() => {
    const app = new PIXI.Application()
    let cups = []
    let hand
    ;(async () => {
      await app.init({ resizeTo: ref.current, backgroundAlpha: 0, antialias: true })
      ref.current.appendChild(app.canvas)
      const w = () => app.renderer.width, h = () => app.renderer.height
      const ocean = new PIXI.Graphics().rect(0,0,w(),h()).fill({color:0x87d9ee})
      const table = new PIXI.Graphics().roundRect(w()*0.08,h()*0.52,w()*0.84,h()*0.4,20).fill({color:0x9a6037})
      const sun = new PIXI.Graphics().circle(w()*0.75,h()*0.16,140).fill({color:0xffd083,alpha:0.3})
      app.stage.addChild(ocean,sun,table)
      const xs=[0.33,0.5,0.67]
      cups=xs.map((x,i)=>{const c=new PIXI.Graphics().roundRect(-40,-55,80,110,25).fill({color:0xe6d9c2}).stroke({color:0x97734f,width:2});c.x=w()*x;c.y=h()*0.58;c.eventMode='static';c.cursor='pointer';c.on('pointertap',()=>cupsEnabled&&onCup(i));app.stage.addChild(c);return c})
      hand=new PIXI.Graphics().roundRect(-50,-16,100,32,15).fill({color:0xbe8c66});hand.x=w()*0.5;hand.y=h()*0.43;hand.eventMode='static';hand.cursor='pointer';hand.on('pointertap',()=>handEnabled&&onHand());app.stage.addChild(hand)
      const ticker=app.ticker.add((t)=>{sun.alpha=0.24+Math.sin(t.lastTime/700)*0.08;hand.x=w()*0.5+Math.sin(t.lastTime/450)*20;cups.forEach((c,idx)=>{c.scale.set(cupsEnabled?1+Math.sin((t.lastTime+idx*180)/250)*0.02:1)})})
    })()
    return ()=>app.destroy(true,{children:true})
  }, [cupsEnabled,handEnabled,onCup,onHand])
  return <div className='absolute inset-0' ref={ref} style={{transform:`translateY(${camera}px)`}} />
}
