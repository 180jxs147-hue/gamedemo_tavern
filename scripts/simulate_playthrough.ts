const memoryStorage = (() => {
  const store: Record<string, string> = {}
  return {
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
    },
    setItem(key: string, value: string) {
      store[key] = String(value)
    },
    removeItem(key: string) {
      delete store[key]
    },
    clear() {
      for (const k of Object.keys(store)) delete store[k]
    },
  }
})()

;(globalThis as any).localStorage = memoryStorage

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

async function main() {
  const { useGameStore } = await import('../src/store/gameStore')
  const { generateFemaleGuest, generateMaleGuest } = await import('../src/utils/generators')

  const runScenario = (label: string, opts: { seed: number; forceCaptureFail?: boolean; forceCaptureSuccess?: boolean; maleWealth?: number }) => {
    Math.random = mulberry32(opts.seed)
    useGameStore.getState().resetGame()

    let s = useGameStore.getState()
    const male = generateMaleGuest('R')
    const female = generateFemaleGuest('R')

    const maleIn = { ...male, status: 'CheckedIn' as const, wealth: opts.maleWealth ?? male.wealth }
    const femaleIn = opts.forceCaptureFail
      ? { ...female, status: 'CheckedIn' as const, constitution: 200 }
      : opts.forceCaptureSuccess
        ? { ...female, status: 'CheckedIn' as const, constitution: -1 }
        : { ...female, status: 'CheckedIn' as const }

    useGameStore.setState({ guests: [maleIn, femaleIn] })
    s = useGameStore.getState()

    console.log(`\n=== ${label} ===`)
    console.log({ day: s.day, timePhase: s.timePhase, ap: s.resources.ap, gold: s.resources.gold })

    const apBeforeInvestigate = s.resources.ap
    s.investigate(s.guests[0].id)
    s = useGameStore.getState()
    console.log({ step: 'investigate', apDelta: apBeforeInvestigate - s.resources.ap })

    s.nextPhase()
    s.nextPhase()
    s = useGameStore.getState()
    console.log({ step: 'toNight', timePhase: s.timePhase })

    const femaleId = s.guests.find((g) => g.gender === 'Female')?.id
    const apBeforeCapture = s.resources.ap
    const captureRes = femaleId ? s.capture(femaleId, 'alchemy') : 'failure'
    s = useGameStore.getState()
    console.log({
      step: 'capture',
      captureRes,
      apDelta: apBeforeCapture - s.resources.ap,
      assets: s.assets.length,
      alertLevel: s.resources.alertLevel,
      guestsRemaining: s.guests.length,
    })

    const maleId = s.guests.find((g) => g.gender === 'Male')?.id
    if (s.assets.length > 0 && maleId) {
      const assetId = s.assets[0].id
      const apBeforeTrain = s.resources.ap
      s.trainAsset(assetId)
      s = useGameStore.getState()
      console.log({ step: 'train', apDelta: apBeforeTrain - s.resources.ap })

      s.assignService(maleId, assetId)
      s.nextPhase()
      s = useGameStore.getState()
      console.log({ step: 'toLateNight', timePhase: s.timePhase })

      const goldBefore = s.resources.gold
      s.nextPhase()
      s = useGameStore.getState()
      console.log({
        step: 'settlement',
        day: s.day,
        timePhase: s.timePhase,
        ap: s.resources.ap,
        goldDelta: s.resources.gold - goldBefore,
        roomIncome: s.latestReport?.roomIncome,
        serviceIncome: s.latestReport?.serviceIncome,
        netProfit: s.latestReport?.netProfit,
        bankruptGuests: s.latestReport?.bankruptGuests,
        guestsAfter: s.guests.length,
      })
    } else {
      // Still test settlement for bankruptcy removal
      s.nextPhase() // Night -> LateNight
      const goldBefore = s.resources.gold
      s.nextPhase() // LateNight -> Morning (settlement)
      s = useGameStore.getState()
      console.log({
        step: 'settlement_no_asset',
        day: s.day,
        goldDelta: s.resources.gold - goldBefore,
        bankruptGuests: s.latestReport?.bankruptGuests,
        guestsAfter: s.guests.length,
        alertLevel: s.resources.alertLevel,
      })
    }
  }

  runScenario('Scenario A: 捕获成功 + 服务结算', { seed: 20260410, forceCaptureSuccess: true })
  runScenario('Scenario B: 强制捕获失败 + 破产驱逐', { seed: 20260411, forceCaptureFail: true, maleWealth: 5 })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
