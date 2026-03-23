import { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, Platform, Modal, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await AsyncStorage.getItem('scanHistory');
      if (data) {
        // Reverse so newest are at the top
        setHistory(JSON.parse(data).reverse());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('scanHistory');
      setHistory([]);
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelectedItem(item)} activeOpacity={0.8}>
      {item.uri ? (
        <Image source={item.uri} style={styles.cardImage} contentFit="cover" />
      ) : (
        <View style={[styles.cardImage, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems:'center' }]}>
          <Ionicons name="fast-food-outline" size={30} color="#999" />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.dateText}>{item.date}</Text>
        <Text style={styles.resultText} numberOfLines={4}>{item.text}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#ffffff', '#fdfbfb']} style={styles.container}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 25, paddingTop: 20 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1c1c1e" />
          </TouchableOpacity>
          <Text style={styles.title}>Historial</Text>
          <TouchableOpacity onPress={clearHistory} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={20} color="#ff3b30" />
          </TouchableOpacity>
        </View>

        {history.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={80} color="#dfdfdf" />
            <Text style={styles.emptyText}>No has escaneado platillos aún.</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadHistory} />}
          />
        )}
      </SafeAreaView>

      {/* Modal para ver detalles completos */}
      <Modal visible={!!selectedItem} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { marginTop: insets.top + 20, marginBottom: insets.bottom + 20 }]}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedItem(null)}>
              <Ionicons name="close-circle" size={32} color="#1c1c1e" />
            </TouchableOpacity>
            
            {selectedItem?.uri && (
              <Image source={selectedItem.uri} style={styles.fullImageModal} contentFit="cover" />
            )}
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDate}>{selectedItem?.date}</Text>
              <Text style={styles.modalText}>{selectedItem?.text}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backBtn: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1c1c1e',
  },
  clearBtn: {
    padding: 10,
    backgroundColor: '#ffeeec',
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: 100,
    height: 120,
  },
  cardContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 30,
    overflow: 'hidden',
    paddingTop: 50,
  },
  closeBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
  },
  fullImageModal: {
    width: '100%',
    height: 300,
  },
  modalScroll: {
    flex: 1,
    padding: 25,
  },
  modalDate: {
    fontSize: 14,
    color: '#999',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 18,
    color: '#1c1c1e',
    lineHeight: 28,
    paddingBottom: 40,
  }
});
