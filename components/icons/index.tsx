import { SVGProps } from 'react';

export const Icons = {
  Email: {
    classic: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="20" height="16" x="2" y="4" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
    modern: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/>
        <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/>
      </svg>
    ),
  },
  SMS: {
    classic: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    modern: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M4 4h16v12H5.17L4 17.17V4m0-2c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H4zm2 10h12v2H6v-2zm0-3h12v2H6V9zm0-3h12v2H6V6z"/>
      </svg>
    ),
  },
  Wallet: {
    classic: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4h2v5h-2zm0 0v5h-2v4H5a2 2 0 0 1 0-4h14v-5h2z"/>
      </svg>
    ),
    modern: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M21 7.5V6a3 3 0 00-3-3H6a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3v-1.5M21 7.5H3m18 0v9M3 7.5v9m18-9c0 .828-.672 1.5-1.5 1.5h-1c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5h1c.828 0 1.5.672 1.5 1.5z"/>
      </svg>
    ),
  },
  Google: {
    classic: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    modern: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
  Apple: {
    classic: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.53-3.2 0-1.39.68-2.12.57-3-.03C3.77 17.32 4.74 11.05 8.5 10.8c1.19-.08 2.06.43 2.83.46.76.03 1.48-.47 2.81-.51 1.76-.05 3.1.73 3.96 1.92-3.47 1.89-2.91 6.85.95 7.61zm-3.21-15.5c-.06 2.43 2.16 4.42 4.41 4.17-.37-2.5-2.6-4.33-4.41-4.17z"/>
      </svg>
    ),
    modern: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.53-3.2 0-1.39.68-2.12.57-3-.03C3.77 17.32 4.74 11.05 8.5 10.8c1.19-.08 2.06.43 2.83.46.76.03 1.48-.47 2.81-.51 1.76-.05 3.1.73 3.96 1.92-3.47 1.89-2.91 6.85.95 7.61zm-3.21-15.5c-.06 2.43 2.16 4.42 4.41 4.17-.37-2.5-2.6-4.33-4.41-4.17z"/>
      </svg>
    ),
  },
  Twitter: {
    classic: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0016.5 3c-2.5 0-4.5 2-4.5 4.5v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
      </svg>
    ),
    modern: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0016.5 3c-2.5 0-4.5 2-4.5 4.5v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
      </svg>
    ),
  },
  Discord: {
    classic: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20.82 4.18A16.88 16.88 0 0016.36 3a11.75 11.75 0 00-8.72 0A16.88 16.88 0 003.18 4.18 16.88 16.88 0 002 8.64a11.75 11.75 0 000 8.72 16.88 16.88 0 001.18 4.46 16.88 16.88 0 004.46 1.18 11.75 11.75 0 008.72 0 16.88 16.88 0 004.46-1.18 16.88 16.88 0 001.18-4.46 11.75 11.75 0 000-8.72 16.88 16.88 0 00-1.18-4.46zM9.5 15.5a1.5 1.5 0 11-1.5-1.5 1.5 1.5 0 011.5 1.5zm5 0a1.5 1.5 0 11-1.5-1.5 1.5 1.5 0 011.5 1.5z" />
      </svg>
    ),
    modern: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M20.82 4.18A16.88 16.88 0 0016.36 3a11.75 11.75 0 00-8.72 0A16.88 16.88 0 003.18 4.18 16.88 16.88 0 002 8.64a11.75 11.75 0 000 8.72 16.88 16.88 0 001.18 4.46 16.88 16.88 0 004.46 1.18 11.75 11.75 0 008.72 0 16.88 16.88 0 004.46-1.18 16.88 16.88 0 001.18-4.46 11.75 11.75 0 000-8.72 16.88 16.88 0 00-1.18-4.46zM9.5 15.5a1.5 1.5 0 11-1.5-1.5 1.5 1.5 0 011.5 1.5zm5 0a1.5 1.5 0 11-1.5-1.5 1.5 1.5 0 011.5 1.5z" />
      </svg>
    ),
  },
  GitHub: {
    classic: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 19c-4.5 1.5-4.5-2.5-6-3m12 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0018 4.77 5.07 5.07 0 0017.91 1S16.73.65 14 2.48a13.38 13.38 0 00-5 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77 5.44 5.44 0 003.5 9.5c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 00-.94 2.61V22" />
      </svg>
    ),
    modern: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M9 19c-4.5 1.5-4.5-2.5-6-3m12 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0018 4.77 5.07 5.07 0 0017.91 1S16.73.65 14 2.48a13.38 13.38 0 00-5 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77 5.44 5.44 0 003.5 9.5c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 00-.94 2.61V22" />
      </svg>
    ),
  },
  LinkedIn: {
    classic: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
    modern: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  Spotify: {
    classic: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 3a9 9 0 100 18 9 9 0 000-18zm3.29 13.29a.75.75 0 01-1.05.22 8.47 8.47 0 00-4.48-1.2 8.47 8.47 0 00-4.48 1.2.75.75 0 11-.83-1.27 9.97 9.97 0 015.31-1.43 9.97 9.97 0 015.31 1.43.75.75 0 01.22 1.05zm1.5-3.5a.75.75 0 01-1.05.22 11.47 11.47 0 00-5.74-1.54 11.47 11.47 0 00-5.74 1.54.75.75 0 11-.83-1.27 12.97 12.97 0 016.57-1.76 12.97 12.97 0 016.57 1.76.75.75 0 01.22 1.05zm1.5-3.5a.75.75 0 01-1.05.22 14.47 14.47 0 00-7-1.76 14.47 14.47 0 00-7 1.76.75.75 0 11-.83-1.27 15.97 15.97 0 018.33-2.1 15.97 15.97 0 018.33 2.1.75.75 0 01.22 1.05z" />
      </svg>
    ),
    modern: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 3a9 9 0 100 18 9 9 0 000-18zm3.29 13.29a.75.75 0 01-1.05.22 8.47 8.47 0 00-4.48-1.2 8.47 8.47 0 00-4.48 1.2.75.75 0 11-.83-1.27 9.97 9.97 0 015.31-1.43 9.97 9.97 0 015.31 1.43.75.75 0 01.22 1.05zm1.5-3.5a.75.75 0 01-1.05.22 11.47 11.47 0 00-5.74-1.54 11.47 11.47 0 00-5.74 1.54.75.75 0 11-.83-1.27 12.97 12.97 0 016.57-1.76 12.97 12.97 0 016.57 1.76.75.75 0 01.22 1.05zm1.5-3.5a.75.75 0 01-1.05.22 14.47 14.47 0 00-7-1.76 14.47 14.47 0 00-7 1.76.75.75 0 11-.83-1.27 15.97 15.97 0 018.33-2.1 15.97 15.97 0 018.33 2.1.75.75 0 01.22 1.05z" />
      </svg>
    ),
  },
  Instagram: {
    classic: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37a4 4 0 11-1.37-2.87 4 4 0 011.37 2.87z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
    modern: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37a4 4 0 11-1.37-2.87 4 4 0 011.37 2.87z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  Telegram: {
    classic: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 3L9 13" />
        <path d="M21 3l-7 19-4-9-9-4z" />
      </svg>
    ),
    modern: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M21 3L9 13" />
        <path d="M21 3l-7 19-4-9-9-4z" />
      </svg>
    ),
  },
  TikTok: {
    classic: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 3v12a4 4 0 104-4h-1" />
        <path d="M12 3a4 4 0 004 4h4" />
      </svg>
    ),
    modern: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M9 3v12a4 4 0 104-4h-1" />
        <path d="M12 3a4 4 0 004 4h4" />
      </svg>
    ),
  },
  Farcaster: {
    classic: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    modern: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  // Add other icons...
} as const; 