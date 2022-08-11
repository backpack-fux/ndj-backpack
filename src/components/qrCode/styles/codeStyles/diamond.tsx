import React, {Component} from 'react';
import Svg, {Rect, G} from 'react-native-svg';

export function drawDiamondPiece(
  x: number,
  y: number,
  modules: any[],
  pieceProperties: any,
  props: any,
) {
  const length = modules.length;
  const width = props.size;
  const height = props.size;
  const xsize = width / (length + 2 * props.padding);
  const ysize = height / (length + 2 * props.padding);
  const px = x * xsize + props.padding * xsize;
  const py = y * ysize + props.padding * ysize;
  return (
    <G
      key={px + ':' + py}
      x={px + xsize / 2}
      y={py + ysize / 2}
      width={xsize}
      height={ysize}>
      <Rect
        x={-xsize / 2}
        y={-ysize / 2}
        width={xsize}
        height={ysize}
        rotate={45}
        fill={props.color}
      />
    </G>
  );
}
