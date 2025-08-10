import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  Button
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

type Lot = {
  id: number;
  type_metaux: { id: number; nom: string };
  poids: number;
  date: string;
};

type Collecte = {
  id: number;
  type_metaux: { id: number; nom: string };
  poids: number;
  date: string;
};

const API_URL = 'http://10.0.2.2:8000/api';

const FusionLots = () => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [collectes, setCollectes] = useState<Collecte[]>([]);
  const [selectedLots, setSelectedLots] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCollectes, setShowCollectes] = useState(false); // pour afficher collectes après génération

  useEffect(() => {
    fetchLots();
    // Ne pas fetchCollectes ici pour ne pas afficher collectes au départ
  }, []);

  const fetchLots = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access');
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté.');
        setLoading(false);
        return;
      }
      const res = await axios.get(`${API_URL}/lots/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLots(res.data);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger les lots');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectes = async () => {
    try {
      const token = await AsyncStorage.getItem('access');
      if (!token) return;
      const res = await axios.get(`${API_URL}/collectes/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCollectes(res.data);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger les collectes');
    }
  };

  const genererDepuisCollectes = async () => {
    try {
      const token = await AsyncStorage.getItem('access');
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté.');
        return;
      }

      const res = await axios.post(
        `${API_URL}/lots/generer_depuis_collectes/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      Alert.alert('Succès', res.data.message || 'Lots générés.');

      // Rafraîchir la liste des lots et récupérer les collectes pour affichage
      await fetchLots();
      await fetchCollectes();
      setShowCollectes(true); // afficher la section collectes
    } catch (error: any) {
      const errMessage = error?.response?.data?.error || 'Erreur lors de la génération.';
      Alert.alert('Erreur', errMessage);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedLots((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const fusionnerLots = async () => {
    if (selectedLots.length < 2) {
      Alert.alert('Erreur', 'Sélectionnez au moins deux lots');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('access');
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté.');
        return;
      }
      const res = await axios.post(
        `${API_URL}/lots/fusionner/`,
        { lots_ids: selectedLots },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const nouveauLot = res.data;
      Alert.alert(
        'Succès',
        `Nouveau lot créé : ${nouveauLot.type_metaux.nom}, ${nouveauLot.poids} kg`
      );
      setSelectedLots([]);
      fetchLots();
    } catch (error: any) {
      const errMessage = error?.response?.data?.error || 'Erreur inconnue';
      Alert.alert('Erreur', errMessage);
    }
  };

  const renderItem = ({ item }: { item: Lot }) => {
    const isSelected = selectedLots.includes(item.id);
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => toggleSelect(item.id)}
        style={[styles.card, isSelected && styles.cardSelected]}
      >
        <Text style={styles.textType}>{item.type_metaux.nom}</Text>
        <Text>{item.poids} kg</Text>
        <Text style={styles.date}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A45C40" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Lots disponibles</Text>

      <View style={styles.buttonContainer}>
        <Button
          title=" Générer depuis Collectes"
          color="#6E4E2E"
          onPress={genererDepuisCollectes}
        />
        <Button
          title=" Fusionner les lots sélectionnés"
          color="#e76f51"
          onPress={fusionnerLots}
        />
      </View>

      {lots.length === 0 ? (
        <Text style={styles.emptyText}>Aucun lot disponible.</Text>
      ) : (
        lots.map((lot) => renderItem({ item: lot }))
      )}

      {showCollectes && (
        <>
          <Text style={[styles.title, { marginTop: 30 }]}>Collectes effectuées</Text>
          {collectes.length === 0 ? (
            <Text style={styles.emptyText}>Aucune collecte disponible.</Text>
          ) : (
            collectes.map((collecte) => (
              <View key={collecte.id} style={styles.card}>
                <Text style={styles.textType}>{collecte.type_metaux.nom}</Text>
                <Text>{collecte.poids} kg</Text>
                <Text style={styles.date}>
                  {new Date(collecte.date).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
   marginTop:15
  },
  center: {
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10
  },
  cardSelected: {
    backgroundColor: '#cce5ff'
  },
  textType: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  date: {
    color: '#555',
    marginTop: 4
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999'
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20
  }
});

export default FusionLots;



// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
//   Button
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// type Lot = {
//   id: number;
//   type_metaux: { id: number; nom: string };
//   poids: number;
//   date: string;
// };

// const API_URL = 'http://10.0.2.2:8000/api';

// const FusionLots = () => {
//   const [lots, setLots] = useState<Lot[]>([]);
//   const [selectedLots, setSelectedLots] = useState<number[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchLots();
//   }, []);

//   const fetchLots = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('access');
// if (!token) {
//   console.log('⚠️ Aucun token trouvé dans AsyncStorage');
//   Alert.alert('Erreur', 'Vous devez être connecté.');
//   return;
// }

//       const res = await axios.get(`${API_URL}/lots/`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       setLots(res.data);
//     } catch (e) {
//       console.error(e);
//       Alert.alert('Erreur', 'Impossible de charger les lots');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const genererDepuisCollectes = async () => {
//     try {
//       const token = await AsyncStorage.getItem('access');
//       const res = await axios.post(
//         `${API_URL}/lots/generer_depuis_collectes/`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       Alert.alert('Succès', res.data.message || 'Lots générés.');
//       fetchLots();
//     } catch (error: any) {
//       console.error(error);
//       const errMessage = error?.response?.data?.error || 'Erreur lors de la génération.';
//       Alert.alert('Erreur', errMessage);
//     }
//   };

//   const toggleSelect = (id: number) => {
//     setSelectedLots((prev) =>
//       prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
//     );
//   };

//   const fusionnerLots = async () => {
//     if (selectedLots.length < 2) {
//       Alert.alert('Erreur', 'Sélectionnez au moins deux lots');
//       return;
//     }

//     try {
//       const token = await AsyncStorage.getItem('access');
//       const res = await axios.post(
//         `${API_URL}/lots/fusionner/`,
//         { lots_ids: selectedLots },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       const nouveauLot = res.data;
//       Alert.alert(
//         'Succès',
//         `Nouveau lot créé : ${nouveauLot.type_metaux.nom}, ${nouveauLot.poids} kg`
//       );
//       setSelectedLots([]);
//       fetchLots();
//     } catch (error: any) {
//       console.error(error);
//       const errMessage = error?.response?.data?.error || 'Erreur inconnue';
//       Alert.alert('Erreur', errMessage);
//     }
//   };

//   const renderItem = ({ item }: { item: Lot }) => {
//     const isSelected = selectedLots.includes(item.id);
//     return (
//       <TouchableOpacity
//         key={item.id}
//         onPress={() => toggleSelect(item.id)}
//         style={[styles.card, isSelected && styles.cardSelected]}
//       >
//         <Text style={styles.textType}>{item.type_metaux.nom}</Text>
//         <Text>{item.poids} kg</Text>
//         <Text style={styles.date}>
//           {new Date(item.date).toLocaleDateString()}
//         </Text>
//       </TouchableOpacity>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#A45C40" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Lots disponibles</Text>

//       <View style={styles.buttonContainer}>
//         <Button title="➕ Générer depuis Collectes" color="#2a9d8f" onPress={genererDepuisCollectes} />
//         <Button title="🔗 Fusionner les lots sélectionnés" color="#e76f51" onPress={fusionnerLots} />
//       </View>

//       {lots.length === 0 ? (
//         <Text style={styles.emptyText}>Aucun lot disponible.</Text>
//       ) : (
//         lots.map((lot) => renderItem({ item: lot }))
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     backgroundColor: '#fff',
//     marginTop:15
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center'
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10
//   },
//   card: {
//     backgroundColor: '#f2f2f2',
//     padding: 12,
//     marginBottom: 10,
//     borderRadius: 10
//   },
//   cardSelected: {
//     backgroundColor: '#cce5ff'
//   },
//   textType: {
//     fontSize: 16,
//     fontWeight: 'bold'
//   },
//   date: {
//     color: '#555',
//     marginTop: 4
//   },
//   emptyText: {
//     textAlign: 'center',
//     marginTop: 20,
//     fontSize: 16,
//     color: '#999'
//   },
//   buttonContainer: {
//     flexDirection: 'column',
//     gap: 10,
//     marginBottom: 20
//   }
// });

// export default FusionLots;
