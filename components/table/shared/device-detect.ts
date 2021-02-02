const ua = navigator.userAgent;

export function isFirefox() {
  return ua.toLowerCase().includes('firefox');
}

export function inWindows() {
  return ua.toLowerCase().includes('windows');
}

export function isChrome() {
  return ua.toLowerCase().includes('chrome');
}
