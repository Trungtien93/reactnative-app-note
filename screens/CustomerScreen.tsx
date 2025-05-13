import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDatabase, ref, onValue, push, set, update, remove } from 'firebase/database';
import { app } from '../firebaseConfig';

const CustomerScreen = () => {
  const [customers, setCustomers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const db = getDatabase(app);
    const customersRef = ref(db, 'customers');
    const unsubscribe = onValue(customersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.keys(data).map(id => ({ id, ...data[id] }));
      setCustomers(list);
    });
    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditCustomer(null);
    setName('');
    setPhone('');
    setAddress('');
    setModalVisible(true);
  };

  const openEditModal = (customer) => {
    setEditCustomer(customer);
    setName(customer.name);
    setPhone(customer.phone);
    setAddress(customer.address);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tên và số điện thoại!');
      return;
    }
    try {
      const db = getDatabase(app);
      if (editCustomer) {
        await update(ref(db, `customers/${editCustomer.id}`), { name, phone, address });
      } else {
        const newRef = push(ref(db, 'customers'));
        await set(newRef, { name, phone, address });
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu khách hàng!');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa khách hàng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = getDatabase(app);
              await remove(ref(db, `customers/${id}`));
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa khách hàng!');
            }
          },
        },
      ]
    );
  };

       const renderItem = ({ item }) => (
  <View style={styles.card}>
    <View style={{ flex: 1 }}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.info}>
        SĐT: <Text style={{ color: '#2196F3', fontWeight: 'bold' }}>{item.phone}</Text>
      </Text>
      <Text style={styles.info}>Địa chỉ: {item.address}</Text>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={() => openEditModal(item)} style={{ marginRight: 8 }}>
        <Ionicons name="create-outline" size={22} color="#E84C6C" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Ionicons name="remove-circle-outline" size={22} color="red" />
      </TouchableOpacity>
    </View>
  </View>
);
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách khách hàng</Text>
      <FlatList
        data={customers}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editCustomer ? 'Sửa khách hàng' : 'Thêm khách hàng'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên khách hàng"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Địa chỉ"
              value={address}
              onChangeText={setAddress}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E84C6C',
    margin: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  info: { fontSize: 15, color: '#555', marginTop: 2 },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#E84C6C',
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E84C6C',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  saveButton: {
    backgroundColor: '#E84C6C',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
});

export default CustomerScreen;