import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Layer, Rect, Stage } from "react-konva";
import { PurlinCrossSection } from "@/components/viewer/elements/cross-section";
import useSectionData, { PurlinSectionData } from "@/components/hooks/use-section-data";
import { useResponsiveStage } from "../hooks/use-responsive-stage";

export default function SectionView({ purlinName, deckName, rotation = 0 }: SectionViewProps) {

  const name = "Z10x2.5 060"

  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null!);
  const stageRef = useRef<Konva.Stage>(null!);
  
  const [purlinSectionLibrary, deckSectionLibrary] = useSectionData();

  const box = getBoundingBox(purlinSectionLibrary[purlinName]);

  useResponsiveStage({ stageRef, containerRef, boundingBox: box, setZoom, padding: SECTION_PADDING })

  return (
    <div ref={containerRef} className="absolute w-full h-full">
      <Stage ref={stageRef}>
        <Layer>
          {(Object.keys(purlinSectionLibrary).length != 0) && (
            <PurlinCrossSection
              x={0}
              y={0}
              rotation={rotation}
              data={purlinSectionLibrary[purlinName]}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

const SECTION_PADDING = { top: 40, bottom: 12 };

type SectionViewProps = {
  purlinName: string,
  deckName: string,
  rotation: number,
}

function getBoundingBox(data: PurlinSectionData) {
  if (data) {
    return ({
      x: (data.shape == "C") ? data.B / 2 : 0,
      y: data.H / 2,
      width: (data.shape == "C") ? data.B : 2 * data.B,
      height: data.H,
    });
  }
  else {
    return ({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });
  } 
}
