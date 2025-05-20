import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getDatabase, ref, update, remove, get } from 'firebase/database';
import { app } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const TaskDetailScreen = ({ route, navigation }) => {
  const { task } = route.params || {};
  const { user } = useContext(AuthContext);

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Không tìm thấy công việc</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return `${d.toLocaleDateString('vi-VN')} lúc ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleToggleComplete = async () => {
    if (!user || !user.uid) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      return;
    }

    const db = getDatabase(app);
    try {
      const newStatus = !task.completed;
      
      // Sử dụng user.uid thay vì task.idUser
      const taskRef = ref(db, `tasks/${user.uid}/${task.id}`);
      
      // Kiểm tra task có tồn tại không
      const snapshot = await get(taskRef);
      if (!snapshot.exists()) {
        Alert.alert('Lỗi', 'Không tìm thấy công việc');
        return;
      }
      
      await update(taskRef, {
        completed: newStatus,
        status: newStatus ? 'completed' : 'in_progress',
        updatedAt: new Date().toISOString(),
      });
      
      Alert.alert(
        'Thành công', 
        newStatus ? 'Đã đánh dấu hoàn thành' : 'Đã đánh dấu chưa hoàn thành'
      );
      
      navigation.goBack();
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái công việc.');
    }
  };

  const handleDelete = () => {
    if (!user || !user.uid) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      return;
    }
    
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa công việc này không?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = getDatabase(app);
              const taskRef = ref(db, `tasks/${user.uid}/${task.id}`);
              
              // Kiểm tra xem task có tồn tại không
              const snapshot = await get(taskRef);
              if (!snapshot.exists()) {
                Alert.alert('Lỗi', 'Không tìm thấy công việc cần xóa');
                return;
              }

              await remove(taskRef);
              Alert.alert('Thành công', 'Đã xóa công việc thành công');
              navigation.goBack();
            } catch (error) {
              console.error('Lỗi khi xóa task:', error);
              Alert.alert('Lỗi', 'Không thể xóa công việc. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: { 
    flex: 1,
    backgroundColor: '#fff',
    padding: 16 
  },
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
