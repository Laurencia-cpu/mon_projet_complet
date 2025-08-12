import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  Alert, TextInput, TouchableOpacity, SafeAreaView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import axios from '../services/api'; // Mampiasa ny axios instance voa-config

// --- Types ---
type Correction = {
  id: number;
  champ_modifie: string;
  ancienne_valeur: string | null;
  nouvelle_valeur: string | null;
  date_modification: string;
};

const HistoriqueCorrectionsScreen = () => {
  // --- States ---
  const [allCorrections, setAllCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);
  const [champFilter, setChampFilter] = useState('');
  const [dateMin, setDateMin] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- Fonctions API ---
  const fetchCorrections = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('access');
    try {
      const response = await axios.get<Correction[]>('historique-corrections/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllCorrections(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger l’historique.');
    } finally {
      setLoading(false);
    }
  };

  const deleteOneCorrection = async (id: number) => {
    // ... (ny lojika eto dia tsy miova, fa aleo asiana fanavaozana ny state)
    Alert.alert('Suppression', 'Voulez-vous vraiment supprimer cette correction ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
            const token = await AsyncStorage.getItem('access');
            try {
                await axios.delete(`historique-corrections/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
                Alert.alert('Supprimé', 'Correction supprimée.');
                setAllCorrections(prev => prev.filter(c => c.id !== id)); // Fanavaozana UI avy hatrany
            } catch (err) {
                Alert.alert('Erreur', 'Échec de la suppression.');
            }
        },
      },
    ]);
  };

  const deleteAllCorrections = async () => {
    // ... (ny lojika eto dia tsy miova)
    Alert.alert('Confirmation', 'Voulez-vous vraiment supprimer tout l’historique ?', [
        { text: 'Annuler', style: 'cancel' },
        {
            text: 'Supprimer Tout', style: 'destructive',
            onPress: async () => {
                const token = await AsyncStorage.getItem('access');
                try {
                    await axios.delete('historique-corrections/clear/', { headers: { Authorization: `Bearer ${token}` } });
                    Alert.alert('Succès', 'Historique entièrement supprimé.');
                    setAllCorrections([]); // Mamafa ny UI avy hatrany
                } catch (error) {
                    Alert.alert('Erreur', 'Échec de la suppression massive.');
                }
            },
        },
    ]);
  };

  useEffect(() => {
    fetchCorrections();
  }, []);
  
  // Mampiasa useMemo mba tsy hikajy foana raha tsy miova ny sivana na ny angona
  const filteredCorrections = useMemo(() => {
    return allCorrections.filter((item) => {
        const champMatch = champFilter ? item.champ_modifie.toLowerCase().includes(champFilter.toLowerCase()) : true;
        const dateMatch = dateMin ? new Date(item.date_modification) >= dateMin : true;
        return champMatch && dateMatch;
    });
  }, [allCorrections, champFilter, dateMin]);


  const renderItem = ({ item }: { item: Correction }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.champ}>{item.champ_modifie}</Text>
        <TouchableOpacity onPress={() => deleteOneCorrection(item.id)}>
          <MaterialIcons name="delete-outline" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
      <View style={styles.valeursContainer}>
        <Text style={styles.valeursAncienne}>{item.ancienne_valeur || 'Vide'}</Text>
        <MaterialIcons name="arrow-forward" size={18} color="#7f8c8d" />
        <Text style={styles.valeursNouvelle}>{item.nouvelle_valeur || 'Vide'}</Text>
      </View>
      <Text style={styles.date}>
        {format(new Date(item.date_modification), 'dd/MM/yyyy HH:mm')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredCorrections}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Historique des Corrections</Text>
            <View style={styles.filtersContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Filtrer par champ (ex: poids)"
                    value={champFilter}
                    onChangeText={setChampFilter}
                />
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                    <Text style={styles.dateButtonText}>
                    {dateMin ? `≥ ${format(dateMin, 'dd/MM/yyyy')}` : 'Date min'}
                    </Text>
                    {dateMin && (
                      <TouchableOpacity onPress={() => setDateMin(null)} style={{marginLeft: 10}}>
                        <MaterialIcons name="close" size={18} color="#3C2C1E" />
                      </TouchableOpacity>
                    )}
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={deleteAllCorrections}>
                <MaterialIcons name="delete-sweep" size={18} color="#fff" />
                <Text style={styles.deleteText}>Tout Supprimer</Text>
            </TouchableOpacity>
          </>
        }
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>Aucune correction ne correspond à vos filtres.</Text> : null}
        refreshing={loading}
        onRefresh={fetchCorrections}
      />

      {showDatePicker && (
        <DateTimePicker
          value={dateMin || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDateMin(selectedDate);
          }}
        />
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF9F6' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#6E4E2E', marginBottom: 16, textAlign: 'center' },
  filtersContainer: { marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, backgroundColor: '#FFF' },
  dateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6D5C2', padding: 12, borderRadius: 10, marginBottom: 10, justifyContent: 'center' },
  dateButtonText: { color: '#3C2C1E', fontWeight: '600' },
  deleteButton: { flexDirection: 'row', backgroundColor: '#c0392b', padding: 12, borderRadius: 10, marginBottom: 20, justifyContent: 'center', alignItems: 'center' },
  deleteText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 10, elevation: 1, borderWidth: 1, borderColor: '#eee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  champ: { fontSize: 16, fontWeight: 'bold', color: '#6E4E2E', textTransform: 'capitalize' },
  valeursContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 8, borderRadius: 6 },
  valeursAncienne: { textDecorationLine: 'line-through', color: '#7f8c8d', flex: 1 },
  valeursNouvelle: { fontWeight: 'bold', color: '#2c3e50', flex: 1, textAlign: 'right' },
  date: { fontSize: 12, color: '#95a5a6', marginTop: 8, fontStyle: 'italic', textAlign: 'right' },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 40 },
});

export default HistoriqueCorrectionsScreen;




// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   ActivityIndicator,
//   StyleSheet,
//   Alert,
//   TextInput,
//   TouchableOpacity,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { format } from 'date-fns';
// import axios from 'axios';

// type Correction = {
//   id: number;
//   champ_modifie: string;
//   ancienne_valeur: string | null;
//   nouvelle_valeur: string | null;
//   date_modification: string;
// };

// const HistoriqueCorrectionsScreen = () => {
//   const [corrections, setCorrections] = useState<Correction[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [champFilter, setChampFilter] = useState('');
//   const [dateMin, setDateMin] = useState<Date | null>(null);
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   const fetchCorrections = async () => {
//     setLoading(true);
//     const token = await AsyncStorage.getItem('access');

//     try {
//       const response = await axios.get<Correction[]>(
//         'http://10.0.2.2:8000/api/historique-corrections/',
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = response.data;

//       const filtered = data.filter((item) => {
//         const champMatch = champFilter
//           ? item.champ_modifie.toLowerCase().includes(champFilter.toLowerCase())
//           : true;

//         const dateMatch = dateMin
//           ? new Date(item.date_modification) >= dateMin
//           : true;

//         return champMatch && dateMatch;
//       });

//       setCorrections(filtered);
//     } catch (error) {
//       console.error('Erreur:', error);
//       Alert.alert('Erreur', 'Impossible de charger l’historique.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteOneCorrection = async (id: number) => {
//     const token = await AsyncStorage.getItem('access');

//     Alert.alert(
//       'Suppression',
//       'Voulez-vous vraiment supprimer cette correction ?',
//       [
//         { text: 'Annuler', style: 'cancel' },
//         {
//           text: 'Supprimer',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await axios.delete(`http://10.0.2.2:8000/api/historique-corrections/${id}/`, {
//                 headers: {
//                   Authorization: `Bearer ${token}`,
//                 },
//               });
//               Alert.alert('Supprimé', 'Correction supprimée.');
//               fetchCorrections();
//             } catch (err) {
//               Alert.alert('Erreur', 'Échec de suppression.');
//               console.error(err);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const deleteAllCorrections = async () => {
//     const token = await AsyncStorage.getItem('access');

//     Alert.alert(
//       'Confirmation',
//       'Voulez-vous vraiment supprimer tout l’historique ?',
//       [
//         { text: 'Annuler', style: 'cancel' },
//         {
//           text: 'Supprimer',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await axios.delete('http://10.0.2.2:8000/api/historique-corrections/clear/', {
//                 headers: {
//                   Authorization: `Bearer ${token}`,
//                 },
//               });
//               Alert.alert('Succès', 'Historique supprimé.');
//               fetchCorrections();
//             } catch (error) {
//               console.error('Erreur suppression:', error);
//               Alert.alert('Erreur', 'Échec de la suppression.');
//             }
//           },
//         },
//       ]
//     );
//   };

//   useEffect(() => {
//     fetchCorrections();
//   }, [champFilter, dateMin]);

//   const renderItem = ({ item }: { item: Correction }) => (
//     <View style={styles.card}>
//       <View style={styles.cardHeader}>
//         <Text style={styles.champ}>Champ : {item.champ_modifie}</Text>
//         <TouchableOpacity onPress={() => deleteOneCorrection(item.id)}>
//           <MaterialIcons name="delete" size={22} color="#cc3b3b" />
//         </TouchableOpacity>

//       </View>
//       <Text style={styles.valeurs}>
//         {item.ancienne_valeur ?? '—'} → {item.nouvelle_valeur ?? '—'}
//       </Text>
//       <Text style={styles.date}>
//         Modifié le {new Date(item.date_modification).toLocaleString()}
//       </Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}> Historique des Corrections</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Filtrer par champ (ex: poids)"
//         value={champFilter}
//         onChangeText={setChampFilter}
//       />

//       <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
//         <Text style={styles.dateButtonText}>
//           {dateMin
//             ? `📆 Date ≥ ${format(dateMin, 'dd/MM/yyyy')}`
//             : '📆 Choisir date min'}
//         </Text>
//       </TouchableOpacity>

//       {showDatePicker && (
//         <DateTimePicker
//           value={dateMin || new Date()}
//           mode="date"
//           display="calendar"
//           onChange={(_, selectedDate) => {
//             setShowDatePicker(false);
//             if (selectedDate) setDateMin(selectedDate);
//           }}
//         />
//       )}

//       <TouchableOpacity style={styles.refreshButton} onPress={fetchCorrections}>
//         <Text style={styles.refreshText}>🔄 Rafraîchir</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.deleteButton} onPress={deleteAllCorrections}>
//         <Text style={styles.deleteText}> Supprimer tout l’historique</Text>
//       </TouchableOpacity>

//       {loading ? (
//         <ActivityIndicator size="large" color="#A45C40" />
//       ) : corrections.length === 0 ? (
//         <Text style={styles.emptyText}>Aucune correction trouvée.</Text>
//       ) : (
//         <FlatList
//           data={corrections}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={renderItem}
//           contentContainerStyle={{ paddingBottom: 30 }}
//         />
//       )}
//     </View>
//   );
// };

// export default HistoriqueCorrectionsScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FCF9F6',
//     padding: 16,
//     marginTop:15
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#6E4E2E',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#CCC',
//     borderRadius: 10,
//     padding: 10,
//     marginBottom: 10,
//     backgroundColor: '#FFF',
//   },
//   dateButton: {
//     backgroundColor: '#E6D5C2',
//     padding: 10,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   dateButtonText: {
//     color: '#3C2C1E',
//     textAlign: 'center',
//     fontWeight: '600',
//   },
//   refreshButton: {
//     backgroundColor: '#A45C40',
//     padding: 10,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   refreshText: {
//     color: '#fff',
//     textAlign: 'center',
//     fontWeight: 'bold',
//   },
//   deleteButton: {
//     backgroundColor: '#cc3b3b',
//     padding: 10,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   deleteText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   card: {
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 10,
//     elevation: 2,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   champ: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#A45C40',
//   },
//   deleteIcon: {
//     fontSize: 18,
//     color: '#cc3b3b',
//   },
//   valeurs: {
//     fontSize: 14,
//     color: '#444',
//     marginTop: 4,
//   },
//   date: {
//     fontSize: 12,
//     color: '#777',
//     marginTop: 6,
//     fontStyle: 'italic',
//   },
//   emptyText: {
//     textAlign: 'center',
//     fontSize: 16,
//     color: '#888',
//     marginTop: 20,
//   },
// });



// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   ActivityIndicator,
//   StyleSheet,
//   Alert,
//   TextInput,
//   TouchableOpacity,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { format } from 'date-fns';
// import axios from 'axios';

// type Correction = {
//   id: number;
//   champ_modifie: string;
//   ancienne_valeur: string | null;
//   nouvelle_valeur: string | null;
//   date_modification: string;
// };

// const HistoriqueCorrectionsScreen = () => {
//   const [corrections, setCorrections] = useState<Correction[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [champFilter, setChampFilter] = useState('');
//   const [dateMin, setDateMin] = useState<Date | null>(null);
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   const fetchCorrections = async () => {
//     setLoading(true);
//     const token = await AsyncStorage.getItem('access');

//     try {
//       const response = await axios.get<Correction[]>(
//         'http://10.0.2.2:8000/api/historique-corrections/',
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = response.data;

//       const filtered = data.filter((item) => {
//         const champMatch = champFilter
//           ? item.champ_modifie.toLowerCase().includes(champFilter.toLowerCase())
//           : true;

//         const dateMatch = dateMin
//           ? new Date(item.date_modification) >= dateMin
//           : true;

//         return champMatch && dateMatch;
//       });

//       setCorrections(filtered);
//     } catch (error) {
//       console.error('Erreur:', error);
//       Alert.alert('Erreur', 'Impossible de charger l’historique.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCorrections();
//   }, [champFilter, dateMin]);

//   const renderItem = ({ item }: { item: Correction }) => (
//     <View style={styles.card}>
//       <Text style={styles.champ}>Champ : {item.champ_modifie}</Text>
//       <Text style={styles.valeurs}>
//         {item.ancienne_valeur ?? '—'} → {item.nouvelle_valeur ?? '—'}
//       </Text>
//       <Text style={styles.date}>
//         Modifié le {new Date(item.date_modification).toLocaleString()}
//       </Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}> Historique des Corrections</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Filtrer par champ (ex: poids)"
//         value={champFilter}
//         onChangeText={setChampFilter}
//       />

//       <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
//         <Text style={styles.dateButtonText}>
//           {dateMin
//             ? `Filtre date ≥ ${format(dateMin, 'dd/MM/yyyy')}`
//             : '📆 Choisir date min'}
//         </Text>
//       </TouchableOpacity>

//       {showDatePicker && (
//         <DateTimePicker
//           value={dateMin || new Date()}
//           mode="date"
//           display="calendar"
//           onChange={(_, selectedDate) => {
//             setShowDatePicker(false);
//             if (selectedDate) setDateMin(selectedDate);
//           }}
//         />
//       )}

//       <TouchableOpacity style={styles.refreshButton} onPress={fetchCorrections}>
//         <Text style={styles.refreshText}>🔄 Rafraîchir</Text>
//       </TouchableOpacity>

//       {loading ? (
//         <ActivityIndicator size="large" color="#A45C40" />
//       ) : corrections.length === 0 ? (
//         <Text style={styles.emptyText}>Aucune correction trouvée.</Text>
//       ) : (
//         <FlatList
//           data={corrections}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={renderItem}
//           contentContainerStyle={{ paddingBottom: 30 }}
//         />
//       )}
//     </View>
//   );
// };

// export default HistoriqueCorrectionsScreen;
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FCF9F6',
//     padding: 16,
//     marginTop:15,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#6E4E2E',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#CCC',
//     borderRadius: 10,
//     padding: 10,
//     marginBottom: 10,
//     backgroundColor: '#FFF',
//   },
//   dateButton: {
//     backgroundColor: '#E6D5C2',
//     padding: 10,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   dateButtonText: {
//     color: '#3C2C1E',
//     textAlign: 'center',
//     fontWeight: '600',
//   },
//   refreshButton: {
//     backgroundColor: '#A45C40',
//     padding: 10,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   refreshText: {
//     color: '#fff',
//     textAlign: 'center',
//     fontWeight: 'bold',
//   },
//   card: {
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 10,
//     elevation: 2,
//   },
//   champ: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#A45C40',
//   },
//   valeurs: {
//     fontSize: 14,
//     color: '#444',
//     marginTop: 4,
//   },
//   date: {
//     fontSize: 12,
//     color: '#777',
//     marginTop: 6,
//     fontStyle: 'italic',
//   },
//   emptyText: {
//     textAlign: 'center',
//     fontSize: 16,
//     color: '#888',
//     marginTop: 20,
//   },
// });