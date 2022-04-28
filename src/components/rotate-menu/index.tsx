import React from 'react';
import {
  Animated,
  Image,
  PanResponder,
  StyleProp,
  TextStyle,
  View,
} from 'react-native';
import {debounce} from 'debounce';
import RadialGradient from 'react-native-radial-gradient';

import {menuSize, menuIconSize, SQUARE_DIMENSIONS} from '@app/constants';

import {styles} from './styles';
import {Icons} from './icons/Icons';
import {CircleIcon} from './icons/CircleIcon';

const line = require('@app/assets/images/round-line.png');

interface Props {
  onSelect: (id: any) => void;
  girthAngle?: number;
  iconHideOnTheBackDuration?: number;
  icons?: any[];
  style?: any;
  styleIconText?: StyleProp<TextStyle>;
  defaultIconColor?: string;
  isExpDistCorrection?: boolean;
  noExpDistCorrectionDegree?: number;
  disable?: boolean;
}

export class RotateMenu extends React.Component<Props, any> {
  static DEFAULT_ICON = (color: string = '#5795D0') => (
    <CircleIcon color={color} />
  );
  _wheelNavigator: any;
  INDEX_EXTRACTORS: any = {};
  GIRTH_ANGLE = 120;
  AMOUNT_OF_ICONS = 3;
  ICON_POSITION_ANGLE = 120 / 3;
  STEP_LENGTH_TO_1_ANGLE = 0;
  DIRECTIONS: any;
  CIRCLE_SECTIONS: any;
  CURRENT_CIRCLE_SECTION: any;
  CURRENT_DIRECTION: any;
  CURRENT_VECTOR_DIFFERENCE_LENGTH = 0;
  PREVIOUS_POSITION: any;
  ICON_HIDE_ON_THE_BACK_DURATION: any;
  ALL_ICONS_FINISH_ANIMATIONS: any;
  _panResponder: any;

  constructor(props: any) {
    super(props);

    let icons = this.mapPropsIconsToAnimatedOnes();
    this.INDEX_EXTRACTORS = {};
    this.GIRTH_ANGLE = this.props.girthAngle || 120;
    this.AMOUNT_OF_ICONS = icons.length;
    this.ICON_POSITION_ANGLE = this.GIRTH_ANGLE / this.AMOUNT_OF_ICONS;

    this.state = {
      pan: new Animated.Value(0),
      icons: icons,
      currentSnappedIcon: this.getCurrentSnappedMiddleIcon(icons),
      ICON_PATH_RADIUS: 0,
      XY_AXES_COORDINATES: {
        X: 0,
        Y: 0,
        PAGE_Y: 0,
        PAGE_X: 0,
      },
      CURRENT_ICON_SHIFT: 0,
    };

    this.INDEX_EXTRACTORS = {};
    this.GIRTH_ANGLE = this.props.girthAngle || 120;
    this.AMOUNT_OF_ICONS = icons.length;
    this.ICON_POSITION_ANGLE = this.GIRTH_ANGLE / this.AMOUNT_OF_ICONS;

    // 2*π*r / 360
    this.STEP_LENGTH_TO_1_ANGLE = 0;

    this.DIRECTIONS = {
      CLOCKWISE: 'CLOCKWISE',
      COUNTERCLOCKWISE: 'COUNTERCLOCKWISE',
    };

    this.CIRCLE_SECTIONS = {
      TOP_LEFT: 'TOP_LEFT',
      TOP_RIGHT: 'TOP_RIGHT',
      BOTTOM_LEFT: 'BOTTOM_LEFT',
      BOTTOM_RIGHT: 'BOTTOM_RIGHT',
    };

    this.CURRENT_CIRCLE_SECTION = null;
    this.CURRENT_DIRECTION = null;
    this.CURRENT_VECTOR_DIFFERENCE_LENGTH = 0;

    this.PREVIOUS_POSITION = {
      X: 0,
      Y: 0,
    };

    this.ICON_HIDE_ON_THE_BACK_DURATION =
      this.props.iconHideOnTheBackDuration || 250;

    this.ALL_ICONS_FINISH_ANIMATIONS = {
      promises: this.state.icons.reduce((promises: any, icon: any) => {
        promises[icon.id] = null;
        return promises;
      }, {}),
      resolvers: this.state.icons.reduce((resolvers: any, icon: any) => {
        resolvers[icon.id] = null;
        return resolvers;
      }, {}),
    };

    this._panResponder = PanResponder.create({
      // onMoveShouldSetResponderCapture: () => true, //Tell iOS that we are allowing the movement
      onMoveShouldSetPanResponderCapture: () => true, // Same here, tell iOS that we allow dragging
      onPanResponderGrant: () => {
        this.resetCurrentValues();
        this.setPreviousDifferenceLengths(0, 0);
        this.state.pan.setValue(this.state.pan._value);
      },
      onPanResponderMove: (e, gestureState) => {
        this.defineCurrentSection(gestureState.moveX, gestureState.moveY);
        this.checkPreviousDifferenceLengths(gestureState.dx, gestureState.dy);

        this.state.pan.setValue(this.CURRENT_VECTOR_DIFFERENCE_LENGTH);
        this.setState(
          {
            ...this.state,
            CURRENT_ICON_SHIFT:
              this.CURRENT_VECTOR_DIFFERENCE_LENGTH /
              this.STEP_LENGTH_TO_1_ANGLE,
          },
          () => this.calculateIconCurrentPositions(gestureState.vx),
        );
      },
      onPanResponderRelease: (evt, gestureState) => {
        let lastGesture = {...gestureState};

        this.createFinishAnimationPromisesAndResolveIfIconsAreNotMovingAlready();

        Promise.all(this.getFinishAnimationPromises()).then(() =>
          this.snapNearestIconToVerticalAxis(lastGesture),
        );
      },
    });
  }

  getCurrentSnappedMiddleIcon(icons: any[]) {
    return icons.filter((icon: any) => icon.index === 0)[0];
  }

  getFinishAnimationPromises() {
    return this.state.icons.map(
      (icon: any) => this.ALL_ICONS_FINISH_ANIMATIONS.promises[icon.id],
    );
  }

  createFinishAnimationPromisesAndResolveIfIconsAreNotMovingAlready() {
    this.state.icons.forEach((icon: any) => {
      this.ALL_ICONS_FINISH_ANIMATIONS.promises[icon.id] = new Promise(
        resolve =>
          (this.ALL_ICONS_FINISH_ANIMATIONS.resolvers[icon.id] = resolve),
      );
      !icon.position.x._animation &&
        this.ALL_ICONS_FINISH_ANIMATIONS.resolvers[icon.id]();
    });
  }

  snapNearestIconToVerticalAxis(lastGesture: any) {
    let {
      minDistanceToVerticalAxis,
      minDistanceToHorizontalAxis,
      sign,
      currentSnappedIcon,
    } = this.getMinDistanceToVerticalAxisAndSnappedIcon();
    [minDistanceToVerticalAxis, minDistanceToHorizontalAxis] =
      this.updateMinimalDistanceExponentialDeflection(
        minDistanceToVerticalAxis,
        minDistanceToHorizontalAxis,
        currentSnappedIcon,
      );

    this.updateCurrentDirectionBasedOnNearestIconPosition(sign);
    this.setAdditiveMovementLength(
      sign * minDistanceToVerticalAxis,
      -minDistanceToHorizontalAxis,
    );
    this.setPreviousDifferenceLengths(
      lastGesture.dx + sign * minDistanceToVerticalAxis,
      lastGesture.dy + minDistanceToHorizontalAxis,
    );
    this.animateAllIconsToMatchVerticalAxis(currentSnappedIcon);
    currentSnappedIcon && this.props.onSelect((currentSnappedIcon as any).id);
  }

  getMinDistanceToVerticalAxisAndSnappedIcon() {
    let minDistanceToVerticalAxis = this.STEP_LENGTH_TO_1_ANGLE * 360;
    let minDistanceToHorizontalAxis = this.STEP_LENGTH_TO_1_ANGLE * 360;
    let sign = 1;
    let currentSnappedIcon = null;
    let yCoordinateFromCssStyling =
      styles.iconContainer.top - SQUARE_DIMENSIONS.ICON_PADDING_FROM_WHEEL;

    this.state.icons.forEach((icon: any) => {
      let iconXCenterCoordinate =
        icon.position.x.__getValue() + styles.icon.width / 2;
      let iconYCenterCoordinate = icon.position.y.__getValue();

      let distanceToXAxis = Math.abs(
        iconXCenterCoordinate -
          (this.state.XY_AXES_COORDINATES.X -
            this.state.XY_AXES_COORDINATES.PAGE_X),
      );
      let distanceToYAxis = Math.abs(
        yCoordinateFromCssStyling - iconYCenterCoordinate,
      );

      if (distanceToYAxis <= minDistanceToHorizontalAxis) {
        minDistanceToHorizontalAxis = distanceToYAxis;
      }

      if (distanceToXAxis <= minDistanceToVerticalAxis) {
        if (
          iconXCenterCoordinate >
          this.state.XY_AXES_COORDINATES.X -
            this.state.XY_AXES_COORDINATES.PAGE_X
        ) {
          sign = -1;
        } else if (
          iconXCenterCoordinate <
          this.state.XY_AXES_COORDINATES.X -
            this.state.XY_AXES_COORDINATES.PAGE_X
        ) {
          sign = 1;
        } else {
          sign = 0;
          minDistanceToVerticalAxis = 0;
        }
        minDistanceToVerticalAxis = distanceToXAxis;
        currentSnappedIcon = icon;
      }
    });

    return {
      minDistanceToVerticalAxis,
      minDistanceToHorizontalAxis,
      sign,
      currentSnappedIcon,
    };
  }

  updateCurrentDirectionBasedOnNearestIconPosition(sign: number) {
    if (sign > 0) {
      this.CURRENT_DIRECTION = this.DIRECTIONS.CLOCKWISE;
    } else {
      this.CURRENT_DIRECTION = this.DIRECTIONS.COUNTERCLOCKWISE;
    }
  }

  adjustMinimalExponentialDistanceCorrection(
    angle: number,
    minV: number,
    minH: number,
  ) {
    const {noExpDistCorrectionDegree = 45} = this.props;
    if (!this.props.isExpDistCorrection) {
      return [minV, minH];
    }

    let currentAngle = Math.round(angle);
    let lowestBoundaryDegree = 270 - noExpDistCorrectionDegree;
    let highestBoundaryDegree = 270 + noExpDistCorrectionDegree;

    if (
      currentAngle < lowestBoundaryDegree ||
      currentAngle > highestBoundaryDegree
    ) {
      let number =
        (45 - 0.004165 * Math.pow(currentAngle - 270, 2)) *
        this.STEP_LENGTH_TO_1_ANGLE;

      return [minV - number, minH - Math.sqrt(number) / 2];
    }

    return [minV, minH];
  }

  /**
   * if current angle is lower than 270 center angle minus 15 degrees gap, that implies parabolic distance
   * from this. 30 degrees center gap - adjust minimal distance to vertical axis regarding this parabolic distance
   */
  updateMinimalDistanceExponentialDeflection(
    minDistanceToVerticalAxis: number,
    minDistanceToHorizontalAxis: number,
    currentSnappedIcon: any,
  ) {
    const id = currentSnappedIcon.id;
    const index = currentSnappedIcon.index;

    let minV = minDistanceToVerticalAxis;
    let minH = minDistanceToHorizontalAxis;

    let currentAngle =
      270 +
      this.state.CURRENT_ICON_SHIFT +
      (this.INDEX_EXTRACTORS[id] || 0) +
      index * this.ICON_POSITION_ANGLE;

    [minV, minH] = this.adjustMinimalExponentialDistanceCorrection(
      currentAngle,
      minV,
      minH,
    );

    return [minV, minH];
  }

  animateAllIconsToMatchVerticalAxis(currentSnappedIcon: any) {
    Animated.spring(this.state.pan, {
      toValue: this.CURRENT_VECTOR_DIFFERENCE_LENGTH,
      speed: 12,
      useNativeDriver: false,
    }).start();
    this.setState(
      {
        ...this.state,
        CURRENT_ICON_SHIFT:
          this.CURRENT_VECTOR_DIFFERENCE_LENGTH / this.STEP_LENGTH_TO_1_ANGLE,
        currentSnappedIcon: currentSnappedIcon,
      },
      () => this.calculateIconCurrentPositions(),
    );
  }

  mapPropsIconsToAnimatedOnes() {
    const {icons = [], defaultIconColor} = this.props;
    function getId(propIcon: any) {
      if (React.isValidElement(propIcon)) {
        const icon: any = propIcon;
        return icon.props?.id || icon.type.name.toLowerCase();
      }
      return typeof propIcon === 'object' ? propIcon.id || 'default' : propIcon;
    }

    function getTitle(propIcon: any) {
      if (React.isValidElement(propIcon)) {
        const icon: any = propIcon;
        return icon.props?.title || icon.type.name.toLowerCase();
      }
      return typeof propIcon === 'object'
        ? propIcon.title || propIcon.id
        : propIcon;
    }

    function getIndex(index: number, array: any[]) {
      return index - Math.trunc(array.length / 2);
    }

    let getEl = (propIcon: any) => {
      return React.isValidElement(propIcon)
        ? propIcon
        : RotateMenu.DEFAULT_ICON(defaultIconColor);
    };

    return icons.map((propIcon, index, array) => ({
      id: getId(propIcon),
      title: getTitle(propIcon),
      isShown: true,
      index: getIndex(index, array),
      el: getEl(propIcon),
      position: new Animated.ValueXY(),
    }));
  }

  rotateOnInputPixelDistanceMatchingRadianShift() {
    return [
      {
        transform: [
          {
            rotate: this.state.pan.interpolate({
              inputRange: [
                -(this.GIRTH_ANGLE * this.STEP_LENGTH_TO_1_ANGLE),
                0,
                this.GIRTH_ANGLE * this.STEP_LENGTH_TO_1_ANGLE,
              ],
              outputRange: [
                `-${this.GIRTH_ANGLE}deg`,
                '0deg',
                `${this.GIRTH_ANGLE}deg`,
              ],
            }),
          },
        ],
      },
    ];
  }

  defineAxesCoordinatesOnLayoutDisplacement = () => {
    this._wheelNavigator.measure(
      (
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number,
      ) => {
        this.setState({
          ...this.state,
          ICON_PATH_RADIUS: height / 2 + styles.icon.height / 2 + 0,
          // SQUARE_DIMENSIONS.ICON_PADDING_FROM_WHEEL,
          XY_AXES_COORDINATES: {
            X: pageX + width / 2,
            Y: pageY + height / 2,
            PAGE_Y: pageY,
            PAGE_X: pageX,
          },
        });
        this.STEP_LENGTH_TO_1_ANGLE =
          (2 * Math.PI * this.state.ICON_PATH_RADIUS) / 360;

        this.calculateIconCurrentPositions();
      },
    );
  };

  defineAxesCoordinatesOnLayoutChangeByStylesOrScreenRotation = () => {
    this.defineAxesCoordinatesOnLayoutDisplacement();
  };

  defineCurrentSection(x: number, y: number) {
    let yAxis = y < this.state.XY_AXES_COORDINATES.Y ? 'TOP' : 'BOTTOM';
    let xAxis = x < this.state.XY_AXES_COORDINATES.X ? 'LEFT' : 'RIGHT';
    this.CURRENT_CIRCLE_SECTION = this.CIRCLE_SECTIONS[`${yAxis}_${xAxis}`];
  }

  resetCurrentValues() {
    this.CURRENT_CIRCLE_SECTION = null;
    this.CURRENT_DIRECTION = null;
    this.PREVIOUS_POSITION.X = 0;
    this.PREVIOUS_POSITION.Y = 0;
  }

  setPreviousDifferenceLengths(x: number, y: number) {
    this.PREVIOUS_POSITION.X = x;
    this.PREVIOUS_POSITION.Y = y;
  }

  checkPreviousDifferenceLengths(x: number, y: number) {
    if (this.CURRENT_CIRCLE_SECTION === null) {
      return;
    }

    let differenceX = x - this.PREVIOUS_POSITION.X;
    let differenceY = y - this.PREVIOUS_POSITION.Y;

    let getCurrentDirectionForYForLeftHemisphere = (diffY: number) => {
      if (diffY < 0) {
        return this.DIRECTIONS.CLOCKWISE;
      }
      if (diffY > 0) {
        return this.DIRECTIONS.COUNTERCLOCKWISE;
      }
    };

    let getCurrentDirectionForXForTopHemisphere = (diffX: number) => {
      if (diffX < 0) {
        return this.DIRECTIONS.COUNTERCLOCKWISE;
      }
      if (diffX > 0) {
        return this.DIRECTIONS.CLOCKWISE;
      }
    };

    let getCurrentDirectionForYForRightHemisphere = (diffY: number) => {
      if (diffY < 0) {
        return this.DIRECTIONS.COUNTERCLOCKWISE;
      }
      if (diffY > 0) {
        return this.DIRECTIONS.CLOCKWISE;
      }
    };

    let getCurrentDirectionForXForBottomHemisphere = (diffX: number) => {
      if (diffX < 0) {
        return this.DIRECTIONS.CLOCKWISE;
      }
      if (diffX > 0) {
        return this.DIRECTIONS.COUNTERCLOCKWISE;
      }
    };

    function getCurrentDirectionForTopLeftQuadrant(
      diffX: number,
      diffY: number,
    ) {
      if (diffX === 0) {
        return getCurrentDirectionForYForLeftHemisphere(diffY);
      }
      return getCurrentDirectionForXForTopHemisphere(diffX);
    }

    function getCurrentDirectionForTopRightQuadrant(
      diffX: number,
      diffY: number,
    ) {
      if (diffX === 0) {
        return getCurrentDirectionForYForRightHemisphere(diffY);
      }
      return getCurrentDirectionForXForTopHemisphere(diffX);
    }

    function getCurrentDirectionForBottomLeftQuadrant(
      diffX: number,
      diffY: number,
    ) {
      if (diffX === 0) {
        return getCurrentDirectionForYForLeftHemisphere(diffY);
      }
      return getCurrentDirectionForXForBottomHemisphere(diffX);
    }

    function getCurrentDirectionForBottomRightQuadrant(
      diffX: number,
      diffY: number,
    ) {
      if (diffX === 0) {
        return getCurrentDirectionForYForRightHemisphere(diffY);
      }
      return getCurrentDirectionForXForBottomHemisphere(diffX);
    }

    switch (this.CURRENT_CIRCLE_SECTION) {
      case this.CIRCLE_SECTIONS.TOP_LEFT:
        this.CURRENT_DIRECTION = getCurrentDirectionForTopLeftQuadrant(
          differenceX,
          differenceY,
        );
        break;
      case this.CIRCLE_SECTIONS.TOP_RIGHT:
        this.CURRENT_DIRECTION = getCurrentDirectionForTopRightQuadrant(
          differenceX,
          differenceY,
        );
        break;
      case this.CIRCLE_SECTIONS.BOTTOM_LEFT:
        this.CURRENT_DIRECTION = getCurrentDirectionForBottomLeftQuadrant(
          differenceX,
          differenceY,
        );
        break;
      case this.CIRCLE_SECTIONS.BOTTOM_RIGHT:
        this.CURRENT_DIRECTION = getCurrentDirectionForBottomRightQuadrant(
          differenceX,
          differenceY,
        );
        break;
    }

    this.setAdditiveMovementLength(differenceX, differenceY);
    this.setPreviousDifferenceLengths(x, y);
  }

  setAdditiveMovementLength(x: number, y: number) {
    let absoluteHypotenuseLength = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

    if (this.CURRENT_DIRECTION === this.DIRECTIONS.CLOCKWISE) {
      this.CURRENT_VECTOR_DIFFERENCE_LENGTH += absoluteHypotenuseLength;
    }

    if (this.CURRENT_DIRECTION === this.DIRECTIONS.COUNTERCLOCKWISE) {
      this.CURRENT_VECTOR_DIFFERENCE_LENGTH -= absoluteHypotenuseLength;
    }
  }

  adjustCurrentIconAngleExponentially(angle: number) {
    const {noExpDistCorrectionDegree = 45} = this.props;
    let currentIconAngle = Math.round(angle);

    if (!this.props.isExpDistCorrection) {
      return currentIconAngle;
    }

    let lowestBoundaryDegree = 270 - noExpDistCorrectionDegree;
    let highestBoundaryDegree = 270 + noExpDistCorrectionDegree;

    if (currentIconAngle < lowestBoundaryDegree) {
      return (
        currentIconAngle - (45 - 0.004165 * Math.pow(currentIconAngle - 270, 2))
      );
    } else if (currentIconAngle > highestBoundaryDegree) {
      return (
        currentIconAngle + (45 - 0.004165 * Math.pow(currentIconAngle - 270, 2))
      );
    } else {
      return currentIconAngle;
    }
  }

  calculateIconCurrentPosition(icon: any) {
    let currentIconAngle = this.calculateCurrentIconAngle(icon);
    currentIconAngle =
      this.adjustCurrentIconAngleExponentially(currentIconAngle);

    return {
      top:
        this.state.XY_AXES_COORDINATES.Y -
        this.state.XY_AXES_COORDINATES.PAGE_Y +
        this.state.ICON_PATH_RADIUS *
          Math.sin(currentIconAngle * (Math.PI / 180)),
      left:
        this.state.XY_AXES_COORDINATES.X -
        this.state.XY_AXES_COORDINATES.PAGE_X -
        styles.icon.width / 2 +
        this.state.ICON_PATH_RADIUS *
          Math.cos(currentIconAngle * (Math.PI / 180)),
    };
  }

  calculateCurrentIconAngle(icon: any) {
    const id = icon.id;
    const index = icon.index;

    if (!this.INDEX_EXTRACTORS[id]) {
      this.INDEX_EXTRACTORS[id] = 0;
    }

    let currentAngle =
      270 +
      this.state.CURRENT_ICON_SHIFT +
      this.INDEX_EXTRACTORS[id] +
      index * this.ICON_POSITION_ANGLE;

    if (currentAngle < 270 - this.GIRTH_ANGLE / 2) {
      this.hideIconWhileMovingBehindCircle(id);
      this.INDEX_EXTRACTORS[id] += this.GIRTH_ANGLE;
      return currentAngle + this.GIRTH_ANGLE;
    }

    if (currentAngle > 270 + this.GIRTH_ANGLE / 2) {
      this.hideIconWhileMovingBehindCircle(id);
      this.INDEX_EXTRACTORS[id] -= this.GIRTH_ANGLE;
      return currentAngle - this.GIRTH_ANGLE;
    }

    return currentAngle;
  }

  calculateIconCurrentPositions(dx?: number) {
    function extractCorrectRestDisplacementThreshold(dx?: number): number {
      if (!dx || ((dx: number) => 0 && dx <= 1)) {
        return 1;
      }

      return 10;
    }

    this.state.icons.forEach((icon: any) => {
      let coordinates = this.calculateIconCurrentPosition(icon);

      Animated.spring(icon.position, {
        toValue: {
          x: coordinates.left,
          y: coordinates.top,
        },
        useNativeDriver: false,
        speed: 1000,
        restSpeedThreshold: 10,
        bounciness: 0,
        restDisplacementThreshold: extractCorrectRestDisplacementThreshold(dx),
      }).start(
        finish =>
          finish.finished &&
          typeof this.ALL_ICONS_FINISH_ANIMATIONS.resolvers[icon.id] ===
            'function' &&
          this.ALL_ICONS_FINISH_ANIMATIONS.resolvers[icon.id](),
      );
    });
  }

  hideIconWhileMovingBehindCircle(key: any) {
    this.setIconDisplayState(key, false);

    let timeout = setTimeout(() => {
      this.setIconDisplayState(key, true);
      clearTimeout(timeout);
    }, this.ICON_HIDE_ON_THE_BACK_DURATION);
  }

  setIconDisplayState(key: any, state: any) {
    this.setState({
      ...this.state,
      icons: [
        ...this.state.icons.map((icon: any) => {
          if (icon.id === key) {
            icon.isShown = state;
          }

          return icon;
        }),
      ],
    });
  }

  render() {
    let {onSelect, style = {}, styleIconText = {}, disable} = this.props;
    const {ICON_PATH_RADIUS} = this.state;
    const panHandlers = disable ? {} : this._panResponder.panHandlers;
    return (
      <Animated.View
        {...panHandlers}
        style={[
          styles.menuWrap,
          {
            height:
              menuSize + ICON_PATH_RADIUS - menuSize / 2 + menuIconSize - 100,
          },
        ]}>
        <View
          style={[style]}
          onLayout={debounce(
            this.defineAxesCoordinatesOnLayoutChangeByStylesOrScreenRotation,
            100,
          )}>
          {!disable && (
            <View
              style={{
                top: -10,
              }}>
              <Image
                source={line}
                style={{
                  position: 'absolute',
                  left: menuSize / 2 - ICON_PATH_RADIUS - 1,
                  top: menuSize / 2 - ICON_PATH_RADIUS - 1,
                  width: ICON_PATH_RADIUS * 2,
                  height: ICON_PATH_RADIUS * 2,
                }}
              />
              <Icons
                icons={this.state.icons}
                onPress={onSelect}
                styleIconText={styleIconText}
              />
            </View>
          )}

          <View
            style={[styles.wheel]}
            ref={component => (this._wheelNavigator = component)}
            onLayout={this.defineAxesCoordinatesOnLayoutDisplacement}>
            <Animated.View
              style={this.rotateOnInputPixelDistanceMatchingRadianShift()}>
              <RadialGradient
                style={styles.circleGradientWrap}
                colors={[
                  'rgba(255, 255, 255, 0)',
                  'rgba(255, 255, 255, 0.2)',
                  'rgba(255, 255, 255, 0)',
                ]}
                stops={[0.8, 0.9, 1]}
                center={[
                  styles.circleGradientWrap.width / 2,
                  styles.circleGradientWrap.width / 2,
                ]}
                radius={styles.circleGradientWrap.width / 2}>
                <RadialGradient
                  style={styles.circleGradient}
                  colors={['#FF00C7', 'rgba(255, 0, 199, 0.2)']}
                  stops={[0.7656, 1]}
                  center={[
                    styles.circleGradient.width / 2,
                    styles.circleGradient.width / 2,
                  ]}
                  radius={styles.circleGradient.width / 2}>
                  <RadialGradient
                    style={styles.circleGradient}
                    colors={['#7F18FF', 'rgba(127, 24, 255, 0)']}
                    stops={[0.401, 0.7292]}
                    center={[
                      styles.circleGradient.width / 2,
                      styles.circleGradient.width / 2,
                    ]}
                    radius={styles.circleGradient.width / 2}>
                    <RadialGradient
                      style={styles.circleGradient}
                      colors={['#00FF83', 'rgba(0, 255, 131, 0)']}
                      stops={[0, 0.2448]}
                      center={[
                        styles.circleGradient.width / 2,
                        styles.circleGradient.width / 2,
                      ]}
                      radius={styles.circleGradient.width / 2}>
                      <RadialGradient
                        style={styles.circleGradient}
                        colors={[
                          'rgba(19, 5, 61, 1)',
                          'rgba(19, 5, 61, 0)',
                          'rgba(0, 255, 131, 0)',
                          'rgba(0, 255, 131, 1)',
                          'rgba(127, 24, 255, 1)',
                        ]}
                        stops={[0.6354, 0.8124, 0.8125, 0.8126, 1]}
                        center={[
                          styles.circleGradient.width / 2,
                          styles.circleGradient.width / 2,
                        ]}
                        radius={styles.circleGradient.width / 2}
                      />
                    </RadialGradient>
                  </RadialGradient>
                </RadialGradient>
              </RadialGradient>

              {/* <LinearGradient
                style={styles.circleGradient}
                useAngle={true}
                angle={180}
                locations={[1]}
                colors={['rgba(126, 24, 255, 1)']}>
                <LinearGradient
                  style={styles.circleGradient}
                  useAngle={true}
                  angle={180}
                  locations={[0, 1]}
                  colors={['rgba(255, 182, 96, 1)', 'rgba(255, 255, 255, 0)']}>
                  <LinearGradient
                    style={styles.circleGradient}
                    useAngle={true}
                    angle={180}
                    locations={[0.4, 0.5, 0.6]}
                    colors={[
                      'rgba(0, 255, 131, 1)',
                      'rgba(255, 0, 199, 0.78)',
                      'rgba(126, 24, 255, 0.24)',
                    ]}
                  />
                </LinearGradient>
              </LinearGradient> */}
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    );
  }
}
