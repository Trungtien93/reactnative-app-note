import React, { useState } from 'react';
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

const TAGS = ['Cá nhân', 'Công việc', 'Học tập', 'Khác'];

// Định nghĩa interface Task cho rõ ràng
interface Task {
  id?: string;
  title: string;
  description?: string;
  deadline?: string; // ISO string
  tag?: string;
  completed?: boolean;
  notificationId?: string; // id notification để có thể hủy
  createdAt?: string;
  updatedAt?: string;
}

interface TaskEditScreenProps {
  route: {
    params?: {
      task?: Task;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

const TaskEditScreen: React.FC<TaskEditScreenProps> = ({ route, navigation }) => {
  const editingTask = route?.params?.task;

  const [title, setTitle] = useState<string>(editingTask?.title || '');
  const [description, setDescription] = useState<string>(editingTask?.description || '');
  const [deadline, setDeadline] = useState<Date>(
    editingTask?.deadline ? new Date(editingTask.deadline) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [tag, setTag] = useState<string>(editingTask?.tag || TAGS[0]);
  const [completed, setCompleted] = useState<boolean>(editingTask?.completed || false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề công việc!');
      return;
    }
    const db = getDatabase(app);

    // Nếu đang chỉnh sửa thì hủy thông báo cũ (nếu có) rồi tạo lại
    if (editingTask) {
      if (editingTask.notificationId) {
        await cancelTaskNotification(editingTask.notificationId);
      }

      // Cập nhật task
      await update(ref(db, `tasks/${editingTask.id}`), {
        title,
        description,
        deadline: deadline.toISOString(),
        tag,
        completed,
        updatedAt: new Date().toISOString(),
      });

      // Đặt lại notification, lấy notificationId mới
      const notificationId = await scheduleTaskNotification({
        id: editingTask.id!,
        title,
        deadline: deadline.toISOString(),
      });

      // Cập nhật notificationId mới vào task
      if (notificationId) {
        await update(ref(db, `tasks/${editingTask.id}`), { notificationId });
      }
    } else {
      // Thêm task mới
      const newRef = push(ref(db, 'tasks'));
      const newTask: Task = {
        title,
        description,
        deadline: deadline.toISOString(),
        tag,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await set(newRef, newTask);

      // Đặt notification cho task mới
      const notificationId = await scheduleTaskNotification({
        id: newRef.key!,
        title,
        deadline: deadline.toISOString(),
      });

      if (notificationId) {
        await update(ref(db, `tasks/${newRef.key}`), { notificationId });
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

      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.input}
      >
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
            : ''}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={deadline}
          mode="datetime"
          display="spinner"
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setDeadline(date);
          }}
          minimumDate={new Date()}
        />
      )}

      <View style={styles.tagRow}>
        {TAGS.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tag, tag === t && styles.tagSelected]}
            onPress={() => setTag(t)}
          >
            <Text style={{ color: tag === t ? '#fff' : '#E84C6C' }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {editingTask && (
        <TouchableOpacity
          style={[
            styles.input,
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
          ]}
          onPress={() => setCompleted(!completed)}
        >
          <Text style={{ color: '#333' }}>Đã hoàn thành</Text>
          <Text style={{ color: completed ? '#43A047' : '#aaa', fontWeight: 'bold' }}>
            {completed ? '✔️' : '❌'}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Lưu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E84C6C',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  tagRow: { flexDirection: 'row', marginBottom: 16, flexWrap: 'wrap' },
  tag: {
    borderWidth: 1,
    borderColor: '#E84C6C',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagSelected: { backgroundColor: '#E84C6C', borderColor: '#E84C6C' },
  saveButton: {
    backgroundColor: '#E84C6C',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default TaskEditScreen;
