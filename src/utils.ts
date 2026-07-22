/**
 * Resolves relative API paths to absolute URLs when running inside native WebView/Capacitor environment.
 */
export function getApiUrl(path: string): string {
  if (!path) return '';
  
  // If the path already has http or https, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Fallback to the active development cloud server of this specific workspace
  const defaultBackend = 'https://ais-dev-4xuxrlpowzv4l2utwp2m7n-392082030555.us-west1.run.app';

  // If we are in the browser, check if it's a real web app or a mobile webview
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const ua = window.navigator.userAgent || '';
    
    const isNative = protocol === 'capacitor:' || protocol === 'file:';
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    // If we are on a mobile device/webview, localhost is likely a local webview assets server
    const isMobileOrWebView = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|wv|WebView/i.test(ua);
    
    const treatAsNative = isNative || (isLocalhost && isMobileOrWebView);

    if (!treatAsNative) {
      // It's a real web app running on a server (production, local, or dev server on PC)
      // Save current origin as the latest working backend URL ONLY if it's not localhost
      if (!isLocalhost) {
        try {
          localStorage.setItem('pashto_novel_backend_url', window.location.origin);
        } catch (e) {
          // ignore
        }
      }
      return `${window.location.origin}${cleanPath}`;
    }
  }

  // Native / WebView context
  let savedUrl = '';
  try {
    savedUrl = localStorage.getItem('pashto_novel_backend_url') || '';
  } catch (e) {
    // ignore
  }

  // If savedUrl contains localhost, 127.0.0.1, or old ais-pre URL, clear it so it resets to the active server
  if (savedUrl && (savedUrl.includes('localhost') || savedUrl.includes('127.0.0.1') || savedUrl.includes('ais-pre-'))) {
    try {
      localStorage.removeItem('pashto_novel_backend_url');
    } catch (e) {
      // ignore
    }
    savedUrl = '';
  }

  if (savedUrl && (savedUrl.startsWith('http://') || savedUrl.startsWith('https://'))) {
    return `${savedUrl}${cleanPath}`;
  }

  return `${defaultBackend}${cleanPath}`;
}
