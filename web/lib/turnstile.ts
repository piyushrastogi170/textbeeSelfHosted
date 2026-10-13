import { type RefObject, useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback?: (token: string) => void
          'error-callback'?: () => void
          'expired-callback'?: () => void
        },
      ) => string
      reset: (widgetId?: string) => void
    }
  }
}

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script'
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

let loadTurnstilePromise: Promise<void> | null = null

const createLoadPromise = () =>
  new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = TURNSTILE_SCRIPT_ID
    script.src = TURNSTILE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Turnstile script'))
    document.body.appendChild(script)
  })

const ensureTurnstileScript = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Turnstile unavailable on server'))
  }
  if (window.turnstile) {
    return Promise.resolve()
  }
  if (loadTurnstilePromise) {
    return loadTurnstilePromise
  }

  const existing = document.getElementById(TURNSTILE_SCRIPT_ID)
  if (existing) {
    const scriptEl = existing as HTMLScriptElement
    loadTurnstilePromise = new Promise<void>((resolve) => {
      scriptEl.addEventListener('load', () => resolve(), { once: true })
      const readyStates = ['loaded', 'complete']
      const state = (scriptEl as any).readyState as string | undefined
      if (state && readyStates.includes(state)) {
        resolve()
      }
    })
    return loadTurnstilePromise
  }

  loadTurnstilePromise = createLoadPromise()
  return loadTurnstilePromise
}

type UseTurnstileOptions = {
  siteKey?: string
  onToken?: (token: string) => void
  onError?: (message: string) => void
  onExpire?: (message: string) => void
}

type UseTurnstileResult = {
  // Nullable: useRef starts at null and only holds the node once mounted.
  containerRef: RefObject<HTMLDivElement | null>
  token: string
  error: string | null
  isReady: boolean
}

export const useTurnstile = ({
  siteKey,
  onToken,
  onError,
  onExpire,
}: UseTurnstileOptions): UseTurnstileResult => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [token, setToken] = useState('self-hosted-bypass-token')
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(true)

  useEffect(() => {
    onToken?.('self-hosted-bypass-token')
  }, [onToken])

  return {
    containerRef,
    token: 'self-hosted-bypass-token',
    error: null,
    isReady: true,
  }
}
