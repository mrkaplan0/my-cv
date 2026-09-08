declare module 'vanta/src/vanta.waves.js' {
  export interface WavesOptions {
    el: HTMLElement | string
    THREE?: object
    mouseControls?: boolean
    touchControls?: boolean
    gyroControls?: boolean
    minHeight?: number
    minWidth?: number
    scale?: number
    scaleMobile?: number
    color?: number | string
    shininess?: number
    waveHeight?: number
    waveSpeed?: number
    zoom?: number
  }

  export interface WavesEffect {
    destroy(): void
    resize(): void
    setOptions(options: Partial<WavesOptions>): void
  }

  export default function WAVES(options: WavesOptions): WavesEffect
}
