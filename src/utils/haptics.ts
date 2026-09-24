/**
 * Haptic feedback utility
 */

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light', enabled = true) {
  if (!enabled || typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(15);
        break;
      case 'medium':
        navigator.vibrate(30);
        break;
      case 'heavy':
        navigator.vibrate(60);
        break;
      case 'success':
        navigator.vibrate([20, 40, 25, 40, 35]);
        break;
      case 'warning':
        navigator.vibrate([40, 50, 40]);
        break;
    }
  } catch {
    // Ignore devices that block vibrate
  }
}
