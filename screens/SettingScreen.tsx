import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, TextInput } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { getDatabase, ref, set, onValue } from 'firebase/database';

const SettingScreen = ({ navigation }) => {
  const email = auth.currentUser?.email || 'user@email.com';
  const uid = auth.currentUser?.uid || 'demo_uid';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [editMode, setEditMode] = useState(true); // true: cho nhập, false: chỉ xem

  // Thêm useEffect để load dữ liệu user nếu đã có
  useEffect(() => {
    const db = getDatabase();
    const userRef = ref(db, `user/${uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setName(data.name || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setEditMode(false); // Nếu đã có dữ liệu thì chỉ xem
      }
    });
    return () => unsubscribe();
  }, [uid]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Đăng xuất thành công!');
      // navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đăng xuất!');
    }
  };

  const handleSave = async () => {
    try {
      const db = getDatabase();
      await set(ref(db, `user/${uid}`), {
        email,
        name,
        phone,
        address,
      });
      Alert.alert('Thành công', 'Đã lưu thông tin!');
      setEditMode(false); // Chuyển sang chế độ chỉ xem
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu thông tin!');
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  return (
    <View style={styles.container}>
      {/* Ảnh đại diện hình tròn */}
      <View style={styles.avatarContainer}>
        <Image
          source={require('../assets/baner.png')}
          style={styles.avatar}
        />
      </View>
      {/* Email */}
      <Text style={styles.email}>{email}</Text>
      {/* Các ô nhập thông tin hoặc chỉ hiển thị */}
      {editMode ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Tên của bạn"
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
          {/* Nút Lưu */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Lưu</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Tên:</Text>
            <Text style={styles.infoText}>{name}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoText}>{phone}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Địa chỉ:</Text>
            <Text style={styles.infoText}>{address}</Text>
          </View>
          {/* Nút Sửa */}
          <TouchableOpacity style={styles.saveButton} onPress={handleEdit}>
            <Text style={styles.saveButtonText}>Sửa</Text>
          </TouchableOpacity>
        </>
      )}
      {/* Nút đăng xuất */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    marginTop: 40,
    marginBottom: 16,
    borderRadius: 60,
    overflow: 'hidden',
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: '#E84C6C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
  },
  email: {
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
    fontSize: 16,
  },
  infoBox: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 110,
    fontSize: 16,
    color: '#333',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#E84C6C',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: 'red',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SettingScreen;