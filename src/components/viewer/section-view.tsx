import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Layer, Rect, Stage } from "react-konva";
import { PurlinCrossSection } from "@/components/viewer/elements/cross-section";
import useSectionData, { PurlinSectionData } from "@/components/hooks/use-section-data";
import { useResponsiveStage } from "../hooks/use-responsive-stage";

export default function SectionView() {

  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null!);
  const stageRef = useRef<Konva.Stage>(null!);
  
  const [purlinSections, deckSections] = useSectionData();
  const box = getBoundingBox(purlinSections[10]);
  // useResponsiveStage({ stageRef, containerRef, boundingBox: box, setZoom})

  useEffect(() => {
    function handleResize() {
      stageRef.current.width(containerRef.current.offsetWidth);
      stageRef.current.height(containerRef.current.offsetHeight);
    }

    handleResize();

    window.addEventListener("resize", handleResize);

    return (() => {
      window.removeEventListener("resize", handleResize);
    });

  }, [])

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-200">
      <Stage ref={stageRef} draggable={true} scale={{x: 10, y: 10}}>
        <Layer>
          {(purlinSections.length != 0) && (
            <PurlinCrossSection
              x={0}
              y={0}
              data={purlinSections[20]}
              zoom={10}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

function getBoundingBox(data: PurlinSectionData) {
  if (data) {
    return ({
      x: 0,
      y: 0,
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