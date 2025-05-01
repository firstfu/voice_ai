/**
 * 標籤欄背景組件 (非iOS平台)
 *
 * 為非iOS平台提供標籤欄背景功能，特點：
 * - 作為iOS專用標籤欄組件的替代實現
 * - 在Web和Android平台上提供空實現
 * - 確保跨平台一致的API接口
 */

// This is a shim for web and Android where the tab bar is generally opaque.
export default undefined;

export function useBottomTabOverflow() {
  return 0;
}
