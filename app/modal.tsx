import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileModal() {
  const [dieta, setDieta] = useState('');
  const [alergias, setAlergias] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedDieta = await AsyncStorage.getItem('dieta');
      const savedAlergias = await AsyncStorage.getItem('alergias');
      const savedSintomas = await AsyncStorage.getItem('sintomas');
      if (savedDieta) setDieta(savedDieta);
      if (savedAlergias) setAlergias(savedAlergias);
      if (savedSintomas) setSintomas(savedSintomas);
    } catch (e) {
      console.error(e);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await AsyncStorage.setItem('dieta', dieta);
      await AsyncStorage.setItem('alergias', alergias);
      await AsyncStorage.setItem('sintomas', sintomas);
      Alert.alert("Guardado", "Tu perfil ha sido guardado. Gemini ahora lo tendrá en cuenta al analizar comida. 🌟");
      router.back();
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const clearProfile = async () => {
    try {
      await AsyncStorage.removeItem('dieta');
      await AsyncStorage.removeItem('alergias');
      await AsyncStorage.removeItem('sintomas');
      setDieta('');
      setAlergias('');
      setSintomas('');
      Alert.alert("Eliminado", "Tu perfil se ha vaciado por completo.");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <LinearGradient colors={['#ffffff', '#fce4ec']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>Cuéntale a la IA sobre ti para que te alerte del peligro en tus comidas.</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}><Ionicons name="leaf-outline" size={16} /> Tipo de Dieta</Text>
          <TextInput 
            style={styles.input}
            placeholder="Ej: Vegano, Keto, Pescatariano..."
            value={dieta}
            onChangeText={setDieta}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}><Ionicons name="warning-outline" size={16} /> Alergias / Intolerancias</Text>
          <TextInput 
            style={styles.input}
            placeholder="Ej: Maní, Intolerante a la lactosa, Gluten..."
            value={alergias}
            onChangeText={setAlergias}
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}><Ionicons name="medical-outline" size={16} /> Síntomas Actuales</Text>
          <TextInput 
            style={styles.input}
            placeholder="Ej: Dolor de cabeza, Reflujo, Gastritis..."
            value={sintomas}
            onChangeText={setSintomas}
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={saveProfile} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? "Guardando..." : "Guardar Perfil"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearBtn} onPress={clearProfile}>
          <Text style={styles.clearBtnText}>Eliminar todos mis datos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.devLink} 
          onPress={() => Linking.openURL('https://bescobar-git-master-beck23s-projects.vercel.app/')}
        >
          <Text style={styles.devText}>Desarrollado por: <Text style={styles.devName}>bescobar</Text></Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    color: '#000',
  },
  saveBtn: {
    backgroundColor: '#1c1c1e',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearBtn: {
    marginTop: 15,
    alignItems: 'center',
    padding: 10,
  },
  clearBtnText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
  },
  devLink: {
    marginTop: 30,
    alignItems: 'center',
    padding: 10,
  },
  devText: {
    fontSize: 14,
    color: '#888',
  },
  devName: {
    fontWeight: 'bold',
    color: '#1c1c1e',
    textDecorationLine: 'underline',
  }
});
