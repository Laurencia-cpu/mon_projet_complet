import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  SafeAreaView, Alert, TouchableOpacity, Linking, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../services/api'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';

// --- Types ---
type Collecte = {
  id: number;
  date: string;
  poids: number;
  commentaire: string | null;
  statut: string;
  type_metaux: { id: number; nom: string; };
  lieu: { id: number; nom: string; adresse_complete?: string };
};

// --- Fonctions Mpanampy ---
const formatDate = (val: string | Date | null | undefined): string => {
  if (!val) return 'Date invalide';
  try {
    const dateObj = typeof val === 'string' ? new Date(val) : val;
    if (isNaN(dateObj.getTime())) return 'Date invalide';
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (e) {
    return 'Date invalide';
  }
};

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'valide':
        case 'Effectuée': return { color: '#27ae60' };
        case 'Problème':
        case 'Annulée': return { color: '#c0392b' };
        case 'important':
        case 'verif': return { color: '#f39c12' };
        default: return { color: '#888' };
    }
};

const statutsPossibles = [
  { label: 'À vérifier', value: 'verif' },
  { label: 'Important', value: 'important' },
  { label: 'Validée', value: 'valide' },
];

// --- Component ho an'ny Karatra (CollecteCard) ---
type CollecteCardProps = {
  item: Collecte;
  onStatusChange: (id: number, status: string) => void;
  onOpenMaps: (address: string | undefined) => void;
  isUpdating: boolean;
};
const CollecteCard: React.FC<CollecteCardProps> = React.memo(({ item, onStatusChange, onOpenMaps, isUpdating }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.date}>{formatDate(item.date)} • {item.lieu.nom}</Text>
          <Text style={styles.type}>{item.type_metaux.nom} - {item.poids} kg</Text>
        </View>

        {/* --- FANITSANA ETO --- */}
        {/* Ity no fomba fanoratra comment marina anaty JSX */}
        
        {/* Asehoy fotsiny ny bokotra raha toa ka MISY ny adresse_complete */}
        {item.lieu.adresse_complete && (
          <TouchableOpacity 
            style={styles.mapButton} 
            onPress={() => onOpenMaps(item.lieu.adresse_complete)}
          >
            <Icon name="directions" size={28} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.statusUpdateContainer}>
        <Text style={styles.label}>Statut : <Text style={getStatusStyle(item.statut)}>{item.statut || 'N/A'}</Text></Text>
        
        {isUpdating ? (
          <View style={styles.updatingContainer}>
            <ActivityIndicator color="#6e4e2e" />
          </View>
        ) : (
          <View style={styles.pickerContainer}>
              <Picker
                  selectedValue={item.statut}
                  onValueChange={(itemValue) => onStatusChange(item.id, itemValue)}
                  style={styles.picker}
                  prompt="Changer le statut"
              >
                  <Picker.Item label={item.statut ? `Actuel : ${item.statut}` : "Choisir un statut..."} value={item.statut} enabled={false} style={{color: 'gray'}}/>
                  {statutsPossibles.map(s => <Picker.Item key={s.value} label={s.label} value={s.value} />)}
              </Picker>
          </View>
        )}
      </View>
    </View>
  );
});


// --- Component Lehibe (TourneeAgentScreen) ---
const TourneeAgentScreen: React.FC = () => {
  const [collectes, setCollectes] = useState<Collecte[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const API_URL = 'collectes/';

  const fetchCollectes = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access');
      if (!token) throw new Error("Vous devez être connecté.");

      const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      const sortedData = response.data.sort((a: Collecte, b: Collecte) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setCollectes(sortedData);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les tournées.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectes();
  }, []);

  const handleStatusChange = useCallback(async (collecteId: number, newStatus: string) => {
    const currentCollecte = collectes.find(c => c.id === collecteId);
    if (!newStatus || newStatus === currentCollecte?.statut) return;
    
    setUpdatingId(collecteId);
    const originalCollectes = [...collectes];
    
    setCollectes(prev => prev.map(c => 
      c.id === collecteId ? { ...c, statut: newStatus } : c
    ));
    
    try {
      const token = await AsyncStorage.getItem('access');
      await axios.patch(`${API_URL}${collecteId}/`, { statut: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error: any) {
      Alert.alert("Erreur", "La mise à jour a échoué. Rétablissement des données.");
      setCollectes(originalCollectes);
      console.log("Erreur de validation", JSON.stringify(error.response?.data));
    } finally {
      setUpdatingId(null);
    }
  }, [collectes]);

  const openMaps = useCallback((address: string | undefined) => {
    if (!address) {
        Alert.alert("Adresse manquante", "Aucune adresse n'est disponible pour cette collecte.");
        return;
    }
    const scheme = Platform.select({ ios: 'maps:?daddr=', android: 'geo:?q=' });
    const url = `${scheme}${encodeURIComponent(address)}`;

    Linking.openURL(url).catch(() => {
        Alert.alert("Erreur", "Impossible d'ouvrir l'application de cartographie. Vérifiez si une application comme Google Maps ou Plans est bien installée.");
    });
  }, []);

  const renderItem = useCallback(({ item }: { item: Collecte }) => (
    <CollecteCard
        item={item}
        onStatusChange={handleStatusChange}
        onOpenMaps={openMaps}
        isUpdating={updatingId === item.id}
    />
  ), [handleStatusChange, openMaps, updatingId]);
  
  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#6e4e2e" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={<Text style={styles.title}>Mes Tournées à Gérer</Text>}
        data={collectes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.empty}>Aucune tournée assignée</Text>}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchCollectes}
        refreshing={loading}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={11}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  loadingContainer: { flex: 1, justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 16, fontWeight: '600', color: '#444' },
  type: { fontSize: 15, color: '#666', marginTop: 4 },
  mapButton: { backgroundColor: '#3498db', padding: 10, borderRadius: 50, width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  statusUpdateContainer: { borderTopWidth: 1, borderColor: '#eee', marginTop: 15, paddingTop: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 5 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fcfcfc' },
  picker: { height: 50 },
  updatingContainer: { height: 50, justifyContent: 'center', alignItems: 'center'},
  empty: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },
});

export default TourneeAgentScreen;


// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   View, Text, FlatList, StyleSheet, ActivityIndicator,
//   SafeAreaView, Alert, TouchableOpacity, Linking, Platform
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from '../services/api'; // Mampiasa ny instance voa-config
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { Picker } from '@react-native-picker/picker';

// // --- Types ---
// type Collecte = {
//   id: number;
//   date: string;
//   poids: number;
//   commentaire: string | null;
//   statut: string;
//   type_metaux: { id: number; nom: string; };
//   lieu: { id: number; nom: string; adresse_complete?: string };
// };

// // --- Fonctions Mpanampy (tsy miova) ---
// const formatDate = (val: string | Date | null | undefined): string => {
//   if (!val) return 'Date invalide';
//   try {
//     const dateObj = typeof val === 'string' ? new Date(val) : val;
//     if (isNaN(dateObj.getTime())) return 'Date invalide';
    
//     const day = dateObj.getDate().toString().padStart(2, '0');
//     const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
//     const year = dateObj.getFullYear();
    
//     return `${day}-${month}-${year}`;
//   } catch (e) {
//     return 'Date invalide';
//   }
// };

// const getStatusStyle = (status: string) => {
//     switch (status) {
//         case 'valide':
//         case 'Effectuée': return { color: '#27ae60' }; // Green
//         case 'Problème':
//         case 'Annulée': return { color: '#c0392b' }; // Red
//         case 'important':
//         case 'verif': return { color: '#f39c12' }; // Orange
//         default: return { color: '#888' }; // Gray (Prévue, En attente)
//     }
// };

// // --- Safidy ho an'ny Picker (tsy miova) ---
// const statutsPossibles = [
//   { label: 'À vérifier', value: 'verif' },
//   { label: 'Important', value: 'important' },
//   { label: 'Validée', value: 'valide' },
// ];

// // --- [FANATSARANA 1] Component ho an'ny Karatra (CollecteCard) ---
// // Mampiasa React.memo mba hisorohana ny re-render tsy ilaina
// type CollecteCardProps = {
//   item: Collecte;
//   onStatusChange: (id: number, status: string) => void;
//   onOpenMaps: (address: string | undefined) => void;
//   isUpdating: boolean; // Mahafantatra raha eo am-panovana ity karatra ity
// };

// const CollecteCard: React.FC<CollecteCardProps> = React.memo(({ item, onStatusChange, onOpenMaps, isUpdating }) => {
//   return (
//     <View style={styles.card}>
//       <View style={styles.cardHeader}>
//         <View style={{ flex: 1, marginRight: 10 }}>
//           <Text style={styles.date}>{formatDate(item.date)} • {item.lieu.nom}</Text>
//           <Text style={styles.type}>{item.type_metaux.nom} - {item.poids} kg</Text>
//         </View>
//         <TouchableOpacity style={styles.mapButton} onPress={() => onOpenMaps(item.lieu.adresse_complete)}>
//           <Icon name="map-marker-path" size={28} color="#fff" />
//         </TouchableOpacity>
//       </View>
      
//       <View style={styles.statusUpdateContainer}>
//         <Text style={styles.label}>Statut : <Text style={getStatusStyle(item.statut)}>{item.statut || 'N/A'}</Text></Text>
        
//         {/* [FANATSARANA 2] Mampiseho ActivityIndicator rehefa manova sata */}
//         {isUpdating ? (
//           <View style={styles.updatingContainer}>
//             <ActivityIndicator color="#6e4e2e" />
//           </View>
//         ) : (
//           <View style={styles.pickerContainer}>
//               <Picker
//                   selectedValue={item.statut}
//                   onValueChange={(itemValue) => onStatusChange(item.id, itemValue)}
//                   style={styles.picker}
//                   prompt="Changer le statut"
//               >
//                   <Picker.Item label={item.statut ? `Actuel : ${item.statut}` : "Choisir un statut..."} value={item.statut} enabled={false} style={{color: 'gray'}}/>
//                   {statutsPossibles.map(s => <Picker.Item key={s.value} label={s.label} value={s.value} />)}
//               </Picker>
//           </View>
//         )}
//       </View>
//     </View>
//   );
// });

// // --- Component Lehibe (TourneeAgentScreen) ---
// const TourneeAgentScreen: React.FC = () => {
//   // --- States ---
//   const [collectes, setCollectes] = useState<Collecte[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [updatingId, setUpdatingId] = useState<number | null>(null); // State vaovao ho an'ny fanovana

//   const API_URL = 'collectes/';

//   // --- Fonctions ---
//   const fetchCollectes = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('access');
//       if (!token) throw new Error("Vous devez être connecté.");

//       const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
//       const sortedData = response.data.sort((a: Collecte, b: Collecte) => new Date(b.date).getTime() - new Date(a.date).getTime());
//       setCollectes(sortedData);
//     } catch (error) {
//       Alert.alert("Erreur", "Impossible de charger les tournées.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCollectes();
//   }, []);

//   // [FANATSARANA 3] Fonosina useCallback ireo handler
//   const handleStatusChange = useCallback(async (collecteId: number, newStatus: string) => {
//     const currentCollecte = collectes.find(c => c.id === collecteId);
//     if (!newStatus || newStatus === currentCollecte?.statut) return;
    
//     setUpdatingId(collecteId); // Manomboka ny loading ho an'ilay karatra
//     const originalCollectes = [...collectes];
    
//     // Fanovana eo no ho eo ho an'ny UX tsara kokoa
//     setCollectes(prev => prev.map(c => 
//       c.id === collecteId ? { ...c, statut: newStatus } : c
//     ));
    
//     try {
//       const token = await AsyncStorage.getItem('access');
//       await axios.patch(`${API_URL}${collecteId}/`, { statut: newStatus }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//     } catch (error: any) {
//       Alert.alert("Erreur", "La mise à jour a échoué. Rétablissement des données.");
//       setCollectes(originalCollectes); // Mamerina ny teo aloha raha misy diso
//       console.log("Erreur de validation", JSON.stringify(error.response?.data));
//     } finally {
//       setUpdatingId(null); // Atsahatra foana ny loading
//     }
//   }, [collectes]); // Miankina amin'ny 'collectes' mba hahazoany ny listra farany

//   const openMaps = useCallback((address: string | undefined) => {
//     if (!address) {
//         Alert.alert("Adresse manquante", "Aucune adresse n'est disponible pour cette collecte.");
//         return;
//     }
//     const url = Platform.select({
//       ios: `maps:?daddr=${encodeURIComponent(address)}`,
//       android: `geo:?q=${encodeURIComponent(address)}`,
//     });
//     Linking.openURL(url!).catch(() => Alert.alert("Erreur", "Impossible d'ouvrir l'application de cartographie."));
//   }, []); // Tsy misy fiankinana, noho izany tsy miova mihitsy

//   // Lasa tsotra sy mahomby kokoa ny renderItem
//   const renderItem = useCallback(({ item }: { item: Collecte }) => (
//     <CollecteCard
//         item={item}
//         onStatusChange={handleStatusChange}
//         onOpenMaps={openMaps}
//         isUpdating={updatingId === item.id}
//     />
//   ), [handleStatusChange, openMaps, updatingId]); // Miankina amin'ireo fonction stabilité sy ny updatingId
  
//   // --- Fisehoana ---
//   if (loading) {
//     return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#6e4e2e" /></View>;
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <FlatList
//         ListHeaderComponent={<Text style={styles.title}>Mes Tournées à Gérer</Text>}
//         data={collectes}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id.toString()}
//         ListEmptyComponent={<Text style={styles.empty}>Aucune tournée assignée</Text>}
//         contentContainerStyle={styles.listContent}
//         onRefresh={fetchCollectes}
//         refreshing={loading}
//         // Fisorohana ny fanovana maro indray miaraka
//         removeClippedSubviews={true} 
//         maxToRenderPerBatch={10}
//         windowSize={11}
//       />
//     </SafeAreaView>
//   );
// };

// // --- Styles (misy fanampiny kely) ---
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f4f4f4' },
//   loadingContainer: { flex: 1, justifyContent: 'center' },
//   listContent: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 10 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
//   card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
//   cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   date: { fontSize: 16, fontWeight: '600', color: '#444' },
//   type: { fontSize: 15, color: '#666', marginTop: 4 },
//   mapButton: { backgroundColor: '#3498db', padding: 10, borderRadius: 25 },
//   statusUpdateContainer: { borderTopWidth: 1, borderColor: '#eee', marginTop: 15, paddingTop: 10 },
//   label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 5 },
//   pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fcfcfc' },
//   picker: { height: 50 },
//   updatingContainer: { height: 50, justifyContent: 'center', alignItems: 'center'},
//   empty: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },
// });

// export default TourneeAgentScreen;



// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   View, Text, FlatList, StyleSheet, ActivityIndicator,
//   SafeAreaView, Alert, TouchableOpacity, Linking, Platform
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from '../services/api'; // Mampiasa ny instance voa-config
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { Picker } from '@react-native-picker/picker';

// // --- Types ---
// type Collecte = {
//   id: number;
//   date: string;
//   poids: number;
//   commentaire: string | null;
//   statut: string;
//   type_metaux: { id: number; nom: string; };
//   lieu: { id: number; nom: string; adresse_complete?: string };
// };

// // --- Fonctions Mpanampy ---
// const formatDate = (val: string | Date | null | undefined): string => {
//   if (!val) return 'Date invalide';
//   try {
//     const dateObj = typeof val === 'string' ? new Date(val) : val;
//     // isNaN(dateObj.getTime()) no tena fomba azo antoka hamantarana daty invalide
//     if (isNaN(dateObj.getTime())) return 'Date invalide';
    
//     const day = dateObj.getDate().toString().padStart(2, '0');
//     const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
//     const year = dateObj.getFullYear();
    
//     return `${day}-${month}-${year}`;
//   } catch (e) {
//     return 'Date invalide';
//   }
// };

// const getStatusStyle = (status: string) => {
//     switch (status) {
//         case 'valide':
//         case 'Effectuée': return { color: '#27ae60' }; // Green
//         case 'Problème':
//         case 'Annulée': return { color: '#c0392b' }; // Red
//         case 'important':
//         case 'verif': return { color: '#f39c12' }; // Orange
//         default: return { color: '#888' }; // Gray (Prévue, En attente)
//     }
// };

// const TourneeAgentScreen: React.FC = () => {
//   // --- States ---
//   const [collectes, setCollectes] = useState<Collecte[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Safidy ho an'ny Picker (mifanaraka amin'ny backend)
//   const statutsPossibles = [
//     { label: 'À vérifier', value: 'verif' },
//     { label: 'Important', value: 'important' },
//     { label: 'Validée', value: 'valide' },
//   ];

//   const API_URL = 'collectes/';

//   // --- Fonctions ---
//   const fetchCollectes = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('access');
//       if (!token) throw new Error("Vous devez être connecté.");

//       const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
//       const sortedData = response.data.sort((a: Collecte, b: Collecte) => new Date(b.date).getTime() - new Date(a.date).getTime());
//       setCollectes(sortedData);
//     } catch (error) {
//       Alert.alert("Erreur", "Impossible de charger les tournées.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCollectes();
//   }, []);

//   const handleStatusChange = async (collecteId: number, newStatus: string) => {
//     const currentCollecte = collectes.find(c => c.id === collecteId);
//     if (!newStatus || newStatus === currentCollecte?.statut) return;

//     const originalCollectes = [...collectes];
//     setCollectes(prev => prev.map(c => 
//       c.id === collecteId ? { ...c, statut: newStatus } : c
//     ));

//     const token = await AsyncStorage.getItem('access');
//     try {
//       await axios.patch(`${API_URL}${collecteId}/`, { statut: newStatus }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//     } catch (error: any) {
//       Alert.alert("Erreur", "La mise à jour a échoué. Rétablissement des données.");
//       setCollectes(originalCollectes);
//       console.log("Erreur de validation", JSON.stringify(error.response?.data));
//     }
//   };

//   const openMaps = (address: string | undefined) => {
//     if (!address) {
//         Alert.alert("Adresse manquante", "Aucune adresse n'est disponible pour cette collecte.");
//         return;
//     }
//     const url = Platform.select({
//       ios: `maps:?daddr=${encodeURIComponent(address)}`,
//       android: `geo:?q=${encodeURIComponent(address)}`,
//     });
//     Linking.openURL(url!).catch(() => Alert.alert("Erreur", "Impossible d'ouvrir l'application de cartographie."));
//   };
  
//   const renderItem = useCallback(({ item }: { item: Collecte }) => (
//     <View style={styles.card}>
//       <View style={styles.cardHeader}>
//         <View style={{ flex: 1, marginRight: 10 }}>
//           <Text style={styles.date}>{formatDate(item.date)} • {item.lieu.nom}</Text>
//           <Text style={styles.type}>{item.type_metaux.nom} - {item.poids} kg</Text>
//         </View>
//         <TouchableOpacity style={styles.mapButton} onPress={() => openMaps(item.lieu.adresse_complete)}>
//           <Icon name="map-marker-path" size={28} color="#fff" />
//         </TouchableOpacity>
//       </View>
      
//       <View style={styles.statusUpdateContainer}>
//         <Text style={styles.label}>Statut : <Text style={getStatusStyle(item.statut)}>{item.statut || 'N/A'}</Text></Text>
//         <View style={styles.pickerContainer}>
//             <Picker
//                 selectedValue={item.statut}
//                 onValueChange={(itemValue) => handleStatusChange(item.id, itemValue)}
//                 style={styles.picker}
//                 prompt="Changer le statut"
//             >
//                 {/* Apetraka ho safidy voalohany foana ny satan'ilay collecte */}
//                 <Picker.Item label={item.statut ? `Actuel : ${item.statut}` : "Choisir un statut..."} value={item.statut} enabled={false} style={{color: 'gray'}}/>
//                 {statutsPossibles.map(s => <Picker.Item key={s.value} label={s.label} value={s.value} />)}
//             </Picker>
//         </View>
//       </View>
//     </View>
//   ), [collectes]);
  
//   // --- Fisehoana ---
//   if (loading) {
//     return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#6e4e2e" /></View>;
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <FlatList
//         ListHeaderComponent={<Text style={styles.title}>Mes Tournées à Gérer</Text>}
//         data={collectes}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id.toString()}
//         ListEmptyComponent={<Text style={styles.empty}>Aucune tournée assignée</Text>}
//         contentContainerStyle={styles.listContent}
//         onRefresh={fetchCollectes}
//         refreshing={loading}
//       />
//     </SafeAreaView>
//   );
// };

// // --- Styles ---
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f4f4f4' },
//   loadingContainer: { flex: 1, justifyContent: 'center' },
//   listContent: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 10 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
//   card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
//   cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   date: { fontSize: 16, fontWeight: '600', color: '#444' },
//   type: { fontSize: 15, color: '#666', marginTop: 4 },
//   mapButton: { backgroundColor: '#3498db', padding: 10, borderRadius: 25 },
//   statusUpdateContainer: { borderTopWidth: 1, borderColor: '#eee', marginTop: 15, paddingTop: 10 },
//   label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 5 },
//   pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fcfcfc' },
//   picker: { height: 50 },
//   empty: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },
// });

// export default TourneeAgentScreen;



// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   View, Text, FlatList, StyleSheet, ActivityIndicator,
//   SafeAreaView, Alert, TouchableOpacity, Linking, Platform, Modal, TextInput
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios'; // Ataovy azo antoka fa efa voa-config ny axios instance-nao
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// // --- Types ---
// type Collecte = {
//   id: number;
//   date: string;
//   poids: number;
//   commentaire: string | null;
//   statut: string;
//   tarif_applique: number | null;
//   type_metaux: { id: number; nom: string; };
//   lieu: { id: number; nom: string; adresse_complete?: string }; // Ampiana adresse_complete
// };

// // --- Fonctions Mpanampy ---
// const formatDate = (val: string) => {
//   if (!val || !val.includes('-')) return 'Date invalide';
//   const [y, m, d] = val.split('-');
//   return `${d}-${m}-${y}`;
// };

// const getStatusStyle = (status: string) => {
//     switch (status) {
//         case 'Effectuée': return { color: '#27ae60' }; // Green
//         case 'Problème':
//         case 'Annulée': return { color: '#c0392b' }; // Red
//         default: return { color: '#f39c12' }; // Orange (Prévue, En attente)
//     }
// };

// const TourneeScreen: React.FC = () => {
//   // --- States ---
//   const [collectes, setCollectes] = useState<Collecte[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [selectedCollecte, setSelectedCollecte] = useState<Collecte | null>(null);
//   const [isUpdating, setIsUpdating] = useState(false);
  
//   // States ho an'ny ao anaty Modal
//   const [actualWeight, setActualWeight] = useState('');
//   const [problemComment, setProblemComment] = useState('');

//   const API_URL = 'http://10.0.2.2:8000/api/collectes/';

//   const fetchCollectes = async () => {
//     setLoading(true);
//     const token = await AsyncStorage.getItem('access');
//     if (!token) {
//       Alert.alert("Erreur", "Session expirée. Veuillez vous reconnecter.");
//       setLoading(false);
//       return;
//     }
//     try {
//       const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
//       const sortedData = response.data.sort((a: Collecte, b: Collecte) => new Date(a.date).getTime() - new Date(b.date).getTime());
//       setCollectes(sortedData);
//     } catch (error) {
//       Alert.alert("Erreur", "Impossible de charger les tournées.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCollectes();
//   }, []);

//   const openUpdateModal = (collecte: Collecte) => {
//     setSelectedCollecte(collecte);
//     setActualWeight('');
//     setProblemComment('');
//     setIsModalVisible(true);
//   };

//   const handleUpdate = async (status: 'Effectuée' | 'Problème') => {
//     if (!selectedCollecte) return;
    
//     let payload: any = { statut: status };

//     if (status === 'Effectuée') {
//         if (!actualWeight || parseFloat(actualWeight) <= 0) {
//             Alert.alert("Erreur", "Veuillez entrer un poids réel valide.");
//             return;
//         }
//         payload.poids_reel = parseFloat(actualWeight);
//     } else { // Problème
//         if (!problemComment) {
//             Alert.alert("Erreur", "Veuillez décrire le problème rencontré.");
//             return;
//         }
//         payload.commentaire = problemComment;
//     }

//     setIsUpdating(true);
//     const token = await AsyncStorage.getItem('access');
    
//     try {
//       // Tokony mifanaraka amin'ny API-nao ity URL ity
//       await axios.patch(`${API_URL}${selectedCollecte.id}/`, payload, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       // Fanavaozana ny lisitra eo an-toerana (UI)
//       setCollectes(prev => prev.map(c => 
//         c.id === selectedCollecte.id ? { ...c, statut: status, commentaire: status === 'Problème' ? problemComment : c.commentaire } : c
//       ));

//       Alert.alert("Succès", "Le statut de la collecte a été mis à jour.");
//       setIsModalVisible(false);

//         } catch (error: any) { // Ampio ': any'
//       if (error.response) {
//         // Raha misy valiny avy amin'ny server (ohatra: 400, 500)
//         // Ity no mampiseho ny tena olana avy amin'ny serializer-nao
//         console.log("Données de l'erreur:", error.response.data);
//         Alert.alert(
//           "Erreur de validation", 
//           JSON.stringify(error.response.data, null, 2) // Mampiseho amin'ny endrika mora vakiana
//         );
//       } else if (error.request) {
//         // Raha nalefa ilay izy fa tsy nisy valiny
//         Alert.alert("Erreur réseau", "Aucune réponse du serveur. Vérifiez votre connexion.");
//       } else {
//         // Hadisoana hafa
//         Alert.alert("Erreur", "Une erreur inattendue est survenue.");
//       }
//     }  finally {
//       setIsUpdating(false);
//     }
//   };

//   const openMaps = (address: string) => {
//     const url = Platform.select({
//       ios: `maps:?daddr=${encodeURIComponent(address)}`,
//       android: `geo:?q=${encodeURIComponent(address)}`,
//     });
//     Linking.openURL(url!).catch(() => Alert.alert("Erreur", "Impossible d'ouvrir l'application de cartographie."));
//   };
  
//   const renderItem = useCallback(({ item }: { item: Collecte }) => (
//     <View style={styles.card}>
//       <View style={styles.cardHeader}>
//         <View style={{ flex: 1, marginRight: 10 }}>
//           <Text style={styles.date}>{formatDate(item.date)} • {item.lieu.nom}</Text>
//           <Text style={styles.type}>{item.type_metaux.nom}</Text>
//         </View>
//         <TouchableOpacity style={styles.mapButton} onPress={() => openMaps(item.lieu.adresse_complete || item.lieu.nom)}>
//           <Icon name="map-marker-path" size={28} color="#fff" />
//         </TouchableOpacity>
//       </View>
      
//       <View style={styles.detailsContainer}>
//         <Text style={styles.details}>Poids Prévu : <Text style={styles.bold}>{item.poids} kg</Text></Text>
//         <Text style={styles.details}>Statut : <Text style={[styles.bold, getStatusStyle(item.statut)]}>{item.statut || 'Prévue'}</Text></Text>
//       </View>
      
//       <TouchableOpacity style={styles.actionButton} onPress={() => openUpdateModal(item)}>
//         <Text style={styles.actionButtonText}>Mettre à jour le statut</Text>
//       </TouchableOpacity>
//     </View>
//   ), []);
  
//   // --- Fisehoana ---
//   if (loading) {
//     return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" color="#A45C40" /></View>;
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <FlatList
//         ListHeaderComponent={<Text style={styles.title}>Mes Tournées du Jour</Text>}
//         data={collectes}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id.toString()}
//         ListEmptyComponent={<Text style={styles.empty}>Aucune tournée assignée pour aujourd'hui</Text>}
//         contentContainerStyle={styles.listContent}
//       />

//       {/* --- MODAL --- */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={isModalVisible}
//         onRequestClose={() => setIsModalVisible(false)}
//       >
//         <View style={styles.modalBackground}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Mise à jour : {selectedCollecte?.lieu.nom}</Text>
            
//             {/* Fizarana ho an'ny "Collecte Réussie" */}
//             <Text style={styles.modalSectionTitle}>Collecte Réussie</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Poids réel collecté (kg)"
//               keyboardType="numeric"
//               value={actualWeight}
//               onChangeText={setActualWeight}
//             />
//             <TouchableOpacity 
//               style={[styles.modalButton, styles.successButton]} 
//               onPress={() => handleUpdate('Effectuée')}
//               disabled={isUpdating}
//             >
//               {isUpdating ? <ActivityIndicator color="#fff"/> : <Text style={styles.modalButtonText}>Valider le Poids</Text>}
//             </TouchableOpacity>

//             {/* Fizarana ho an'ny "Signaler un Problème" */}
//             <Text style={styles.modalSectionTitle}>Signaler un Problème</Text>
//             <TextInput
//               style={[styles.input, {height: 80}]}
//               placeholder="Description du problème (client absent, etc.)"
//               multiline
//               value={problemComment}
//               onChangeText={setProblemComment}
//             />
//             <TouchableOpacity 
//               style={[styles.modalButton, styles.problemButton]} 
//               onPress={() => handleUpdate('Problème')}
//               disabled={isUpdating}
//             >
//               {isUpdating ? <ActivityIndicator color="#fff"/> : <Text style={styles.modalButtonText}>Signaler le Problème</Text>}
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
//               <Text style={styles.closeButtonText}>Annuler</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// // --- Styles ---
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f4f4f4' },
//   listContent: { paddingHorizontal: 16, paddingBottom: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginVertical: 20, color: '#333', textAlign: 'center' },
//   card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
//   cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   date: { fontSize: 16, fontWeight: '600', color: '#444' },
//   type: { fontSize: 15, color: '#666' },
//   mapButton: { backgroundColor: '#3498db', padding: 10, borderRadius: 25 },
//   detailsContainer: { paddingVertical: 12, marginVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
//   details: { fontSize: 14, color: '#555', lineHeight: 22 },
//   bold: { fontWeight: 'bold' },
//   actionButton: { backgroundColor: '#6e4e2e', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
//   actionButtonText: { color: '#fff', fontWeight: 'bold' },
//   empty: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },
  
//   // Styles ho an'ny Modal
//   modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
//   modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20, elevation: 10 },
//   modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
//   modalSectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 15, marginBottom: 10, color: '#333' },
//   input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
//   modalButton: { padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
//   successButton: { backgroundColor: '#27ae60' },
//   problemButton: { backgroundColor: '#e74c3c' },
//   modalButtonText: { color: 'white', fontWeight: 'bold' },
//   closeButton: { marginTop: 15 },
//   closeButtonText: { color: 'gray', textAlign: 'center' },
// });

// export default TourneeScreen;


// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   View, Text, FlatList, StyleSheet, ActivityIndicator,
//   SafeAreaView, Alert
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// // --- Types ---
// type Collecte = {
//   id: number;
//   date: string;
//   poids: number;
//   commentaire: string | null;
//   statut: string;
//   tarif_applique: number | null;
//   type_metaux: { id: number; nom: string; };
//   lieu: { id: number; nom: string; };
// };

// // --- Fonctions Mpanampy ---
// const formatDate = (val: string) => {
//   if (!val || !val.includes('-')) return 'Date invalide';
//   const [y, m, d] = val.split('-');
//   return `${d}-${m}-${y}`;
// };

// const TourneeScreen: React.FC = () => {
//   // --- States ---
//   const [collectes, setCollectes] = useState<Collecte[]>([]);
//   const [loading, setLoading] = useState(true);

//   const API_URL = 'http://10.0.2.2:8000/api/collectes/';

//   const fetchCollectes = async () => {
//     const token = await AsyncStorage.getItem('access');
//     if (!token) {
//         Alert.alert("Erreur", "Veuillez vous reconnecter.");
//         setLoading(false);
//         return;
//     }

//     try {
//       const response = await axios.get(API_URL, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       // Mampiasa .sort() fa tsy .reverse() mba hahazoana antoka ny filaharana
//       const sortedData = response.data.sort((a: Collecte, b: Collecte) => new Date(b.date).getTime() - new Date(a.date).getTime());
//       setCollectes(sortedData);
//     } catch (error) {
//       console.error('Erreur de chargement des collectes', error);
//       Alert.alert("Erreur", "Impossible de charger l'historique des tournées.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCollectes();
//   }, []);

//   // --- Render Functions ---
//   const renderItem = useCallback(({ item }: { item: Collecte }) => (
//     <View style={styles.card}>
//       <Text style={styles.date}>{formatDate(item.date)} • {item.lieu.nom}</Text>
//       <Text style={styles.type}>{item.type_metaux.nom}</Text>
//       <Text style={styles.details}>
//         Poids : <Text style={styles.bold}>{item.poids} kg</Text> | Statut : <Text style={styles.bold}>{item.statut || 'N/A'}</Text>
//       </Text>
//       {item.commentaire ? (
//         <Text style={styles.commentaire}>💬 {item.commentaire}</Text>
//       ) : null}
//     </View>
//   ), []);

//   const renderHeader = () => (
//     <Text style={styles.title}>Suivi des Tournées</Text>
//   );

//   // --- Fisehoana ---
//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" color="#A45C40" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//         {/* Esorina ny ScrollView ary ampiasaina mivantana ny FlatList */}
//         <FlatList
//             ListHeaderComponent={renderHeader} // <-- NY VAHANA LEHIBE
//             data={collectes}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.id.toString()}
//             ListEmptyComponent={
//                 <Text style={styles.empty}>Aucune collecte enregistrée</Text>
//             }
//             contentContainerStyle={styles.listContent}
//         />
//     </SafeAreaView>
//   );
// };

// export default TourneeScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fefefe',
//   },
//   listContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginVertical: 20,
//     color: '#6e4e2e',
//     textAlign: 'center',
//   },
//   card: {
//     backgroundColor: '#f8f8f8',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#eee'
//   },
//   date: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 6,
//     color: '#444',
//   },
//   type: {
//     fontSize: 15,
//     color: '#333',
//     marginBottom: 8,
//   },
//   details: {
//     fontSize: 14,
//     color: '#555',
//   },
//   bold: {
//     fontWeight: 'bold',
//   },
//   commentaire: {
//     fontSize: 13,
//     fontStyle: 'italic',
//     marginTop: 8,
//     backgroundColor: '#e9e9e9',
//     padding: 8,
//     borderRadius: 6,
//     color: '#666',
//   },
//   empty: {
//     textAlign: 'center',
//     marginTop: 50,
//     color: '#888',
//     fontSize: 16,
//   },
// });
