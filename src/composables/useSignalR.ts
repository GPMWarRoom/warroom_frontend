
import { ref, onUnmounted, computed  } from 'vue'
import * as signalR from '@microsoft/signalr'

const connection = ref<signalR.HubConnection | null>(null)

export function useSignalR() {
  // 開始連線
  async function startConnection() {
    if (connection.value) return

    connection.value = new signalR.HubConnectionBuilder()
      .withUrl(import.meta.env.VITE_POSTGRES_CONNECTION_STRING, {
        transport: signalR.HttpTransportType.WebSockets, // 強制使用 WebSocket
        skipNegotiation: true,  // 跳過協商過程
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
  function off(eventName: string) {
    connection.value?.off(eventName)
  }

  // 停止連線
  async function stopConnection() {
    if (connection.value) {
      await connection.value.stop()
      connection.value = null
      console.log('🛑 SignalR Disconnected')
    }
  }

  // optional: auto disconnect on unmount
  onUnmounted(() => {
    stopConnection()
  })

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
            
