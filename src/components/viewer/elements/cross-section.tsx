import { PurlinSectionData } from "@/components/hooks/use-section-data";
import { Line } from "react-konva";

export function PurlinCrossSection({x, y, rotation = 0, data }: PurlinCrossSectionProps) {
  const points = getCeeSectionPoints(data);

  return (
    <>
      <Line
        x={x}
        y={y}
        rotation={rotation}
        points={points}
        stroke="#374151"
        strokeWidth={2 * data.t}  // make section thicker for clarity
        // strokeScaleEnabled={false}
      />
    </>
  );
}

type PurlinCrossSectionProps = {
  data: PurlinSectionData,
  x: number,
  y: number,
  rotation?: number, // unit: degrees
}

function getCeeSectionPoints(data: PurlinSectionData) {
  const {shape, D, B, H, t, r, webAngle, flangeAngle, lipAngle} = data;
  // Origin is at the top left corner of the section
  let coordinates: Array<{x: number, y:number}> = [];
  if (shape === "C") {
    coordinates = [
      {x: B + D * Math.cos(Math.abs(lipAngle * Math.PI / 180)), y: D * Math.sin(Math.abs(lipAngle * Math.PI / 180))},
      {x: B, y: 0},
      {x: 0, y: 0},
      {x: 0, y: H},
      {x: B, y: H},
      {x: (B + D * Math.cos(Math.abs(lipAngle * Math.PI / 180))), y: H - D * Math.sin(Math.abs(lipAngle * Math.PI / 180))},
    ]; // unit: inches
  }
  else if (shape === "Z") {
    coordinates = [
      {x: B + D * Math.cos(Math.abs(lipAngle * Math.PI / 180)), y: D * Math.sin(Math.abs(lipAngle * Math.PI / 180))},
      {x: B, y: 0},
      {x: 0, y: 0},
      {x: 0, y: H},
      {x: -B, y: H},
      {x: -(B + D * Math.cos(Math.abs(lipAngle * Math.PI / 180))), y: H - D * Math.sin(Math.abs(lipAngle * Math.PI / 180))},
    ]; // unit: inches
  }

  const points: Array<number> = []
  coordinates.forEach((coordinate) => {
    points.push(coordinate.x);
    points.push(coordinate.y);
  });

  return points;  
}


