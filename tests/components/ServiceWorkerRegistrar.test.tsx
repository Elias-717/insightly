import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';

function stubServiceWorker() {
  const register = vi.fn().mockResolvedValue({});
  Object.defineProperty(navigator, 'serviceWorker', {
    value: { register },
    configurable: true,
  });
  return register;
}

describe('ServiceWorkerRegistrar', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    Reflect.deleteProperty(navigator, 'serviceWorker');
  });

  it('registers /sw.js in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const register = stubServiceWorker();
    render(<ServiceWorkerRegistrar />);
    expect(register).toHaveBeenCalledWith('/sw.js');
  });

  it('does nothing outside production', () => {
    const register = stubServiceWorker();
    render(<ServiceWorkerRegistrar />);
    expect(register).not.toHaveBeenCalled();
  });

  it('does nothing when the browser has no service worker support', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => render(<ServiceWorkerRegistrar />)).not.toThrow();
  });
});
