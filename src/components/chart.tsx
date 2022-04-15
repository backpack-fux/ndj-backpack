import React, {useRef, useState} from 'react';
import {PanResponder, View} from 'react-native';
import {AreaChart} from 'react-native-svg-charts';
import {Circle, G, Line, Path, Rect, Text as SvgText} from 'react-native-svg';
import * as shape from 'd3-shape';
import {t} from 'react-native-tailwindcss';
import {colors} from '@app/assets/colors.config';
import {apx, formatCurrency} from '@app/utils';
import {Paragraph} from './text';

export const Chart = ({
  datasets,
  labels,
  currency,
}: {
  datasets: number[];
  labels: string[];
  currency: string;
}) => {
  const size = useRef(labels.length);
  const max = Math.max(...datasets);
  const min = Math.min(...datasets);

  const [positionX, setPositionX] = useState(-1); // The currently selected X coordinate position
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        evt.stopPropagation();
        evt.preventDefault();
        updatePosition(evt.nativeEvent.locationX);
        return true;
      },
      onPanResponderMove: (evt, gestureState) => {
        evt.stopPropagation();
        evt.preventDefault();
        updatePosition(evt.nativeEvent.locationX);
        return false;
      },
      onPanResponderRelease: () => {
        setPositionX(-1);
      },
    }),
  );

  const updatePosition = (x: number) => {
    const YAxisWidth = apx(130);
    const x0 = apx(0); // x0 position
    const chartWidth = apx(750) - YAxisWidth - x0;
    const xN = x0 + chartWidth; //xN position
    const xDistance = chartWidth / size.current; // The width of each coordinate point
    if (x <= x0) {
      x = x0;
    }
    if (x >= xN) {
      x = xN;
    }

    // console.log((x - x0) )

    // The selected coordinate x :
    // (x - x0)/ xDistance = value
    let value = Number(((x - x0) / xDistance).toFixed(0));
    if (value >= size.current - 1) {
      value = size.current - 1; // Out of chart range, automatic correction
    }

    setPositionX(Number(value));
  };

  const CustomLine = ({line}: any) => {
    return (
      <Path
        key="line"
        d={line}
        stroke={colors.textGray}
        strokeWidth={apx(6)}
        fill="none"
      />
    );
  };

  const Tooltip = ({x, y, ticks}: any) => {
    if (positionX < 0) {
      return null;
    }

    const date = labels[positionX];

    return (
      <G x={x(positionX)} key="tooltip">
        <G
          x={positionX > size.current / 2 ? -apx(350 + 10) : apx(10)}
          y={y(datasets[positionX]) - apx(10)}>
          <Rect
            y={-apx(24 + 24 + 20) / 2}
            rx={apx(12)} // borderRadius
            ry={apx(12)} // borderRadius
            width={apx(350)}
            height={apx(96)}
            stroke="rgba(254, 190, 24, 0.27)"
            fill="rgba(255, 255, 255, 0.8)"
          />

          <SvgText x={apx(20)} fill="#617485" opacity={0.65} fontSize={apx(28)}>
            {date}
          </SvgText>
          <SvgText
            x={apx(20)}
            y={apx(24 + 20)}
            fontSize={apx(28)}
            fontWeight="bold"
            fill={colors.secondary}>
            {formatCurrency(datasets[positionX], currency)}
          </SvgText>
        </G>

        <G x={x}>
          <Line
            y1={ticks[0]}
            y2={ticks[Number(ticks.length)]}
            stroke={colors.white}
            strokeWidth={apx(4)}
            strokeDasharray={[6, 3]}
          />

          <Circle
            cy={y(datasets[positionX])}
            r={apx(20 / 2)}
            stroke="#fff"
            strokeWidth={apx(2)}
            fill={colors.primary}
          />
        </G>
      </G>
    );
  };

  const verticalContentInset = {top: apx(40), bottom: apx(40)};

  return (
    <View
      style={[
        t.flexRow,
        t.wFull,
        t.selfStretch,
        {
          height: apx(400),
        },
      ]}>
      <View style={[t.flex1]} {...panResponder.current.panHandlers}>
        <Paragraph
          text={formatCurrency(max, currency)}
          align="right"
          size={14}
          type="bold"
          color={colors.textGray}
          marginRight={5}
          marginTop={5}
        />
        <AreaChart
          style={[t.flex1]}
          data={datasets}
          curve={shape.curveMonotoneX}
          contentInset={{...verticalContentInset}}
          svg={{fill: 'url(#gradient)'}}>
          <CustomLine />
          <Tooltip />
        </AreaChart>
        <Paragraph
          text={formatCurrency(min, currency)}
          marginLeft={5}
          size={14}
          type="bold"
          color={colors.textGray}
        />
      </View>
    </View>
  );
};
