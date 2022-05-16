import {drawSquarePiece} from './square';
import {drawCirclePiece} from './circle';
import {drawDiamondPiece} from './diamond';

export function drawInnerEyePiece(
  x: number,
  y: number,
  modules: any[],
  pieceProperties: any,
  props: any,
) {
  switch (props.innerEyeStyle) {
    case 'square':
      return drawSquarePiece(x, y, modules, pieceProperties, props);
    case 'circle':
      return drawCirclePiece(x, y, modules, pieceProperties, props);
    case 'diamond':
      return drawDiamondPiece(x, y, modules, pieceProperties, props);
    default:
      return drawSquarePiece(x, y, modules, pieceProperties, props);
  }
}
