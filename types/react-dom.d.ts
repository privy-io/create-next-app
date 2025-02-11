declare module 'react-dom/client' {
  import { Container } from 'react-dom';
  
  export function createRoot(
    container: Element | DocumentFragment,
    options?: { hydrate?: boolean }
  ): {
    render(children: React.ReactNode): void;
    unmount(): void;
  };
} 