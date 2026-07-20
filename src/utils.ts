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

  // If we are in the browser, always default to relative paths or the current origin
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const isNative = protocol === 'capacitor:' || protocol === 'file:';
    
    if (!isNative) {
      // It's a real web app running on a server (production, local, or dev server)
      try {
        localStorage.setItem('pashto_novel_backend_url', window.location.origin);
      } catch (e) {
        // ignore
      }
      return `${window.location.origin}${cleanPath}`;
    }
  }

  // Native / Capacitor context
  let savedUrl = '';
  try {
    savedUrl = localStorage.getItem('pashto_novel_backend_url') || '';
  } catch (e) {
    // ignore
  }

  if (savedUrl && (savedUrl.startsWith('http://') || savedUrl.startsWith('https://'))) {
    return `${savedUrl}${cleanPath}`;
  }

  // Fallback to the production deployed URL of this specific workspace
  const defaultBackend = 'https://ais-pre-4xuxrlpowzv4l2utwp2m7n-392082030555.us-west1.run.app';
  return `${defaultBackend}${cleanPath}`;
}
