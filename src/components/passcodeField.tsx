import React, {useEffect} from 'react';
import {Text} from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
  MaskSymbol,
  isLastFilledCell,
  RenderCellOptions,
} from 'react-native-confirmation-code-field';
import {t} from 'react-native-tailwindcss';

interface Props {
  setValue: (value: string) => void;
  value: string;
  editable?: boolean;
  autoFocus?: boolean;
  cellCount?: number;
}

export const PasscodeField = ({
  cellCount = 6,
  value = '',
  setValue = () => {},
  editable = false,
  autoFocus = false,
}: Props) => {
  const ref = useBlurOnFulfill({value, cellCount});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const renderCell = ({index, symbol, isFocused}: RenderCellOptions) => {
    let textChild = null;

    if (symbol) {
      textChild = (
        <MaskSymbol
          maskSymbol="●"
          isLastFilledCell={isLastFilledCell({index, value})}>
          {symbol}
        </MaskSymbol>
      );
    } else if (isFocused) {
      textChild = <Cursor />;
    }

    return (
      <Text
        key={index}
        style={[
          t.bgPurple200,
          t.roundedLg,
          t.overflowHidden,
          t.w10,
          t.h10,
          t.pT3,
          t.textCenter,
          t.textWhite,
        ]}
        onLayout={getCellOnLayoutHandler(index)}>
        {textChild}
      </Text>
    );
  };

  useEffect(() => {
    if (ref && autoFocus && !value) {
      ref.current?.focus();
    }
  }, [autoFocus, ref, value]);

  return (
    <CodeField
      ref={ref}
      {...props}
      value={value}
      onChangeText={setValue}
      cellCount={cellCount}
      editable={editable}
      rootStyle={[t.wFull, t.justifyAround]}
      autoFocus={autoFocus}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      renderCell={renderCell}
    />
  );
};
