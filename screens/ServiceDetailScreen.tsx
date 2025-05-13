import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDatabase, ref, remove, onValue } from 'firebase/database';
import { auth } from '../firebaseConfig';

const ServiceDetailScreen = ({ route, navigation }) => {
  const { service } = route.params;
  const [showMenu, setShowMenu] = useState(false);
  const [creatorName, setCreatorName] = useState(service.creator || 'Khách');

  // Ẩn menu khi rời khỏi màn hình
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setShowMenu(false);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (service.creator === 'Khách' && auth.currentUser?.uid) {
      const db = getDatabase();
      const userRef = ref(db, `user/${auth.currentUser.uid}/name`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        const name = snapshot.val();
        if (name) setCreatorName(name);
        else setCreatorName('Khách');
      });
      return () => unsubscribe();
    }
  }, [service.creator]);

  // Hàm xóa dịch vụ
  const handleDelete = () => {
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
              const db = getDatabase();
              await remove(ref(db, `services/${service.id}`));
              navigation.goBack();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa dịch vụ!');
              console.log(error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>Service detail</Text>
        <TouchableOpacity onPress={() => setShowMenu(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Thông tin dịch vụ */}
      <View style={styles.card}>
        <Text style={styles.label}>
          <Text style={styles.bold}>Service name:</Text> {service.name}
        </Text>
        <Text style={styles.label}>
          <Text style={styles.bold}>Price:</Text> {service.price.toLocaleString()} đ
        </Text>
        <Text style={styles.label}>
          <Text style={styles.bold}>Creator:</Text> {creatorName}
        </Text>
        <Text style={styles.label}>
          <Text style={styles.bold}>Time:</Text> {service.time || ''}
        </Text>
        <Text style={styles.label}>
          <Text style={styles.bold}>Final update:</Text> {service.finalUpdate || ''}
        </Text>
      </View>

      {/* Menu Edit/Delete dạng Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <View style={styles.menuOverlay}>
          <View style={styles.menuBox}>
            <TouchableOpacity
              onPress={() => {
                setShowMenu(false);
                navigation.navigate('EditService', { service });
              }}
            >
              <Text style={styles.menuItem}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={[styles.menuItem, { color: 'red' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
          {/* Bấm ra ngoài để tắt menu */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setShowMenu(false)}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E84C6C',
    paddingTop: 36,
    paddingBottom: 16,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  header: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 8,
    color: '#333',
  },
  bold: { fontWeight: 'bold' },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: 200,
    elevation: 10,
  },
  menuItem: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
    textAlign: 'center',
  },
});

export default ServiceDetailScreen;