import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

// useSyncExternalStore, not a lazy useState initializer reading `window`:
// that made the first client render on a phone disagree with the server
// render (desktop sidebar vs mobile sheet), so every /owner page threw a
// hydration error on phones and React re-built the tree from scratch. With
// getServerSnapshot, hydration uses `false` and React re-renders with the real
// value right after. The desktop sidebar is CSS-hidden below md, so there's
// no visible flash.
export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  )
}
