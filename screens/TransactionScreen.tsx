import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDatabase, ref, onValue, push, set, update, remove } from 'firebase/database';
import { app } from '../firebaseConfig';

const TransactionScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);

  // Danh sách khách hàng và dịch vụ
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);

  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);

  // Trường nhập/chọn
  const [customer, setCustomer] = useState('');
  const [service, setService] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');

  // Lấy danh sách giao dịch
  useEffect(() => {
    const db = getDatabase(app);
    const transactionsRef = ref(db, 'transactions');
    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.keys(data).map(id => ({ id, ...data[id] }));
      setTransactions(list);
    });
    return () => unsubscribe();
  }, []);

  // Lấy danh sách dịch vụ (lấy cả name và price)
  useEffect(() => {
    const db = getDatabase(app);
    const servicesRef = ref(db, 'services');
    const unsubscribe = onValue(servicesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.keys(data).map(id => ({
        name: data[id].name,
        price: data[id].price,
      }));
      setServices(list);
    });
    return () => unsubscribe();
  }, []);

  // Lấy danh sách khách hàng
  useEffect(() => {
    const db = getDatabase(app);
    const customersRef = ref(db, 'customers');
    const unsubscribe = onValue(customersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.keys(data).map(id => data[id].name);
      setCustomers(list);
    });
    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditTransaction(null);
    setCustomer('');
    setService('');
    setAmount('');
    // Lấy ngày hiện tại
    const now = new Date();
    const today = now.toLocaleDateString('vi-VN');
    setDate(today);
    setModalVisible(true);
  };

  const openEditModal = (transaction) => {
    setEditTransaction(transaction);
    setCustomer(transaction.customer);
    setService(transaction.service);
    setAmount(transaction.amount.toString());
    setDate(transaction.date);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!customer.trim() || !service.trim() || !amount.trim() || !date.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    try {
      const db = getDatabase(app);
      if (editTransaction) {
        await update(ref(db, `transactions/${editTransaction.id}`), {
          customer,
          service,
          amount: Number(amount),
          date,
        });
      } else {
        const newRef = push(ref(db, 'transactions'));
        await set(newRef, {
          customer,
          service,
          amount: Number(amount),
          date,
        });
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu giao dịch!');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa giao dịch này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = getDatabase(app);
              await remove(ref(db, `transactions/${id}`));
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa giao dịch!');
            }
          },
        },
      ]
    );
  };

 const renderItem = ({ item }) => (
  <View style={styles.card}>
    <View style={{ flex: 1 }}>
      <Text style={styles.name}>Khách: {item.customer}</Text>
      <Text style={styles.info}>Dịch vụ: {item.service}</Text>
      <Text style={styles.info}>
        Số tiền: <Text style={{ color: '#2196F3', fontWeight: 'bold' }}>
          {item.amount?.toLocaleString()} đ
        </Text>
      </Text>
      <Text style={styles.info}>Ngày: {item.date}</Text>
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
      <Text style={styles.header}>Danh sách giao dịch</Text>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>{editTransaction ? 'Sửa giao dịch' : 'Thêm giao dịch'}</Text>
              
              {/* Chọn khách hàng */}
              <TouchableOpacity
                style={styles.selectBox}
                onPress={() => setCustomerModalVisible(true)}
              >
                <Text style={{ color: customer ? '#222' : '#aaa', fontSize: 16 }}>
                  {customer || 'Chọn khách hàng'}
                </Text>
              </TouchableOpacity>
              <Modal visible={customerModalVisible} transparent animationType="fade">
                <TouchableWithoutFeedback onPress={() => setCustomerModalVisible(false)}>
                  <View style={styles.modalOverlay}>
                    <View style={styles.selectModalBox}>
                      <FlatList
                        data={customers}
                        keyExtractor={(item, idx) => idx.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.selectItem}
                            onPress={() => {
                              setCustomer(item);
                              setCustomerModalVisible(false);
                            }}
                          >
                            <Text style={{ fontSize: 16 }}>{item}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>

              {/* Chọn dịch vụ */}
              <TouchableOpacity
                style={styles.selectBox}
                onPress={() => setServiceModalVisible(true)}
              >
                <Text style={{ color: service ? '#222' : '#aaa', fontSize: 16 }}>
                  {service || 'Chọn dịch vụ'}
                </Text>
              </TouchableOpacity>
              <Modal visible={serviceModalVisible} transparent animationType="fade">
                <TouchableWithoutFeedback onPress={() => setServiceModalVisible(false)}>
                  <View style={styles.modalOverlay}>
                    <View style={styles.selectModalBox}>
                      <FlatList
                        data={services}
                        keyExtractor={(item, idx) => idx.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.selectItem}
                            onPress={() => {
                              setService(item.name);
                              setAmount(item.price ? item.price.toString() : '');
                              setServiceModalVisible(false);
                            }}
                          >
                            <Text style={{ fontSize: 16 }}>
                              {item.name} {item.price ? `- ${item.price.toLocaleString()} đ` : ''}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>

              {/* Số tiền */}
              <TextInput
                style={styles.input}
                placeholder="Số tiền"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
              {/* Ngày giao dịch */}
              <TextInput
                style={styles.input}
                placeholder="Ngày giao dịch"
                value={date}
                editable={false}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
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
    marginTop: 40,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 18,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#E84C6C',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  info: { fontSize: 15, color: '#555', marginTop: 2 },
  addButton: {
    position: 'absolute',
    right: 28,
    bottom: 36,
    backgroundColor: '#E84C6C',
    borderRadius: 32,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#E84C6C',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modalOverlay: {
    flex: 1,
     backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    width: '90%',
    elevation: 12,
    shadowColor: '#E84C6C',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E84C6C',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#E84C6C',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    flex: 1,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
  selectBox: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fafafa',
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  selectModalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    width: '80%',
    maxHeight: '60%',
    alignSelf: 'center',
    marginTop: '40%',
  },
  selectItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default TransactionScreen;