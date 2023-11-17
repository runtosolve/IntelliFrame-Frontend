import { Line } from "react-konva";

export default function SteelBeam({tf, tw, w, h, x, y, strokeWidth}: SteelBeamProps) {

  const hw = h - 2 * tf;

  const points = [
    {x: -tw / 2, y: tf},
    {x: -w / 2, y: tf},
    {x: -w / 2, y: 0},
    {x: w / 2, y: 0},
    {x: w / 2 , y: tf},
    {x: tw / 2, y: tf},
    {x: tw / 2, y: h - tf},
    {x: w / 2, y: h - tf},
    {x: w / 2, y: h},
    {x: -w / 2, y: h},
    {x: -w / 2, y: h - tf},
    {x: -tw / 2, y: h - tf}
  ]

  const data: Array<number> = [];
  points.forEach((item) => data.push(item.x + x, item.y + y));

  return (
    <Line
      points={data}
      stroke="#0f172a"
      strokeWidth={strokeWidth}
      fill="#64748b"
      closed={true}
    />
  );

}

type SteelBeamProps = {
  tf: number,
  tw: number,
  w: number,
  h: number,
  x: number,
  y: number,
  strokeWidth: number,
}
