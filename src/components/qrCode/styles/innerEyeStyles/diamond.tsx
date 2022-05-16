import React from 'react';
import {Rect, G} from 'react-native-svg';

export function drawDiamondPiece(
  x: number,
  y: number,
  modules: any[],
  pieceProperties: any,
  props: any,
) {
  var length = modules.length;
  var width = props.size;
  var height = props.size;
  var xsize = width / (length + 2 * props.padding);
  var ysize = height / (length + 2 * props.padding);
  var px = x * xsize + props.padding * xsize;
  var py = y * ysize + props.padding * ysize;
  return (
    <G x={px + xsize / 2} y={py + ysize / 2} width={xsize} height={ysize}>
      <Rect
        key={px + ':' + py}
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
