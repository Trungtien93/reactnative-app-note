import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDatabase, ref, push, set, update } from 'firebase/database';
import { app } from '../firebaseConfig';
import { scheduleTaskNotification, cancelTaskNotification } from '../utils/notification';
import { AuthContext } from '../context/AuthContext';

const TAGS = ['Cá nhân', 'Công việc', 'Học tập', 'Khác'];

const TaskEditScreen = ({ route, navigation }) => {
  const editingTask = route?.params?.task;
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [deadline, setDeadline] = useState(editingTask?.deadline ? new Date(editingTask.deadline) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tag, setTag] = useState(editingTask?.tag || TAGS[0]);
  const [completed, setCompleted] = useState(editingTask?.completed || false);

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Lỗi', 'Bạn chưa đăng nhập!');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề công việc!');
      return;
    }

    const db = getDatabase(app);
    const userTasksRef = ref(db, `tasks/${user.uid}`);

    if (editingTask && editingTask.id) {
      const taskRef = ref(db, `tasks/${user.uid}/${editingTask.id}`);

      // Hủy thông báo cũ nếu có
      if (editingTask.notificationId) {
        await cancelTaskNotification(editingTask.notificationId);
      }

      await update(taskRef, {
        title,
        description,
        deadline: deadline.toISOString(),
        tag,
        completed,
        status: completed ? 'completed' : 'in_progress',
        updatedAt: new Date().toISOString(),
      });

      // Lên lịch thông báo mới
      const notificationId = await scheduleTaskNotification({
        id: editingTask.id,
        title,
        deadline: deadline.toISOString(),
      });

      if (notificationId) {
        await update(taskRef, { notificationId });
      }
    } else {
      // Tạo task mới
      const newRef = push(userTasksRef);
      const newTask = {
        id: newRef.key,  // Gán id cho task mới rất quan trọng
        title,
        description,
        deadline: deadline.toISOString(),
        tag,
        completed: false,
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await set(newRef, newTask);

      // Lên lịch thông báo
      const notificationId = await scheduleTaskNotification({
        id: newRef.key,
        title,
        deadline: deadline.toISOString(),
      });

      if (notificationId) {
        await update(ref(db, `tasks/${user.uid}/${newRef.key}`), { notificationId });
      }
    }

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {editingTask ? 'Sửa công việc' : 'Thêm công việc mới'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Tiêu đề"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Mô tả"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text style={{ color: '#333' }}>
          Hạn hoàn thành:{' '}
          {deadline
            ? deadline.toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : 'Chọn ngày'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={deadline}
          mode="datetime"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setDeadline(date);
          }}
        />
      )}

      <View style={styles.tagContainer}>
        {TAGS.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tag, tag === t && { backgroundColor: '#E84C6C' }]}
            onPress={() => setTag(t)}
          >
            <Text style={[styles.tagText, tag === t && { color: 'white' }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#E84C6C' }]} onPress={handleSave}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
          {editingTask ? 'Cập nhật' : 'Thêm mới'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#E84C6C', marginTop: 40 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  tagContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  tagText: {
    fontSize: 14,
    color: '#555',
  },
  saveButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default TaskEditScreen;
