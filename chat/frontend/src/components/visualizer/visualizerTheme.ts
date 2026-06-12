export const VISUALIZER_COLORS = {
  bg: '#060810',
  accent: '#5b8cff',
  accentBright: '#9ec5ff',
  teal: '#2dd4a8',
  tealBright: '#7dffd4',
  gold: '#ffd166',
  goldBright: '#ffe8a8',
  goldDeep: '#c9922e',
  core: '#ffffff',
  ringCool: '#b8d4ff',
  ringWarm: '#ffcc66',
  line: '#6ecfff',
  particle: '#fff4d6',
} as const

export const MODE_INTENSITY = {
  idle: 0.2,
  thinking: 0.55,
  streaming: 0.88,
  building: 0.78,
  celebrating: 1,
} as const

export const MODE_LABELS = {
  idle: 'Idle',
  thinking: 'Thinking',
  streaming: 'Streaming',
  building: 'Building',
  celebrating: 'Unlocked',
} as const
