import { PurlinSectionData } from "@/components/hooks/use-section-data";
import { Line } from "react-konva";

export function PurlinCrossSection({ data }: PurlinCrossSectionProps) {
  const points = getCeeSectionPoints(data);

  return (
    <>
      <Line
        points={points}
        closed={true}
        fill="white"
        stroke="black"
        strokeWidth={2}
      />
    </>
  );
}

type PurlinCrossSectionProps = {
  data: PurlinSectionData
}

function getCeeSectionPoints(data: PurlinSectionData) {
  const {D, B, H, t, r, webAngle, flangeAngle, lipAngle} = data;
  // Origin is at the top left corner of the section
  const coordinates = [
    {x: B, y: D},
    {x: B, y: 0},
    {x: 0, y: 0},
    {x: 0, y: H},
    {x: B, y: H},
    {x: B, y: H - D},
  ]; // unit: inches

  const points: Array<number> = []
  coordinates.forEach((coordinate) => {
    points.push(coordinate.x);
    points.push(coordinate.y);
  });

  return points;  
}


