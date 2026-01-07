import { waterStressZones } from "../data/waterStressZones";
import { getDistanceKm } from "./geoUtils";

export function detectWaterStress(industryLocation) {
  for (const zone of waterStressZones) {
    const distance = getDistanceKm(
      industryLocation.lat,
      industryLocation.lng,
      zone.lat,
      zone.lng
    );

    if (distance <= zone.radiusKm) {
      return {
        level: zone.stressLevel,
        region: zone.region
      };
    }
  }

  return { level: "LOW", region: "Safe Zone" };
}
