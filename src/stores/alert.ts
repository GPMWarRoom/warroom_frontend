import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlarmStore = defineStore('alarm', () => {
  const isAlarmPlaying = ref(false)
  // 永久靜音狀態：預設靜音，使用者選「正常」後記在 localStorage（頁面每 10 分鐘會自動重整）
  const isMuted = ref(typeof localStorage === 'undefined' || localStorage.getItem('agvc-alarm-muted') !== 'false')
  const alarmAudio = new Audio('/alarm_triple_beep.wav') // 原音檔 /alarm.wav 保留

  const playAlarm = () => {
    isAlarmPlaying.value = true
    if (isMuted.value) return
    alarmAudio.loop = true
    alarmAudio.play()
  }

  const stopAlarm = () => {
    alarmAudio.pause()
    alarmAudio.currentTime = 0
    isAlarmPlaying.value = false
  }

  const muteAlarm = () => {
    isMuted.value = true
    localStorage.setItem('agvc-alarm-muted', 'true')
    stopAlarm()
  }

  const unmuteAlarm = () => {
    isMuted.value = false
    localStorage.setItem('agvc-alarm-muted', 'false')
  }

  return { isAlarmPlaying, playAlarm, stopAlarm, isMuted, muteAlarm, unmuteAlarm }
})