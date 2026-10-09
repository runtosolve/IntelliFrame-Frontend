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
        stroke="#030712"
        strokeWidth={2 * data.t}
        // strokeScaleEnabled={false}
      />
    </>
  );
}

type PurlinCrossSectionProps = {
  data: PurlinSectionData,
  x: number,
  y: number,
  rotation?: number,
}

function getCeeSectionPoints(data: PurlinSectionData) {
  const {shape, D, B, H, t, r, webAngle, flangeAngle, lipAngle} = data;
  let coordinates: Array<{x: number, y:number}> = [];
  if (data.B_bottom != null || data.B_top != null) {
    const bottom = data.B_bottom ?? B;
    const top = data.B_top ?? B;
    const lip = lipAngle * Math.PI / 180;
    coordinates = [
      {x: bottom, y: 0},
      {x: 0, y: 0},
      {x: 0, y: H},
      {x: top, y: H},
      {x: top + D * Math.cos(lip), y: H + D * Math.sin(lip)},
    ];
  }
  else if (shape === "C") {
    coordinates = [
      {x: B + D * Math.cos(Math.abs(lipAngle * Math.PI / 180)), y: D * Math.sin(Math.abs(lipAngle * Math.PI / 180))},
      {x: B, y: 0},
      {x: 0, y: 0},
      {x: 0, y: H},
      {x: B, y: H},
      {x: (B + D * Math.cos(Math.abs(lipAngle * Math.PI / 180))), y: H - D * Math.sin(Math.abs(lipAngle * Math.PI / 180))},
    ];
  }
  else if (shape === "Z") {
    coordinates = [
      {x: B + D * Math.cos(Math.abs(lipAngle * Math.PI / 180)), y: D * Math.sin(Math.abs(lipAngle * Math.PI / 180))},
      {x: B, y: 0},
      {x: 0, y: 0},
      {x: 0, y: H},
      {x: -B, y: H},
      {x: -(B + D * Math.cos(Math.abs(lipAngle * Math.PI / 180))), y: H - D * Math.sin(Math.abs(lipAngle * Math.PI / 180))},
    ];
  }

  const points: Array<number> = []
  coordinates.forEach((coordinate) => {
    points.push(coordinate.x);
    points.push(coordinate.y);
  });

  return points;  
}


