import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getDatabase, ref, update, remove } from 'firebase/database';
import { app } from '../firebaseConfig';

const TaskDetailScreen = ({ route, navigation }) => {
  const { task } = route.params || {};

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Không tìm thấy công việc</Text>
      </View>
    );
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return `${d.toLocaleDateString('vi-VN')} lúc ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleToggleComplete = async () => {
    const db = getDatabase(app);
    try {
      await update(ref(db, `tasks/${task.idUser || ''}/${task.id}`), {
        completed: !task.completed,
        updatedAt: new Date().toISOString(),
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái công việc.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa công việc này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!task.id || !task.idUser) {
                Alert.alert('Lỗi', 'Không tìm thấy ID công việc hoặc người dùng.');
                return;
              }

              const db = getDatabase(app);
              await remove(ref(db, `tasks/${task.idUser}/${task.id}`));
              Alert.alert('Thành công', 'Xóa công việc thành công.');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa công việc. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>

      <Text style={styles.label}>Mô tả:</Text>
      <Text style={styles.text}>{task.description || '-'}</Text>

      <Text style={styles.label}>Hạn hoàn thành:</Text>
      <Text style={styles.text}>{formatDateTime(task.deadline)}</Text>

      <Text style={styles.label}>Tag:</Text>
      <Text style={styles.text}>{task.tag || '-'}</Text>

      <Text style={styles.label}>Trạng thái:</Text>
      <Text style={[styles.text, { color: task.completed ? '#43A047' : '#E84C6C' }]}>
        {task.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
      </Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: task.completed ? '#F57C00' : '#43A047' }]}
          onPress={handleToggleComplete}
        >
          <Text style={styles.buttonText}>
            {task.completed ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#E84C6C' }]}
          onPress={() => navigation.navigate('TaskEdit', { task })}
        >
          <Text style={styles.buttonText}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#ccc' }]}
          onPress={handleDelete}
        >
          <Text style={[styles.buttonText, { color: '#333' }]}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 16, color: '#E84C6C' },
  label: { fontWeight: 'bold', marginTop: 12 },
  text: { fontSize: 16, color: '#333', marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default TaskDetailScreen;
