import { AU, YEAR_SECONDS } from '@/utils/constants';

export interface Planet {
  id: string;
  name: string;
  color: string;
  mass: number;         // kg
  radius: number;       // m
  semiMajorAxis: number;// m
  orbitalPeriod: number;// s
  eccentricity: number; // 0 to 1
  rotationPeriod: number;// s (sidereal rotation period)
  description: string;
}

export const planets: Planet[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#A5A5A5', // Grey
    mass: 3.3011e23,
    radius: 2.4397e6,
    semiMajorAxis: 0.387098 * AU,
    orbitalPeriod: 0.240846 * YEAR_SECONDS,
    eccentricity: 0.2056,
    rotationPeriod: 58.6 * 24 * 3600,
    description: 'The smallest planet in our solar system and closest to the Sun.',
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#E3BB76', // Yellowish-white
    mass: 4.8675e24,
    radius: 6.0518e6,
    semiMajorAxis: 0.723332 * AU,
    orbitalPeriod: 0.615198 * YEAR_SECONDS,
    eccentricity: 0.0067,
    rotationPeriod: -243 * 24 * 3600, // Retrograde
    description: 'Spinning in the opposite direction to most planets, Venus is the hottest planet.',
  },
  {
    id: 'earth',
    name: 'Earth',
    color: '#22A6B3', // Blue-Green
    mass: 5.972e24,
    radius: 6.371e6,
    semiMajorAxis: 1.000000 * AU,
    orbitalPeriod: 1.000017 * YEAR_SECONDS,
    eccentricity: 0.0167,
    rotationPeriod: 23.9 * 3600,
    description: 'Our home planet is the only place we know of so far that’s inhabited by living things.',
  },
  {
    id: 'mars',
    name: 'Mars',
    color: '#EB4D4B', // Red
    mass: 6.4171e23,
    radius: 3.3895e6,
    semiMajorAxis: 1.523679 * AU,
    orbitalPeriod: 1.8808 * YEAR_SECONDS,
    eccentricity: 0.0934,
    rotationPeriod: 24.6 * 3600,
    description: 'Mars is a dusty, cold, desert world with a very thin atmosphere.',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#F9CA24', // Orange-Yellow stripes (simplified)
    mass: 1.8982e27,
    radius: 6.9911e7,
    semiMajorAxis: 5.204267 * AU,
    orbitalPeriod: 11.8618 * YEAR_SECONDS,
    eccentricity: 0.0489,
    rotationPeriod: 9.9 * 3600,
    description: 'Jupiter is more than twice as massive as the other planets of our solar system combined.',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#F0DFAF', // Pale Gold
    mass: 5.6834e26,
    radius: 5.8232e7,
    semiMajorAxis: 9.582017 * AU,
    orbitalPeriod: 29.4571 * YEAR_SECONDS,
    eccentricity: 0.0565,
    rotationPeriod: 10.7 * 3600,
    description: 'Adorned with a dazzling, complex system of icy rings, Saturn is unique in our solar system.',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    color: '#7DE3F4', // Cyan
    mass: 8.6810e25,
    radius: 2.5362e7,
    semiMajorAxis: 19.229411 * AU,
    orbitalPeriod: 84.0205 * YEAR_SECONDS,
    eccentricity: 0.0463,
    rotationPeriod: -17.2 * 3600, // Retrograde
    description: 'Uranus rotates at a nearly 90-degree angle from the plane of its orbit.',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    color: '#30336B', // Deep Blue
    mass: 1.0241e26,
    radius: 2.4622e7,
    semiMajorAxis: 30.103662 * AU,
    orbitalPeriod: 164.8 * YEAR_SECONDS,
    eccentricity: 0.0086,
    rotationPeriod: 16.1 * 3600,
    description: 'Neptune is dark, cold and whipped by supersonic winds.',
  },
];
