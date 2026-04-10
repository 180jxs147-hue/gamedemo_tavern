const memoryStorage = (() => {
  /** @type {Record<string,string>} */
  const store = {}
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
    },
    setItem(key, value) {
      store[key] = String(value)
    },
    removeItem(key) {
      delete store[key]
    },
    clear() {
      for (const k of Object.keys(store)) delete store[k]
    },
  }
})()

globalThis.localStorage = memoryStorage

function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

async function main() {
  const rand = mulberry32(20260410)
  Math.random = rand

  const { useGameStore } = await import('../src/store/gameStore.ts')
  const { generateFemaleGuest, generateMaleGuest } = await import('../src/utils/generators.ts')

  useGameStore.getState().resetGame()

  let s = useGameStore.getState()
  console.log('--- init ---')
  console.log({ day: s.day, timePhase: s.timePhase, ap: s.resources.ap, gold: s.resources.gold, queue: s.queue.length })

  // Ensure we have at least 1 male + 1 female checked in (capacity 3)
  const male = generateMaleGuest('R')
  const female = generateFemaleGuest('R')
  useGameStore.setState({
    guests: [
      { ...male, status: 'CheckedIn' },
      { ...female, status: 'CheckedIn' },
    ],
    queue: s.queue,
  })

  s = useGameStore.getState()
  console.log('--- after force check-in ---')
  console.log({ guests: s.guests.map((g) => `${g.name}:${g.gender}:${g.rarity}`) })

  // Investigate male
  const apBeforeInvestigate = s.resources.ap
  const invOk = s.investigate(s.guests[0].id)
  s = useGameStore.getState()
  console.log('--- investigate ---')
  console.log({ invOk, apDelta: apBeforeInvestigate - s.resources.ap, investigated: s.guests[0].isInvestigated })

  // Advance to Night
  s.nextPhase() // Morning -> Day
  s.nextPhase() // Day -> Night
  s = useGameStore.getState()
  console.log('--- phase to night ---')
  console.log({ timePhase: s.timePhase })

  // Capture female at night
  const apBeforeCapture = s.resources.ap
  const captureRes = s.capture(s.guests.find((g) => g.gender === 'Female')?.id, 'alchemy')
  s = useGameStore.getState()
  console.log('--- capture ---')
  console.log({
    captureRes,
    apDelta: apBeforeCapture - s.resources.ap,
    assets: s.assets.length,
    alertLevel: s.resources.alertLevel,
    guestsRemaining: s.guests.length,
  })

  // If capture succeeded, assign service and settle
  const maleId = s.guests.find((g) => g.gender === 'Male')?.id
  if (s.assets.length > 0 && maleId) {
    const assetId = s.assets[0].id
    const apBeforeTrain = s.resources.ap
    const trainOk = s.trainAsset(assetId)
    s = useGameStore.getState()
    console.log('--- train ---')
    console.log({ trainOk, apDelta: apBeforeTrain - s.resources.ap, charm: s.assets[0].charm, obedience: s.assets[0].obedience })

    s.assignService(maleId, assetId)
    s = useGameStore.getState()
    console.log('--- assign service ---')
    console.log({ assigned: s.guests.find((g) => g.id === maleId)?.assignedAssetId === assetId })

    // Night -> LateNight -> Settlement
    s.nextPhase()
    s = useGameStore.getState()
    console.log('--- phase to latenight ---', s.timePhase)

    const goldBefore = s.resources.gold
    s.nextPhase() // settlement triggers here
    s = useGameStore.getState()
    console.log('--- settlement ---')
    console.log({
      day: s.day,
      timePhase: s.timePhase,
      ap: s.resources.ap,
      goldDelta: s.resources.gold - goldBefore,
      report: s.latestReport,
      guests: s.guests.length,
    })
  } else {
    console.log('--- skipped service/settlement (no asset captured) ---')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

