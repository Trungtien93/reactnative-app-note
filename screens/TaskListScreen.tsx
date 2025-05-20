import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../firebaseConfig';
import TaskItem from '../components/TaskItem';
import TagPicker from '../components/TagPicker';
import StatusFilter from '../components/StatusFilter';
import { suggestPriorityTasks } from '../utils/aiSuggest';
import { AuthContext } from '../context/AuthContext';

const TaskListScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('Tất cả');
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return;

    const db = getDatabase(app);
    const tasksRef = ref(db, `tasks/${user.uid}`);

    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.keys(data).map(id => ({ id, ...data[id] }));
      setTasks(list);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredTasks = tasks.filter(t => {
    const matchSearch =
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    const matchTag = selectedTag === 'Tất cả' || t.tag === selectedTag;
    
    // Kiểm tra quá hạn
    const now = new Date();
    const deadline = t.deadline ? new Date(t.deadline) : null;
    const isOverdue = deadline && deadline < now && !t.completed && t.status !== 'completed';
    
    const matchStatus =
      selectedStatus === 'Tất cả' ||
      (selectedStatus === 'Đã xong' && (t.completed || t.status === 'completed')) ||
      (selectedStatus === 'Đang làm' && !t.completed && t.status !== 'completed' && !isOverdue) ||
      (selectedStatus === 'Quá hạn' && isOverdue);
    
    return matchSearch && matchTag && matchStatus;
  });

  const priorityTasks = suggestPriorityTasks(tasks).slice(0, 3);

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return `${d.toLocaleDateString('vi-VN')} lúc ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách công việc</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm công việc..."
        value={search}
        onChangeText={setSearch}
      />

      {priorityTasks.length > 0 && (
        <View style={{ marginHorizontal: 16, marginBottom: 8 }}>
          <Text style={{ fontWeight: 'bold', color: '#E84C6C', marginBottom: 4 }}>
            Cần hoàn thành trước:
          </Text>
          {priorityTasks.map(task => (
            <View
              key={task.id}
              style={{ backgroundColor: '#FFF3E0', borderRadius: 8, padding: 8, marginBottom: 4 }}
            >
              <Text style={{ fontWeight: 'bold', color: '#FB8C00' }}>{task.title}</Text>
              <Text style={{ color: '#555', fontSize: 13 }}>
                Hạn: {formatDateTime(task.deadline)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ marginBottom: 4, marginLeft: 12 }}>
        <StatusFilter selectedStatus={selectedStatus} onSelectStatus={setSelectedStatus} />
        <TagPicker selectedTag={selectedTag} onSelectTag={setSelectedTag} />
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskItem item={item} onPress={() => navigation.navigate('TaskDetail', { task: item })} />
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('TaskEdit')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', margin: 16, color: '#E84C6C', marginTop: 70 },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#E84C6C',
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  addButtonText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  searchInput: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
});

export default TaskListScreen;
