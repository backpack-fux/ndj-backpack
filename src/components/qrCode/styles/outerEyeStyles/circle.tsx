import React from 'react';
import {Circle} from 'react-native-svg';

export function drawCirclePiece(
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
  var px = x * xsize + props.padding * xsize + xsize / 2;
  var py = y * ysize + props.padding * ysize + ysize / 2;
  return (
    <Circle
      key={px + ':' + py + Math.random()}
      cx={px}
      cy={py}
      r={xsize / 2}
      fill={props.color}
    />
  );
}
