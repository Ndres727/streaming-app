import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { usePlayer } from '../contexts/PlayerContext';

const TIMER_OPTIONS = [
  { label: '5 min', minutes: 5 },
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '60 min', minutes: 60 },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SleepTimerModal({ visible, onClose }: Props) {
  const { setSleepTimer, cancelSleepTimer, sleepTimer, formatTime } = usePlayer();

  const handleSelect = (minutes: number) => {
    setSleepTimer(minutes);
    onClose();
  };

  const handleCancel = () => {
    cancelSleepTimer();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Sleep Timer</Text>
          <Text style={styles.subtitle}>Music will pause automatically</Text>

          {sleepTimer && (
            <View style={styles.activeTimer}>
              <Text style={styles.activeLabel}>Timer running</Text>
              <Text style={styles.activeTime}>
                {formatTime(sleepTimer.remaining * 1000)}
              </Text>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel Timer</Text>
              </TouchableOpacity>
            </View>
          )}

          {!sleepTimer && (
            <View style={styles.options}>
              {TIMER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.minutes}
                  style={styles.optionBtn}
                  onPress={() => handleSelect(opt.minutes)}
                >
                  <Text style={styles.optionText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  content: {
    backgroundColor: '#18181b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#f4f4f5', textAlign: 'center' },
  subtitle: { color: '#a1a1aa', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  activeTimer: { alignItems: 'center', marginBottom: 16 },
  activeLabel: { color: '#22c55e', fontSize: 14 },
  activeTime: { fontSize: 36, fontWeight: 'bold', color: '#f4f4f5', marginVertical: 8 },
  cancelBtn: {
    backgroundColor: '#27272a',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  cancelText: { color: '#f87171', fontSize: 14, fontWeight: '600' },
  options: { gap: 8 },
  optionBtn: {
    backgroundColor: '#27272a',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  optionText: { color: '#f4f4f5', fontSize: 16, fontWeight: '500' },
  closeBtn: { marginTop: 16, alignItems: 'center', paddingVertical: 10 },
  closeText: { color: '#71717a', fontSize: 14 },
});
