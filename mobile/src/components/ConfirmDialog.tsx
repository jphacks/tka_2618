// 確認ダイアログです（Figma の「確認ダイアログ」）。
// 画面を暗くして、真ん中に「キャンセル」「削除する」などのボタンを出します。

import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { Button } from './Button';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'キャンセル',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      {/* 暗幕を押してもキャンセルになります */}
      <Pressable accessibilityLabel={cancelLabel} style={styles.scrim} onPress={onCancel}>
        {/* ダイアログの中を押したときは閉じないようにします */}
        <Pressable accessibilityRole="alert" style={styles.dialog} onPress={() => {}}>
          <View style={styles.message}>
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.body}>{message}</Text>}
          </View>
          <View style={styles.buttons}>
            <Button title={cancelLabel} variant="secondary" onPress={onCancel} style={styles.button} />
            <Button title={confirmLabel} onPress={onConfirm} style={styles.button} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.scrim,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    padding: spacing.lg,
    gap: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },
  message: {
    gap: spacing.sm,
  },
  title: {
    ...fonts.sectionTitle,
    color: colors.text,
  },
  body: {
    ...fonts.body,
    color: colors.textSecondary,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
