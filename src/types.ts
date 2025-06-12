export interface Location {
  x: number;
  y: number;
  z: number;
}

export type WorldRegion = Omit<Location, 'z'>;