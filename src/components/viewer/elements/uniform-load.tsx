import { Arrow, Group } from "react-konva";

export default function UniformLoad({x = 0., y = 0., width, zoom = 1}: UniformLoadProps) {

  const nominalSpacing = 25 / zoom;
  const realSpacing = width / Math.round(width / nominalSpacing);
  const height = width / 25;
  const pointerWidth = 5 / zoom;
  const pointerLength = pointerWidth * 1.5;
  const strokeWidth = 1 / zoom;

  const positions = []
  for (let x = 0; x <= (width + realSpacing / 2); x += realSpacing) {
    positions.push(x);
  }

  return (
    <Group
      x={x}
      y={y}
      offsetY={height}
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
    </Group>
  );
}

type UniformLoadProps = {
  x?: number,
  y?: number,
  width: number,
  zoom?: number,
}