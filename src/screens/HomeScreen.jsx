import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';
import axios from 'axios';

export default function AllImagesScreen() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const pageRequests = [1, 2, 3].map(page =>
          axios.get(`https://picsum.photos/v2/list?page=${page}&limit=100`)
        );

        const responses = await Promise.all(pageRequests);
        const combinedImages = responses.flatMap(res => res.data);
        setImages(combinedImages);
      } catch (err) {
        console.error('Error fetching images:', err);
        Alert.alert('Error fetching images');
      }
    };
    fetchImages();
  }, []);

  // Upload image to S3 using Lambda-generated presigned URL
  const uploadImage = async (item) => {
    setUploading(true);
    try {
      const fileName = `${item.id}.jpg`;
      const presignedUrlApi = `https://z4dtbdz335.execute-api.ap-south-1.amazonaws.com/default/generatePresignedUrl?name=${fileName}`;

      // Step 1: Get presigned URL
      const presignRes = await axios.get(presignedUrlApi);
      const uploadUrl = presignRes.data.uploadUrl;
      console.log('Presigned URL:', uploadUrl);

      // Step 2: Fetch image as blob
      const imageResponse = await fetch(item.download_url);
      const blob = await imageResponse.blob();

      // Step 3: Upload to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body: blob,
      });

      Alert.alert('✅ Uploaded Successfully');
    } catch (error) {
      console.error('❌ Upload error:', error);
      Alert.alert('❌ Upload Failed', error.message || 'Please try again.');
    } finally {
      setUploading(false);
      setSelectedId(null);
    }
  };

  const handleSelect = (id) => {
    setSelectedId(prev => (prev === id ? null : id));
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item.id)}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.card,
          selectedId === item.id && styles.selectedCard,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image source={{ uri: item.download_url }} style={styles.image} />
        <Text style={styles.author}>{item.author}</Text>
        {selectedId === item.id && (
          <TouchableOpacity
            onPress={() => uploadImage(item)}
            style={styles.uploadButton}
          >
            <Text style={styles.uploadButtonText}>Upload to S3</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {uploading && <ActivityIndicator size="large" color="#007AFF" style={{ margin: 10 }} />}
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  card: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9ff',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: '#e0f0ff',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  image: { width: '100%', height: 200, borderRadius: 8 },
  author: { marginVertical: 8, fontWeight: '600', fontSize: 15, color: '#333' },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
