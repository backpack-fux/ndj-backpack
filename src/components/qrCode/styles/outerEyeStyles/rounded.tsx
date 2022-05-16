import React from 'react';
import {Rect} from 'react-native-svg';

export function drawRoundedPiece(
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
    <Rect
      key={px + ':' + py}
      x={px}
      y={py}
      rx={xsize / 2}
      width={xsize}
      height={ysize}
      fill={props.color}
    />
  );
}
