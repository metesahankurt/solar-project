// Solar System Data Layer
// Scientific values based on NASA Planetary Fact Sheet
// Units: SI (Meters, Kilograms, Seconds) unless otherwise stated

import { AU_METERS, SPEED_OF_LIGHT_M_S } from "@/lib/astronomy";

export const CONSTANTS = {
  G: 6.67430e-11, // m^3 kg^-1 s^-2
  SOLAR_MASS: 1.989e30, // kg
  SPEED_OF_LIGHT: SPEED_OF_LIGHT_M_S, // m/s
  AU: AU_METERS, // m (Astronomical Unit)
};

export interface Planet {
  name: string;
  mass: number; // kg
  radius: number; // km (for visualization scale mostly, though simulation uses m)
  radiusMeters: number; // m
  semiMajorAxis: number; // m
  orbitalPeriod: number; // s
  eccentricity: number;
  meanLongitudeDeg: number; // deg at J2000.0 epoch
  color: string;
  description?: string;
  texture?: string;
  parent?: string;
  bodyType?: "planet" | "moon" | "dwarf" | "star";
}

export const planets: Planet[] = [
  {
    name: "Mercury",
    mass: 0.330103e24,
    radius: 2439.4,
    radiusMeters: 2439.4e3,
    semiMajorAxis: 57.9e9,
    orbitalPeriod: 0.2408467 * 365.25 * 24 * 60 * 60,
    eccentricity: 0.205,
    meanLongitudeDeg: 252.25084,
    color: "#A5A5A5",
    description: "The smallest planet in our solar system and closest to the Sun.",
    bodyType: "planet",
  },
  {
    name: "Venus",
    mass: 4.86731e24,
    radius: 6051.8,
    radiusMeters: 6051.8e3,
    semiMajorAxis: 108.2e9,
    orbitalPeriod: 0.61519726 * 365.25 * 24 * 60 * 60,
    eccentricity: 0.007,
    meanLongitudeDeg: 181.97973,
    color: "#E3BB76",
    description: "Spinning in the opposite direction to most planets, Venus is the hottest planet.",
    bodyType: "planet",
  },
  {
    name: "Earth",
    mass: 5.97217e24,
    radius: 6371.0084,
    radiusMeters: 6371.0084e3,
    semiMajorAxis: 149.6e9,
    orbitalPeriod: 1.0000174 * 365.25 * 24 * 60 * 60,
    eccentricity: 0.017,
    meanLongitudeDeg: 100.46435,
    color: "#22A6B3",
    description: "Our home planet is the only place we know of so far that's inhabited by living things.",
    bodyType: "planet",
  },
  {
    name: "Mars",
    mass: 0.641691e24,
    radius: 3389.50,
    radiusMeters: 3389.50e3,
    semiMajorAxis: 227.9e9,
    orbitalPeriod: 1.8808476 * 365.25 * 24 * 60 * 60,
    eccentricity: 0.094,
    meanLongitudeDeg: 355.45332,
    color: "#EB4D4B",
    description: "Mars is a dusty, cold, desert world with a very thin atmosphere.",
    bodyType: "planet",
  },
  {
    name: "Jupiter",
    mass: 1898.125e24,
    radius: 69911,
    radiusMeters: 69911e3,
    semiMajorAxis: 778.6e9,
    orbitalPeriod: 11.862615 * 365.25 * 24 * 60 * 60,
    eccentricity: 0.049,
    meanLongitudeDeg: 34.40438,
    color: "#F9CA24",
    description: "Jupiter is more than twice as massive as the other planets of our solar system combined.",
    bodyType: "planet",
  },
  {
    name: "Saturn",
    mass: 568.317e24,
    radius: 58232,
    radiusMeters: 58232e3,
    semiMajorAxis: 1433.5e9,
    orbitalPeriod: 29.447498 * 365.25 * 24 * 60 * 60,
    eccentricity: 0.057,
    meanLongitudeDeg: 49.94432,
    color: "#F0932B",
    description: "Adorned with a dazzling, complex system of icy rings, Saturn is unique in our solar system.",
    bodyType: "planet",
  },
  {
    name: "Uranus",
    mass: 86.8099e24,
    radius: 25362,
    radiusMeters: 25362e3,
    semiMajorAxis: 2872.5e9,
    orbitalPeriod: 84.016846 * 365.25 * 24 * 60 * 60,
    eccentricity: 0.046,
    meanLongitudeDeg: 313.23218,
    color: "#7ED6DF",
    description: "Uranus rotates at a nearly 90-degree angle from the plane of its orbit.",
    bodyType: "planet",
  },
  {
    name: "Neptune",
    mass: 102.4092e24,
    radius: 24622,
    radiusMeters: 24622e3,
    semiMajorAxis: 4495.1e9,
    orbitalPeriod: 164.79132 * 365.25 * 24 * 60 * 60,
    eccentricity: 0.011,
    meanLongitudeDeg: 304.88003,
    color: "#4834D4",
    description: "Neptune is dark, cold and whipped by supersonic winds.",
    bodyType: "planet",
  }
];

export const dwarfPlanets: Planet[] = [
  {
    name: "Pluto",
    mass: 1.30246e22,
    radius: 1188.3,
    radiusMeters: 1188.3e3,
    semiMajorAxis: 5906.4e9,
    orbitalPeriod: 247.92065 * 365.25 * 24 * 60 * 60,
    eccentricity: 0.249,
    meanLongitudeDeg: 238.929038,
    color: "#b9a89c",
    description: "Pluto is a dwarf planet in the Kuiper belt with a highly eccentric orbit.",
    bodyType: "dwarf",
  }
];

export const moonData: Planet = {
  name: "Moon",
  parent: "Earth",
  bodyType: "moon",
  mass: 7.342e22,
  radius: 1737.4,
  radiusMeters: 1737400,
  semiMajorAxis: 384400000, // m (from Earth)
  orbitalPeriod: 27.321661 * 24 * 60 * 60,
  eccentricity: 0.055,
  meanLongitudeDeg: 0,
  color: "#c9c9c9",
  description: "Earth's natural satellite.",
};

export const sun = {
  name: "Sun",
  bodyType: "star",
  mass: CONSTANTS.SOLAR_MASS,
  radius: 696340,
  radiusMeters: 696340000,
  semiMajorAxis: 0,
  orbitalPeriod: 0,
  eccentricity: 0,
  color: "#F1C40F",
  description: "The star at the center of our Solar System."
};
