import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Platform,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../firebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';

const screenWidth = Dimensions.get('window').width;

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

const StatsScreen = () => {
  const [done, setDone] = useState(0);
  const [doing, setDoing] = useState(0);
  const [late, setLate] = useState(0);
  const [total, setTotal] = useState(0);

  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    const db = getDatabase(app);
    const tasksRef = ref(db, 'tasks');
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val() || {};
      let d = 0, doin = 0, l = 0, t = 0;
      const today = formatDate(new Date());
      Object.values(data).forEach((task: any) => {
        if (!task.deadline) return;
        const deadline = formatDate(new Date(task.deadline));
        if (deadline >= formatDate(fromDate) && deadline <= formatDate(toDate)) {
          t++;
          if (task.completed) d++;
          else if (deadline < today) l++;
          else doin++;
        }
      });
      setDone(d);
      setDoing(doin);
      setLate(l);
      setTotal(t);
    });
    return () => unsubscribe();
  }, [fromDate, toDate]);

  const chartData = [
    { name: 'Đã xong', population: done, color: '#4CAF50', legendFontColor: '#333', legendFontSize: 14 },
    { name: 'Đang làm', population: doing, color: '#90A4AE', legendFontColor: '#333', legendFontSize: 14 },
    { name: 'Quá hạn', population: late, color: '#EF5350', legendFontColor: '#333', legendFontSize: 14 },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>📊 Thống kê công việc</Text>

      <View style={styles.dateRow}>
        <TouchableOpacity onPress={() => setShowFromPicker(true)} style={styles.dateBtn}>
          <Text style={styles.dateText}>📅 Từ: {formatDate(fromDate)}</Text>
        </TouchableOpacity>
        <Text style={{ marginHorizontal: 8 }}>→</Text>
        <TouchableOpacity onPress={() => setShowToPicker(true)} style={styles.dateBtn}>
          <Text style={styles.dateText}>📅 Đến: {formatDate(toDate)}</Text>
        </TouchableOpacity>
      </View>

      {showFromPicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(_, date) => {
            setShowFromPicker(false);
            if (date) setFromDate(date);
          }}
          maximumDate={toDate}
        />
      )}
      {showToPicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(_, date) => {
            setShowToPicker(false);
            if (date) setToDate(date);
          }}
          minimumDate={fromDate}
        />
      )}

      <View style={styles.chartCard}>
        <PieChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{ color: () => '#888' }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="16"
          absolute
        />
      </View>

      <View style={styles.summaryBox}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Tổng</Text>
          <Text style={styles.statValue}>{total}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Đã xong</Text>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>{done}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Đang làm</Text>
          <Text style={[styles.statValue, { color: '#90A4AE' }]}>{doing}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Quá hạn</Text>
          <Text style={[styles.statValue, { color: '#EF5350' }]}>{late}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', padding: 20 },
  header: { fontSize: 22, fontWeight: '600', color: '#222', textAlign: 'center', marginBottom: 20 , marginTop: 40 },
  dateRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  dateBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  dateText: { color: '#333', fontSize: 14 },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginVertical: 16,
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 14, color: '#777' },
  statValue: { fontSize: 18, fontWeight: '600', color: '#222' },
});

export default StatsScreen;
