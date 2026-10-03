import { PurlinData } from "./purlin-view";

export function generatePurlinViewData(spans: Array<{id: string, value: number}>, lapLength: number) {

  const data = spans.map((item, index) => {
    let span = item.value;
    let leftLap = (index == 0) ? (0) : (lapLength / 2);
    let rightLap = (index == (spans.length - 1)) ? (0) : (lapLength / 2)
    let length = span + leftLap + rightLap;
    
    return {id: item.id, index, leftLap, span, rightLap, length}
  })

  return data

}


export function calcualtePurlinPosiions(data: Array<PurlinData>, lapOffsetY: number) {
  const purlinPositions: Array<{x: number, y: number}> = [];

  let curPurlinX = 0
  let curPurlinY = lapOffsetY / 2;
  data.forEach((item) => {
    purlinPositions.push({x: curPurlinX - item.leftLap, y:curPurlinY});
    curPurlinX += item.span
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
    curSupportX += item.span;
    supportPositions.push({x: curSupportX, y: curSupportY});
  });

  return supportPositions;
}

