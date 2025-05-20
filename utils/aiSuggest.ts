// Sắp xếp công việc theo deadline và trạng thái (ưu tiên chưa hoàn thành, deadline gần nhất)
export function suggestPriorityTasks(tasks) {
  const now = new Date();

  return tasks
    .filter(t => {
      if (t.completed) return false; // loại bỏ task đã hoàn thành
      if (!t.deadline) return true;  // giữ lại nếu không có deadline (tuỳ bạn)
      return new Date(t.deadline) > now; // loại bỏ task quá hạn
    })
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
}
