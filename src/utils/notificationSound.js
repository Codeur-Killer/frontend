// Petit carillon synthétisé (deux notes) — pas besoin d'un fichier audio à
// embarquer. Les navigateurs bloquent l'audio tant qu'aucune interaction
// utilisateur n'a eu lieu sur la page : on avale l'erreur silencieusement
// dans ce cas plutôt que de faire planter la notification visuelle.
export function playNotificationSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    const ctx = new Ctx()
    const notes = [880, 1100]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = ctx.currentTime + i * 0.16
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.2, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.25)
    })
    setTimeout(() => ctx.close(), 600)
  } catch {
    // Audio indisponible ou bloqué — la notification visuelle suffit.
  }
}
