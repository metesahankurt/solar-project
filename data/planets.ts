// Solar System Data Layer
// Scientific values based on NASA Planetary Fact Sheet
// Units: SI (Meters, Kilograms, Seconds) unless otherwise stated

export const CONSTANTS = {
  G: 6.67430e-11, // m^3 kg^-1 s^-2
  SOLAR_MASS: 1.989e30, // kg
  SPEED_OF_LIGHT: 299792458, // m/s
  AU: 149.6e9, // m (Astronomical Unit)
};

export interface Planet {
  name: string;
  mass: number; // kg
  radius: number; // km (for visualization scale mostly, though simulation uses m)
  radiusMeters: number; // m
  semiMajorAxis: number; // m
  orbitalPeriod: number; // s
  eccentricity: number;
  color: string;
  description?: string;
  texture?: string;
}

export const planets: Planet[] = [
  {
    name: "Mercury",
    mass: 0.330e24,
    radius: 2439.7,
    radiusMeters: 2439700,
    semiMajorAxis: 57.9e9,
    orbitalPeriod: 88 * 24 * 60 * 60, // ~88 days
    eccentricity: 0.205,
    color: "#A5A5A5",
    description: "The smallest planet in our solar system and closest to the Sun."
  },
  {
    name: "Venus",
    mass: 4.87e24,
    radius: 6051.8,
    radiusMeters: 6051800,
    semiMajorAxis: 108.2e9,
    orbitalPeriod: 224.7 * 24 * 60 * 60,
    eccentricity: 0.007,
    color: "#E3BB76",
    description: "Spinning in the opposite direction to most planets, Venus is the hottest planet."
  },
  {
    name: "Earth",
    mass: 5.97e24,
    radius: 6371,
    radiusMeters: 6371000,
    semiMajorAxis: 149.6e9,
    orbitalPeriod: 365.2 * 24 * 60 * 60,
    eccentricity: 0.017,
    color: "#22A6B3",
    description: "Our home planet is the only place we know of so far that's inhabited by living things."
  },
  {
    name: "Mars",
    mass: 0.642e24,
    radius: 3389.5,
    radiusMeters: 3389500,
    semiMajorAxis: 227.9e9,
    orbitalPeriod: 687 * 24 * 60 * 60,
    eccentricity: 0.094,
    color: "#EB4D4B",
    description: "Mars is a dusty, cold, desert world with a very thin atmosphere."
  },
  {
    name: "Jupiter",
    mass: 1898e24,
    radius: 69911,
    radiusMeters: 69911000,
    semiMajorAxis: 778.6e9,
    orbitalPeriod: 4331 * 24 * 60 * 60, // ~11.8 years
    eccentricity: 0.049,
    color: "#F9CA24",
    description: "Jupiter is more than twice as massive as the other planets of our solar system combined."
  },
  {
    name: "Saturn",
    mass: 568e24,
    radius: 58232,
    radiusMeters: 58232000,
    semiMajorAxis: 1433.5e9,
    orbitalPeriod: 10747 * 24 * 60 * 60, // ~29.4 years
    eccentricity: 0.057,
    color: "#F0932B",
    description: "Adorned with a dazzling, complex system of icy rings, Saturn is unique in our solar system."
  },
  {
    name: "Uranus",
    mass: 86.8e24,
    radius: 25362,
    radiusMeters: 25362000,
    semiMajorAxis: 2872.5e9,
    orbitalPeriod: 30589 * 24 * 60 * 60, // ~84 years
    eccentricity: 0.046,
    color: "#7ED6DF",
    description: "Uranus rotates at a nearly 90-degree angle from the plane of its orbit."
  },
  {
    name: "Neptune",
    mass: 102e24,
    radius: 24622,
    radiusMeters: 24622000,
    semiMajorAxis: 4495.1e9,
    orbitalPeriod: 59800 * 24 * 60 * 60, // ~165 years
    eccentricity: 0.011,
    color: "#4834D4",
    description: "Neptune is dark, cold and whipped by supersonic winds."
  }
];

export const sun = {
  name: "Sun",
  mass: CONSTANTS.SOLAR_MASS,
  radius: 696340,
  radiusMeters: 696340000,
  semiMajorAxis: 0,
  orbitalPeriod: 0,
  eccentricity: 0,
  color: "#F1C40F",
  description: "The star at the center of our Solar System."
};
