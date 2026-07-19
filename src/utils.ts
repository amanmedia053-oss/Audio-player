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

  // Check if we are running in a standard web browser (not capacitor:// and not file://)
  const isWeb = typeof window !== 'undefined' && 
                window.location.protocol !== 'capacitor:' && 
                window.location.protocol !== 'file:' && 
                !window.location.hostname.includes('localhost');

  if (isWeb) {
    // Save current origin as the latest working backend url
    try {
      localStorage.setItem('pashto_novel_backend_url', window.location.origin);
    } catch (e) {
      // ignore
    }
    return `${window.location.origin}${cleanPath}`;
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
