import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getDatabase, ref, update, remove } from 'firebase/database';
import { app } from '..//firebaseConfig';

const TaskDetailScreen = ({ route, navigation }) => {
  const { task } = route.params;

  const handleToggleComplete = async () => {
    const db = getDatabase(app);
    await update(ref(db, `tasks/${task.id}`), {
      completed: !task.completed,
      updatedAt: new Date().toISOString(),
    });
    navigation.goBack();
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
            const db = getDatabase(app);
            await remove(ref(db, `tasks/${task.id}`));
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.label}>Mô tả:</Text>
      <Text style={styles.text}>{task.description}</Text>
      <Text style={styles.label}>Hạn hoàn thành:</Text>
      <Text style={styles.text}>{task.deadline}</Text>
      <Text style={styles.label}>Tag:</Text>
      <Text style={styles.text}>{task.tag}</Text>
      <Text style={styles.label}>Trạng thái:</Text>
      <Text style={[styles.text, { color: task.completed ? '#43A047' : '#E84C6C' }]}>
        {task.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
      </Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#43A047' }]}
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
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#E84C6C', marginBottom: 12 },
  label: { fontWeight: 'bold', marginTop: 10 },
  text: { fontSize: 16, color: '#333', marginTop: 2 },
  row: { flexDirection: 'row', marginTop: 24, justifyContent: 'space-between' },
  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default TaskDetailScreen;