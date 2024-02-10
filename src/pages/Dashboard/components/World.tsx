import { useEffect, useRef } from "react";
import Globe from "react-globe.gl";
import GlobeImg from "@images/globe.jpg";
import globeData from "./data.json";
import populationData from "./population.json";
import { useAppSelector } from "state";
import { Theme } from "state/user/reducer";

export default function World({ size = 0 }: { size: number | undefined }) {
	const globeRef = useRef();

	useEffect(() => {
		if (globeRef.current == null) return;
		// Auto-rotate
		(globeRef.current as any).controls().autoRotate = true;
		(globeRef.current as any).controls().autoRotateSpeed = 0.5;
		(globeRef.current as any).controls().enableZoom = false;
		(globeRef.current as any).pointOfView({
			lat: 23.5,
			lng: 0,
			altitude: 1.8,
		});
	}, []);

	const {theme} = useAppSelector((state) => state.user);

	return (
		<div className="w-full h-full overflow-hidden flex justify-center">
			<Globe
				ref={globeRef}
				width={size || 0}
				height={size || 0}
				backgroundColor={theme===Theme.DARK? "#05072b" : "#ffffff"}
				globeImageUrl={GlobeImg}
				atmosphereColor={theme===Theme.DARK? "#dadada" : `#2b2c33`}
				atmosphereAltitude={0.1}
				hexPolygonsData={globeData.features}
				pointResolution={0.1}
				labelsData={populationData.features}
				labelAltitude={0.002}
				labelLat={(d: any) => d.properties.latitude}
				labelLng={(d: any) => d.properties.longitude}
				labelText={(d: any) => d.properties.name}
				labelSize={(d: any) => Math.sqrt(d.properties.pop_max) * 4e-4}
				labelDotRadius={(d: any) =>
					Math.sqrt(d.properties.pop_max) * 4e-4
				}
				labelColor={(d: any) =>
					d.properties.color ? d.properties.color : "#03BC47"
				}
				labelResolution={2}
				hexPolygonResolution={3}
				hexPolygonMargin={0.3}
				hexPolygonColor={() => theme===Theme.DARK? "#05072b" : `#71717a`}
			/>
		</div>
	);
}
