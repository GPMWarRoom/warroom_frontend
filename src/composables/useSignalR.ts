
import { ref, onUnmounted, computed  } from 'vue'
import * as signalR from '@microsoft/signalr'

const connection = ref<signalR.HubConnection | null>(null)
const config = ref<{ API_URL?: string }>({})

async function loadConfig() {
  if (Object.keys(config.value).length) return config.value
  const res = await fetch('/config.json')
  config.value = await res.json()
  return config.value
}

export function useSignalR() {
  // 開始連線
  async function startConnection() {
    if (connection.value) return

    const cfg = await loadConfig()
    const apiUrl = cfg.API_URL
    if (!apiUrl) throw new Error('No API_URL in config.json')

    connection.value = new signalR.HubConnectionBuilder()
      .withUrl(apiUrl, {
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()

    connection.value.onreconnected(() => {
      console.log('🔁 Reconnected')
    })

    await connection.value.start()
    console.log('🚀 SignalR Connected')
  }

  // 註冊事件
  function on(eventName: string, callback: (...args: any[]) => void) {
    connection.value?.on(eventName, callback)
  }

  // 解除事件註冊
  function off(eventName: string, callback?: (...args: any[]) => void) {
    if (callback) {
      connection.value?.off(eventName, callback)
    } else {
      connection.value?.off(eventName)
    }
  }

  // 停止連線
  async function stopConnection() {
    if (connection.value) {
      await connection.value.stop()
      connection.value = null
      console.log('🛑 SignalR Disconnected')
    }
  }

  // // optional: auto disconnect on unmount
  // onUnmounted(() => {
  //   stopConnection()
  // })

  const isConnected = computed(() => 
    connection.value?.state === signalR.HubConnectionState.Connected
  )

  return {
    connection, // 直接暴露 connection 讓使用者可以自由使用
    startConnection,
    stopConnection,
    on,
    off,
    isConnected
  }
}
            
