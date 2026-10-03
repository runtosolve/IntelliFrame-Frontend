import { Arrow, Group, Line } from "react-konva";

export default function UniformLoad({x = 0., y = 0., width, zoom = 1, rotation = 0}: UniformLoadProps) {
  const safeZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 0;
  const nominalSpacing = 25 / safeZoom;
  const intervalCount = Math.max(1, Math.round(safeWidth / nominalSpacing));
  const realSpacing = safeWidth / intervalCount;
  const height = safeWidth / 25;
  const pointerWidth = 5 / safeZoom;
  const pointerLength = pointerWidth * 1.5;
  const strokeWidth = 0.5 / safeZoom;
  const positions = Array.from(
    { length: intervalCount + 1 },
    (_, index) => index * realSpacing
  );

  return (
    <Group
      x={x + safeWidth / 2}
      y={y}
      offsetX={safeWidth / 2}
      offsetY={height / 2}
      rotation={rotation}
    >
      {positions.map((x) => (
        <Arrow
          key={x} 
          points={[x, 0, x, height]}
          stroke="#020617"
          strokeWidth={strokeWidth}
          pointerLength={pointerLength}
          pointerWidth={pointerWidth}
          fill="#020617"
        />
        ))}
        <Line
          points={[0, 0, safeWidth, 0]}
          stroke="#020617"
          strokeWidth={strokeWidth}
        />
    </Group>
  );
}

type UniformLoadProps = {
  x?: number,
  y?: number,
  width: number,
  zoom?: number,
  rotation?: number,
}