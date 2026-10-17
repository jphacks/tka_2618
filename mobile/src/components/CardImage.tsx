// カードの画像部分です。画像のURLがあれば写真を、なければ（読み込み中も）薄い色を出します。

import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../constants/theme';

type Props = {
  imageUrl?: string;
  style?: StyleProp<ViewStyle>;
};

export function CardImage({ imageUrl, style }: Props) {
  return (
    <View style={[styles.placeholder, style]}>
      {imageUrl && <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.imagePlaceholder,
    overflow: 'hidden',
  },
});
