import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { scheduleTaskNotification, cancelTaskNotification } from '../utils/notification';
import { AuthContext } from '../context/AuthContext';
import { useTasks, Task } from '../utils/useTasks';

const TAGS = ['Cá nhân', 'Công việc', 'Học tập', 'Khác'];

const TaskEditScreen = ({ route, navigation }) => {
  const editingTask = route?.params?.task;
  const { user } = useContext(AuthContext);
  const { addTask, updateTask } = useTasks();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
    try {
      const taskData: Partial<Task> = {
        title,
        description,
        deadline: deadline.toISOString(),
        tag,
        completed,
      };

      let taskId: string | null = null;
      let notificationId: string | undefined;

      if (editingTask && editingTask.id) {
        // Hủy thông báo cũ nếu có
        if (editingTask.notificationId) {
          await cancelTaskNotification(editingTask.notificationId);
        }

        // Cập nhật task
        const success = await updateTask(editingTask.id, taskData);
        if (!success) {
          throw new Error('Không thể cập nhật công việc');
        }
        taskId = editingTask.id;
      } else {
        // Tạo task mới
        taskId = await addTask(taskData as Task);
        if (!taskId) {
          throw new Error('Không thể tạo công việc mới');
        }
      }

      // Lên lịch thông báo mới nếu có taskId
      if (taskId) {
        notificationId = await scheduleTaskNotification({
          id: taskId,
          title,
          deadline: deadline.toISOString(),
        });

        // Cập nhật notificationId nếu có
        if (notificationId) {
          await updateTask(taskId, { notificationId });
        }
      }

      Alert.alert('Thành công', editingTask ? 'Đã cập nhật công việc' : 'Đã thêm công việc mới');
      navigation.goBack();
    } catch (error) {
      console.error('Lỗi khi lưu công việc:', error);
      Alert.alert('Lỗi', 'Không thể lưu công việc. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
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

      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: '#E84C6C' }]} 
        onPress={handleSave}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            {editingTask ? 'Cập nhật' : 'Thêm mới'}
          </Text>
        )}
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
