import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';

const STATUS = ['Tất cả', 'Đã xong', 'Đang làm'];

const StatusFilter = ({ selectedStatus, onSelectStatus }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
    {STATUS.map(status => (
      <TouchableOpacity
        key={status}
        style={[styles.statusBtn, selectedStatus === status && styles.statusBtnActive]}
        onPress={() => onSelectStatus(status)}
      >
        <Text style={{ color: selectedStatus === status ? '#fff' : '#E84C6C' }}>{status}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  statusBtn: {
    borderWidth: 1,
    borderColor: '#E84C6C',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  statusBtnActive: {
    backgroundColor: '#E84C6C',
    borderColor: '#E84C6C',
  },
});

export default StatusFilter;