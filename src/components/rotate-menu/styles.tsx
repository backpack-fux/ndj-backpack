import {
  menuIconSize,
  menuSize,
  SQUARE_DIMENSIONS,
} from '@app/constants/dimension';
import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuWrap: {
    alignItems: 'center',
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: -SQUARE_DIMENSIONS.WIDTH * 0.45,
  },
  icon: {
    position: 'absolute',
    top: 0,
    width: menuIconSize,
    height: menuIconSize,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // iconContainer: {
  //   position: 'absolute',
  //   top: -((SQUARE_DIMENSIONS.WIDTH * 0.08) / 2),
  //   left: 0,
  //   width: SQUARE_DIMENSIONS.WIDTH * 0.08,
  //   height: SQUARE_DIMENSIONS.WIDTH * 0.08,
  //   // backgroundColor: colors.background,
  //   alignItems: 'center',
  //   borderRadius: 3,
  //   justifyContent: 'center',
  //   // justifyContent: 'center',
  //   // borderRadius: SQUARE_DIMENSIONS.WIDTH * 0.08,
  // },
  // iconText: {
  //   color: '#fff',
  //   fontSize: 20,
  //   flex: 0,
  //   width: SQUARE_DIMENSIONS.WIDTH * 0.4,
  //   left: -(
  //     SQUARE_DIMENSIONS.WIDTH * 0.2 -
  //     (SQUARE_DIMENSIONS.WIDTH * 0.09) / 2
  //   ),
  //   textAlign: 'center',
  //   textTransform: 'capitalize',
  // },
  iconContainer: {
    position: 'absolute',
    top: -10,
    width: 70,
    height: 24,
    alignItems: 'center',
    borderRadius: 3,
    justifyContent: 'center',
  },
  iconText: {
    color: '#fff',
    fontSize: 14,
    flex: 0,
    width: SQUARE_DIMENSIONS.WIDTH * 0.4,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  swipeArrowHint: {
    position: 'absolute',
    top: SQUARE_DIMENSIONS.WIDTH * 0.08,
    left: SQUARE_DIMENSIONS.WIDTH * 0.21,
    width: SQUARE_DIMENSIONS.WIDTH * 0.38,
    height: SQUARE_DIMENSIONS.WIDTH * 0.3,
  },
  wheel: {
    width: menuSize,
    height: menuSize,
  },
  circleGradientWrap: {
    width: menuSize,
    height: menuSize,
    borderRadius: menuSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleGradient: {
    width: menuSize * 0.9,
    height: menuSize * 0.9,
    borderRadius: menuSize / 2,
    overflow: 'hidden',
  },
  wheelTouchableCenter: {
    position: 'absolute',
    width: SQUARE_DIMENSIONS.WIDTH * 0.4,
    height: SQUARE_DIMENSIONS.WIDTH * 0.4,
    top: SQUARE_DIMENSIONS.WIDTH * 0.2,
    left: SQUARE_DIMENSIONS.WIDTH * 0.2,
  },
});
