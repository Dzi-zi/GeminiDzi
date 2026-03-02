import { useState, useEffect, useRef } from 'react'

// ── Constants ─────────────────────────────────────────────────────────────────
const W = 900, H = 520
const T = 48          // tile size
const PW = 26, PH = 36
const GRAV = 0.55
const JUMP = -13
const SPD = 4.2

// ── Palette ───────────────────────────────────────────────────────────────────
const PAL = {
  physical: { sky0: '#3D1800', sky1: '#7B3A18', plat: '#A07048', platTop: '#C8935A', water: '#1A6BAA88', waterLine: '#2196F3', ground: '#6B4428', accent: '#D4AF37', player: '#D4AF37' },
  spirit:   { sky0: '#010510', sky1: '#0A1830', plat: '#0D3058', platTop: '#1560B8', water: '#00BCD488', waterLine: '#00E5FF', ground: '#081828', accent: '#00E5FF', player: '#7CDEFD' },
}

// ── Abilities ─────────────────────────────────────────────────────────────────
const ABILITIES = [
  { id: 'shift',  name: 'World Shift',  sym: '⟁', desc: 'S — switch worlds',           unlockAt: 1 },
  { id: 'ride',   name: 'Current Ride', sym: '〜', desc: 'Currents push you forward',    unlockAt: 3 },
  { id: 'dash',   name: 'Spirit Dash',  sym: '⟶', desc: 'X — dash through enemies',     unlockAt: 5 },
  { id: 'float',  name: 'Water Float',  sym: '◌', desc: 'Sink slowly in water',          unlockAt: 7 },
  { id: 'djump',  name: 'Spirit Leap',  sym: '⬡', desc: 'Double jump in spirit world',  unlockAt: 9 },
]

// ── Level definitions ─────────────────────────────────────────────────────────
// Tiles: ' '=empty, '#'=both platform, 'P'=physical-only, 'S'=spirit-only
//        'W'=still water, 'C'=current←, 'R'=current→
//        'O'=offering, 'E'=enemy, 'X'=exit portal, '@'=player start
// 11 rows tall, wide for camera scroll. MODULE SCOPE so closures never go stale.

const LEVELS = (function makeLevels() {
  // Row indices 0-10, col 0-N
  // Format: array of strings, each string = one row (left to right)
  return [
    // ── Level 1: The River Shore ──────────────────────────────────────────────
    {
      id: 1, title: 'The River Shore', bleed: 0.0,
      rows: [
        '                                                            ',
        '                                                            ',
        '      O         O                    O                      ',
        '   #####      ####        ####     ####                    X',
        '                                                       #####',
        '         ##                  ##                             ',
        '  @                                        O                ',
        '#######WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW###############  ',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        '############################################################',
        '############################################################',
      ],
    },
    // ── Level 2: Shallow Crossing ─────────────────────────────────────────────
    {
      id: 2, title: 'Shallow Crossing', bleed: 0.1,
      rows: [
        '                                                                  ',
        '                 O                        O                       ',
        '   ####        #####      S S S         #####        O            ',
        '                                                   #####          ',
        '       ####               S   S    ####                       X   ',
        '  @                                                        ########',
        '######RRRRRRRRRRRRRRRRRR###########CCCCCCCCCCCCCC#################  ',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        '##################################################################',
        '##################################################################',
      ],
    },
    // ── Level 3: Between Worlds ───────────────────────────────────────────────
    {
      id: 3, title: 'Between Worlds', bleed: 0.25,
      rows: [
        '                                                                        ',
        '     S S S            O          S S S          O                       ',
        '                    #####                     #####     E               ',
        '   #####    S S                         P P              S S S          ',
        '          O         ####   E                   ####              O      ',
        '  @     #####                  P P P                                 X  ',
        '#######WWWWWWWWWW##############WWWWWWWWWW###############WWWWWWWWW#######',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        '########################################################################',
        '########################################################################',
      ],
    },
    // ── Level 4: The Deep Current ─────────────────────────────────────────────
    {
      id: 4, title: 'The Deep Current', bleed: 0.35,
      rows: [
        '                                                                          ',
        '   O           O              O              O              O             ',
        '######       ######        ######         ######         ######           ',
        '                                                                          ',
        '       ####        ####          ####           ####             ####     ',
        '  @                                                                    X  ',
        '######RRRRRRRR####RRRRRRRR#######CCCCCCC########RRRRRRR##########CCCCCC##',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        '##########################################################################',
        '##########################################################################',
      ],
    },
    // ── Level 5: Spirit Veil ─────────────────────────────────────────────────
    {
      id: 5, title: 'Spirit Veil', bleed: 0.5,
      rows: [
        '                                                                              ',
        '  S S S S          O       S S S        O        S S         O               ',
        '                 ######                        ######                         ',
        '  ######                    ######                       ######     E         ',
        '          E  P P                       P P P                            S S S ',
        ' @                  ####                        ####                       X  ',
        '########WWWWWWWWWWWW####RRRRRRRRRRRRRR####WWWWWWWWWWWWW####RRRRRRRRR#########',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        '#############################################################################',
        '#############################################################################',
      ],
    },
    // ── Level 6: Sunken Temple ───────────────────────────────────────────────
    {
      id: 6, title: 'Sunken Temple', bleed: 0.6,
      rows: [
        '                                                                                ',
        '  S     S       O          S   S         O           S S S         O           ',
        '     S       ########               ########                    ########        ',
        '  #######              E    #####              E   #                    E       ',
        '          P     S S                      S S               P P                 ',
        ' @              ####    ####                   ####                         X   ',
        '#########CCCCCCC####RRRR####CCCCCCCCCCCC########RRRRRRRRRR###CCCCCCC############',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        '##################################################################################',
        '##################################################################################',
      ],
    },
    // ── Level 7: The Vortex ──────────────────────────────────────────────────
    {
      id: 7, title: 'The Vortex', bleed: 0.7,
      rows: [
        '                                                                                    ',
        '  S S S S S       O          S S S S       O        S S S S        O               ',
        '                ########                ########               ########             ',
        '  #########  E                 E    E                  E  E               E         ',
        '          S S    P   P P                 P   P P              S S    P              ',
        ' @                  ######                     ######                          X    ',
        '#########RRRRRRRRRRR######CCCCCCCCCCCCCCC######RRRRRRRRRRRRR######CCCCCCCCCC#########',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        '######################################################################################',
        '######################################################################################',
      ],
    },
    // ── Level 8: Mami's Mirror ───────────────────────────────────────────────
    {
      id: 8, title: "Mami's Mirror", bleed: 0.8,
      rows: [
        '                                                                                       ',
        '  S       S          O         S     S        O          S     S        O              ',
        '     S S          ########       S S        ########        S S       ########         ',
        ' ########   E  E              ########  E              ########   E               E    ',
        '           S    S S    P P              S    S S               S    S S    P P         ',
        ' @                  ######                      ######                          X      ',
        '########CCCCCCCC##########RRRRRRRRR####CCCCCCC########RRRRRRRRRR####CCCCCCCC###########',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        '#########################################################################################',
        '#########################################################################################',
      ],
    },
    // ── Level 9: The Undertow ────────────────────────────────────────────────
    {
      id: 9, title: 'The Undertow', bleed: 0.9,
      rows: [
        '                                                                                         ',
        ' S S S     S S S      O      S S S     S S S      O      S S S     S S S      O         ',
        '                   ########                    ########                    ########      ',
        ' ########  E  E                 E  E  ########               E  E  ########              ',
        '        S S     P P   P P              S S     P P   P P           S S     P P   P P     ',
        ' @                 #######                        #######                          X     ',
        '#######RRRRRRRRRRR########CCCCCCCCCCCC#####RRRRRRR########CCCCCCCCC#####RRRRRRR##########',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        '###########################################################################################',
        '###########################################################################################',
      ],
    },
    // ── Level 10: Heart of the Deep ──────────────────────────────────────────
    {
      id: 10, title: 'Heart of the Deep', bleed: 1.0,
      rows: [
        '                                                                                            ',
        ' S   S   S   S   S      O      S   S   S   S      O      S   S   S   S      O              ',
        '                     ########                   ########                  ########          ',
        ' ########  E  E  E              E  E  ########              E  E  ########                  ',
        '        S S   P P  P  P P                S S  P  P P  P           S S   P P   P  P P        ',
        ' @                  ########                       ########                          X       ',
        '#######RRRRRRRRRRRR########CCCCCCCCCCCCCC####RRRRRR########CCCCCCCCCCCC####RRRRRRR###########',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        '##############################################################################################',
        '##############################################################################################',
      ],
    },
  ]
}())

// ── Parse level into objects ───────────────────────────────────────────────────
function parseLevel(lvl) {
  const platforms = [], water = [], offerings = [], enemies = []
  let startX = T, startY = 5 * T, exitX = 0, exitY = 0

  lvl.rows.forEach((row, gy) => {
    for (let gx = 0; gx < row.length; gx++) {
      const ch = row[gx]
      const x = gx * T, y = gy * T
      if (ch === '#') platforms.push({ x, y, w: T, h: T, world: 'both' })
      else if (ch === 'P') platforms.push({ x, y, w: T, h: T, world: 'physical' })
      else if (ch === 'S') platforms.push({ x, y, w: T, h: T, world: 'spirit' })
      else if (ch === 'W') water.push({ x, y, w: T, h: T, flow: 0 })
      else if (ch === 'C') water.push({ x, y, w: T, h: T, flow: -2.2 })
      else if (ch === 'R') water.push({ x, y, w: T, h: T, flow: 2.2 })
      else if (ch === 'O') offerings.push({ x: x + T / 2, y: y + T / 2, col: gx, row: gy, collected: false })
      else if (ch === 'E') enemies.push({ x, y, startX: x, dir: 1, vy: 0, onGround: false, id: `${gx}_${gy}` })
      else if (ch === '@') { startX = x; startY = y }
      else if (ch === 'X') { exitX = x; exitY = y }
    }
  })
  return { platforms, water, offerings, enemies, startX, startY, exitX, exitY }
}

// ── AABB overlap ──────────────────────────────────────────────────────────────
function overlaps(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

// ── Camera ────────────────────────────────────────────────────────────────────
function getCamera(px, mapWidth) {
  let cx = px - W * 0.35
  cx = Math.max(0, Math.min(cx, mapWidth - W))
  return cx
}

// ── Draw helpers ──────────────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t }
function lerpCol(c1, c2, t) {
  const h = s => [parseInt(s.slice(1,3),16), parseInt(s.slice(3,5),16), parseInt(s.slice(5,7),16)]
  const [r1,g1,b1]=h(c1), [r2,g2,b2]=h(c2)
  return `rgb(${~~lerp(r1,r2,t)},${~~lerp(g1,g2,t)},${~~lerp(b1,b2,t)})`
}

function drawBG(ctx, bleed, isSpirit, frame, camX, mapWidth) {
  const t = isSpirit ? Math.min(1, bleed + 0.5) : bleed
  const sky0 = lerpCol(PAL.physical.sky0, PAL.spirit.sky0, t)
  const sky1 = lerpCol(PAL.physical.sky1, PAL.spirit.sky1, t)
  const sg = ctx.createLinearGradient(0,0,0,H)
  sg.addColorStop(0, sky0); sg.addColorStop(1, sky1)
  ctx.fillStyle = sg; ctx.fillRect(0,0,W,H)

  // Stars
  if (t > 0.3) {
    for (let i=0;i<50;i++){
      const sx=(i*157+30)%mapWidth - camX
      if(sx<0||sx>W) continue
      const sy=8+(i*83)%(H*0.5)
      ctx.globalAlpha=(t-0.3)*0.8*(0.5+Math.sin(frame*0.04+i)*0.3)
      ctx.fillStyle='#C8E8FF'
      ctx.beginPath();ctx.arc(sx,sy,0.9+(i%3)*0.3,0,Math.PI*2);ctx.fill()
    }
    ctx.globalAlpha=1
  }

  // Sun/moon
  const sunX = W*0.8
  if (t<0.8) { ctx.globalAlpha=1-t*0.9; ctx.fillStyle='#FF8C42'; ctx.beginPath();ctx.arc(sunX,50,22,0,Math.PI*2);ctx.fill(); ctx.globalAlpha=1 }
  if (t>0.15) { ctx.globalAlpha=(t-0.15)*1.1; ctx.fillStyle='#E8EAF6'; ctx.beginPath();ctx.arc(W*0.12,45,18,0,Math.PI*2);ctx.fill(); ctx.fillStyle=sky0; ctx.beginPath();ctx.arc(W*0.12+10,40,14,0,Math.PI*2);ctx.fill(); ctx.globalAlpha=1 }

  // Spirit world serpent rings
  if (t>0.45) {
    ctx.globalAlpha=(t-0.45)*0.18
    for(let i=0;i<5;i++){
      const r=80+i*55, cx2=W*0.5, cy2=H*0.38
      ctx.strokeStyle='#00E5FF'; ctx.lineWidth=1+(i%2)*0.5
      ctx.beginPath(); ctx.ellipse(cx2,cy2,r,r*0.4,frame*0.003+i,0,Math.PI*2); ctx.stroke()
    }
    ctx.globalAlpha=1
  }
}

function drawPlatform(ctx, p, isSpirit, bleed) {
  const t = isSpirit ? Math.min(1,bleed+0.4) : bleed
  let col, top
  if (p.world==='physical') {
    if (isSpirit) { ctx.globalAlpha=0.18; ctx.strokeStyle='#D4AF37'; ctx.lineWidth=1.5; ctx.strokeRect(p.x,p.y,p.w,p.h); ctx.globalAlpha=1; return }
    col=PAL.physical.plat; top=PAL.physical.platTop
  } else if (p.world==='spirit') {
    if (!isSpirit) { ctx.globalAlpha=0.18; ctx.strokeStyle='#00E5FF'; ctx.lineWidth=1.5; ctx.strokeRect(p.x,p.y,p.w,p.h); ctx.globalAlpha=1; return }
    col=PAL.spirit.plat; top=PAL.spirit.platTop
  } else {
    col=lerpCol(PAL.physical.plat,PAL.spirit.plat,t)
    top=lerpCol(PAL.physical.platTop,PAL.spirit.platTop,t)
  }
  ctx.fillStyle=col; ctx.fillRect(p.x,p.y,p.w,p.h)
  ctx.fillStyle=top; ctx.fillRect(p.x,p.y,p.w,5)
  if (p.world==='spirit'&&isSpirit) {
    ctx.strokeStyle='#00E5FF30'; ctx.lineWidth=1.5; ctx.strokeRect(p.x+1,p.y+1,p.w-2,p.h-2)
  }
}

function drawWater(ctx, w, frame, isSpirit, bleed) {
  const t = isSpirit ? Math.min(1,bleed+0.4) : bleed
  const col = lerpCol(PAL.physical.water, PAL.spirit.water, t)
  ctx.fillStyle = col; ctx.fillRect(w.x,w.y,w.w,w.h)
  if (w.flow!==0) {
    const wCol = lerpCol(PAL.physical.waterLine, PAL.spirit.waterLine, t)
    const off = ((frame * w.flow * 0.25) % (w.w*2) + w.w*2) % (w.w*2)
    ctx.fillStyle = wCol+'44'
    for(let i=-1;i<3;i++){
      const wx = w.x + ((off + i*w.w*0.8) % (w.w*3)) - w.w
      ctx.beginPath(); ctx.ellipse(wx, w.y+w.h*0.55, w.w*0.3, w.h*0.22, 0,0,Math.PI*2); ctx.fill()
    }
    ctx.fillStyle=wCol+'88'; ctx.font='bold 13px monospace'
    ctx.textAlign='center'; ctx.textBaseline='middle'
    ctx.fillText(w.flow<0?'←':'→', w.x+w.w/2, w.y+w.h/2)
    ctx.textAlign='left'; ctx.textBaseline='alphabetic'
  }
}

function drawOffering(ctx, o, frame) {
  if (o.collected) return
  const glow = 0.55+Math.sin(frame*0.1)*0.35
  ctx.save()
  ctx.shadowColor='#D4AF37'; ctx.shadowBlur=14
  ctx.globalAlpha=glow
  ctx.fillStyle='#D4AF37'
  ctx.beginPath(); ctx.arc(o.x,o.y,8,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='#FFF8E1'
  ctx.beginPath(); ctx.arc(o.x-2,o.y-2,3,0,Math.PI*2); ctx.fill()
  ctx.restore()
}

function drawEnemy(ctx, e, frame, isSpirit) {
  if (!isSpirit) {
    ctx.globalAlpha=0.25; ctx.strokeStyle='#FF006680'; ctx.lineWidth=1.5
    ctx.beginPath(); ctx.arc(e.x+T/2,e.y+T/2,14,0,Math.PI*2); ctx.stroke()
    ctx.globalAlpha=1; return
  }
  const bob = Math.sin(frame*0.1+e.x*0.01)*4
  ctx.save()
  ctx.shadowColor='#FF006660'; ctx.shadowBlur=18
  ctx.fillStyle='#3A0050'
  ctx.beginPath(); ctx.arc(e.x+T/2,e.y+T/2+bob,15,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='#CC0066'
  ctx.beginPath(); ctx.arc(e.x+T/2,e.y+T/2+bob,9,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='#FFEB3B'
  ;[[-4,-3],[4,-3]].forEach(([ox,oy])=>{
    ctx.beginPath(); ctx.arc(e.x+T/2+ox,e.y+T/2+oy+bob,2.5,0,Math.PI*2); ctx.fill()
  })
  ctx.restore()
}

function drawExit(ctx, x, y, frame) {
  const pulse = 0.6+Math.sin(frame*0.09)*0.35
  ctx.save()
  ctx.shadowColor='#00E5FF'; ctx.shadowBlur=24
  ctx.globalAlpha=pulse
  ctx.fillStyle='#00E5FF'
  for(let r=20;r>4;r-=6){
    ctx.globalAlpha=pulse*(r/20)*0.5
    ctx.beginPath(); ctx.arc(x+T/2,y+T/2,r,0,Math.PI*2); ctx.fill()
  }
  ctx.globalAlpha=pulse
  ctx.fillStyle='#FFFFFF'
  ctx.beginPath(); ctx.arc(x+T/2,y+T/2,6,0,Math.PI*2); ctx.fill()
  ctx.restore()
  ctx.font='bold 10px "Courier New"'; ctx.fillStyle='rgba(255,255,255,0.7)'
  ctx.textAlign='center'; ctx.textBaseline='top'
  ctx.fillText('EXIT', x+T/2, y+T+2)
  ctx.textAlign='left'; ctx.textBaseline='alphabetic'
}

function drawPlayer(ctx, px, py, frame, isSpirit, inWater, dashing) {
  const col = isSpirit ? PAL.spirit.player : PAL.physical.player
  const legWave = Math.sin(frame*0.28)*5
  ctx.save()
  if (dashing) { ctx.globalAlpha=0.7; ctx.shadowColor='#00E5FF'; ctx.shadowBlur=22 }

  // Glow aura in spirit world
  if (isSpirit) {
    ctx.globalAlpha=0.22
    ctx.fillStyle=col
    ctx.beginPath(); ctx.ellipse(px+PW/2,py+PH/2+8,PW*0.7,PH*0.55,0,0,Math.PI*2); ctx.fill()
    ctx.globalAlpha=dashing?0.7:1
  }

  // Body
  ctx.fillStyle=col
  ctx.beginPath(); ctx.ellipse(px+PW/2,py+PH*0.55,PW*0.42,PH*0.36,0,0,Math.PI*2); ctx.fill()

  // Head
  ctx.beginPath(); ctx.arc(px+PW/2,py+PH*0.2,PW*0.38,0,Math.PI*2); ctx.fill()

  // Eyes
  ctx.fillStyle = isSpirit?'#00E5FF':'#1A0A00'
  ;[[-PW*0.15,0],[PW*0.15,0]].forEach(([ox])=>{
    ctx.beginPath(); ctx.arc(px+PW/2+ox,py+PH*0.18,2.2,0,Math.PI*2); ctx.fill()
  })

  // Legs or tail
  if (!inWater) {
    ctx.strokeStyle=col; ctx.lineWidth=4; ctx.lineCap='round'
    ctx.beginPath(); ctx.moveTo(px+PW*0.32,py+PH*0.78); ctx.lineTo(px+PW*0.32-legWave,py+PH+3); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(px+PW*0.68,py+PH*0.78); ctx.lineTo(px+PW*0.68+legWave,py+PH+3); ctx.stroke()
  } else {
    const tw=Math.sin(frame*0.18)*9
    ctx.strokeStyle=col+'CC'; ctx.lineWidth=5; ctx.lineCap='round'
    ctx.beginPath(); ctx.moveTo(px+PW/2,py+PH*0.72)
    ctx.quadraticCurveTo(px+PW/2+tw,py+PH+10,px+PW/2-tw*0.4,py+PH+18); ctx.stroke()
  }

  // Spirit ring
  if (isSpirit) {
    ctx.globalAlpha=0.45; ctx.strokeStyle='#00E5FF'; ctx.lineWidth=1.5
    ctx.beginPath(); ctx.arc(px+PW/2,py+PH*0.2,PW*0.52,0,Math.PI*2); ctx.stroke()
  }

  ctx.restore()
}

// ── Game Component ────────────────────────────────────────────────────────────
function Game({ onBack }) {
  const canvasRef = useRef(null)
  const keys = useRef({})
  const prevKeys = useRef({})
  const G = useRef(null)
  // phase controlled via running flag in closure + React state
  const [phase, setPhase] = useState('play')
  const [hudInfo, setHudInfo] = useState({ lvl:1, title:'', offerings:0, total:0, isSpirit:false, abilities:[], bleed:0 })
  const [clearInfo, setClearInfo] = useState({ offerings:0, total:0, nextAbility:null })
  const [loopKey, setLoopKey] = useState({ lvl: 0, retry: 0 })


  function buildState(lvlIdx) {
    const lvl = LEVELS[lvlIdx]
    const parsed = parseLevel(lvl)
    return {
      lvlIdx,
      px: parsed.startX, py: parsed.startY,
      pvx: 0, pvy: 0,
      onGround: false, inWater: false,
      isSpirit: false,
      dashing: false, dashTimer: 0, dashCooldown: 0,
      shiftCooldown: 0,
      jumpsLeft: 1,
      ...parsed,
      mapWidth: lvl.rows[0].length * T,
      bleed: lvl.bleed,
      abilities: ABILITIES.filter(a => a.unlockAt <= lvl.id),
      frame: 0,
      collectedOfferings: 0,
      totalOfferings: parsed.offerings.length,
    }
  }

  useEffect(() => {
    G.current = buildState(loopKey.lvl)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let rafId

    const onDown = e => {
      keys.current[e.code] = true
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyS','KeyA','KeyD','KeyX'].includes(e.code)) e.preventDefault()
    }
    const onUp = e => { keys.current[e.code] = false }
    window.addEventListener('keydown', onDown, { passive: false })
    window.addEventListener('keyup', onUp)

    function jp(code) { return keys.current[code] && !prevKeys.current[code] }

    function die(p, info) {
      running = false
      cancelAnimationFrame(rafId)
      if (p === 'levelclear') setClearInfo(info || {})
      setPhase(p)
    }
    let running = true
    function loop() {
      if (!running) return
      const g = G.current; if (!g) { rafId = requestAnimationFrame(loop); return }
      g.frame++
      const fr = g.frame

      // ── World shift ──
      if (jp('KeyS') || jp('ShiftLeft')) {
        if (g.shiftCooldown <= 0) {
          g.isSpirit = !g.isSpirit
          g.shiftCooldown = 20
        }
      }
      if (g.shiftCooldown > 0) g.shiftCooldown--
      if (g.dashCooldown > 0) g.dashCooldown--
      if (g.dashTimer > 0) { g.dashTimer--; if (g.dashTimer<=0) g.dashing=false }

      // ── Dash ──
      const hasDash = g.abilities.find(a=>a.id==='dash')
      if (jp('KeyX') && hasDash && g.dashCooldown<=0) {
        const dir = (keys.current['ArrowLeft']||keys.current['KeyA']) ? -1 : 1
        g.pvx = dir * 13; g.dashing = true; g.dashTimer = 9; g.dashCooldown = 45
      }

      // ── Horizontal movement ──
      const left = keys.current['ArrowLeft']||keys.current['KeyA']
      const right = keys.current['ArrowRight']||keys.current['KeyD']
      if (!g.dashing) {
        if (left)  g.pvx = Math.max(g.pvx-1.4, -SPD)
        else if (right) g.pvx = Math.min(g.pvx+1.4, SPD)
        else g.pvx *= 0.78
      }

      // ── Water ──
      const waterTile = g.water.find(w => overlaps(g.px,g.py,PW,PH,w.x,w.y,w.w,w.h))
      g.inWater = !!waterTile
      if (g.inWater && waterTile.flow !== 0) {
        const canRide = g.abilities.find(a=>a.id==='ride')
        g.pvx += waterTile.flow * (canRide ? 0.45 : 0.15)
      }

      // ── Gravity ──
      const grav = g.inWater ? (g.abilities.find(a=>a.id==='float') ? GRAV*0.06 : GRAV*0.28) : GRAV
      g.pvy += grav
      if (g.inWater) g.pvy = Math.min(g.pvy, 2.2)

      // ── Jump ──
      const hasDjump = g.isSpirit && g.abilities.find(a=>a.id==='djump')
      const maxJumps = hasDjump ? 2 : 1
      if (jp('Space')||jp('ArrowUp')) {
        if (g.onGround || g.inWater || (hasDjump && g.jumpsLeft > 0)) {
          g.pvy = g.inWater ? -10 : JUMP * (g.isSpirit ? 1.08 : 1)
          g.jumpsLeft = Math.max(0, g.jumpsLeft - 1)
          g.onGround = false
        }
      }
      if (g.onGround) g.jumpsLeft = maxJumps

      // ── Move player horizontally ──
      g.px += g.pvx
      g.px = Math.max(0, g.px)

      // ── Active platforms ──
      const activePlats = g.platforms.filter(p =>
        p.world==='both' || (p.world==='physical'&&!g.isSpirit) || (p.world==='spirit'&&g.isSpirit)
      )

      // X collision
      for (const p of activePlats) {
        if (!overlaps(g.px,g.py+4,PW,PH-8,p.x,p.y,p.w,p.h)) continue
        const prevX = g.px - g.pvx
        if (prevX + PW <= p.x) { g.px = p.x - PW; g.pvx = 0 }
        else if (prevX >= p.x + p.w) { g.px = p.x + p.w; g.pvx = 0 }
      }

      // ── Move player vertically ──
      g.py += g.pvy
      g.onGround = false

      // Y collision
      for (const p of activePlats) {
        if (!overlaps(g.px+3,g.py,PW-6,PH,p.x,p.y,p.w,p.h)) continue
        const prevY = g.py - g.pvy
        if (prevY + PH <= p.y + 4) {
          g.py = p.y - PH; g.pvy = 0; g.onGround = true
        } else if (prevY >= p.y + p.h - 4) {
          g.py = p.y + p.h; g.pvy = Math.abs(g.pvy)*0.2
        }
      }

      // ── Fall off bottom → die ──
      if (g.py > H + 100) {
        die('gameover')
        return
      }

      // ── Enemy patrol ──
      g.enemies.forEach(e => {
        e.x += e.dir * 1.5
        const onPlat = activePlats.find(p => p.y===e.y+T && e.x+T>p.x && e.x<p.x+p.w)
        if (!onPlat || e.x < 0 || e.x > g.mapWidth - T) e.dir *= -1
        // Collision with player (only in spirit world)
        if (g.isSpirit && !g.dashing && overlaps(g.px,g.py,PW,PH,e.x+8,e.y+8,T-16,T-16)) {
          die('gameover')
          return
        }
      })

      // ── Collect offerings ──
      g.offerings.forEach(o => {
        if (!o.collected && Math.abs((g.px+PW/2)-o.x)<16 && Math.abs((g.py+PH/2)-o.y)<16) {
          o.collected=true; g.collectedOfferings++
        }
      })

      // ── Check exit ──
      if (overlaps(g.px,g.py,PW,PH, g.exitX,g.exitY,T,T)) {
        const nextAbility = ABILITIES.find(a => a.unlockAt === g.lvlIdx + 2) || null
        if (g.lvlIdx >= LEVELS.length - 1) {
          die('win')
        return
        } else {
          die('levelclear', {
            offerings: g.collectedOfferings,
            total: g.totalOfferings,
            nextAbility,
          })
        return
        }
        return
      }

      // ── HUD update ──
      if (fr % 8 === 0) {
        setHudInfo({
          lvl: g.lvlIdx+1, title: LEVELS[g.lvlIdx].title,
          offerings: g.collectedOfferings, total: g.totalOfferings,
          isSpirit: g.isSpirit, abilities: g.abilities, bleed: g.bleed,
        })
      }

      // ═══ DRAW ═══
      ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'
      ctx.clearRect(0,0,W,H)

      const camX = getCamera(g.px, g.mapWidth)
      ctx.save(); ctx.translate(-camX, 0)

      drawBG(ctx, g.bleed, g.isSpirit, fr, camX, g.mapWidth)

      // Water
      g.water.forEach(w => drawWater(ctx,w,fr,g.isSpirit,g.bleed))

      // Platforms
      g.platforms.forEach(p => drawPlatform(ctx,p,g.isSpirit,g.bleed))

      // Offerings
      g.offerings.forEach(o => drawOffering(ctx,o,fr))

      // Enemies
      g.enemies.forEach(e => drawEnemy(ctx,e,fr,g.isSpirit))

      // Exit
      drawExit(ctx, g.exitX, g.exitY, fr)

      // Player
      drawPlayer(ctx,g.px,g.py,fr,g.isSpirit,g.inWater,g.dashing)

      ctx.restore()

      // Shift cooldown bar
      if (g.shiftCooldown>0) {
        ctx.fillStyle='rgba(0,229,255,0.35)'
        ctx.fillRect(0,H-3,W*(1-g.shiftCooldown/20),3)
      }

      // Mini-map strip
      const miniW=W*0.3, miniH=6, mx=(W-miniW)/2, my=8
      ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.fillRect(mx,my,miniW,miniH)
      const progX = mx + (g.px/g.mapWidth)*miniW
      ctx.fillStyle=g.isSpirit?'#00E5FF':'#D4AF37'
      ctx.fillRect(progX-2,my,4,miniH)

      prevKeys.current = {...keys.current}
      rafId = requestAnimationFrame(loop)
    }

      if (running) rafId = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  // eslint-disable-next-line
  }, [loopKey])

  // goNextLevel / retryLevel work by incrementing an inner key → remounts useEffect

  function goNextLevel() {
    const next = (G.current?.lvlIdx ?? 0) + 1
    setLoopKey({ lvl: next, retry: 0 })
    setPhase('play')
  }

  function retryLevel() {
    setLoopKey(k => ({ lvl: k.lvl, retry: k.retry + 1 }))
    setPhase('play')
  }

  const pal = hudInfo.isSpirit ? PAL.spirit : PAL.physical

  return (
    <div style={{ minHeight:'100vh', background: hudInfo.isSpirit?PAL.spirit.bg:PAL.physical.bg, paddingTop:'80px', display:'flex', flexDirection:'column', alignItems:'center', transition:'background 1s ease' }}>
      {/* HUD */}
      <div style={{ width:W, maxWidth:'100vw', padding:'0.4rem 0.9rem', background:'rgba(0,0,0,0.58)', display:'flex', justifyContent:'space-between', alignItems:'center', boxSizing:'border-box', borderBottom:`2px solid ${pal.accent}28`, flexWrap:'wrap', gap:'0.3rem' }}>
        <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
          <span style={{ fontFamily:'"Courier New",monospace', fontSize:'0.65rem', fontWeight:700, color:pal.accent }}>
            {hudInfo.isSpirit?'✦ SPIRIT':'◎ PHYSICAL'}
          </span>
          <span style={{ fontFamily:'"Courier New",monospace', fontSize:'0.6rem', color:'rgba(255,255,255,0.35)' }}>
            {hudInfo.lvl}/10 — {hudInfo.title}
          </span>
          <span style={{ fontFamily:'"Courier New",monospace', fontSize:'0.62rem', color:'#D4AF37' }}>
            ◈ {hudInfo.offerings}/{hudInfo.total}
          </span>
        </div>
        <div style={{ display:'flex', gap:'0.35rem', alignItems:'center' }}>
          {hudInfo.abilities.map(a=>(
            <span key={a.id} style={{ padding:'0.12rem 0.45rem', background:pal.accent+'16', border:`1px solid ${pal.accent}35`, borderRadius:'4px', fontFamily:'"Courier New",monospace', fontSize:'0.55rem', color:pal.accent }} title={a.desc}>{a.sym}</span>
          ))}
          <button onClick={onBack} style={{ padding:'0.18rem 0.55rem', background:'rgba(255,255,255,0.05)', border:'2px solid rgba(255,255,255,0.1)', borderRadius:'4px', color:'rgba(255,255,255,0.3)', fontFamily:'"Courier New",monospace', fontSize:'0.58rem', cursor:'pointer' }}>quit</button>
        </div>
      </div>

      {/* Canvas + overlays */}
      <div style={{ position:'relative' }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ display:'block', maxWidth:'100vw' }}/>

        {phase === 'levelclear' && (
          <div style={{ position:'absolute', inset:0, background:'rgba(0,8,30,0.84)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.9rem', animation:'fadeUp 0.3s ease' }}>
            <div style={{ fontSize:'2.5rem', filter:'drop-shadow(0 0 20px #00E5FF)' }}>🌊</div>
            <h2 style={{ fontFamily:'Georgia,serif', fontSize:'2rem', color:'#00E5FF', margin:0 }}>Level Complete</h2>
            <p style={{ fontFamily:'"Courier New",monospace', color:'rgba(200,240,255,0.5)', margin:0, fontSize:'0.78rem' }}>
              Offerings: {clearInfo.offerings}/{clearInfo.total}
            </p>
            {clearInfo.nextAbility && (
              <div style={{ padding:'0.7rem 1.2rem', background:'rgba(0,229,255,0.08)', border:'2px solid rgba(0,229,255,0.3)', borderRadius:'12px', textAlign:'center' }}>
                <div style={{ fontFamily:'"Courier New",monospace', fontSize:'0.58rem', color:'#00E5FF', marginBottom:'0.2rem', letterSpacing:'0.1em' }}>NEW ABILITY UNLOCKED</div>
                <div style={{ fontFamily:'Georgia,serif', fontSize:'0.95rem', color:'#E8F6FF', fontWeight:700 }}>{clearInfo.nextAbility.sym} {clearInfo.nextAbility.name}</div>
                <div style={{ fontFamily:'Georgia,serif', fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', fontStyle:'italic' }}>{clearInfo.nextAbility.desc}</div>
              </div>
            )}
            <button onClick={goNextLevel} style={{ padding:'0.65rem 1.8rem', background:'#00838F', border:'2px solid #00E5FF', borderRadius:'10px', fontFamily:'Georgia,serif', fontWeight:700, color:'#001820', cursor:'pointer', fontSize:'0.9rem' }}>
              Next Level →
            </button>
          </div>
        )}

        {phase === 'gameover' && (
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.82)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.8rem' }}>
            <div style={{ fontSize:'2.2rem' }}>💀</div>
            <h2 style={{ fontFamily:'Georgia,serif', fontSize:'1.8rem', color:'#FF4081', margin:0 }}>The deep claimed you</h2>
            <div style={{ display:'flex', gap:'0.7rem', marginTop:'0.3rem' }}>
              <button onClick={retryLevel} style={{ padding:'0.6rem 1.3rem', background:'#00838F', border:'2px solid #00E5FF', borderRadius:'8px', fontFamily:'Georgia,serif', fontWeight:700, color:'#001820', cursor:'pointer' }}>Try Again</button>
              <button onClick={onBack} style={{ padding:'0.6rem 1.1rem', background:'transparent', border:'2px solid rgba(255,255,255,0.2)', borderRadius:'8px', fontFamily:'Georgia,serif', color:'#F0EDE8', cursor:'pointer' }}>Menu</button>
            </div>
          </div>
        )}

        {phase === 'win' && (
          <div style={{ position:'absolute', inset:0, background:'rgba(0,5,20,0.94)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem', padding:'2rem', textAlign:'center' }}>
            <div style={{ fontSize:'3rem', filter:'drop-shadow(0 0 24px #00E5FF)' }}>🌊</div>
            <h2 style={{ fontFamily:'Georgia,serif', fontSize:'2.2rem', color:'#00E5FF', margin:0 }}>Mami Wata is pleased</h2>
            <p style={{ fontFamily:'Georgia,serif', fontStyle:'italic', color:'rgba(200,240,255,0.55)', maxWidth:420, lineHeight:1.8, margin:0 }}>
              You have crossed all ten depths, gathered the sacred offerings, and walked between both worlds. The water remembers your name.
            </p>
            <button onClick={onBack} style={{ padding:'0.75rem 2.2rem', background:'linear-gradient(135deg,#00838F,#00BCD4)', border:'none', borderRadius:'10px', fontFamily:'Georgia,serif', fontWeight:700, color:'#001020', cursor:'pointer', fontSize:'0.95rem' }}>
              Return to Shore
            </button>
          </div>
        )}
      </div>

      {/* On-screen controls */}
      <div style={{ display:'flex', gap:'0.6rem', padding:'0.55rem', justifyContent:'center', flexWrap:'wrap' }}>
        {[['ArrowLeft','← Left'],['Space','↑ Jump'],['ArrowRight','Right →']].map(([code,label])=>(
          <button key={code}
            onPointerDown={()=>{keys.current[code]=true}}
            onPointerUp={()=>{keys.current[code]=false}}
            onPointerLeave={()=>{keys.current[code]=false}}
            style={{ padding:'0.6rem 1.1rem', background:'#1A2A1A', border:'2px solid rgba(255,255,255,0.14)', borderRadius:'9px', color:'#F0EDE8', fontFamily:'Georgia,serif', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', userSelect:'none', touchAction:'none' }}>{label}</button>
        ))}
        <button
          onPointerDown={()=>{keys.current['KeyS']=true}}
          onPointerUp={()=>{keys.current['KeyS']=false}}
          onPointerLeave={()=>{keys.current['KeyS']=false}}
          style={{ padding:'0.6rem 1.1rem', background:'#250040', border:'2px solid #A78BFA80', borderRadius:'9px', color:'#C4B5FD', fontFamily:'Georgia,serif', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', userSelect:'none', touchAction:'none' }}>⟁ Shift</button>
        <button
          onPointerDown={()=>{keys.current['KeyX']=true}}
          onPointerUp={()=>{keys.current['KeyX']=false}}
          onPointerLeave={()=>{keys.current['KeyX']=false}}
          style={{ padding:'0.6rem 1.1rem', background:'#00181E', border:'2px solid #00E5FF50', borderRadius:'9px', color:'#7CDEFD', fontFamily:'Georgia,serif', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', userSelect:'none', touchAction:'none' }}>⟶ Dash</button>
      </div>
      <p style={{ fontFamily:'"Courier New",monospace', fontSize:'0.57rem', color:'rgba(255,255,255,0.18)', margin:'0 0 1rem' }}>
        ←→/WASD move · Space jump · S shift worlds · X dash (unlocks lvl 5) · gold dots = offerings · reach EXIT portal
      </p>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;} }
      `}</style>
    </div>
  )
}

// ── Menu ──────────────────────────────────────────────────────────────────────
function Menu({ onStart }) {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#010510 0%,#031E38 55%,#043850 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem', paddingTop:'100px', position:'relative', overflow:'hidden' }}>
      {[0,1,2,3].map(i=>(
        <div key={i} style={{ position:'absolute', width:250+i*160, height:250+i*160, borderRadius:'50%', border:`1px solid rgba(0,229,255,${0.09-i*0.018})`, animation:`ripple 5s ease-in-out ${i*0.9}s infinite`, left:'50%', top:'38%', transform:'translate(-50%,-50%)', pointerEvents:'none' }}/>
      ))}
      <div style={{ maxWidth:520, textAlign:'center', position:'relative', zIndex:1 }}>
        <div style={{ fontSize:'3.5rem', marginBottom:'0.5rem', filter:'drop-shadow(0 0 28px #00E5FF)' }}>🌊</div>
        <div style={{ fontFamily:'"Courier New",monospace', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.22em', color:'#00E5FF', marginBottom:'0.5rem' }}>PUZZLE PLATFORMER</div>
        <h1 style={{ fontFamily:'Georgia,"Times New Roman",serif', fontSize:'clamp(2.5rem,8vw,4.5rem)', fontWeight:700, color:'#E8F4FF', margin:'0 0 0.3rem', letterSpacing:'-0.02em', lineHeight:1.05, textShadow:'0 0 40px rgba(0,229,255,0.28)' }}>Mami Wata</h1>
        <p style={{ fontFamily:'Georgia,serif', fontSize:'0.88rem', color:'rgba(200,235,255,0.42)', fontStyle:'italic', margin:'0 0 1.8rem', lineHeight:1.65 }}>Navigate between worlds. Collect the offerings.<br/>Appease the water spirit.</p>
        <div style={{ display:'flex', gap:'0.5rem', justifyContent:'center', marginBottom:'1.8rem', flexWrap:'wrap' }}>
          {[['10 Levels','🌊'],['2 Worlds','⟁'],['5 Abilities','✦'],['Currents & Enemies','〜']].map(([l,e])=>(
            <div key={l} style={{ padding:'0.32rem 0.75rem', background:'rgba(0,229,255,0.06)', border:'1px solid rgba(0,229,255,0.18)', borderRadius:'20px', fontFamily:'"Courier New",monospace', fontSize:'0.58rem', color:'rgba(200,235,255,0.48)' }}>{e} {l}</div>
          ))}
        </div>
        <button onClick={onStart} style={{ padding:'0.85rem 2.5rem', background:'linear-gradient(135deg,#006575,#00BCD4)', border:'2px solid #00E5FF', borderRadius:'10px', color:'#001820', fontFamily:'Georgia,serif', fontSize:'1rem', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 22px rgba(0,229,255,0.22)', transition:'all 0.2s' }}
          onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
          onMouseLeave={e=>e.currentTarget.style.transform=''}>
          Dive In →
        </button>
      </div>
      <style>{`
        @keyframes ripple { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.7;} 50%{transform:translate(-50%,-50%) scale(1.04);opacity:0.35;} }
      `}</style>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function MamiWata() {
  const [screen, setScreen] = useState('menu')
  const [key, setKey] = useState(0)
  if (screen==='game') return <Game key={key} onBack={()=>setScreen('menu')}/>
  return <Menu onStart={()=>{ setKey(k=>k+1); setScreen('game') }}/>
}