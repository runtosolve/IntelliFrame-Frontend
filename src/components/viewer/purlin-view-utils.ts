import { PurlinData } from "./purlin-view";

export function calcualtePurlinPosiions(data: Array<PurlinData>, lapOffsetY: number) {
  const purlinPositions: Array<{x: number, y: number}> = [];

  let curPurlinX = 0
  let curPurlinY = lapOffsetY / 2;
  data.forEach((item, index) => {
    purlinPositions.push({x: curPurlinX, y:curPurlinY});
    curPurlinX += item.span - item.rightLap;
    curPurlinY = (curPurlinY < 0) ? (lapOffsetY / 2) : (-lapOffsetY / 2);

  });

  return purlinPositions;
}

export function calculateSupportPositions(data: Array<PurlinData>, lapOffsetY: number, purlinHeight: number) {
  const supportPositions: Array<{x: number, y: number}> = [];

  let curSupportX = 0
  let curSupportY = purlinHeight + lapOffsetY
  data.forEach((item, index) => {
    if (index == 0) supportPositions.push({x: curSupportX, y: curSupportY});
    curSupportX += item.span - item.rightLap / 2 - item.leftLap / 2;
    supportPositions.push({x: curSupportX, y: curSupportY});
  });

  return supportPositions;
}