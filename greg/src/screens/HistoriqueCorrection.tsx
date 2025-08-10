import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import axios from 'axios';

type Correction = {
  id: number;
  champ_modifie: string;
  ancienne_valeur: string | null;
  nouvelle_valeur: string | null;
  date_modification: string;
};

const HistoriqueCorrectionsScreen = () => {
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);
  const [champFilter, setChampFilter] = useState('');
  const [dateMin, setDateMin] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchCorrections = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('access');

    try {
      const response = await axios.get<Correction[]>(
        'http://10.0.2.2:8000/api/historique-corrections/',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      const filtered = data.filter((item) => {
        const champMatch = champFilter
          ? item.champ_modifie.toLowerCase().includes(champFilter.toLowerCase())
          : true;

        const dateMatch = dateMin
          ? new Date(item.date_modification) >= dateMin
          : true;

        return champMatch && dateMatch;
      });

      setCorrections(filtered);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger l’historique.');
    } finally {
      setLoading(false);
    }
  };

  const deleteOneCorrection = async (id: number) => {
    const token = await AsyncStorage.getItem('access');

    Alert.alert(
      'Suppression',
      'Voulez-vous vraiment supprimer cette correction ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`http://10.0.2.2:8000/api/historique-corrections/${id}/`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              Alert.alert('Supprimé', 'Correction supprimée.');
              fetchCorrections();
            } catch (err) {
              Alert.alert('Erreur', 'Échec de suppression.');
              console.error(err);
            }
          },
        },
      ]
    );
  };

  const deleteAllCorrections = async () => {
    const token = await AsyncStorage.getItem('access');

    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer tout l’historique ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete('http://10.0.2.2:8000/api/historique-corrections/clear/', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              Alert.alert('Succès', 'Historique supprimé.');
              fetchCorrections();
            } catch (error) {
              console.error('Erreur suppression:', error);
              Alert.alert('Erreur', 'Échec de la suppression.');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchCorrections();
  }, [champFilter, dateMin]);

  const renderItem = ({ item }: { item: Correction }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.champ}>Champ : {item.champ_modifie}</Text>
        <TouchableOpacity onPress={() => deleteOneCorrection(item.id)}>
          <MaterialIcons name="delete" size={22} color="#cc3b3b" />
        </TouchableOpacity>

      </View>
      <Text style={styles.valeurs}>
        {item.ancienne_valeur ?? '—'} → {item.nouvelle_valeur ?? '—'}
      </Text>
      <Text style={styles.date}>
        Modifié le {new Date(item.date_modification).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Historique des Corrections</Text>

      <TextInput
        style={styles.input}
        placeholder="Filtrer par champ (ex: poids)"
        value={champFilter}
        onChangeText={setChampFilter}
      />

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>
          {dateMin
            ? `📆 Date ≥ ${format(dateMin, 'dd/MM/yyyy')}`
            : '📆 Choisir date min'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dateMin || new Date()}
          mode="date"
          display="calendar"
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDateMin(selectedDate);
          }}
        />
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={fetchCorrections}>
        <Text style={styles.refreshText}>🔄 Rafraîchir</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={deleteAllCorrections}>
        <Text style={styles.deleteText}> Supprimer tout l’historique</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#A45C40" />
      ) : corrections.length === 0 ? (
        <Text style={styles.emptyText}>Aucune correction trouvée.</Text>
      ) : (
        <FlatList
          data={corrections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};

export default HistoriqueCorrectionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF9F6',
    padding: 16,
    marginTop:15
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6E4E2E',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#FFF',
  },
  dateButton: {
    backgroundColor: '#E6D5C2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  dateButtonText: {
    color: '#3C2C1E',
    textAlign: 'center',
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#A45C40',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  refreshText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#cc3b3b',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  champ: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A45C40',
  },
  deleteIcon: {
    fontSize: 18,
    color: '#cc3b3b',
  },
  valeurs: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#777',
    marginTop: 6,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});



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