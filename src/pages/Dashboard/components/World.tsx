import { useEffect, useRef } from "react";
import Globe from "react-globe.gl";
import GlobeImg from "@images/globe.jpg";
import globeData from "./data.json";
import populationData from "./population.json";

export default function World({ size = 0 }: { size: number | undefined }) {
  const globeRef = useRef();

  useEffect(() => {
    if (globeRef.current == null) return;
    // Auto-rotate
    (globeRef.current as any).controls().autoRotate = true;
    (globeRef.current as any).controls().autoRotateSpeed = 1;
    (globeRef.current as any).controls().enableZoom = false;
    (globeRef.current as any).pointOfView({
      lat: 23.5,
      lng: 0,
      altitude: 1.8,
    });

    setTimeout(() => {
      // wait for scene to be populated (asynchronously)
      const directionalLight = (globeRef.current as any)
        .scene()
        .children.find((obj3d: any) => obj3d.type === "DirectionalLight");
      // if (directionalLight) directionalLight.intensity = 0.2; // change light position to see the specularMap's effect
    }, 500);
  }, []);

  return (
    <Globe
      ref={globeRef}
      width={(size || 0) * 1.25}
      height={(size || 0) * 1.25}
      backgroundColor="white"
      globeImageUrl={GlobeImg}
      atmosphereColor="#27272a"
      atmosphereAltitude={0.1}
      hexPolygonsData={globeData.features}
      labelsData={populationData.features}
      labelAltitude={0.002}
      labelLat={(d: any) => d.properties.latitude}
      labelLng={(d: any) => d.properties.longitude}
      labelText={(d: any) => d.properties.name}
      labelSize={(d: any) => Math.sqrt(d.properties.pop_max) * 4e-4}
      labelDotRadius={(d: any) => Math.sqrt(d.properties.pop_max) * 4e-4}
      labelColor={() => "#03BC47"}
      labelResolution={2}
      hexPolygonResolution={3}
      hexPolygonMargin={0.3}
      hexPolygonColor={() => `#71717a`}
    />
  );
}
