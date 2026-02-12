"use client"

import { AU_METERS, LIGHT_YEAR_METERS, SCENE_AU } from "@/lib/astronomy"

const LINEAR_AU = 50
const LOG_SCALE = 1200
const MIN_CAMERA_DISTANCE = 40
const MAX_CAMERA_DISTANCE = 60000
const CAMERA_EXPONENT = 16

export const AU_PER_LY = LIGHT_YEAR_METERS / AU_METERS

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function mapAuToScene(au: number) {
  if (au <= LINEAR_AU) return au * SCENE_AU
  const base = LINEAR_AU * SCENE_AU
  const log = Math.log10(au) - Math.log10(LINEAR_AU)
  return base + log * LOG_SCALE
}

export function mapLyToScene(ly: number) {
  return mapAuToScene(ly * AU_PER_LY)
}

export function mapSignedLyToScene(ly: number) {
  const sign = Math.sign(ly) || 1
  return sign * mapLyToScene(Math.abs(ly))
}

export function mapCameraDistanceToAu(distance: number) {
  const t = clamp((distance - MIN_CAMERA_DISTANCE) / (MAX_CAMERA_DISTANCE - MIN_CAMERA_DISTANCE), 0, 1)
  return Math.pow(10, t * CAMERA_EXPONENT)
}

export const CAMERA_DISTANCE_RANGE = {
  min: MIN_CAMERA_DISTANCE,
  max: MAX_CAMERA_DISTANCE,
}
