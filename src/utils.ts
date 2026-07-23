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

  // Public backend cloud server URL for mobile APKs / Capacitor
  const PUBLIC_CLOUD_BACKEND = 'https://ais-pre-4xuxrlpowzv4l2utwp2m7n-392082030555.us-west1.run.app';

  if (typeof window !== 'undefined') {
    // Check if user set a custom backend URL in settings
    try {
      const savedUrl = localStorage.getItem('pashto_novel_backend_url');
      if (savedUrl && (savedUrl.startsWith('http://') || savedUrl.startsWith('https://'))) {
        return `${savedUrl.replace(/\/$/, '')}${cleanPath}`;
      }
    } catch (e) {
      // ignore
    }

    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';

    // Detect Capacitor or native mobile webview environment
    const isCapacitor = !!(window as any).Capacitor || !!(window as any).CapacitorWebFetch;
    const isNativeProtocol = protocol === 'capacitor:' || protocol === 'file:' || protocol === 'ionic:' || protocol === 'content:';
    const isMobileUA = /Android|iPhone|iPad|iPod|wv|WebView|Capacitor/i.test(ua);
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';

    // If running in Capacitor, native mobile webview, or localhost on mobile device:
    if (isCapacitor || isNativeProtocol || (isLocalhost && isMobileUA)) {
      return `${PUBLIC_CLOUD_BACKEND}${cleanPath}`;
    }

    // Standard web app running in browser on a real domain (Cloud Run, preview, etc)
    if (!isLocalhost && !isNativeProtocol) {
      return cleanPath;
    }
  }

  // Native / WebView fallback default
  return `${PUBLIC_CLOUD_BACKEND}${cleanPath}`;
}

