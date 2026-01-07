import { GoogleMap, Marker, Circle } from "@react-google-maps/api";

export default function WaterStressMap({ location, stress }) {
  return (
    <GoogleMap
      zoom={8}
      center={{ lat: location.lat, lng: location.lng }}
      mapContainerClassName="h-[350px] w-full rounded-xl"
    >
      <Marker position={location} />

      <Circle
        center={location}
        radius={stress.level === "HIGH" ? 100000 : 50000}
        options={{
          fillColor:
            stress.level === "HIGH"
              ? "#ef4444"
              : stress.level === "MEDIUM"
              ? "#f59e0b"
              : "#22c55e",
          fillOpacity: 0.25,
          strokeWidth: 0
        }}
      />
    </GoogleMap>
  );
}
