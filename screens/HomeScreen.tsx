import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Firebase imports
import { getDatabase, ref, onValue, push, set, update, remove } from 'firebase/database';
import { app, auth } from '../firebaseConfig'; // import auth

const USER_NAME = 'HUYỀN TRINH';

type RootStackParamList = {
  Home: undefined;
  ServiceDetail: {
    service: any;
    onDelete: (id: any) => void;
  };
  Setting: undefined;
};

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [services, setServices] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [newService, setNewService] = useState({ name: '', price: '' });
  const [editService, setEditService] = useState({ id: '', name: '', price: '' });
  const [userName, setUserName] = useState(''); // Thay USER_NAME bằng state

  // Lấy tên user từ Realtime Database
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const db = getDatabase(app);
    const userRef = ref(db, `user/${uid}/name`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const name = snapshot.val();
      setUserName(name || 'Khách');
    });
    return () => unsubscribe();
  }, []);

  // Đọc dữ liệu từ Firebase khi mở app
  useEffect(() => {
    const db = getDatabase(app);
    const servicesRef = ref(db, 'services');
    const unsubscribe = onValue(servicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const serviceList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setServices(serviceList);
      } else {
        setServices([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Thêm dịch vụ mới lên Firebase
  const handleAddService = async () => {
    if (!newService.name.trim() || !newService.price) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    try {
      const db = getDatabase(app);
      const servicesRef = ref(db, 'services');
      const newServiceRef = push(servicesRef);

      // Lấy tên creator từ user hiện tại trên Realtime Database
      const uid = auth.currentUser?.uid;
      let creator = 'Khách';
      if (uid) {
        const userRef = ref(db, `user/${uid}/name`);
        const snapshot = await new Promise<import('firebase/database').DataSnapshot>((resolve) => {
          onValue(userRef, (snap) => resolve(snap), { onlyOnce: true });
        });
        if (snapshot.exists() && snapshot.val()) {
          creator = snapshot.val();
        }
      }

      // Lấy thời gian hiện tại (ngày/tháng/năm giờ:phút:giây)
      const now = new Date();
      const timeString = now.toLocaleString('vi-VN', { hour12: false });

      await set(newServiceRef, {
        name: newService.name,
        price: parseInt(newService.price, 10),
        creator,
        time: timeString,
        finalUpdate: timeString,
      });
      setNewService({ name: '', price: '' });
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert('Lỗi', `Không thể thêm dịch vụ!\n${error.message}`);
      console.log(error);
    }
  };

  // Xem chi tiết dịch vụ
  const handleShowDetail = (service) => {
    setSelectedService(service);
    setDetailModalVisible(true);
  };

  // Xóa dịch vụ trên Firebase
  const handleDeleteService = (id) => {
    Alert.alert(
      'Warning',
      'Are you sure you want to remove this service? This operation cannot be returned',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'DELETE',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = getDatabase(app);
              await remove(ref(db, `services/${id}`));
              setDetailModalVisible(false);
            } catch (error: any) {
              Alert.alert('Lỗi', `Không thể xóa dịch vụ!\n${error.message}`);
              console.log(error);
            }
          },
        },
      ]
    );
  };

  // Sửa dịch vụ trên Firebase
  const handleEditService = async () => {
    if (!editService.name.trim() || !editService.price) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    try {
      const db = getDatabase(app);
      await update(ref(db, `services/${editService.id}`), {
        name: editService.name,
        price: parseInt(editService.price, 10),
      });
      setEditModalVisible(false);
      setDetailModalVisible(false);
    } catch (error: any) {
      Alert.alert('Lỗi', `Không thể cập nhật dịch vụ!\n${error.message}`);
      console.log(error);
    }
  };

  const renderService = ({ item }) => (
    <View style={styles.serviceCard}>
      {/* Bấm vào tên dịch vụ để xem chi tiết */}
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => handleShowDetail(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.serviceName} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <Text style={styles.servicePrice}>{item.price.toLocaleString()} đ</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Nút sửa */}
        <TouchableOpacity
          style={{ marginHorizontal: 4 }}
          onPress={() => {
            setEditService(item);
            setEditModalVisible(true);
          }}
        >
          <Ionicons name="create-outline" size={22} color="#E84C6C" />
        </TouchableOpacity>
        {/* Nút xóa */}
        <TouchableOpacity
          style={{ marginHorizontal: 4 }}
          onPress={() => handleDeleteService(item.id)}
        >
          <Ionicons name="remove-circle-outline" size={22} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{userName}</Text>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => navigation.navigate('Setting')}
        >
          <Ionicons name="person-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/baner.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Danh sách dịch vụ */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.listTitle}>Danh sách dịch vụ</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderService}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal Thêm dịch vụ */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Service</Text>
            <Text style={styles.label}>Service name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Input a service name"
              value={newService.name}
              onChangeText={(text) => setNewService({ ...newService, name: text })}
            />
            <Text style={styles.label}>Price *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={newService.price}
              onChangeText={(text) => setNewService({ ...newService, price: text })}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={handleAddService}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Chi tiết dịch vụ */}
      <Modal visible={detailModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.detailHeader}>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.detailHeaderTitle}>Service detail</Text>
              <TouchableOpacity
                onPress={() => {
                  setEditService(selectedService);
                  setEditModalVisible(true);
                }}
              >
                <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {selectedService && (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.detailLabel}>
                  <Text style={styles.bold}>Service name:</Text> {selectedService.name}
                </Text>
                <Text style={styles.detailLabel}>
                  <Text style={styles.bold}>Price:</Text> {selectedService.price.toLocaleString()} đ
                </Text>
                <Text style={styles.detailLabel}>
                 <Text style={styles.bold}>Creator:</Text> {selectedService.creator || 'Khách'}
                </Text>
                <Text style={styles.detailLabel}>
                  <Text style={styles.bold}>Time:</Text> {selectedService.time || ''}
                </Text>
                <Text style={styles.detailLabel}>
                  <Text style={styles.bold}>Final update:</Text> {selectedService.finalUpdate || ''}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Sửa/Xóa dịch vụ */}
      <Modal visible={editModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Service</Text>
            <Text style={styles.label}>Service name *</Text>
            <TextInput
              style={styles.input}
              value={editService.name}
              onChangeText={(text) => setEditService({ ...editService, name: text })}
            />
            <Text style={styles.label}>Price *</Text>
            <TextInput
              style={styles.input}
              value={editService.price?.toString()}
              onChangeText={(text) => setEditService({ ...editService, price: text })}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={handleEditService}>
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteService(editService.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E84C6C',
    paddingTop: 36,
    paddingBottom: 16,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  headerIcon: {
    padding: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  logo: {
    width: 160,
    height: 60,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E84C6C',
  },
  addButton: {
    backgroundColor: '#E84C6C',
    borderRadius: 20,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  serviceCard: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#eee',
  },
  serviceName: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    marginRight: 8,
    fontWeight: '500',
  },
  servicePrice: {
    fontSize: 15,
    color: '#E84C6C',
    fontWeight: 'bold',
    minWidth: 80,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'stretch',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E84C6C',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fafafa',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#E84C6C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 15,
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },
  detailModalContent: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 0,
    elevation: 5,
    overflow: 'hidden',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E84C6C',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  detailHeaderTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  detailLabel: {
    fontSize: 15,
    marginBottom: 8,
    marginLeft: 16,
    marginRight: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default HomeScreen;