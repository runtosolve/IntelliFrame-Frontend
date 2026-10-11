import Konva from "konva";
import { useMemo, useRef, useState } from "react";
import { Layer, Stage } from "react-konva";
import { getSectionDrawing, SectionDrawingView } from "@/components/viewer/elements/cross-section";
import { getDimensionLayout } from "@/components/viewer/elements/section-dimensions";
import useSectionData from "@/components/hooks/use-section-data";
import { useResponsiveStage } from "../hooks/use-responsive-stage";

export default function SectionView({
  purlinName,
  existingName,
  catalog = "purlin",
  rotation = 0,
  loadDirection = "gravity",
}: SectionViewProps) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null!);
  const stageRef = useRef<Konva.Stage>(null!);

  const [purlinSectionLibrary, intelliFrameLibrary] = useSectionData();
  const retrofit = catalog === "intelliframe";
  const section = retrofit ? intelliFrameLibrary[purlinName] : purlinSectionLibrary[purlinName];
  const existing = retrofit && existingName ? purlinSectionLibrary[existingName] : undefined;

  const drawing = useMemo(() => (section ? getSectionDrawing(section, existing) : undefined), [section, existing]);
  const layout = useMemo(() => (drawing ? getDimensionLayout(drawing) : undefined), [drawing]);
  const box = layout
    ? {
      x: layout.bounds.cx,
      y: layout.bounds.cy,
      width: layout.bounds.maxX - layout.bounds.minX,
      height: layout.bounds.maxY - layout.bounds.minY,
    }
    : { x: 0, y: 0, width: 10, height: 10 };

  const ready = useResponsiveStage({ stageRef, containerRef, boundingBox: box, setZoom, padding: SECTION_PADDING });

  return (
    <div
      ref={containerRef}
      className="absolute w-full h-full"
      style={{ visibility: ready && drawing ? "visible" : "hidden" }}
    >
      <Stage ref={stageRef}>
        <Layer listening={false}>
          {drawing && layout && (
            <SectionDrawingView
              drawing={drawing}
              layout={layout}
              zoom={zoom}
              rotation={rotation}
              loadDirection={loadDirection}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

const SECTION_PADDING = { top: 18, bottom: 14, left: 20, right: 20 };

type SectionViewProps = {
  purlinName: string,
  existingName?: string,
  catalog?: "purlin" | "intelliframe",
  rotation: number,
  loadDirection?: "gravity" | "uplift",
}
