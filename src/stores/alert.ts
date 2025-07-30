import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlarmStore = defineStore('alarm', () => {
  const isAlarmPlaying = ref(false)
  const isMuted = ref(false) // 永久靜音狀態
  const alarmAudio = new Audio('/alarm.wav')

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
    stopAlarm()
  }

  const unmuteAlarm = () => {
    isMuted.value = false
  }

  return { isAlarmPlaying, playAlarm, stopAlarm, isMuted, muteAlarm, unmuteAlarm }
})