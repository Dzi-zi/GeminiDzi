import { useState, useEffect, useRef, useCallback } from 'react'

// ── Constants ─────────────────────────────────────────────────────────────────
const W = 900, H = 500
const GRAVITY = 0.55
const JUMP_FORCE = -13
const MOVE_SPEED = 4.5
const DASH_SPEED = 11
const DASH_DURATION = 12
const DASH_COOLDOWN = 40

// ── World definitions ─────────────────────────────────────────────────────────
const WORLDS = [
  {
    id: 'lagos',
    name: 'Lagos',
    subtitle: 'the neon city',
    sky: ['#0A0520', '#1A0A3A', '#2D1B5E'],
    ground: '#1A0A3A',
    platform: '#C2185B',
    platformEdge: '#FF4081',
    accent: '#FF9800',
    enemyColor: '#FF5722',
    bossColor: '#B71C1C',
    particles: '#FF9800',
    bgElements: 'lagos',
    collectibleColor: '#FFD700',
    music: 220,
  },
  {
    id: 'accra',
    name: 'Accra',
    subtitle: 'kente streets',
    sky: ['#1A0A00', '#3D1A00', '#6B2D00'],
    ground: '#3D1A00',
    platform: '#D4AF37',
    platformEdge: '#FFD54F',
    accent: '#FF6B35',
    enemyColor: '#8D6E63',
    bossColor: '#4E342E',
    particles: '#FF6B35',
    bgElements: 'accra',
    collectibleColor: '#4ECDC4',
    music: 196,
  },
  {
    id: 'cairo',
    name: 'Cairo',
    subtitle: 'desert pyramids',
    sky: ['#0D0A00', '#2D2000', '#5C4000'],
    ground: '#3D2E00',
    platform: '#C8A850',
    platformEdge: '#FFE082',
    accent: '#FF8F00',
    enemyColor: '#A1887F',
    bossColor: '#4E342E',
    particles: '#FFE082',
    bgElements: 'cairo',
    collectibleColor: '#E8758A',
    music: 174,
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    subtitle: 'neon rain',
    sky: ['#060C14', '#0A1A2E', '#0D2840'],
    ground: '#0A1A2E',
    platform: '#00BCD4',
    platformEdge: '#80DEEA',
    accent: '#FF4081',
    enemyColor: '#7986CB',
    bossColor: '#283593',
    particles: '#00BCD4',
    bgElements: 'tokyo',
    collectibleColor: '#FF4081',
    music: 246,
  },
  {
    id: 'rio',
    name: 'Rio',
    subtitle: 'carnival rooftops',
    sky: ['#0A1500', '#1A2D00', '#2D4D00'],
    ground: '#1A2D00',
    platform: '#4CAF50',
    platformEdge: '#A5D6A7',
    accent: '#FFEB3B',
    enemyColor: '#FF7043',
    bossColor: '#BF360C',
    particles: '#FFEB3B',
    bgElements: 'rio',
    collectibleColor: '#A78BFA',
    music: 261,
  },
  {
    id: 'london',
    name: 'London',
    subtitle: 'foggy underground',
    sky: ['#0A0A0A', '#141414', '#1E1E24'],
    ground: '#141414',
    platform: '#607D8B',
    platformEdge: '#B0BEC5',
    accent: '#EF5350',
    enemyColor: '#546E7A',
    bossColor: '#263238',
    particles: '#EF5350',
    bgElements: 'london',
    collectibleColor: '#D4AF37',
    music: 293,
  },
]

// ── Character creator options ─────────────────────────────────────────────────
const SKIN_TONES  = ['#FDDBB4','#F5C18A','#E8A96A','#C68642','#9A5724','#6B3421','#3D1C02']
const HAIR_COLORS = ['#1A0A00','#3D2B1F','#8B4513','#C8A850','#D4AF37','#FF6B35','#A78BFA','#4ECDC4','#FF4081','#E8E8E8','#FFFFFF']
const HAIR_STYLES = ['short','afro','locs','braids','fade','natural','bald']
const OUTFITS     = [
  { id:'dashiki',    label:'Dashiki',      color:'#D4AF37', accent:'#FF6B35' },
  { id:'streetwear', label:'Streetwear',   color:'#1A1A2E', accent:'#4ECDC4' },
  { id:'armour',     label:'Futurist Armour',color:'#263238',accent:'#00BCD4'},
  { id:'kente',      label:'Kente Cloth',  color:'#C8A850', accent:'#C2185B' },
  { id:'hoodie',     label:'Hoodie',       color:'#37474F', accent:'#FF9800' },
  { id:'gown',       label:'Flowing Gown', color:'#880E4F', accent:'#F48FB1' },
  { id:'suit',       label:'Sharp Suit',   color:'#1A237E', accent:'#FFFFFF' },
  { id:'casual',     label:'Casual',       color:'#4CAF50', accent:'#FFFFFF' },
]
const BODY_TYPES  = ['slim','average','athletic','broad']
const ACCESSORIES = ['none','glasses','cap','headwrap','earrings','necklace','backpack']

// ── Audio ─────────────────────────────────────────────────────────────────────
let audioCtx = null
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}
function playTone(freq, type = 'square', dur = 0.08, vol = 0.08) {
  try {
    const ctx = getAudio()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.type = type; o.frequency.value = freq
    g.gain.setValueAtTime(vol, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    o.start(); o.stop(ctx.currentTime + dur)
  } catch {}
}
function playJump()   { playTone(300, 'sine', 0.12, 0.1); setTimeout(() => playTone(450, 'sine', 0.08, 0.08), 60) }
function playDash()   { playTone(600, 'sawtooth', 0.1, 0.12) }
function playPunch()  { playTone(120, 'square', 0.1, 0.15) }
function playHit()    { playTone(80,  'sawtooth', 0.2, 0.2) }
function playCoin()   { playTone(880, 'sine', 0.12, 0.1); setTimeout(() => playTone(1100, 'sine', 0.08, 0.08), 60) }
function playDead()   { [200,150,100,70].forEach((f,i) => setTimeout(() => playTone(f,'sawtooth',0.2,0.18), i*80)) }

// ── Platform generator ────────────────────────────────────────────────────────
function genPlatforms(worldId) {
  const base = [
    { x: 0,    y: H - 40, w: W * 2, h: 40, isGround: true },
    { x: 150,  y: 360, w: 120, h: 16 },
    { x: 340,  y: 290, w: 110, h: 16 },
    { x: 520,  y: 340, w: 100, h: 16 },
    { x: 680,  y: 260, w: 120, h: 16 },
    { x: 860,  y: 310, w: 100, h: 16 },
    { x: 1020, y: 230, w: 130, h: 16 },
    { x: 1200, y: 280, w: 110, h: 16 },
    { x: 1380, y: 200, w: 120, h: 16 },
    { x: 1560, y: 260, w: 100, h: 16 },
  ]
  return base
}

function genEnemies(world) {
  return [
    { x: 400,  y: 450, w: 32, h: 36, vx: -1.2, vy: 0, hp: 2, maxHp: 2, onGround: false, dead: false, type: 'walker', isBoss: false },
    { x: 700,  y: 450, w: 32, h: 36, vx: 1.2,  vy: 0, hp: 2, maxHp: 2, onGround: false, dead: false, type: 'walker', isBoss: false },
    { x: 900,  y: 450, w: 32, h: 36, vx: -1.5, vy: 0, hp: 3, maxHp: 3, onGround: false, dead: false, type: 'jumper', isBoss: false },
    { x: 1100, y: 450, w: 32, h: 36, vx: 1.2,  vy: 0, hp: 2, maxHp: 2, onGround: false, dead: false, type: 'walker', isBoss: false },
    { x: 1300, y: 450, w: 32, h: 36, vx: -1.8, vy: 0, hp: 3, maxHp: 3, onGround: false, dead: false, type: 'jumper', isBoss: false },
    // Boss
    { x: 1550, y: 380, w: 64, h: 72, vx: -1.5, vy: 0, hp: 12, maxHp: 12, onGround: false, dead: false, type: 'boss', isBoss: true },
  ]
}

function genCollectibles() {
  return [
    { x: 180, y: 330, collected: false, type: 'coin' },
    { x: 210, y: 330, collected: false, type: 'coin' },
    { x: 370, y: 260, collected: false, type: 'gem'  },
    { x: 560, y: 310, collected: false, type: 'coin' },
    { x: 590, y: 310, collected: false, type: 'coin' },
    { x: 710, y: 230, collected: false, type: 'gem'  },
    { x: 900, y: 200, collected: false, type: 'orb'  },
    { x: 1060,y: 200, collected: false, type: 'coin' },
    { x: 1090,y: 200, collected: false, type: 'coin' },
    { x: 1420,y: 170, collected: false, type: 'gem'  },
    { x: 1590,y: 230, collected: false, type: 'coin' },
  ]
}

// ── Draw helpers ──────────────────────────────────────────────────────────────
function drawRoundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
  if (fill)   { ctx.fillStyle = fill; ctx.fill() }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke() }
}

function drawCharacter(ctx, char, x, y, facing, frame, isDashing, isAttacking) {
  const outfit = OUTFITS.find(o => o.id === char.outfit) || OUTFITS[0]
  const w = 28, h = 40
  const cx = x + w / 2

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(cx, y + h + 2, 14, 5, 0, 0, Math.PI * 2); ctx.fill()

  // Legs animation
  const legOff = Math.sin(frame * 0.3) * 5
  ctx.fillStyle = outfit.color
  if (isDashing) {
    ctx.fillStyle = outfit.accent
    ctx.globalAlpha = 0.7
  }

  // Body
  drawRoundRect(ctx, x + 4, y + 16, w - 8, 18, 4, outfit.color)

  // Outfit detail
  ctx.fillStyle = outfit.accent
  ctx.fillRect(x + 8, y + 20, w - 16, 3)

  // Legs
  ctx.fillStyle = outfit.color
  ctx.fillRect(x + 5,  y + 32, 8, 12 + (facing === 1 ? legOff : -legOff))
  ctx.fillRect(x + 15, y + 32, 8, 12 - (facing === 1 ? legOff : -legOff))

  // Head
  ctx.fillStyle = char.skinTone
  drawRoundRect(ctx, x + 6, y, w - 12, 18, 6, char.skinTone)

  // Eyes
  const eyeX = facing === 1 ? x + 16 : x + 8
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.ellipse(eyeX, y + 7, 3, 3.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1A0A00'
  ctx.beginPath(); ctx.ellipse(eyeX + facing * 1, y + 7.5, 1.5, 2, 0, 0, Math.PI * 2); ctx.fill()

  // Hair
  ctx.fillStyle = char.hairColor
  switch (char.hairStyle) {
    case 'afro':
      ctx.beginPath(); ctx.arc(cx, y - 2, 12, Math.PI, 0); ctx.fill()
      ctx.beginPath(); ctx.arc(cx - 10, y + 4, 7, Math.PI * 1.2, Math.PI * 0.2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + 10, y + 4, 7, Math.PI * 0.8, Math.PI * 1.8); ctx.fill()
      break
    case 'locs':
      for (let i = 0; i < 6; i++) {
        ctx.beginPath(); ctx.moveTo(x + 8 + i * 3, y)
        ctx.lineTo(x + 6 + i * 3, y - 8 - (i % 2) * 4); ctx.lineWidth = 2.5
        ctx.strokeStyle = char.hairColor; ctx.stroke()
      }
      break
    case 'braids':
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(x + 8 + i * 4, y)
        ctx.lineTo(x + 6 + i * 4, y - 6); ctx.lineWidth = 3
        ctx.strokeStyle = char.hairColor; ctx.stroke()
      }
      break
    case 'fade':
      ctx.beginPath(); ctx.arc(cx, y + 2, 9, Math.PI, 0); ctx.fill()
      break
    case 'bald':
      break
    default: // short / natural
      drawRoundRect(ctx, x + 5, y - 3, w - 10, 10, 4, char.hairColor)
  }

  // Accessory
  switch (char.accessory) {
    case 'glasses':
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5
      ctx.strokeRect(eyeX - 4, y + 4, 7, 5)
      break
    case 'cap':
      ctx.fillStyle = outfit.accent
      drawRoundRect(ctx, x + 4, y - 5, w - 8, 8, 3, outfit.accent)
      ctx.fillRect(x + 2, y - 2, 4, 3)
      break
    case 'headwrap':
      ctx.fillStyle = outfit.accent
      drawRoundRect(ctx, x + 4, y - 4, w - 8, 10, 4, outfit.accent)
      break
    case 'earrings':
      ctx.fillStyle = '#FFD700'
      ctx.beginPath(); ctx.arc(x + 6, y + 10, 2.5, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(x + w - 6, y + 10, 2.5, 0, Math.PI * 2); ctx.fill()
      break
    case 'necklace':
      ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(cx, y + 20, 6, 0.2, Math.PI - 0.2); ctx.stroke()
      break
  }

  // Attack flash
  if (isAttacking) {
    ctx.fillStyle = 'rgba(255,200,50,0.6)'
    ctx.beginPath()
    ctx.arc(x + (facing === 1 ? w + 8 : -8), y + 18, 14, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalAlpha = 1
}

function drawEnemy(ctx, e, world, frame) {
  if (e.dead) return
  const color = e.isBoss ? world.bossColor : world.enemyColor
  const cx = e.x + e.w / 2

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(cx, e.y + e.h + 2, e.w / 2, 4, 0, 0, Math.PI * 2); ctx.fill()

  // Body
  const bounce = e.isBoss ? Math.sin(frame * 0.05) * 3 : 0
  drawRoundRect(ctx, e.x, e.y + bounce, e.w, e.h, e.isBoss ? 8 : 5, color, e.isBoss ? world.accent : null)

  // Eyes
  ctx.fillStyle = '#FF4444'
  ctx.beginPath(); ctx.ellipse(cx - e.w * 0.2, e.y + e.h * 0.3 + bounce, e.isBoss ? 5 : 3, e.isBoss ? 5 : 3, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(cx + e.w * 0.2, e.y + e.h * 0.3 + bounce, e.isBoss ? 5 : 3, e.isBoss ? 5 : 3, 0, 0, Math.PI * 2); ctx.fill()

  // Boss crown
  if (e.isBoss) {
    ctx.fillStyle = '#FFD700'
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.moveTo(e.x + 8 + i * 12, e.y + bounce)
      ctx.lineTo(e.x + 14 + i * 12, e.y - 8 + bounce)
      ctx.lineTo(e.x + 20 + i * 12, e.y + bounce); ctx.fill()
    }
    // HP bar
    const bw = e.w + 20
    ctx.fillStyle = '#333'; ctx.fillRect(e.x - 10, e.y - 18 + bounce, bw, 8)
    ctx.fillStyle = `hsl(${(e.hp / e.maxHp) * 120},100%,45%)`
    ctx.fillRect(e.x - 10, e.y - 18 + bounce, bw * (e.hp / e.maxHp), 8)
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(e.x - 10, e.y - 18 + bounce, bw, 8)
  }
}

function drawBackground(ctx, world, camX, frame) {
  // Sky gradient
  const grd = ctx.createLinearGradient(0, 0, 0, H)
  world.sky.forEach((c, i) => grd.addColorStop(i / (world.sky.length - 1), c))
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H)

  const px = (camX * 0.3) % W

  switch (world.bgElements) {
    case 'lagos': {
      // Buildings
      [[60,80,120],[220,60,100],[420,90,80],[620,50,110],[820,70,90]].forEach(([bx, bh, bw]) => {
        const rx = ((bx - px) % (W + 200)) - 100
        ctx.fillStyle = '#0D0030'
        ctx.fillRect(rx, H - 40 - bh, bw, bh)
        // Windows
        ctx.fillStyle = '#FF9800'
        for (let wy = 10; wy < bh - 10; wy += 18)
          for (let wx = 8; wx < bw - 8; wx += 16)
            if (Math.random() > 0.3) ctx.fillRect(rx + wx, H - 40 - bh + wy, 8, 10)
      })
      // Neon signs
      ctx.font = '10px monospace'; ctx.fillStyle = '#FF4081'
      ctx.fillText('LAGOS', ((200 - px * 0.5) % W), 120)
      ctx.fillStyle = '#00BCD4'
      ctx.fillText('NG', ((500 - px * 0.5) % W), 90)
      break
    }
    case 'accra': {
      // Kente pattern strips
      const colors = ['#C8A850','#C2185B','#4CAF50','#1A237E']
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = colors[i % colors.length] + '30'
        ctx.fillRect(0, i * 65, W, 30)
      }
      // Market stalls
      [[80,100],[300,90],[550,110],[750,95]].forEach(([bx,bh]) => {
        const rx = ((bx - px * 0.4) % (W + 150)) - 50
        ctx.fillStyle = '#3D1A00'; ctx.fillRect(rx, H - 40 - bh, 90, bh)
        ctx.fillStyle = colors[Math.floor(bx / 100) % colors.length]
        ctx.fillRect(rx - 10, H - 40 - bh, 110, 12) // awning
      })
      break
    }
    case 'cairo': {
      // Pyramids
      [[100,160],[350,130],[600,180],[850,140]].forEach(([bx,bh]) => {
        const rx = ((bx - px * 0.25) % (W + 200)) - 100
        ctx.fillStyle = '#8B6914'
        ctx.beginPath(); ctx.moveTo(rx, H - 40); ctx.lineTo(rx + bh, H - 40 - bh); ctx.lineTo(rx + bh * 2, H - 40); ctx.fill()
        ctx.fillStyle = '#C8A850'
        ctx.beginPath(); ctx.moveTo(rx + bh * 0.4, H - 40); ctx.lineTo(rx + bh, H - 40 - bh); ctx.lineTo(rx + bh * 0.6, H - 40); ctx.fill()
      })
      // Stars
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = '#FFE082'
        ctx.beginPath(); ctx.arc((i * 97 + 30 - px * 0.1) % W, 20 + (i * 41) % 80, 1.5, 0, Math.PI * 2); ctx.fill()
      }
      break
    }
    case 'tokyo': {
      // Rain
      ctx.strokeStyle = 'rgba(120,180,255,0.25)'; ctx.lineWidth = 1
      for (let i = 0; i < 60; i++) {
        const rx = (i * 31 + frame * 3) % W
        const ry = (i * 47 + frame * 6) % H
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 3, ry + 14); ctx.stroke()
      }
      // Buildings
      [[50,200,70],[180,160,60],[320,220,80],[500,180,65],[680,240,75],[860,200,70]].forEach(([bx,bh,bw]) => {
        const rx = ((bx - px * 0.35) % (W + 150)) - 50
        ctx.fillStyle = '#061020'; ctx.fillRect(rx, H - 40 - bh, bw, bh)
        ctx.fillStyle = '#00BCD4'
        for (let wy = 8; wy < bh; wy += 14)
          ctx.fillRect(rx + 4, H - 40 - bh + wy, bw - 8, 6)
      })
      break
    }
    case 'rio': {
      // Hills
      ctx.fillStyle = '#1A3D00'
      ctx.beginPath(); ctx.moveTo(0, H - 40)
      for (let x = 0; x <= W; x += 20)
        ctx.lineTo(x, H - 40 - 60 - Math.sin((x + px * 0.2) * 0.02) * 40)
      ctx.lineTo(W, H - 40); ctx.fill()
      // Carnival lights
      ctx.fillStyle = '#FFEB3B'
      for (let i = 0; i < 20; i++) {
        ctx.beginPath(); ctx.arc(((i * 80 - px * 0.3) % W + W) % W, 40 + (i % 3) * 20, 4, 0, Math.PI * 2); ctx.fill()
      }
      break
    }
    case 'london': {
      // Fog
      const fog = ctx.createLinearGradient(0, H - 200, 0, H)
      fog.addColorStop(0, 'rgba(180,180,180,0)')
      fog.addColorStop(1, 'rgba(180,180,180,0.15)')
      ctx.fillStyle = fog; ctx.fillRect(0, 0, W, H)
      // Buildings
      [[60,180,80],[220,220,70],[400,160,90],[600,200,75],[800,240,85]].forEach(([bx,bh,bw]) => {
        const rx = ((bx - px * 0.3) % (W + 180)) - 80
        ctx.fillStyle = '#1A1A24'; ctx.fillRect(rx, H - 40 - bh, bw, bh)
        ctx.fillStyle = '#EF5350'
        ctx.fillRect(rx + bw / 2 - 4, H - 40 - bh - 20, 8, 20) // chimney
      })
      // Underground sign
      ctx.fillStyle = '#EF5350'
      ctx.beginPath(); ctx.arc(((400 - px * 0.5 + W) % W), 100, 18, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#1A1A1A'; ctx.fillRect(((400 - px * 0.5 + W) % W) - 22, 96, 44, 8)
      break
    }
  }
}

function drawPlatform(ctx, p, world) {
  if (p.isGround) {
    const grd = ctx.createLinearGradient(0, p.y, 0, p.y + p.h)
    grd.addColorStop(0, world.platform)
    grd.addColorStop(1, world.ground)
    ctx.fillStyle = grd; ctx.fillRect(p.x, p.y, p.w, p.h)
    ctx.fillStyle = world.platformEdge; ctx.fillRect(p.x, p.y, p.w, 4)
    return
  }
  ctx.fillStyle = world.platform
  drawRoundRect(ctx, p.x, p.y, p.w, p.h, 4, world.platform)
  ctx.fillStyle = world.platformEdge; ctx.fillRect(p.x + 4, p.y, p.w - 8, 3)
}

function drawCollectible(ctx, c, world, frame) {
  if (c.collected) return
  const bob = Math.sin(frame * 0.07 + c.x * 0.1) * 3
  const size = c.type === 'orb' ? 11 : c.type === 'gem' ? 9 : 7
  ctx.fillStyle = world.collectibleColor
  if (c.type === 'coin') {
    ctx.beginPath(); ctx.ellipse(c.x, c.y + bob, size, size, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.beginPath(); ctx.ellipse(c.x - 2, c.y + bob - 2, 3, 3, 0, 0, Math.PI * 2); ctx.fill()
  } else if (c.type === 'gem') {
    ctx.beginPath(); ctx.moveTo(c.x, c.y + bob - size)
    ctx.lineTo(c.x + size, c.y + bob); ctx.lineTo(c.x, c.y + bob + size)
    ctx.lineTo(c.x - size, c.y + bob); ctx.closePath(); ctx.fill()
  } else {
    ctx.beginPath(); ctx.arc(c.x, c.y + bob, size, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.stroke()
  }
}

// ── Character Creator ─────────────────────────────────────────────────────────
function CharacterCreator({ onStart }) {
  const [char, setChar] = useState({
    skinTone: '#C68642', hairColor: '#1A0A00', hairStyle: 'afro',
    outfit: 'dashiki', bodyType: 'average', accessory: 'none', name: 'Hero',
  })
  const previewRef = useRef(null)

  useEffect(() => {
    const canvas = previewRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 120, 160)
    // Background
    ctx.fillStyle = '#1A1A2E'; ctx.fillRect(0, 0, 120, 160)
    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1
    for (let i = 0; i < 120; i += 20) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,160); ctx.stroke() }
    for (let i = 0; i < 160; i += 20) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(120,i); ctx.stroke() }
    drawCharacter(ctx, char, 46, 60, 1, 0, false, false)
  }, [char])

  const Row = ({ label, children }) => (
    <div style={{ marginBottom: '0.9rem' }}>
      <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '0.4rem' }}>{label}</div>
      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>{children}</div>
    </div>
  )

  const Swatch = ({ val, current, onClick, style = {} }) => (
    <button onClick={() => onClick(val)} style={{ width: '26px', height: '26px', borderRadius: '50%', border: `3px solid ${current === val ? '#D4AF37' : 'transparent'}`, background: val, cursor: 'pointer', flexShrink: 0, transition: 'border 0.1s', ...style }} />
  )

  const Chip = ({ val, current, onClick, label }) => (
    <button onClick={() => onClick(val)} style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: current === val ? 700 : 400, background: current === val ? '#D4AF37' : 'rgba(255,255,255,0.07)', color: current === val ? '#0A0A0F' : 'rgba(255,255,255,0.45)', border: `2px solid ${current === val ? '#D4AF37' : 'rgba(255,255,255,0.1)'}`, transition: 'all 0.13s' }}>{label || val}</button>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', paddingTop: '100px' }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '0.5rem' }}>WORLD RUNNER</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 700, color: '#F0EDE8', margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>Create Your Character</h1>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', margin: 0 }}>customise your hero before you hit the streets</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' }}>
          {/* Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
            <canvas ref={previewRef} width={120} height={160} style={{ borderRadius: '10px', border: '2px solid rgba(212,175,55,0.3)', imageRendering: 'pixelated' }} />
            <input value={char.name} onChange={e => setChar(c => ({ ...c, name: e.target.value }))}
              placeholder="name"
              style={{ width: '100%', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.07)', border: '2px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#F0EDE8', fontFamily: 'Georgia, serif', fontSize: '0.82rem', outline: 'none', textAlign: 'center', boxSizing: 'border-box' }}
            />
          </div>

          {/* Options */}
          <div style={{ overflowY: 'auto', maxHeight: '420px', paddingRight: '0.4rem' }}>
            <Row label="SKIN TONE">
              {SKIN_TONES.map(s => <Swatch key={s} val={s} current={char.skinTone} onClick={v => setChar(c => ({ ...c, skinTone: v }))} />)}
            </Row>
            <Row label="HAIR COLOUR">
              {HAIR_COLORS.map(h => <Swatch key={h} val={h} current={char.hairColor} onClick={v => setChar(c => ({ ...c, hairColor: v }))} />)}
            </Row>
            <Row label="HAIR STYLE">
              {HAIR_STYLES.map(s => <Chip key={s} val={s} current={char.hairStyle} onClick={v => setChar(c => ({ ...c, hairStyle: v }))} />)}
            </Row>
            <Row label="OUTFIT">
              {OUTFITS.map(o => (
                <button key={o.id} onClick={() => setChar(c => ({ ...c, outfit: o.id }))}
                  style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontFamily: '"Courier New", monospace', fontSize: '0.6rem', background: char.outfit === o.id ? o.color : 'rgba(255,255,255,0.06)', color: char.outfit === o.id ? '#fff' : 'rgba(255,255,255,0.45)', border: `2px solid ${char.outfit === o.id ? o.color : 'rgba(255,255,255,0.1)'}`, fontWeight: char.outfit === o.id ? 700 : 400, transition: 'all 0.13s' }}>
                  {o.label}
                </button>
              ))}
            </Row>
            <Row label="BODY TYPE">
              {BODY_TYPES.map(b => <Chip key={b} val={b} current={char.bodyType} onClick={v => setChar(c => ({ ...c, bodyType: v }))} />)}
            </Row>
            <Row label="ACCESSORY">
              {ACCESSORIES.map(a => <Chip key={a} val={a} current={char.accessory} onClick={v => setChar(c => ({ ...c, accessory: v }))} />)}
            </Row>
          </div>
        </div>

        {/* World select */}
        <div style={{ marginTop: '1.2rem' }}>
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '0.6rem', textAlign: 'center' }}>CHOOSE YOUR STARTING WORLD</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem', marginBottom: '1.2rem' }}>
            {WORLDS.map((w, i) => (
              <button key={w.id} onClick={() => onStart(char, i)}
                style={{ padding: '0.7rem', borderRadius: '10px', cursor: 'pointer', background: `linear-gradient(135deg, ${w.sky[0]}, ${w.sky[2]})`, border: `2px solid ${w.platform}`, transition: 'all 0.15s', textAlign: 'center' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.82rem', fontWeight: 700, color: w.platformEdge }}>{w.name}</div>
                <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.1rem' }}>{w.subtitle}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Game ─────────────────────────────────────────────────────────────────
function Game({ char, worldIndex, onBack }) {
  const canvasRef  = useRef(null)
  const stateRef   = useRef(null)
  const keysRef    = useRef({})
  const rafRef     = useRef(null)
  const frameRef   = useRef(0)

  const [hud, setHud] = useState({ score: 0, hp: 5, lives: 3, world: WORLDS[worldIndex].name, coins: 0, worldIdx: worldIndex })
  const [gameOver, setGameOver] = useState(false)
  const [worldClear, setWorldClear] = useState(false)
  const [paused, setPaused] = useState(false)

  const initWorld = useCallback((wIdx) => {
    const world = WORLDS[wIdx]
    stateRef.current = {
      player: { x: 80, y: 380, w: 28, h: 40, vx: 0, vy: 0, onGround: false, jumps: 0, facing: 1, dashing: false, dashTimer: 0, dashCool: 0, attacking: false, attackTimer: 0, invincible: 0, hp: 5, lives: 3, score: 0, coins: 0 },
      platforms: genPlatforms(world.id),
      enemies: genEnemies(world),
      collectibles: genCollectibles(),
      camX: 0, world, wIdx,
      particles: [],
    }
  }, [])

  useEffect(() => {
    initWorld(worldIndex)
    const handleKey = (e) => {
      keysRef.current[e.code] = e.type === 'keydown'
      if (['Space','ArrowUp','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault()
    }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('keyup', handleKey)
    return () => { window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKey) }
  }, [worldIndex, initWorld])

  useEffect(() => {
    if (gameOver || worldClear || paused) { cancelAnimationFrame(rafRef.current); return }
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')

    const loop = () => {
      if (!stateRef.current) return
      const s = stateRef.current
      const p = s.player
      const keys = keysRef.current
      frameRef.current++
      const frame = frameRef.current

      // ── Input ──
      const left  = keys['ArrowLeft']  || keys['KeyA']
      const right = keys['ArrowRight'] || keys['KeyD']
      const jump  = keys['ArrowUp']    || keys['KeyW'] || keys['Space']
      const dash  = keys['ShiftLeft']  || keys['ShiftRight']
      const attack= keys['KeyZ'] || keys['KeyJ'] || keys['ControlLeft']

      // Move
      if (!p.dashing) {
        if (left)  { p.vx = -MOVE_SPEED; p.facing = -1 }
        else if (right) { p.vx = MOVE_SPEED;  p.facing = 1 }
        else p.vx *= 0.8

        // Jump
        if (jump && !keysRef.current._jumpHeld && p.jumps < 2) {
          p.vy = p.jumps === 0 ? JUMP_FORCE : JUMP_FORCE * 0.85
          p.jumps++
          playJump()
          s.particles.push(...Array.from({ length: 6 }, (_, i) => ({ x: p.x + p.w / 2, y: p.y + p.h, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 3, life: 18, color: s.world.particles })))
        }
        keysRef.current._jumpHeld = jump
      }

      // Dash
      if (dash && !p.dashing && p.dashCool <= 0) {
        p.dashing = true; p.dashTimer = DASH_DURATION; p.dashCool = DASH_COOLDOWN
        p.vx = p.facing * DASH_SPEED; playDash()
        s.particles.push(...Array.from({ length: 10 }, (_, i) => ({ x: p.x + p.w / 2, y: p.y + p.h / 2, vx: -p.facing * (2 + Math.random() * 3), vy: (Math.random() - 0.5) * 2, life: 20, color: s.world.accent })))
      }
      if (p.dashing) {
        p.dashTimer--
        if (p.dashTimer <= 0) p.dashing = false
      }
      if (p.dashCool > 0) p.dashCool--

      // Attack
      if (attack && !p.attacking) {
        p.attacking = true; p.attackTimer = 14
        playPunch()
        // Hit enemies in range
        s.enemies.forEach(e => {
          if (e.dead) return
          const reach = p.isBoss ? 50 : 40
          const inRange = p.facing === 1
            ? e.x < p.x + p.w + reach && e.x + e.w > p.x
            : e.x < p.x + reach && e.x + e.w > p.x - 10
          const vertOk = Math.abs((e.y + e.h / 2) - (p.y + p.h / 2)) < 40
          if (inRange && vertOk) {
            e.hp--
            s.particles.push(...Array.from({ length: 8 }, (_, i) => ({ x: e.x + e.w / 2, y: e.y + e.h / 2, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 4 - 1, life: 22, color: '#FF4444' })))
            if (e.hp <= 0) {
              e.dead = true
              p.score += e.isBoss ? 500 : 100
              s.particles.push(...Array.from({ length: 20 }, (_, i) => ({ x: e.x + e.w / 2, y: e.y + e.h / 2, vx: (Math.random() - 0.5) * 8, vy: -Math.random() * 6 - 2, life: 35, color: s.world.accent })))
            }
          }
        })
      }
      if (p.attacking) { p.attackTimer--; if (p.attackTimer <= 0) p.attacking = false }

      // Physics
      p.vy += GRAVITY
      p.x += p.vx
      p.y += p.vy
      if (p.invincible > 0) p.invincible--

      // Platform collision
      p.onGround = false
      s.platforms.forEach(pl => {
        if (p.x + p.w > pl.x && p.x < pl.x + pl.w) {
          if (p.y + p.h > pl.y && p.y + p.h < pl.y + pl.h + 16 && p.vy >= 0) {
            p.y = pl.y - p.h; p.vy = 0; p.onGround = true; p.jumps = 0
          }
        }
      })

      // Enemy update
      s.enemies.forEach(e => {
        if (e.dead) return
        e.vy += GRAVITY
        e.x += e.vx
        e.y += e.vy
        s.platforms.forEach(pl => {
          if (e.x + e.w > pl.x && e.x < pl.x + pl.w) {
            if (e.y + e.h > pl.y && e.y + e.h < pl.y + 20 && e.vy >= 0) {
              e.y = pl.y - e.h; e.vy = 0; e.onGround = true
            }
          }
        })
        // Bounce off walls / edges
        if (e.x < 0 || e.x + e.w > 1800) e.vx *= -1
        if (e.onGround) {
          // Patrol & chase
          const dist = p.x - e.x
          if (Math.abs(dist) < 300) { e.vx = Math.sign(dist) * (e.isBoss ? 2 : 1.5) }
          if (e.type === 'jumper' && Math.abs(dist) < 200 && e.onGround && frame % 80 === 0) e.vy = JUMP_FORCE * 0.7
          if (e.isBoss && Math.abs(dist) < 400 && frame % 60 === 0) e.vy = JUMP_FORCE * 0.8
        }
        // Damage player
        if (p.invincible <= 0 && !p.dashing &&
          p.x + p.w > e.x + 4 && p.x < e.x + e.w - 4 &&
          p.y + p.h > e.y + 4 && p.y < e.y + e.h - 4) {
          p.hp -= e.isBoss ? 2 : 1
          p.invincible = 60
          p.vx = -p.facing * 5; p.vy = -6
          playHit()
          if (p.hp <= 0) {
            p.lives--; p.hp = 5; p.x = 80; p.y = 380; p.vx = 0; p.vy = 0
            playDead()
            if (p.lives < 0) { setGameOver(true); return }
          }
        }
      })

      // Collectibles
      s.collectibles.forEach(c => {
        if (c.collected) return
        if (p.x + p.w > c.x - 12 && p.x < c.x + 12 && p.y + p.h > c.y - 12 && p.y < c.y + 12) {
          c.collected = true
          p.coins++
          p.score += c.type === 'orb' ? 50 : c.type === 'gem' ? 30 : 10
          playCoin()
          s.particles.push(...Array.from({ length: 8 }, (_, i) => ({ x: c.x, y: c.y, vx: (Math.random() - 0.5) * 5, vy: -Math.random() * 4 - 1, life: 20, color: s.world.collectibleColor })))
        }
      })

      // Particles
      s.particles = s.particles.filter(pt => pt.life > 0)
      s.particles.forEach(pt => { pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.15; pt.life-- })

      // Fall off screen
      if (p.y > H + 100) { p.y = 380; p.x = 80; p.vy = 0; p.hp -= 1; if (p.hp <= 0) { p.lives--; p.hp = 5; if (p.lives < 0) { setGameOver(true); return } } }

      // Camera
      const targetCam = p.x - W * 0.35
      s.camX += (targetCam - s.camX) * 0.1
      s.camX = Math.max(0, s.camX)

      // Check world clear (boss dead)
      const boss = s.enemies.find(e => e.isBoss)
      if (boss && boss.dead) { setWorldClear(true); return }

      // HUD update
      setHud({ score: p.score, hp: p.hp, lives: p.lives, world: s.world.name, coins: p.coins, worldIdx: s.wIdx })

      // ── DRAW ──
      ctx.save()
      ctx.translate(-s.camX, 0)

      // Background (fixed to screen)
      ctx.save(); ctx.translate(s.camX, 0)
      drawBackground(ctx, s.world, s.camX, frame)
      ctx.restore()

      // Platforms
      s.platforms.forEach(pl => drawPlatform(ctx, pl, s.world))

      // Collectibles
      s.collectibles.forEach(c => drawCollectible(ctx, c, s.world, frame))

      // Enemies
      s.enemies.forEach(e => drawEnemy(ctx, e, s.world, frame))

      // Player (flash when invincible)
      if (p.invincible <= 0 || frame % 6 < 3)
        drawCharacter(ctx, char, p.x, p.y, p.facing, p.onGround ? frame : 0, p.dashing, p.attacking)

      // Particles
      s.particles.forEach(pt => {
        ctx.globalAlpha = pt.life / 30
        ctx.fillStyle = pt.color
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
      })

      ctx.restore()

      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [char, gameOver, worldClear, paused, worldIndex, initWorld])

  const nextWorld = () => {
    const next = (stateRef.current?.wIdx || worldIndex) + 1
    if (next >= WORLDS.length) { onBack(); return }
    setWorldClear(false)
    const p = stateRef.current?.player
    initWorld(next)
    if (p && stateRef.current) {
      stateRef.current.player.score = p.score
      stateRef.current.player.coins = p.coins
      stateRef.current.player.hp    = p.hp
      stateRef.current.player.lives = p.lives
    }
  }

  const world = WORLDS[worldIndex]

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '80px' }}>
      {/* HUD */}
      <div style={{ width: '100%', maxWidth: W, padding: '0.5rem 0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.6)', borderBottom: '2px solid rgba(255,255,255,0.08)', flexWrap: 'wrap', gap: '0.4rem', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.72rem', color: '#D4AF37', fontWeight: 700 }}>{char.name || 'Hero'}</span>
          <div style={{ display: 'flex', gap: '2px' }}>{Array.from({ length: 5 }, (_, i) => <div key={i} style={{ width: '14px', height: '14px', borderRadius: '3px', background: i < hud.hp ? '#E8758A' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }} />)}</div>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)' }}>{'♦'.repeat(Math.max(0, hud.lives + 1))}</span>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.68rem', color: WORLDS[hud.worldIdx]?.collectibleColor || '#FFD700' }}>● {hud.coins}</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.78rem', fontWeight: 700, color: WORLDS[hud.worldIdx]?.platformEdge || '#fff' }}>{hud.world}</span>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.72rem', color: '#D4AF37' }}>{hud.score.toLocaleString()} pts</span>
          <button onClick={() => setPaused(p => !p)} style={{ padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)', borderRadius: '5px', color: 'rgba(255,255,255,0.5)', fontFamily: '"Courier New", monospace', fontSize: '0.6rem', cursor: 'pointer' }}>{paused ? '▶' : '⏸'}</button>
          <button onClick={onBack} style={{ padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '5px', color: 'rgba(255,255,255,0.3)', fontFamily: '"Courier New", monospace', fontSize: '0.6rem', cursor: 'pointer' }}>quit</button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ position: 'relative' }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block', imageRendering: 'pixelated', maxWidth: '100vw' }} />

        {/* Pause overlay */}
        {paused && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#F0EDE8', margin: 0 }}>Paused</h2>
            <button onClick={() => setPaused(false)} style={{ padding: '0.6rem 1.5rem', background: '#D4AF37', border: 'none', borderRadius: '8px', fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', color: '#0A0A0F' }}>Resume</button>
          </div>
        )}

        {/* Game Over */}
        {gameOver && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', color: '#E8758A', margin: 0 }}>Game Over</h2>
            <p style={{ fontFamily: '"Courier New", monospace', color: '#D4AF37', margin: 0 }}>Score: {hud.score.toLocaleString()}</p>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button onClick={() => { setGameOver(false); initWorld(worldIndex) }} style={{ padding: '0.6rem 1.3rem', background: '#D4AF37', border: 'none', borderRadius: '8px', fontFamily: 'Georgia, serif', fontWeight: 700, cursor: 'pointer', color: '#0A0A0F' }}>Try Again</button>
              <button onClick={onBack} style={{ padding: '0.6rem 1.3rem', background: 'transparent', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontFamily: 'Georgia, serif', color: '#F0EDE8', cursor: 'pointer' }}>Back</button>
            </div>
          </div>
        )}

        {/* World Clear */}
        {worldClear && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.8rem' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2.2rem', color: '#D4AF37', margin: 0 }}>World Clear! 🌍</h2>
            <p style={{ fontFamily: 'Georgia, serif', color: '#F0EDE8', fontSize: '1.1rem', margin: 0 }}>{WORLDS[stateRef.current?.wIdx || worldIndex]?.name} conquered</p>
            <p style={{ fontFamily: '"Courier New", monospace', color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.8rem' }}>Score: {hud.score.toLocaleString()} · Coins: {hud.coins}</p>
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
              {(stateRef.current?.wIdx || worldIndex) + 1 < WORLDS.length && (
                <button onClick={nextWorld} style={{ padding: '0.65rem 1.4rem', background: '#D4AF37', border: 'none', borderRadius: '8px', fontFamily: 'Georgia, serif', fontWeight: 700, cursor: 'pointer', color: '#0A0A0F', fontSize: '0.9rem' }}>
                  Next: {WORLDS[(stateRef.current?.wIdx || worldIndex) + 1]?.name} →
                </button>
              )}
              <button onClick={onBack} style={{ padding: '0.65rem 1.2rem', background: 'transparent', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontFamily: 'Georgia, serif', color: '#F0EDE8', cursor: 'pointer' }}>Menu</button>
            </div>
          </div>
        )}
      </div>

      {/* Controls hint */}
      <div style={{ display: 'flex', gap: '1.2rem', padding: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[['←→ / AD', 'move'], ['↑/W/Space', 'jump (×2)'], ['Shift', 'dash'], ['Z/J/Ctrl', 'attack']].map(([k, v]) => (
          <span key={k} style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
            <span style={{ color: 'rgba(212,175,55,0.6)' }}>{k}</span> {v}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function WorldRunner() {
  const [screen,     setScreen]     = useState('create') // create | game
  const [character,  setCharacter]  = useState(null)
  const [worldIndex, setWorldIndex] = useState(0)

  if (screen === 'game' && character) {
    return <Game char={character} worldIndex={worldIndex} onBack={() => setScreen('create')} />
  }

  return <CharacterCreator onStart={(char, wIdx) => { setCharacter(char); setWorldIndex(wIdx); setScreen('game') }} />
}