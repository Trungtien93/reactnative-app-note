import { useState, useEffect, useContext } from 'react';
import { getDatabase, ref, onValue, push, update, remove, set } from 'firebase/database';
import { app } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';

export interface Task {
  id?: string;
  title: string;
  description?: string;
  deadline?: string;
  completed?: boolean;
  status?: 'in_progress' | 'completed' | 'overdue';
  tag?: string;
  priority?: 'high' | 'medium' | 'low';
  createdAt?: string;
  updatedAt?: string;
  notificationId?: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  // Tải danh sách công việc
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const db = getDatabase(app);
    const tasksRef = ref(db, `tasks/${user.uid}`);

    const unsubscribe = onValue(
      tasksRef,
      (snapshot) => {
        const data = snapshot.val() || {};
        const taskList = Object.keys(data).map((id) => ({
          id,
          ...data[id],
        }));
        setTasks(taskList);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Lỗi khi tải danh sách công việc:', error);
        setError('Không thể tải danh sách công việc');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Thêm công việc mới
  const addTask = async (task: Omit<Task, 'id'>) => {
    if (!user) return null;
    
    try {
      const db = getDatabase(app);
      const tasksRef = ref(db, `tasks/${user.uid}`);
      const newTaskRef = push(tasksRef);
      
      const now = new Date().toISOString();
      const newTask = {
        ...task,
        id: newTaskRef.key,
        completed: false,
        status: 'in_progress',
        createdAt: now,
        updatedAt: now,
      };
      
      await set(newTaskRef, newTask);
      return newTaskRef.key;
    } catch (error) {
      console.error('Lỗi khi thêm công việc:', error);
      setError('Không thể thêm công việc mới');
      return null;
    }
  };

  // Cập nhật công việc
  const updateTask = async (taskId: string, updatedData: Partial<Task>) => {
    if (!user) return false;
    
    try {
      const db = getDatabase(app);
      const taskRef = ref(db, `tasks/${user.uid}/${taskId}`);
      
      await update(taskRef, {
        ...updatedData,
        updatedAt: new Date().toISOString(),
      });
      
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật công việc:', error);
      setError('Không thể cập nhật công việc');
      return false;
    }
  };

  // Xóa công việc
  const deleteTask = async (taskId: string) => {
    if (!user) return false;
    
    try {
      const db = getDatabase(app);
      const taskRef = ref(db, `tasks/${user.uid}/${taskId}`);
      
      await remove(taskRef);
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa công việc:', error);
      setError('Không thể xóa công việc');
      return false;
    }
  };

  // Chuyển đổi trạng thái hoàn thành
  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    if (!user) return false;
    
    try {
      const db = getDatabase(app);
      const taskRef = ref(db, `tasks/${user.uid}/${taskId}`);
      
      await update(taskRef, {
        completed: !currentStatus,
        status: !currentStatus ? 'completed' : 'in_progress',
        updatedAt: new Date().toISOString(),
      });
      
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      setError('Không thể cập nhật trạng thái công việc');
      return false;
    }
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
  };
} 