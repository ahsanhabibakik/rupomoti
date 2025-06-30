/**
 * Utility to force light mode and remove any dark mode artifacts
 */

export function forceLightMode() {
  if (typeof window === 'undefined') return

  // Clear any stored theme preferences that might enable dark mode
  try {
    localStorage.setItem('main-site-theme', 'light')
    localStorage.removeItem('theme') // Remove any legacy theme storage
    localStorage.removeItem('ui-theme') // Remove any other theme storage keys
  } catch (error) {
    console.warn('Could not access localStorage:', error)
  }

  // Force HTML element to light mode
  const root = document.documentElement
  root.classList.remove('dark')
  root.classList.add('light')
  root.style.colorScheme = 'light'
  root.setAttribute('data-theme', 'light')

  // Remove any dark mode CSS that might have been applied
  const darkModeElements = document.querySelectorAll('.dark, [data-theme="dark"]')
  darkModeElements.forEach(element => {
    if (!element.closest('[data-admin-theme-container]')) {
      element.classList.remove('dark')
      element.removeAttribute('data-theme')
      element.classList.add('light')
      element.setAttribute('data-theme', 'light')
    }
  })

  // Force CSS variables to light mode values
  root.style.setProperty('--background', '28 80% 98%')
  root.style.setProperty('--foreground', '28 34% 21%')
  root.style.setProperty('--card', '28 80% 98%')
  root.style.setProperty('--card-foreground', '28 34% 21%')
  root.style.setProperty('--popover', '28 80% 98%')
  root.style.setProperty('--popover-foreground', '28 34% 21%')

  // Add a style tag to force light mode
  const forceStyleId = 'force-light-mode-override'
  if (!document.getElementById(forceStyleId)) {
    const style = document.createElement('style')
    style.id = forceStyleId
    style.textContent = `
      :root {
        color-scheme: light !important;
      }
      body {
        background-color: hsl(28 80% 98%) !important;
        color: hsl(28 34% 21%) !important;
      }
      .dark {
        color-scheme: light !important;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          color-scheme: light !important;
        }
      }
    `
    document.head.appendChild(style)
  }
}

// Auto-run when this module is imported
if (typeof window !== 'undefined') {
  // Run immediately
  forceLightMode()
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceLightMode)
  }
  
  // Run when page is fully loaded
  window.addEventListener('load', forceLightMode)
}
