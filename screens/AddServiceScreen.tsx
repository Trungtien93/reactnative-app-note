import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getDatabase, ref, push, set } from 'firebase/database';
import { app } from '../firebaseConfig';

const AddServiceScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleAdd = async () => {
    if (!name || !price) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    try {
      const db = getDatabase(app);
      const servicesRef = ref(db, 'services');
      const newServiceRef = push(servicesRef);

      // Lấy thời gian hiện tại (ngày/tháng/năm giờ:phút:giây)
      const now = new Date();
      const timeString = now.toLocaleString('vi-VN', { hour12: false });

      await set(newServiceRef, {
        name,
        price: Number(price),
        time: timeString,
        finalUpdate: timeString,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu dịch vụ!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Service</Text>
      <Text style={styles.label}>Service name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Input a service name"
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.label}>Price *</Text>
      <TextInput
        style={styles.input}
        placeholder="0"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E84C6C',
    marginBottom: 24,
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
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddServiceScreen;