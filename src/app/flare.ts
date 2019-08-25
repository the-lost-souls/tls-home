import { SafeStyle } from '@angular/platform-browser';

export class Flare {
  constructor(public position: {x: number, y: number}, public image: string, public size: number, public imageScale: number) { }

  public transform: SafeStyle;
}

