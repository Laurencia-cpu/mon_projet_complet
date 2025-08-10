// import React, { useEffect, useState } from 'react';
// import {
//   View, Text, TextInput, TouchableOpacity, ActivityIndicator,
//   Alert, FlatList, StyleSheet, SafeAreaView, KeyboardAvoidingView,
//   Platform, ScrollView
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Picker } from '@react-native-picker/picker';

// type TypeMetaux = { id: number; nom: string; };
// type LieuCollecte = { id: number; nom: string; };
// type Collecte = {
//   id: number;
//   date: string;
//   poids: number;
//   commentaire?: string;
//   statut?: string;
//   tarif_applique?: number;
//   type_metaux: TypeMetaux;
//   lieu: LieuCollecte;
// };

// const API_COLLECTE = 'http://10.0.2.2:8000/api/collectes/';
// const API_METAL = 'http://10.0.2.2:8000/api/types-metaux/';
// const API_LIEU = 'http://10.0.2.2:8000/api/lieux-collecte/';

// const convertirDate = (val: string) => {
//   const [jour, mois, annee] = val.split('-');
//   if (!jour || !mois || !annee) return val;
//   return `${annee}-${mois}-${jour}`;
// };

// const formatDateAffichage = (val: string) => {
//   const [annee, mois, jour] = val.split('-');
//   if (!jour || !mois || !annee) return val;
//   return `${jour}-${mois}-${annee}`;
// };

// const fetchJSON = async (url: string, headers: any) => {
//   const res = await fetch(url, { headers });
//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`Erreur ${res.status}: ${text}`);
//   }
//   return res.json();
// };

// const CollecteScreen = () => {
//   const [collectes, setCollectes] = useState<Collecte[]>([]);
//   const [typeMetaux, setTypeMetaux] = useState<TypeMetaux[]>([]);
//   const [lieux, setLieux] = useState<LieuCollecte[]>([]);
//   const [date, setDate] = useState('');
//   const [poids, setPoids] = useState('');
//   const [commentaire, setCommentaire] = useState('');
//   const [typeId, setTypeId] = useState<number>(0);
//   const [lieuId, setLieuId] = useState<number>(0);
//   const [loading, setLoading] = useState(false);

//   const loadData = async () => {
//     setLoading(true);
//     const token = await AsyncStorage.getItem('access');
//     if (!token) {
//       Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter.');
//       setLoading(false);
//       return;
//     }
//     const headers = { Authorization: `Bearer ${token}` };
//     try {
//       const [c, m, l] = await Promise.all([
//         fetchJSON(API_COLLECTE, headers),
//         fetchJSON(API_METAL, headers),
//         fetchJSON(API_LIEU, headers),
//       ]);
//       setCollectes(c.reverse());
//       setTypeMetaux(m);
//       setLieux(l);
//     } catch (e: any) {
//       Alert.alert('Erreur', 'Chargement des données impossible.', [{ text: 'OK' }]);
//       console.error('Erreur loadData:', e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   const ajouterCollecte = async () => {
//     const token = await AsyncStorage.getItem('access');
//     if (!token) {
//       Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter.');
//       return;
//     }
//     if (!date || !poids || typeId === 0 || lieuId === 0) {
//       Alert.alert('Erreur', 'Tous les champs obligatoires doivent être remplis.');
//       return;
//     }
//     if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) {
//       Alert.alert('Erreur', 'Le format de la date doit être JJ-MM-AAAA');
//       return;
//     }
//     const poidsNum = parseFloat(poids);
//     if (isNaN(poidsNum) || poidsNum <= 0) {
//       Alert.alert('Erreur', 'Le poids doit être un nombre positif.');
//       return;
//     }
//     try {
//       const res = await fetch(API_COLLECTE, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           date: convertirDate(date),
//           poids: poidsNum,
//           commentaire,
//           type_metaux_id: typeId,
//           lieu_id: lieuId
//         }),
//       });
//       if (res.status === 201) {
//         setDate('');
//         setPoids('');
//         setCommentaire('');
//         setTypeId(0);
//         setLieuId(0);
//         loadData();
//         Alert.alert('Succès', 'Collecte ajoutée avec succès');
//       } else {
//         const err = await res.json();
//         Alert.alert('Erreur', JSON.stringify(err));
//       }
//     } catch (error) {
//       Alert.alert('Erreur', 'Impossible d’ajouter la collecte.');
//       console.error('Erreur ajouterCollecte:', error);
//     }
//   };

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         style={styles.container}
//       >
//         <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
//           <Text style={styles.title}>Enregistrer une collecte</Text>

//           <TextInput
//             style={styles.input}
//             placeholder="Date (JJ-MM-AAAA)"
//             value={date}
//             onChangeText={setDate}
//             keyboardType="numeric"
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Poids (kg)"
//             keyboardType="numeric"
//             value={poids}
//             onChangeText={setPoids}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Commentaire"
//             value={commentaire}
//             onChangeText={setCommentaire}
//           />

//           <Text style={styles.label}>Type de Métal</Text>
//           <View style={styles.picker}>
//             <Picker selectedValue={typeId} onValueChange={(value) => setTypeId(value)}>
//               <Picker.Item label="-- Choisir un métal --" value={0} />
//               {typeMetaux.map((t) => (
//                 <Picker.Item key={t.id} label={t.nom} value={t.id} />
//               ))}
//             </Picker>
//           </View>

//           <Text style={styles.label}>Lieu de Collecte</Text>
//           <View style={styles.picker}>
//             <Picker selectedValue={lieuId} onValueChange={(value) => setLieuId(value)}>
//               <Picker.Item label="-- Choisir un lieu --" value={0} />
//               {lieux.map((l) => (
//                 <Picker.Item key={l.id} label={l.nom} value={l.id} />
//               ))}
//             </Picker>
//           </View>

//           <TouchableOpacity style={styles.button} onPress={ajouterCollecte}>
//             <Text style={styles.buttonText}>Enregistrer</Text>
//           </TouchableOpacity>

//           <Text style={styles.subtitle}>Collectes enregistrées</Text>
//           {loading ? (
//             <ActivityIndicator size="large" color="#A45C40" />
//           ) : (
//             <FlatList
//               data={collectes}
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={({ item }) => (
//                 <View style={styles.item}>
//                   <Text style={styles.itemTitle}>
//                     {item.date ? formatDateAffichage(item.date) : 'Date inconnue'} - {item.type_metaux?.nom || 'Métal inconnu'}
//                   </Text>
//                   <Text>Lieu : {item.lieu?.nom || 'Lieu inconnu'}</Text>
//                   <Text>Poids : {item.poids ?? '-'} kg</Text>
//                   <Text>Commentaire : {item.commentaire || '-'}</Text>
//                   <Text>Statut : {item.statut || '-'}</Text>
//                   <Text>Tarif : {item.tarif_applique ?? '-'} €/kg</Text>
//                 </View>
//               )}
//               scrollEnabled={true}
//               ListEmptyComponent={<Text style={{ textAlign: 'center' }}>Aucune collecte</Text>}
//             />
//           )}
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// export default CollecteScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: '#fff', marginTop:15, },
//   title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#6e4e2e' },
//   subtitle: { fontSize: 20, fontWeight: '600', marginVertical: 16, color: '#6e4e2e' },
//   input: {
//     borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
//     paddingHorizontal: 12, paddingVertical: 10, fontSize: 16,
//     marginBottom: 10, backgroundColor: '#fff',
//   },
//   button: {
//     backgroundColor: '#6e4e2e', paddingVertical: 14,
//     borderRadius: 8, alignItems: 'center', marginTop: 12,
//   },
//   buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
//   item: {
//     backgroundColor: '#f2eee5', padding: 12,
//     borderRadius: 10, marginBottom: 12,
//   },
//   itemTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
//   picker: {
//     borderWidth: 1, borderColor: '#ccc',
//     borderRadius: 8, marginBottom: 12,
//     backgroundColor: '#fff', overflow: 'hidden',
//   },
//   label: { fontWeight: '600', marginBottom: 4 },
// });

import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  Alert, FlatList, StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';  // <-- import axios

type TypeMetaux = { id: number; nom: string; };
type LieuCollecte = { id: number; nom: string; };
type Collecte = {
  id: number;
  date: string;
  poids: number;
  commentaire?: string;
  statut?: string;
  tarif_applique?: number;
  type_metaux: TypeMetaux;
  lieu: LieuCollecte;
};

const API_COLLECTE = 'http://10.0.2.2:8000/api/collectes/';
const API_METAL = 'http://10.0.2.2:8000/api/types-metaux/';
const API_LIEU = 'http://10.0.2.2:8000/api/lieux-collecte/';

const convertirDate = (val: string) => {
  const [jour, mois, annee] = val.split('-');
  if (!jour || !mois || !annee) return val;
  return `${annee}-${mois}-${jour}`;
};

const formatDateAffichage = (val: string) => {
  const [annee, mois, jour] = val.split('-');
  if (!jour || !mois || !annee) return val;
  return `${jour}-${mois}-${annee}`;
};

// Version axios de fetchJSON
const fetchJSON = async (url: string, headers: any) => {
  try {
    const res = await axios.get(url, { headers });
    return res.data;
  } catch (error: any) {
    // Extraire le message d'erreur
    const status = error.response?.status || '???';
    const data = error.response?.data || error.message;
    throw new Error(`Erreur ${status}: ${JSON.stringify(data)}`);
  }
};

const CollecteScreen = () => {
  const [collectes, setCollectes] = useState<Collecte[]>([]);
  const [typeMetaux, setTypeMetaux] = useState<TypeMetaux[]>([]);
  const [lieux, setLieux] = useState<LieuCollecte[]>([]);
  const [date, setDate] = useState('');
  const [poids, setPoids] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [typeId, setTypeId] = useState<number>(0);
  const [lieuId, setLieuId] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('access');
    if (!token) {
      Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [c, m, l] = await Promise.all([
        fetchJSON(API_COLLECTE, headers),
        fetchJSON(API_METAL, headers),
        fetchJSON(API_LIEU, headers),
      ]);
      setCollectes(c.reverse());
      setTypeMetaux(m);
      setLieux(l);
    } catch (e: any) {
      Alert.alert('Erreur', 'Chargement des données impossible.', [{ text: 'OK' }]);
      console.error('Erreur loadData:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const ajouterCollecte = async () => {
    const token = await AsyncStorage.getItem('access');
    if (!token) {
      Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter.');
      return;
    }
    if (!date || !poids || typeId === 0 || lieuId === 0) {
      Alert.alert('Erreur', 'Tous les champs obligatoires doivent être remplis.');
      return;
    }
    if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      Alert.alert('Erreur', 'Le format de la date doit être JJ-MM-AAAA');
      return;
    }
    const poidsNum = parseFloat(poids);
    if (isNaN(poidsNum) || poidsNum <= 0) {
      Alert.alert('Erreur', 'Le poids doit être un nombre positif.');
      return;
    }
    try {
      const res = await axios.post(
        API_COLLECTE,
        {
          date: convertirDate(date),
          poids: poidsNum,
          commentaire,
          type_metaux_id: typeId,
          lieu_id: lieuId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if (res.status === 201) {
        setDate('');
        setPoids('');
        setCommentaire('');
        setTypeId(0);
        setLieuId(0);
        loadData();
        Alert.alert('Succès', 'Collecte ajoutée avec succès');
      } else {
        Alert.alert('Erreur', JSON.stringify(res.data));
      }
    } catch (error: any) {
      const errMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      Alert.alert('Erreur', `Impossible d’ajouter la collecte. ${errMsg}`);
      console.error('Erreur ajouterCollecte:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <Text style={styles.title}>Enregistrer une collecte</Text>

          <TextInput
            style={styles.input}
            placeholder="Date (JJ-MM-AAAA)"
            value={date}
            onChangeText={setDate}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Poids (kg)"
            keyboardType="numeric"
            value={poids}
            onChangeText={setPoids}
          />
          <TextInput
            style={styles.input}
            placeholder="Commentaire"
            value={commentaire}
            onChangeText={setCommentaire}
          />

          <Text style={styles.label}>Type de Métal</Text>
          <View style={styles.picker}>
            <Picker selectedValue={typeId} onValueChange={(value) => setTypeId(value)}>
              <Picker.Item label="-- Choisir un métal --" value={0} />
              {typeMetaux.map((t) => (
                <Picker.Item key={t.id} label={t.nom} value={t.id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Lieu de Collecte</Text>
          <View style={styles.picker}>
            <Picker selectedValue={lieuId} onValueChange={(value) => setLieuId(value)}>
              <Picker.Item label="-- Choisir un lieu --" value={0} />
              {lieux.map((l) => (
                <Picker.Item key={l.id} label={l.nom} value={l.id} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity style={styles.button} onPress={ajouterCollecte}>
            <Text style={styles.buttonText}>Enregistrer</Text>
          </TouchableOpacity>

          <Text style={styles.subtitle}>Collectes enregistrées</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#A45C40" />
          ) : (
            <FlatList
              data={collectes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <Text style={styles.itemTitle}>
                    {item.date ? formatDateAffichage(item.date) : 'Date inconnue'} - {item.type_metaux?.nom || 'Métal inconnu'}
                  </Text>
                  <Text>Lieu : {item.lieu?.nom || 'Lieu inconnu'}</Text>
                  <Text>Poids : {item.poids ?? '-'} kg</Text>
                  <Text>Commentaire : {item.commentaire || '-'}</Text>
                  <Text>Statut : {item.statut || '-'}</Text>
                  <Text>Tarif : {item.tarif_applique ?? '-'} Ar/kg</Text>
                </View>
              )}
              scrollEnabled={true}
              ListEmptyComponent={<Text style={{ textAlign: 'center' }}>Aucune collecte</Text>}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CollecteScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#6e4e2e' },
  subtitle: { fontSize: 20, fontWeight: '600', marginVertical: 16, color: '#6e4e2e' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 16,
    marginBottom: 10, backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#6e4e2e', paddingVertical: 14,
    borderRadius: 8, alignItems: 'center', marginTop: 12,
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  item: {
    backgroundColor: '#f2eee5', padding: 12,
    borderRadius: 10, marginBottom: 12,
  },
  itemTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  picker: {
    borderWidth: 1, borderColor: '#ccc',
    borderRadius: 8, marginBottom: 12,
    backgroundColor: '#fff', overflow: 'hidden',
  },
  label: { fontWeight: '600', marginBottom: 4 },
});
