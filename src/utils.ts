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

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const isNative = protocol === 'capacitor:' || protocol === 'file:';
    
    // Check if user set a custom backend URL in settings
    let savedUrl = '';
    try {
      savedUrl = localStorage.getItem('pashto_novel_backend_url') || '';
    } catch (e) {
      // ignore
    }

    if (savedUrl && (savedUrl.startsWith('http://') || savedUrl.startsWith('https://'))) {
      return `${savedUrl.replace(/\/$/, '')}${cleanPath}`;
    }

    if (!isNative) {
      // Standard web app - always use relative path directly
      return cleanPath;
    }
  }

  // Native / WebView fallback default
  const defaultBackend = 'https://ais-dev-4xuxrlpowzv4l2utwp2m7n-392082030555.us-west1.run.app';
  return `${defaultBackend}${cleanPath}`;
}
