import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';

const TAGS = [ 'Tất cả','Cá nhân', 'Công việc', 'Học tập', 'Khác'];

const TagPicker = ({ selectedTag, onSelectTag }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
    {TAGS.map(tag => (
      <TouchableOpacity
        key={tag}
        style={[styles.tagBtn, selectedTag === tag && styles.tagBtnActive]}
        onPress={() => onSelectTag(tag)}
      >
        <Text style={{ color: selectedTag === tag ? '#fff' : '#E84C6C' }}>{tag}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  tagBtn: {
    borderWidth: 1,
    borderColor: '#E84C6C',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  tagBtnActive: {
    backgroundColor: '#E84C6C',
    borderColor: '#E84C6C',
  },
});

export default TagPicker;