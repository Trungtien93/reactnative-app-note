import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PRIORITY_COLORS = {
  'Cao': '#E84C6C',
  'Trung bình': '#FB8C00',
  'Thấp': '#43A047',
};

const PriorityChip = ({ priority = 'Trung bình' }) => (
  <View style={[styles.chip, { backgroundColor: PRIORITY_COLORS[priority] || '#888' }]}>
    <Text style={styles.text}>{priority}</Text>
  </View>
);

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default PriorityChip;