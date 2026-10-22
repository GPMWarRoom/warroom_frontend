import { ref, watch, type Ref } from 'vue'

// 畫面狀態存在 sessionStorage：頁面自動重新整理後能回到原本的場域與頁籤，
// 且每個瀏覽器分頁各自獨立，戰情室多個螢幕分別看不同場域時不會互相覆蓋
const PREFIX = 'warroom:'

export function readSession<T>(key: string, isValid: (value: unknown) => boolean = () => true): T | undefined {
  try {
    const raw = sessionStorage.getItem(PREFIX + key)
    if (raw === null) return undefined
    const value = JSON.parse(raw)
    return isValid(value) ? (value as T) : undefined
  } catch {
    return undefined
  }
}

export function writeSession(key: string, value: unknown) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // sessionStorage 無法使用時略過，不影響操作
  }
}

/** 與 ref 相同，但值會保存在 sessionStorage，重新整理後還原 */
export function useSessionRef<T>(key: string, fallback: T, isValid?: (value: unknown) => boolean): Ref<T> {
  const state = ref(readSession<T>(key, isValid) ?? fallback) as Ref<T>
  watch(state, value => writeSession(key, value))
  return state
}

export const isOneOf = <T>(options: readonly T[]) => (value: unknown) => options.includes(value as T)
