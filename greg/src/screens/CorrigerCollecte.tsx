import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

type Collecte = {
  id: number;
  date: string;
  poids: number;
  commentaire?: string;
  statut: string | null;
  type_metaux: { id: number; nom: string };
  lieu: { id: number; nom: string };
};

type Option = { id: number; nom: string };

const CorrigerCollecteScreen = () => {
  const [collectes, setCollectes] = useState<Collecte[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Collecte | null>(null);
  const [poids, setPoids] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [statut, setStatut] = useState('');
  const [lieuId, setLieuId] = useState<number | null>(null);
  const [typeMetauxId, setTypeMetauxId] = useState<number | null>(null);
  const [lieux, setLieux] = useState<Option[]>([]);
  const [metaux, setMetaux] = useState<Option[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Statuts possibles pour le Picker statut
  const statuts = [
    { id: 'important', label: 'Important' },
    { id: 'valide', label: 'Valide' },
    { id: 'verif', label: 'À vérifier' },
  ];

  const API_URL = 'http://10.0.2.2:8000/api/collectes/';

  const fetchCollectes = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('access');
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCollectes(res.data);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger les collectes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLieuxEtMetaux = async () => {
    const token = await AsyncStorage.getItem('access');
    try {
      const [resLieux, resMetaux] = await Promise.all([
        axios.get('http://10.0.2.2:8000/api/lieux-collecte/', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://10.0.2.2:8000/api/types-metaux/', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setLieux(resLieux.data);
      setMetaux(resMetaux.data);
    } catch (e) {
      Alert.alert('Erreur', 'Échec de chargement des lieux ou types de métaux.');
    }
  };

  useEffect(() => {
    fetchCollectes();
    fetchLieuxEtMetaux();
  }, []);

  const openEdit = (item: Collecte) => {
    setSelected(item);
    setPoids(item.poids.toString());
    setCommentaire(item.commentaire || '');
    setStatut(item.statut || '');
    setLieuId(item.lieu.id);
    setTypeMetauxId(item.type_metaux.id);
    setSelectedDate(new Date(item.date));
  };

  const formatDateFr = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${
      (date.getMonth() + 1).toString().padStart(2, '0')
    }/${date.getFullYear()}`;
  };

  const modifierCollecte = async () => {
    if (!selected || !lieuId || !typeMetauxId || !selectedDate) return;

    const token = await AsyncStorage.getItem('access');
    try {
      await axios.put(
        `${API_URL}${selected.id}/`,
        {
          poids: parseFloat(poids),
          commentaire,
          statut,
          lieu_id: lieuId,
          type_metaux_id: typeMetauxId,
          date: selectedDate.toISOString().split('T')[0], // ISO pour backend
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert('Succès', 'Collecte modifiée.');
      setSelected(null);
      fetchCollectes();
    } catch (error: any) {
      if (error.response && error.response.data) {
        Alert.alert('Erreur', JSON.stringify(error.response.data));
      } else {
        Alert.alert('Erreur', 'Échec de la mise à jour.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Corriger les Collectes</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={collectes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => openEdit(item)}>
              <Text style={styles.itemTitle}>
                {item.type_metaux.nom} - {item.poids} kg
              </Text>
              <Text>
                {item.lieu.nom} | {item.date}
              </Text>
              <Text>Statut: {item.statut || 'N/A'}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={!!selected} animationType="slide">
        <ScrollView contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Modifier la collecte</Text>

          <Text style={styles.label}>Poids (kg)</Text>
          <TextInput
            placeholder="Poids (kg)"
            value={poids}
            onChangeText={setPoids}
            keyboardType="decimal-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Commentaire</Text>
          <TextInput
            placeholder="Commentaire"
            value={commentaire}
            onChangeText={setCommentaire}
            style={styles.input}
          />

          <Text style={styles.label}>Statut</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={statut}
              onValueChange={(value) => setStatut(value)}
              style={styles.picker}
            >
              <Picker.Item label="-- Choisir un statut --" value="" />
              {statuts.map((s) => (
                <Picker.Item key={s.id} label={s.label} value={s.id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Lieu de collecte</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={lieuId}
              onValueChange={(value) => setLieuId(value)}
              style={styles.picker}
            >
              <Picker.Item label="-- Sélectionner un lieu --" value={null} />
              {lieux.map((lieu) => (
                <Picker.Item key={lieu.id} label={lieu.nom} value={lieu.id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Type de Métaux</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={typeMetauxId}
              onValueChange={(value) => setTypeMetauxId(value)}
              style={styles.picker}
            >
              <Picker.Item label="-- Sélectionner un métal --" value={null} />
              {metaux.map((met) => (
                <Picker.Item key={met.id} label={met.nom} value={met.id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[styles.input, { justifyContent: 'center' }]}
          >
            <Text>
              {selectedDate ? formatDateFr(selectedDate) : 'Sélectionner une date'}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setSelectedDate(date);
              }}
            />
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btnCancel} onPress={() => setSelected(null)}>
              <Text style={styles.btnText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSave} onPress={modifierCollecte}>
              <Text style={styles.btnText}>Modifier</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
};

export default CorrigerCollecteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop:15
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  item: {
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modal: {
    padding: 24,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  btnCancel: {
    backgroundColor: '#aaa',
    padding: 12,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  btnSave: {
    backgroundColor: '#6e4e2e',
    padding: 12,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});





// import React, { useEffect, useState } from 'react';
// import {
//   View, Text, FlatList, TextInput, TouchableOpacity,
//   ActivityIndicator, StyleSheet, Alert, Modal, SafeAreaView
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';  // <-- Import axios

// type Collecte = {
//   id: number;
//   date: string;
//   poids: number;
//   commentaire?: string;
//   statut: string | null;
//   type_metaux: { id: number; nom: string };
//   lieu: { id: number; nom: string };
// };

// const CorrigerCollecteScreen = () => {
//   const [collectes, setCollectes] = useState<Collecte[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [selected, setSelected] = useState<Collecte | null>(null);
//   const [poids, setPoids] = useState('');
//   const [commentaire, setCommentaire] = useState('');
//   const [statut, setStatut] = useState('');
//   const API_URL = 'http://10.0.2.2:8000/api/collectes/';

//   const fetchCollectes = async () => {
//     setLoading(true);
//     const token = await AsyncStorage.getItem('access');
//     try {
//       const res = await axios.get(API_URL, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setCollectes(res.data);
//     } catch (e) {
//       Alert.alert('Erreur', 'Impossible de charger les collectes.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCollectes();
//   }, []);

//   const modifierCollecte = async () => {
//     if (!selected) return;
//     const token = await AsyncStorage.getItem('access');
//     try {
//       const res = await axios.put(
//         `${API_URL}${selected.id}/`,
//         {
//           poids: parseFloat(poids),
//           commentaire,
//           statut,
//           type_metaux_id: selected.type_metaux.id,
//           lieu_id: selected.lieu.id,
//           date: selected.date,
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       Alert.alert('Succès', 'Collecte modifiée.');
//       setSelected(null);
//       fetchCollectes();
//     } catch (error: any) {
//       if (error.response && error.response.data) {
//         Alert.alert('Erreur', JSON.stringify(error.response.data));
//       } else {
//         Alert.alert('Erreur', 'Échec de la mise à jour.');
//       }
//     }
//   };

//   const openEdit = (item: Collecte) => {
//     setSelected(item);
//     setPoids(item.poids.toString());
//     setCommentaire(item.commentaire || '');
//     setStatut(item.statut || '');
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>Corriger les Collectes</Text>

//       {loading ? (
//         <ActivityIndicator size="large" />
//       ) : (
//         <FlatList
//           data={collectes}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={({ item }) => (
//             <TouchableOpacity style={styles.item} onPress={() => openEdit(item)}>
//               <Text style={styles.itemTitle}>{item.type_metaux.nom} - {item.poids} kg</Text>
//               <Text>{item.lieu.nom} | {item.date}</Text>
//               <Text>Statut: {item.statut || 'N/A'}</Text>
//             </TouchableOpacity>
//           )}
//         />
//       )}

//       {/* MODAL DE MODIFICATION */}
//       <Modal visible={!!selected} animationType="slide">
//         <View style={styles.modal}>
//           <Text style={styles.modalTitle}>Modifier la collecte</Text>

//           <TextInput
//             placeholder="Poids (kg)"
//             value={poids}
//             onChangeText={setPoids}
//             keyboardType="decimal-pad"
//             style={styles.input}
//           />
//           <TextInput
//             placeholder="Commentaire"
//             value={commentaire}
//             onChangeText={setCommentaire}
//             style={styles.input}
//           />
//           <TextInput
//             placeholder="Statut (important, valide, verif)"
//             value={statut}
//             onChangeText={setStatut}
//             style={styles.input}
//           />

//           <View style={styles.btnRow}>
//             <TouchableOpacity style={styles.btnCancel} onPress={() => setSelected(null)}>
//               <Text style={styles.btnText}>Annuler</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.btnSave} onPress={modifierCollecte}>
//               <Text style={styles.btnText}>Enregistrer</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default CorrigerCollecteScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     marginTop: 15,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   item: {
//     padding: 12,
//     backgroundColor: '#eee',
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   itemTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   modal: {
//     flex: 1,
//     padding: 24,
//     backgroundColor: '#fff',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#aaa',
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 12,
//   },
//   btnRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   btnCancel: {
//     backgroundColor: '#aaa',
//     padding: 12,
//     borderRadius: 8,
//     width: '45%',
//     alignItems: 'center',
//   },
//   btnSave: {
//     backgroundColor: '#6e4e2e',
//     padding: 12,
//     borderRadius: 8,
//     width: '45%',
//     alignItems: 'center',
//   },
//   btnText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });
