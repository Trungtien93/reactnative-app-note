import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import PriorityChip from './PriorityChip';

const TAG_COLORS = {
  'Cá nhân': '#43A047',
  'Công việc': '#FB8C00',
  'Học tập': '#8E24AA',
  'Khác': '#607D8B',
  'Tất cả': '#E84C6C'
};

// Hàm định dạng ngày và giờ
const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const date = d.toLocaleDateString('vi-VN'); // ví dụ: 18/05/2025
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }); // ví dụ: 16:17
  return `${date} lúc ${time}`;
};

const getStatusText = (item) => {
  if (item.completed) return '✅ Đã xong';
  const now = new Date();
  const deadline = item.deadline ? new Date(item.deadline) : null;
  if (deadline && deadline < now) return '⚠️ Quá hạn';
  return '⏳ Đang làm';
};

const getStatusColor = (item) => {
  if (item.completed) return '#43A047';
  const now = new Date();
  const deadline = item.deadline ? new Date(item.deadline) : null;
  if (deadline && deadline < now) return '#E84C6C';
  return '#888';
};

const TaskItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.taskItem} onPress={onPress}>
    <Text style={styles.title}>{item.title}</Text>
    {item.deadline && (
      <Text style={styles.deadline}>Hạn: {formatDateTime(item.deadline)}</Text>
    )}
    <Text style={[styles.status, { color: getStatusColor(item) }]}>
      {getStatusText(item)}
    </Text>
    <Text style={[styles.tag, { color: TAG_COLORS[item.tag] || '#E84C6C' }]}>
      {item.tag}
    </Text>
    <PriorityChip priority={item.priority} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  taskItem: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  deadline: { fontSize: 15, color: '#555', marginTop: 2 },
  status: { fontSize: 15, marginTop: 2 },
  tag: { fontSize: 13, marginTop: 2, fontStyle: 'italic' },
});

export default TaskItem;
