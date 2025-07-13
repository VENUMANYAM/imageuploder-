// src/screens/S3Screen.jsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
  Alert,
} from 'react-native';
import { Snackbar } from 'react-native-paper';
import axios from 'axios';

export default function S3Screen() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', color: 'green' });

  const showSnackbar = (message, color = 'green') => {
    setSnackbar({ visible: true, message, color });
  };

  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, visible: false });
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'https://5jge0qnlfl.execute-api.ap-south-1.amazonaws.com/list'
      );
      setFiles(response.data);

      if (response.data.length === 0) {
        showSnackbar('No files found in your S3 bucket.', 'orange');
      }
    } catch (error) {
      console.error('❌ Error fetching files:', error);
      showSnackbar('Error fetching files from S3.', 'red');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = (key) => {
    Alert.alert('Delete File', `Are you sure you want to delete "${key}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const deleteUrl = `https://0bb2h7slm6.execute-api.ap-south-1.amazonaws.com/deleteimage?key=${encodeURIComponent(key)}`;
            await axios.get(deleteUrl);
            showSnackbar(`"${key}" deleted successfully.`);
            fetchFiles();
          } catch (error) {
            console.error('❌ Delete error:', error);
            showSnackbar('Error deleting the file.', 'red');
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFiles();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onLongPress={() => handleDelete(item.key)}
      style={styles.card}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.url }} style={styles.image} />
      <Text style={styles.filename}>{item.key.split('/').pop()}</Text>
      <Text style={styles.helperText}>(Long press to delete)</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : files.length === 0 ? (
        <View style={styles.noFilesContainer}>
          <Text style={styles.noFilesText}>No files in your S3 bucket.</Text>
          <Text style={styles.helperText}>Upload from Home and pull down to refresh.</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <Snackbar
        visible={snackbar.visible}
        onDismiss={hideSnackbar}
        duration={3000}
        style={{ backgroundColor: snackbar.color, marginBottom: 50 }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  card: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginHorizontal: 10,
  },
  image: { width: '100%', height: 200, borderRadius: 8 },
  filename: { marginTop: 8, color: '#333', fontSize: 14, fontWeight: '600' },
  helperText: { fontSize: 12, color: '#777', marginTop: 2 },
  noFilesContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  noFilesText: { fontSize: 18, color: '#555', textAlign: 'center', marginBottom: 8 },
});
