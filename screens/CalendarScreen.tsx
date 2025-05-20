import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';

LocaleConfig.locales['vi'] = {
  monthNames: ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],
  monthNamesShort: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'],
  dayNames: ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'],
  dayNamesShort: ['CN','T2','T3','T4','T5','T6','T7'],
  today: 'Hôm nay'
};
LocaleConfig.defaultLocale = 'vi';

type Task = {
  title: string;
  deadline: string;
  completed: boolean;
  description?: string;
  tag?: string;
  [key: string]: any;
};

const CalendarScreen = () => {
  const { user } = useContext(AuthContext);
  const [markedDates, setMarkedDates] = useState({});
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (!user) return;

    const db = getDatabase(app);
    const tasksRef = ref(db, `tasks/${user.uid}`);
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val() || {};
      const marks = {};
      const taskList = [];
      
      Object.entries(data).forEach(([taskId, taskObj]) => {
        const task = taskObj as Task;
        if (task.deadline) {
          const date = task.deadline.slice(0, 10);
          marks[date] = {
            marked: true,
            dotColor: task.completed ? '#43A047' : '#E84C6C',
            activeOpacity: 0,
          };
          taskList.push({ ...task, id: taskId, deadline: date });
        }
      });
      setMarkedDates(marks);
      setTasks(taskList);
    });
    return () => unsubscribe();
  }, [user]);

  const tasksForSelectedDate = tasks.filter(
    (task) => selectedDate && task.deadline === selectedDate
  );

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.header}>Vui lòng đăng nhập để xem lịch công việc</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.header}>📆 Lịch công việc</Text>
      <Calendar
        markedDates={{
          ...markedDates,
          ...(selectedDate && {
            [selectedDate]: {
              ...(markedDates[selectedDate] || {}),
              selected: true,
              selectedColor: '#E84C6C',
            },
          }),
        }}
        onDayPress={day => setSelectedDate(day.dateString)}
        theme={{
          backgroundColor: '#fff',
          calendarBackground: '#fff',
          textSectionTitleColor: '#222',
          selectedDayBackgroundColor: '#E84C6C',
          selectedDayTextColor: '#fff',
          todayTextColor: '#E84C6C',
          dayTextColor: '#333',
          textDisabledColor: '#ccc',
          dotColor: '#E84C6C',
          selectedDotColor: '#fff',
          arrowColor: '#E84C6C',
          monthTextColor: '#E84C6C',
          indicatorColor: '#E84C6C',
          textDayFontWeight: '400',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '500',
          textDayFontSize: 15,
          textMonthFontSize: 20,
          textDayHeaderFontSize: 13,
        }}
        style={styles.calendar}
      />

      {selectedDate ? (
        <View style={styles.taskListContainer}>
          <Text style={styles.taskListTitle}>
            📌 Công việc ngày <Text style={{ fontWeight: 'bold' }}>{selectedDate}</Text>
          </Text>
          {tasksForSelectedDate.length === 0 ? (
            <Text style={styles.noTaskText}>Không có công việc nào.</Text>
          ) : (
            tasksForSelectedDate.map((item) => (
              <View key={item.id} style={styles.taskBox}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskMeta}>⏰ Hạn: {item.deadline}</Text>
                {item.tag && <Text style={styles.taskMeta}>🏷️ Tag: {item.tag}</Text>}
                <Text style={[styles.taskStatus, { color: item.completed ? '#43A047' : '#E84C6C' }]}>
                  {item.completed ? '✔️ Đã hoàn thành' : '🕓 Chưa hoàn thành'}
                </Text>
                {item.description ? (
                  <Text style={styles.taskDescription}>{item.description}</Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E84C6C',
    textAlign: 'center',
    marginBottom: 12,
  },
  calendar: {
    borderRadius: 16,
    elevation: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  taskListContainer: {
    marginTop: 8,
  },
  taskListTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E84C6C',
    marginBottom: 8,
  },
  noTaskText: {
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 12,
  },
  taskBox: {
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  taskStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
});

export default CalendarScreen;
