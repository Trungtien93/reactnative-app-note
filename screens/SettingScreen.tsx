import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, TextInput, ActivityIndicator, SafeAreaView } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';

// Thêm interface cho dữ liệu người dùng
interface UserData {
  email: string;
  name: string;
  phone: string;
  address: string;
  avatarUri?: string;
}

const SettingScreen = ({ navigation }) => {
  const email = auth.currentUser?.email || 'user@email.com';
  const uid = auth.currentUser?.uid || 'demo_uid';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [editMode, setEditMode] = useState(true); // true: cho nhập, false: chỉ xem
  const [avatarSource, setAvatarSource] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Thêm useEffect để load dữ liệu user nếu đã có
  useEffect(() => {
    const db = getDatabase();
    const userRef = ref(db, `user/${uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        // Nếu có dữ liệu trên database, lấy theo đó
        setName(data.name || email.split('@')[0]);
        setPhone(data.phone || '0123456789');
        setAddress(data.address || '');
        // Tải ảnh đại diện từ URI đã lưu (nếu có)
        if (data.avatarUri) {
          setAvatarSource({ uri: data.avatarUri });
        }
        setEditMode(false); // Chỉ xem khi đã có dữ liệu
      } else {
        // Nếu chưa có dữ liệu user trong db, set mặc định
        setName(email.split('@')[0]);
        setPhone('0123456789');
        setAddress('');
        setEditMode(true);  // Mở chế độ edit cho nhập liệu lần đầu
      }
    });
    return () => unsubscribe();
  }, [uid, email]);

  const pickImage = async () => {
    if (!editMode) return;
    
    try {
      // Kiểm tra quyền truy cập thư viện ảnh
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để chọn ảnh đại diện');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        // Lưu URI vào state để hiển thị
        setAvatarSource({ uri: imageUri });
        
        // Lưu URI vào database ngay lập tức
        try {
          const db = getDatabase();
          await set(ref(db, `user/${uid}/avatarUri`), imageUri);
          Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện');
        } catch (error) {
          console.error('Lỗi khi lưu URI ảnh:', error);
          Alert.alert('Lỗi', 'Không thể lưu đường dẫn ảnh');
        }
      }
    } catch (error) {
      console.error('Lỗi khi chọn ảnh:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thư viện');
    }
  };

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
    setIsLoading(true);
    try {
      const db = getDatabase();
      // Tạo object userData bao gồm cả URI ảnh (nếu có)
      const userData: UserData = {
        email,
        name,
        phone,
        address,
      };
      
      // Nếu có avatarSource, thêm URI vào dữ liệu người dùng
      if (avatarSource && avatarSource.uri) {
        userData.avatarUri = avatarSource.uri;
      }
      
      // Lưu tất cả thông tin vào database
      await set(ref(db, `user/${uid}`), userData);
      
      Alert.alert('Thành công', 'Đã lưu thông tin!');
      setEditMode(false); // Chuyển sang chế độ chỉ xem
    } catch (error) {
      console.error('Lỗi khi lưu:', error);
      Alert.alert('Lỗi', 'Không thể lưu thông tin!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Ảnh đại diện hình tròn */}
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={pickImage}
          disabled={!editMode || isLoading}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#E84C6C" />
          ) : (
            <Image
              source={avatarSource || require('../assets/baner.png')}
              style={styles.avatar}
            />
          )}
          {editMode && (
            <View style={styles.editIconContainer}>
              <Text style={styles.editIcon}>📷</Text>
            </View>
          )}
        </TouchableOpacity>
        
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
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Đang lưu...' : 'Lưu'}
              </Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E84C6C',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 10,
    marginBottom: 5,
  },
  editIcon: {
    fontSize: 18,
    color: '#fff',
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