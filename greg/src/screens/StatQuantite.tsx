// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   ActivityIndicator,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// type QuantiteItem = {
//   type_metaux__nom: string;
//   poids_total: number;
// };

// const QuantiteRecupereeScreen = () => {
//   const [data, setData] = useState<QuantiteItem[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchQuantite = async () => {
//     setLoading(true);
//     const token = await AsyncStorage.getItem('access');

//     try {
//       const response = await fetch('http://10.0.2.2:8000/api/quantite-par-metaux/', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) throw new Error('Erreur de chargement');

//       const result: QuantiteItem[] = await response.json();
//       setData(result);
//     } catch (error) {
//       console.error(error);
//       Alert.alert('Erreur', "Impossible de récupérer les données.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchQuantite();
//   }, []);

//   const renderItem = ({ item }: { item: QuantiteItem }) => (
//     <View style={styles.card}>
//       <Text style={styles.metal}>{item.type_metaux__nom}</Text>
//       <Text style={styles.poids}>{item.poids_total.toFixed(2)} kg</Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>⚖️ Quantité Récupérée</Text>

//       <TouchableOpacity style={styles.refreshButton} onPress={fetchQuantite}>
//         <Text style={styles.refreshText}>🔄 Rafraîchir</Text>
//       </TouchableOpacity>

//       {loading ? (
//         <ActivityIndicator size="large" color="#A45C40" />
//       ) : data.length === 0 ? (
//         <Text style={styles.empty}>Aucune donnée disponible.</Text>
//       ) : (
//         <FlatList
//           data={data}
//           keyExtractor={(item, index) => item.type_metaux__nom + index}
//           renderItem={renderItem}
//           contentContainerStyle={{ paddingBottom: 30 }}
//         />
//       )}
//     </View>
//   );
// };

// export default QuantiteRecupereeScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9F5F2',
//     padding: 16,
//     marginTop:15,
//   },
//   title: {
//     fontSize: 20,
//     color: '#6E4E2E',
//     fontWeight: 'bold',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   refreshButton: {
//     backgroundColor: '#A45C40',
//     padding: 10,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   refreshText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   card: {
//     backgroundColor: '#fff',
//     padding: 14,
//     borderRadius: 10,
//     marginBottom: 10,
//     elevation: 2,
//   },
//   metal: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#4A3428',
//   },
//   poids: {
//     fontSize: 14,
//     color: '#555',
//     marginTop: 4,
//   },
//   empty: {
//     textAlign: 'center',
//     color: '#888',
//     marginTop: 20,
//   },
// });

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

type QuantiteItem = {
  type_metaux__nom: string;
  poids_total: number;
};

const QuantiteRecupereeScreen = () => {
  const [data, setData] = useState<QuantiteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuantite = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('access');

    try {
      const response = await axios.get<QuantiteItem[]>(
        'http://10.0.2.2:8000/api/quantite-par-metaux/',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', "Impossible de récupérer les données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuantite();
  }, []);

  const renderItem = ({ item }: { item: QuantiteItem }) => (
    <View style={styles.card}>
      <Text style={styles.metal}>{item.type_metaux__nom}</Text>
      <Text style={styles.poids}>{item.poids_total.toFixed(2)} kg</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚖️ Quantité Récupérée</Text>

      <TouchableOpacity style={styles.refreshButton} onPress={fetchQuantite}>
        <Text style={styles.refreshText}>🔄 Rafraîchir</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#A45C40" />
      ) : data.length === 0 ? (
        <Text style={styles.empty}>Aucune donnée disponible.</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => item.type_metaux__nom + index}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};

export default QuantiteRecupereeScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F5F2',
    padding: 16,
    marginTop:15
  },
  title: {
    fontSize: 20,
    color: '#6E4E2E',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#A45C40',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  refreshText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  metal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A3428',
  },
  poids: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});
