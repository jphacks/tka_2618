// オン・オフを切り替えるトグルです（Figma の「トグル」: 48 × 28）。

import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '../constants/theme';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
};

export function Toggle({ value, onValueChange, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      hitSlop={8}
      onPress={() => onValueChange(!value)}
      style={[styles.track, value ? styles.trackOn : styles.trackOff]}
    >
      <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: radius.full,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: colors.primary,
  },
  trackOff: {
    backgroundColor: colors.border,
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.background,
  },
  knobOn: {
    alignSelf: 'flex-end',
    marginRight: 3,
  },
  knobOff: {
    alignSelf: 'flex-start',
    marginLeft: 3,
  },
});
