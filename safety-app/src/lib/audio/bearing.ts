/** Maps a compass bearing (0 = front, clockwise) to a StereoPannerNode
 *  pan value (-1 = hard left, +1 = hard right). Front and rear both
 *  read as centered - this is a two-ear "which side" demo, not a full
 *  front/back HRTF spatializer, so front/rear ambiguity is expected
 *  and matches what bone conduction can and can't convey. */
export function bearingToPan(bearing: number): number {
  return Math.sin((bearing * Math.PI) / 180);
}
