/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      animation: {
        blink: 'marker 1.5s steps(3, start) 4s infinite',
        rotate: 'rotate 20s linear infinite',
        rotateReverse: 'rotate 20s linear infinite reverse',
        animevents: 'events 0s linear 0.25s forwards'
      },
      keyframes: {
        marker: {
          'to':{visibility: 'hidden'}
        },
        rotate: {
          'from': {transform: 'rotate(0deg)'},
          'to': {transform: 'rotate(360deg)'}
        },
        events: {
          '0%':{pointerEvents: 'none'},
          '100%':{pointerEvents: 'all'}
        }
      },
      screens: {
        'xsm': '320px',
        'smH': { 'raw': '(min-height: 420px)' },
        'smmH': { 'raw': '(min-height: 520px)' },
        'mdH': { 'raw': '(min-height: 600px)' },
      }
    },
  },
  plugins: [],
}

