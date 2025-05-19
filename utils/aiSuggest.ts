// Sắp xếp công việc theo deadline và trạng thái (ưu tiên chưa hoàn thành, deadline gần nhất)
export function suggestPriorityTasks(tasks) {
  return tasks
    .filter(t => !t.completed)
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
}

// Gợi ý khung giờ làm việc (time blocking) đơn giản
export function suggestTimeBlocks(tasks) {
  // Gợi ý mỗi task 1 khung giờ trong ngày (ví dụ: 9h, 10h, 11h...)
  const baseHour = 9;
  return tasks.map((task, idx) => ({
    ...task,
    suggestedTime: `${baseHour + idx}:00`,
  }));
}