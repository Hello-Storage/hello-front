import { useEffect, useState } from "react";
import Globe from "react-globe.gl";
import globeData from "./data1.json";

export default function World() {
  return (
    <Globe
      width={900}
      height={900}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
      hexPolygonsData={globeData}
      hexPolygonResolution={3}
      hexPolygonMargin={0.3}
      hexPolygonColor={() =>
        `#${Math.round(Math.random() * Math.pow(2, 24))
          .toString(16)
          .padStart(6, "0")}`
      }
      // hexPolygonLabel={({ properties: d }) => `
      //   <b>${d.ADMIN} (${d.ISO_A2})</b> <br />
      //   Population: <i>${d.POP_EST}</i>
      // `}
    />
  );
  return <div>World</div>;
}
