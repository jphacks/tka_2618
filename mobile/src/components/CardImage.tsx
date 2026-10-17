// カードの画像部分です。画像のURLがあれば画像を、なければ灰色の仮表示を出します。

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
    backgroundColor: colors.cardImage,
  },
});
