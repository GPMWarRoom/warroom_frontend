/**
 * 創建一個防抖函數
 * @param fn 需要防抖的函數
 * @param delay 延遲時間（毫秒）
 * @returns 防抖後的函數
 */
export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 300
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function (this: any, ...args: Parameters<T>) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            fn.apply(this, args);
            timeoutId = null;
        }, delay);
    };
}

/**
 * 使用範例:
 * 
 * import { debounce } from '@/utils/debounce';
 * 
 * const debouncedFunction = debounce(() => {
 *     // 你的程式碼
 * }, 300);
 * 
 * // 或者用於事件監聽
 * window.addEventListener('resize', debounce(() => {
 *     // 處理 resize
 * }, 300));
 */ 