import { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [foodImage, setFoodImage] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  
  const cameraRef = useRef<any>(null);

  const startCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) return;
    }
    setAiAnalysis(null);
    setFoodImage(null);
    setIsCameraActive(true);
  };

  const analyzeFood = async (base64Data: string) => {
    setAnalyzing(true);
    setAiAnalysis("Analizando platillo...");
    
    try {
      if (!GEMINI_API_KEY) {
        throw new Error("no .env detectado");
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Eres el mejor chef del mundo. Dime qué platillo es este y sus posibles ingredientes iniciales en viñetas cortas. Sé directo, amigable y breve (máximo 5 renglones)." },
              { inline_data: { mime_type: "image/jpeg", data: base64Data } }
            ]
          }]
        })
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error.message);
      
      const textoGenerado = data.candidates[0].content.parts[0].text;
      setAiAnalysis(textoGenerado);
      
    } catch (e: any) {
      console.error(e);
      setAiAnalysis(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const captureOrReset = async () => {
    // Si la cámara está activa, tomar foto
    if (isCameraActive && cameraRef.current) {
      setAnalyzing(true);
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      setIsCameraActive(false);
      setFoodImage(photo.uri);
      
      if (photo.base64) {
        analyzeFood(photo.base64);
      }
    } 
    // Si ya hay foto, limpiar y volver a la cámara
    else if (foodImage) {
      setFoodImage(null);
      setAiAnalysis(null);
      startCamera();
    } 
    // Si no hay nada, encender cámara
    else {
      startCamera();
    }
  };

  return (
    <LinearGradient 
      colors={['#e0f2f1', '#fce4ec', '#fff3e0']} 
      style={styles.container} 
      start={{x: 0, y: 0}} 
      end={{x: 1, y: 1}}
    >
      <SafeAreaView style={styles.safeArea}>
        
      
        <View style={styles.headerRow}>
           <View style={styles.iconBubble}>
             <Ionicons name="apps-outline" size={24} color="#333" />
           </View>
           <View style={styles.iconBubble}>
             <Ionicons name="person-outline" size={24} color="#333" />
           </View>
        </View>

       
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>Hola,</Text>
          <Text style={styles.mainTitle}>¿Qué vamos a{"\n"}escanear hoy?</Text>
        </View>

        <View style={styles.viewfinderContainer}>
          {isCameraActive ? (
             <CameraView 
               ref={cameraRef}
               style={styles.fullImage} 
               facing="back"
             />
          ) : foodImage ? (
             <Image 
               source={foodImage} 
               style={styles.fullImage} 
               contentFit="cover"
               transition={500}
             />
          ) : (
             <View style={styles.placeholder}>
               <Ionicons name="fast-food-outline" size={80} color="#b0bec5" />
               <Text style={styles.placeholderText}>Listo para analizar</Text>
             </View>
          )}

          {aiAnalysis && (
            <BlurView intensity={80} tint="light" style={styles.analysisGlass}>
               {analyzing ? (
                  <ActivityIndicator size="small" color="#000" />
               ) : (
                  <ScrollView style={{maxHeight: 180}} showsVerticalScrollIndicator={false}>
                     <Text style={styles.analysisText}>{aiAnalysis}</Text>
                  </ScrollView>
               )}
            </BlurView>
          )}
        </View>

        <View style={styles.bottomDock}>
          <TouchableOpacity 
             style={styles.fabButton} 
             onPress={captureOrReset} 
             disabled={analyzing}
             activeOpacity={0.7}
          >
             {analyzing ? (
               <ActivityIndicator color="white" />
             ) : isCameraActive ? (
               <Ionicons name="aperture" size={36} color="white" />
             ) : foodImage ? (
               <Ionicons name="refresh" size={32} color="white" />
             ) : (
               <Ionicons name="scan" size={36} color="white" />
             )}
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginBottom: 40,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '500',
    color: '#666',
    marginBottom: 5,
  },
  mainTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1c1c1e',
    letterSpacing: -1,
  },
  viewfinderContainer: {
    flex: 1,
    borderRadius: 45,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
    position: 'relative',
    marginBottom: 100,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  placeholderText: {
    marginTop: 15,
    fontSize: 18,
    color: '#78909c',
    fontWeight: '600',
  },
  analysisGlass: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  analysisText: {
    fontSize: 16,
    color: '#222',
    lineHeight: 24,
    fontWeight: '500',
  },
  bottomDock: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fabButton: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#1c1c1e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 15,
  }
});
