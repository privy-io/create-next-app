import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    "name": "Privy Auth Demo",
    "short_name": "Privy Auth Demo",
    "description": "Privy Auth Demo",
    "start_url": "/",
    "display": "standalone",
    "icons": [
      {
        "src": "/favicons/android-chrome-192x192.png", 
        "type": "image/png", 
        "sizes": "192x192"
      },
      {
        "src": "/favicons/android-chrome-512x512.png",
        "type": "image/png", 
        "sizes": "512x512"
      }
    ]
  }
}