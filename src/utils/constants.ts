export const CUBE_SIZE = 2
export const CUBE_HALF = CUBE_SIZE / 2
export const CUBE_RADIUS = 0.08

export const COLORS = {
  body: '#2a2a2e',
  facePanel: '#18181c',

  buttonRed: '#ff4757',
  buttonBlue: '#2ed1fc',
  buttonGreen: '#2ed573',
  buttonYellow: '#ffa502',
  buttonPurple: '#a55eea',

  switchOn: '#2ed573',
  switchOff: '#ff4757',
  switchBody: '#3d3d42',

  gearMetal: '#8a8a92',

  ball: '#ff6348',
  ballTrack: '#3d3d42',

  sliderTrack: '#3d3d42',
  sliderThumb: '#2ed1fc',

  joystickBase: '#3d3d42',
  joystickNub: '#555560',

  accent: '#2ed1fc',
} as const

export const CAMERA_POSITION: [number, number, number] = [3, 2.5, 4]
export const CAMERA_FOV = 45
