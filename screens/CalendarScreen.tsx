import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, FlatList, SafeAreaView } from 'react-native';
import { Calendar, LocaleConfig, Agenda } from 'react-native-calendars';
import { AuthContext } from '../context/AuthContext';
import { useTasks, Task } from '../utils/useTasks';

LocaleConfig.locales['vi'] = {
  monthNames: ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],
  monthNamesShort: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'],
  dayNames: ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'],
  dayNamesShort: ['CN','T2','T3','T4','T5','T6','T7'],
  today: 'Hôm nay'
};
LocaleConfig.defaultLocale = 'vi';

type ViewMode = 'calendar' | 'agenda';
type StatusFilter = 'all' | 'completed' | 'in_progress' | 'overdue';
type TimeFilter = 'all' | 'today' | 'week' | 'month';

const CalendarScreen = ({ navigation }: any) => {
  const { user } = useContext(AuthContext);
  const { tasks, loading, toggleTaskCompletion, addTask } = useTasks();
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [agendaItems, setAgendaItems] = useState({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  // Helper function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#FF5252';
      case 'medium': return '#FB8C00';
      case 'low': return '#4CAF50';
      default: return '#E84C6C';
    }
  };

  // Helper function to check if task is overdue
  const isOverdue = (deadline: string, completed: boolean) => {
    if (completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(deadline);
    return taskDate < today;
  };

  // Helper function to filter tasks based on time
  const filterTasksByTime = (tasks: Task[], filter: TimeFilter) => {
    if (filter === 'all') return tasks;
    
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      
      switch (filter) {
        case 'today':
          const taskDay = new Date(taskDate);
          taskDay.setHours(0, 0, 0, 0);
          return taskDay.getTime() === today.getTime();
          
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          return taskDate >= weekStart && taskDate <= weekEnd;
          
        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          monthEnd.setHours(23, 59, 59, 999);
          return taskDate >= monthStart && taskDate <= monthEnd;
          
        default:
          return true;
      }
    });
  };

  // Helper function to filter tasks based on status
  const filterTasksByStatus = (tasks: Task[], filter: StatusFilter) => {
    if (filter === 'all') return tasks;
    
    return tasks.filter(task => {
      switch (filter) {
        case 'completed':
          return task.completed;
        case 'in_progress':
          return !task.completed && !isOverdue(task.deadline || '', task.completed || false);
        case 'overdue':
          return !task.completed && isOverdue(task.deadline || '', task.completed || false);
        default:
          return true;
      }
    });
  };

  // Get filtered tasks for agenda
  const getFilteredTasks = () => {
    let filtered = tasks.filter(task => task.deadline);
    filtered = filterTasksByTime(filtered, timeFilter);
    filtered = filterTasksByStatus(filtered, statusFilter);
    return filtered.sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  };

  useEffect(() => {
    if (!tasks.length) {
      setMarkedDates({});
      setAgendaItems({});
      return;
    }

    const marks = {};
    const tasksByDate = {};
    
    tasks.forEach((task) => {
      if (task.deadline) {
        const date = task.deadline.slice(0, 10);
        
        if (!tasksByDate[date]) {
          tasksByDate[date] = [];
        }
        tasksByDate[date].push(task);
      }
    });

    // Prepare agenda items separately
    const agendaData = {};
    Object.entries(tasksByDate).forEach(([date, dateTasks]: [string, any[]]) => {
      agendaData[date] = dateTasks.map((task, index) => ({
        name: task.title,
        height: 80,
        day: date,
        task: task,
        key: `${task.id}-${index}`
      }));
    });

    Object.entries(tasksByDate).forEach(([date, dateTasks]: [string, any[]]) => {
      const completedTasks = dateTasks.filter(t => t.completed).length;
      const totalTasks = dateTasks.length;
      const hasOverdue = dateTasks.some(t => isOverdue(t.deadline, t.completed));
      
      // Determine primary color based on status
      let dotColor = '#E84C6C';
      let backgroundColor = '#fff';
      if (totalTasks === completedTasks) {
        dotColor = '#43A047'; // All completed
        backgroundColor = '#E8F5E8';
      } else if (hasOverdue) {
        dotColor = '#FF5252'; // Has overdue
        backgroundColor = '#FFEBEE';
      } else {
        backgroundColor = '#FFF3E0'; // Has pending tasks
      }

      marks[date] = {
        marked: true,
        dotColor,
        customStyles: {
          container: {
            backgroundColor,
            borderRadius: 4,
          },
          text: {
            color: '#333',
            fontWeight: '500'
          }
        },
        taskInfo: {
          count: totalTasks,
          completed: completedTasks,
          hasOverdue
        }
      };
    });
    
    setMarkedDates(marks);
    setAgendaItems(agendaData);
  }, [tasks]);

  const tasksForSelectedDate = tasks.filter(
    (task) => selectedDate && task.deadline?.slice(0, 10) === selectedDate
  );

  const handleTaskPress = (task: Task) => {
    if (navigation) {
      navigation.navigate('TaskDetail', { task });
    }
  };

  const handleQuickToggle = async (task: Task, event: any) => {
    event.stopPropagation(); // Prevent navigation when toggling
    try {
      await toggleTaskCompletion(task.id!, task.completed || false);
      // Visual feedback
      Alert.alert(
        'Thành công', 
        task.completed ? 'Đã đánh dấu chưa hoàn thành' : 'Đã đánh dấu hoàn thành',
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái công việc');
    }
  };

  const handleQuickAddTask = () => {
    if (!selectedDate || !navigation) return;
    
    const newTask = {
      title: '',
      deadline: `${selectedDate}T23:59`,
      description: '',
      tag: '',
      priority: 'medium' as const,
      completed: false,
      status: 'in_progress' as const
    };
    
    navigation.navigate('TaskEdit', { 
      task: newTask, 
      isNew: true, 
      prefilledDate: selectedDate 
    });
  };

  const renderViewModeToggle = () => (
    <View style={styles.viewModeContainer}>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'calendar' && styles.activeViewMode]}
        onPress={() => setViewMode('calendar')}
      >
        <Text style={[styles.viewModeText, viewMode === 'calendar' && styles.activeViewModeText]}>
          📅 Lịch
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'agenda' && styles.activeViewMode]}
        onPress={() => setViewMode('agenda')}
      >
        <Text style={[styles.viewModeText, viewMode === 'agenda' && styles.activeViewModeText]}>
          📋 Danh sách
        </Text>
      </TouchableOpacity>
    </View>
  );

  const CustomDay = ({ date, marking }: any) => {
    const isSelected = selectedDate === date.dateString;
    const taskInfo = marking?.taskInfo;
    
    return (
      <TouchableOpacity 
        style={[
          styles.customDayContainer,
          marking?.customStyles?.container && !isSelected && marking.customStyles.container,
          isSelected && styles.selectedDayContainer
        ]}
        onPress={() => setSelectedDate(date.dateString)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.customDayText,
          marking?.customStyles?.text && !isSelected && marking.customStyles.text,
          isSelected && styles.selectedDayText
        ]}>
          {date.day}
        </Text>
        {taskInfo && (
          <View style={[
            styles.taskCountBadge,
            { backgroundColor: isSelected ? '#fff' : marking.dotColor }
          ]}>
            <Text style={[
              styles.taskCountText,
              { color: isSelected ? '#E84C6C' : '#fff' }
            ]}>
              {taskInfo.completed}/{taskInfo.count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderAgendaItem = (item: any) => {
    const task = item.task;
    const isTaskOverdue = isOverdue(task.deadline, task.completed);
    const priorityColor = getPriorityColor(task.priority || 'medium');

    return (
      <TouchableOpacity 
        style={[
          styles.agendaItem,
          isTaskOverdue && styles.overdueTask,
          task.completed && styles.completedTask
        ]}
        onPress={() => handleTaskPress(task)}
      >
        <View style={styles.taskHeader}>
          <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
          <Text style={[
            styles.agendaTaskTitleNew,
            task.completed && styles.completedTaskTitleNew
          ]}>
            {task.title}
          </Text>
          <TouchableOpacity
            style={styles.quickToggle}
            onPress={(event) => handleQuickToggle(task, event)}
          >
            <Text style={styles.quickToggleText}>
              {task.completed ? '✅' : '⭕'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {task.tag && (
          <Text style={styles.agendaTaskMetaNew}>🏷️ {task.tag}</Text>
        )}
        
        <Text style={[styles.taskStatusNew, { color: task.completed ? '#43A047' : '#E84C6C' }]}>
          {task.completed ? '✔️ Đã hoàn thành' : '🕓 Chưa hoàn thành'}
          {isTaskOverdue && <Text style={styles.overdueTextNew}> (Quá hạn)</Text>}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTask = (task: any) => {
    const isTaskOverdue = isOverdue(task.deadline, task.completed);
    const priorityColor = getPriorityColor(task.priority || 'medium');

    return (
      <TouchableOpacity 
        key={task.id} 
        style={[
          styles.taskBox,
          isTaskOverdue && styles.overdueTask,
          task.completed && styles.completedTask
        ]}
        onLongPress={() => handleTaskPress(task)}
      >
        <View style={styles.taskHeader}>
          <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
          <Text style={[
            styles.taskTitle,
            task.completed && styles.completedTaskTitle
          ]}>
            {task.title}
          </Text>
          <TouchableOpacity
            style={styles.quickToggle}
            onPress={(event) => handleQuickToggle(task, event)}
          >
            <Text style={styles.quickToggleText}>
              {task.completed ? '✅' : '⭕'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.taskMeta}>
          ⏰ Hạn: {task.deadline}
          {isTaskOverdue && <Text style={styles.overdueText}> (Quá hạn)</Text>}
        </Text>
        
        {task.tag && (
          <Text style={styles.taskMeta}>🏷️ Tag: {task.tag}</Text>
        )}
        
        {task.priority && (
          <Text style={styles.taskMeta}>
            🎯 Độ ưu tiên: {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
          </Text>
        )}
        
        <Text style={[styles.taskStatus, { color: task.completed ? '#43A047' : '#E84C6C' }]}>
          {task.completed ? '✔️ Đã hoàn thành' : '🕓 Chưa hoàn thành'}
        </Text>
        
        {task.description && (
          <Text style={styles.taskDescription}>{task.description}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderFilterControls = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Lọc theo trạng thái:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
        <TouchableOpacity
          style={[styles.filterButton, statusFilter === 'all' && styles.activeFilter]}
          onPress={() => setStatusFilter('all')}
        >
          <Text style={[styles.filterText, statusFilter === 'all' && styles.activeFilterText]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, statusFilter === 'in_progress' && styles.activeFilter]}
          onPress={() => setStatusFilter('in_progress')}
        >
          <Text style={[styles.filterText, statusFilter === 'in_progress' && styles.activeFilterText]}>
            🕓 Đang làm
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, statusFilter === 'completed' && styles.activeFilter]}
          onPress={() => setStatusFilter('completed')}
        >
          <Text style={[styles.filterText, statusFilter === 'completed' && styles.activeFilterText]}>
            ✅ Hoàn thành
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, statusFilter === 'overdue' && styles.activeFilter]}
          onPress={() => setStatusFilter('overdue')}
        >
          <Text style={[styles.filterText, statusFilter === 'overdue' && styles.activeFilterText]}>
            ⏰ Quá hạn
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      <Text style={styles.filterLabel}>Lọc theo thời gian:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
        <TouchableOpacity
          style={[styles.filterButton, timeFilter === 'all' && styles.activeFilter]}
          onPress={() => setTimeFilter('all')}
        >
          <Text style={[styles.filterText, timeFilter === 'all' && styles.activeFilterText]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, timeFilter === 'today' && styles.activeFilter]}
          onPress={() => setTimeFilter('today')}
        >
          <Text style={[styles.filterText, timeFilter === 'today' && styles.activeFilterText]}>
            📅 Hôm nay
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, timeFilter === 'week' && styles.activeFilter]}
          onPress={() => setTimeFilter('week')}
        >
          <Text style={[styles.filterText, timeFilter === 'week' && styles.activeFilterText]}>
            📆 Tuần này
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, timeFilter === 'month' && styles.activeFilter]}
          onPress={() => setTimeFilter('month')}
        >
          <Text style={[styles.filterText, timeFilter === 'month' && styles.activeFilterText]}>
            🗓️ Tháng này
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.header}>Vui lòng đăng nhập để xem lịch công việc</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#E84C6C" />
        <Text style={styles.loadingText}>Đang tải lịch công việc...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>📆 Lịch công việc</Text>
      
      {renderViewModeToggle()}

      {viewMode === 'calendar' ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <Calendar
            markedDates={{
              ...markedDates,
              ...(selectedDate && {
                [selectedDate]: {
                  ...(markedDates[selectedDate] || {}),
                  selected: true,
                  selectedColor: '#4A90E2',
                  selectedTextColor: '#fff',
                },
              }),
            }}
            onDayPress={day => setSelectedDate(day.dateString)}
            theme={{
              backgroundColor: '#fff',
              calendarBackground: '#fff',
              textSectionTitleColor: '#222',
              selectedDayBackgroundColor: '#4A90E2',
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
            dayComponent={({ date, marking }: any) => <CustomDay date={date} marking={marking} />}
          />

          {selectedDate ? (
            <View style={styles.taskListContainer}>
              <View style={styles.taskListHeader}>
                <Text style={styles.taskListTitle}>
                  📌 Công việc ngày <Text style={{ fontWeight: 'bold' }}>{selectedDate}</Text>
                </Text>
                <TouchableOpacity
                  style={styles.quickAddButton}
                  onPress={handleQuickAddTask}
                >
                  <Text style={styles.quickAddText}>+ Thêm nhanh</Text>
                </TouchableOpacity>
              </View>
              
              {tasksForSelectedDate.length === 0 ? (
                <Text style={styles.noTaskText}>Không có công việc nào.</Text>
              ) : (
                <View>
                  <Text style={styles.taskSummary}>
                    Tổng: {tasksForSelectedDate.length} • 
                    Hoàn thành: {tasksForSelectedDate.filter(t => t.completed).length} • 
                    Còn lại: {tasksForSelectedDate.filter(t => !t.completed).length}
                  </Text>
                  {tasksForSelectedDate.map(renderTask)}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>
                💡 Chọn một ngày để xem chi tiết công việc
              </Text>
              <Text style={styles.legendText}>
                🔴 Có việc quá hạn • 🔵 Có việc chưa xong • 🟢 Hoàn thành tất cả
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.agendaContainer}>
          {renderFilterControls()}
          <FlatList
            data={getFilteredTasks()}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const taskDate = item.deadline!.slice(0, 10);
              const isTaskOverdue = isOverdue(item.deadline!, item.completed || false);
              const priorityColor = getPriorityColor(item.priority || 'medium');

              return (
                <TouchableOpacity 
                  style={[
                    styles.agendaTaskItem,
                    isTaskOverdue && styles.overdueTask,
                    item.completed && styles.completedTask
                  ]}
                  onPress={() => handleTaskPress(item)}
                >
                  <View style={styles.agendaTaskHeader}>
                    <Text style={styles.agendaDateText}>{taskDate}</Text>
                    <TouchableOpacity
                      style={styles.quickToggle}
                      onPress={(event) => handleQuickToggle(item, event)}
                    >
                      <Text style={styles.quickToggleText}>
                        {item.completed ? '✅' : '⭕'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.taskHeader}>
                    <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
                    <Text style={[
                      styles.agendaTaskTitleNew,
                      item.completed && styles.completedTaskTitleNew
                    ]}>
                      {item.title}
                    </Text>
                  </View>
                  
                  {item.tag && (
                    <Text style={styles.agendaTaskMetaNew}>🏷️ {item.tag}</Text>
                  )}
                  
                  <Text style={[styles.taskStatusNew, { color: item.completed ? '#43A047' : '#E84C6C' }]}>
                    {item.completed ? '✔️ Đã hoàn thành' : '🕓 Chưa hoàn thành'}
                    {isTaskOverdue && <Text style={styles.overdueTextNew}> (Quá hạn)</Text>}
                  </Text>
                </TouchableOpacity>
              );
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 12 }}
            ListEmptyComponent={() => (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                  Không có công việc nào phù hợp với bộ lọc hiện tại
                </Text>
                <Text style={styles.emptyStateSubText}>
                  Thử thay đổi bộ lọc hoặc tạo công việc mới
                </Text>
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  viewModeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeViewMode: {
    backgroundColor: '#E84C6C',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeViewModeText: {
    color: '#fff',
  },
  calendar: {
    borderRadius: 16,
    elevation: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  agenda: {
    borderRadius: 16,
    elevation: 4,
    marginBottom: 12,
    height: 300,
  },
  emptyDate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  customDayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 4,
  },
  selectedDayContainer: {
    backgroundColor: '#4A90E2',
    borderRadius: 6,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  customDayText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '700',
  },
  taskIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 2,
  },
  taskCount: {
    fontSize: 8,
    color: '#666',
  },
  taskListContainer: {
    marginTop: 8,
  },
  taskListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskListTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E84C6C',
  },
  quickAddButton: {
    backgroundColor: '#E84C6C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickAddText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  taskSummary: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
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
    borderLeftWidth: 4,
    borderLeftColor: '#E84C6C',
  },
  overdueTask: {
    backgroundColor: '#FFF5F5',
    borderLeftColor: '#FF5252',
  },
  completedTask: {
    backgroundColor: '#F8FFF8',
    borderLeftColor: '#43A047',
    opacity: 0.8,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  quickToggle: {
    padding: 4,
  },
  quickToggleText: {
    fontSize: 18,
  },
  taskMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  overdueText: {
    color: '#FF5252',
    fontWeight: '500',
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
  hintContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  agendaItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E84C6C',
  },
  agendaTaskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  agendaTaskMeta: {
    fontSize: 14,
    color: '#666',
  },
  agendaContainer: {
    flex: 1,
  },
  agendaTaskItem: {
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#E84C6C',
  },
  agendaTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  agendaDateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E84C6C',
  },
  agendaTaskTitleNew: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  completedTaskTitleNew: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  taskStatusNew: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 4,
  },
  overdueTextNew: {
    color: '#FF5252',
    fontWeight: '500',
  },
  agendaTaskMetaNew: {
    fontSize: 14,
    color: '#666',
  },
  filterContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 4,
  },
  filterScrollView: {
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  activeFilter: {
    backgroundColor: '#E84C6C',
    borderColor: '#E84C6C',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  taskCountBadge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: '#E84C6C',
    borderRadius: 10,
    minWidth: 20,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  taskCountText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default CalendarScreen;
