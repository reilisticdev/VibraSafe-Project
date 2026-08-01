import type { PatternFactory, PatternId } from "../types";
import { createSiren } from "./siren";
import { createSmokeAlarm } from "./smokeAlarm";
import { createVehicleApproach } from "./vehicleApproach";
import { createSosConfirm } from "./sosConfirm";

export const patternRegistry: Record<PatternId, PatternFactory> = {
  siren: createSiren,
  smokeAlarm: createSmokeAlarm,
  vehicleApproach: createVehicleApproach,
  sosConfirm: createSosConfirm,
};
