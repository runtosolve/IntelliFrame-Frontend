import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Layer, Rect, Stage } from "react-konva";
import { getSectionCoordinates, PurlinCrossSection } from "@/components/viewer/elements/cross-section";
import useSectionData, { PurlinSectionData } from "@/components/hooks/use-section-data";
import { useResponsiveStage } from "../hooks/use-responsive-stage";

export default function SectionView({ purlinName, deckName, catalog = "purlin", rotation = 0 }: SectionViewProps) {

  const name = "Z10x2.5 060"

  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null!);
  const stageRef = useRef<Konva.Stage>(null!);
  
  const [purlinSectionLibrary, intelliFrameLibrary] = useSectionData();
  const sectionLibrary = catalog === "intelliframe" ? intelliFrameLibrary : purlinSectionLibrary;
  const section = sectionLibrary[purlinName];

  const box = getBoundingBox(section);

  useResponsiveStage({ stageRef, containerRef, boundingBox: box, setZoom, padding: SECTION_PADDING })

  return (
    <div ref={containerRef} className="absolute w-full h-full">
      <Stage ref={stageRef}>
        <Layer>
          {section && (
            <PurlinCrossSection
              x={0}
              y={0}
              rotation={rotation}
              data={section}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

const SECTION_PADDING = { top: 40, bottom: 24, left: 28, right: 28 };

type SectionViewProps = {
  purlinName: string,
  deckName: string,
  catalog?: "purlin" | "intelliframe",
  rotation: number,
}

function getBoundingBox(data: PurlinSectionData) {
  if (!data) {
    return { x: 0, y: 0, width: 10, height: 10 };
  }

  const points = getSectionCoordinates(data);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  points.forEach((point) => {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  });

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
    width: Math.max(maxX - minX, 0.1),
    height: Math.max(maxY - minY, 0.1),
  };
}
