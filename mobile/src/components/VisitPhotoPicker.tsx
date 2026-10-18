import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MAX_VISIT_PHOTOS } from '../constants/visits';
import { colors, radius, spacing } from '../constants/theme';

type Props = {
  photoUris: string[];
  disabled: boolean;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export function VisitPhotoPicker({ photoUris, disabled, onAdd, onRemove }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <Text accessibilityRole="header" style={styles.heading}>写真</Text>
        <Text style={styles.count}>{photoUris.length}/{MAX_VISIT_PHOTOS}</Text>
      </View>
      {photoUris.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
          {photoUris.map((uri, index) => (
            <View key={`${uri}-${index}`} style={styles.photoFrame}>
              <Image source={{ uri }} style={styles.photo} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${index + 1}枚目の写真を削除`}
                disabled={disabled}
                onPress={() => onRemove(index)}
                style={styles.remove}
              >
                <Text style={styles.removeText}>×</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
      <Pressable
        accessibilityRole="button"
        disabled={disabled || photoUris.length >= MAX_VISIT_PHOTOS}
        onPress={onAdd}
        style={({ pressed }) => [styles.addButton, (disabled || photoUris.length >= MAX_VISIT_PHOTOS) && styles.disabled, pressed && styles.pressed]}
      >
        <Text style={styles.addText}>＋ 写真を撮る</Text>
      </Pressable>
      <Text style={styles.help}>訪問確認には写真が1枚以上必要です。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heading: { color: colors.text, fontSize: 18, fontWeight: '700' },
  count: { color: '#66736f', fontSize: 13 },
  photos: { gap: spacing.sm },
  photoFrame: { width: 116, height: 116, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: '#e7ebe9' },
  photo: { width: '100%', height: '100%' },
  remove: { position: 'absolute', right: 6, top: 6, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.72)' },
  removeText: { color: '#fff', fontSize: 20, lineHeight: 23 },
  addButton: { minHeight: 50, borderRadius: radius.sm, borderWidth: 1, borderColor: '#aeb8b4', alignItems: 'center', justifyContent: 'center' },
  addText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  help: { color: '#66736f', fontSize: 12 },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.65 },
});
