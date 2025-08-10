// import React, { useEffect, useState } from 'react';
// import {
//   View, Text, FlatList, StyleSheet, ActivityIndicator,
//   SafeAreaView, ScrollView
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// type Collecte = {
//   id: number;
//   date: string;
//   poids: number;
//   commentaire: string | null;
//   statut: string;
//   tarif_applique: number | null;
//   type_metaux: {
//     id: number;
//     nom: string;
//   };
//   lieu: {
//     id: number;
//     nom: string;
//   };
// };

// // ✅ Fonction pour formater la date en JJ-MM-AAAA
// const formatDate = (val: string) => {
//   const [y, m, d] = val.split('-');
//   return `${d}-${m}-${y}`;
// };

// const TourneeScreen: React.FC = () => {
//   const [collectes, setCollectes] = useState<Collecte[]>([]);
//   const [loading, setLoading] = useState(true);

//   const API_URL = 'http://10.0.2.2:8000/api/collectes/';

//   const fetchCollectes = async () => {
//     const token = await AsyncStorage.getItem('access');
//     setLoading(true);
//     try {
//       const response = await fetch(API_URL, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const data = await response.json();
//       setCollectes(data.reverse()); // plus récent en haut
//     } catch (error) {
//       console.error('Erreur de chargement des collectes', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCollectes();
//   }, []);

//   const renderItem = ({ item }: { item: Collecte }) => (
//     <View style={styles.card}>
//       <Text style={styles.date}>{formatDate(item.date)} • {item.lieu.nom}</Text>
//       <Text style={styles.type}>{item.type_metaux.nom}</Text>
//       <Text style={styles.details}>
//         Poids : {item.poids} kg | Statut : {item.statut || 'N/A'}
//       </Text>
//       {item.commentaire ? (
//         <Text style={styles.commentaire}>💬 {item.commentaire}</Text>
//       ) : null}
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <Text style={styles.title}>Suivi des Tournées</Text>

//         {loading ? (
//           <ActivityIndicator size="large" color="#A45C40" />
//         ) : (
//           <FlatList
//             data={collectes}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.id.toString()}
//             ListEmptyComponent={
//               <Text style={styles.empty}>Aucune collecte enregistrée</Text>
//             }
//           />
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default TourneeScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fefefe',
//     paddingHorizontal: 16,
//     marginTop:15,
//   },
//   scrollContent: {
//     paddingBottom: 20,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginVertical: 16,
//     color: '#6e4e2e',
//     textAlign: 'center',
//   },
//   card: {
//     backgroundColor: '#f2f2f2',
//     borderRadius: 10,
//     padding: 16,
//     marginBottom: 12,
//     elevation: 2,
//   },
//   date: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 4,
//     color: '#444',
//   },
//   type: {
//     fontSize: 15,
//     fontWeight: '500',
//     color: '#333',
//   },
//   details: {
//     fontSize: 14,
//     marginTop: 4,
//     color: '#555',
//   },
//   commentaire: {
//     fontSize: 13,
//     fontStyle: 'italic',
//     marginTop: 4,
//     color: '#888',
//   },
//   empty: {
//     textAlign: 'center',
//     marginTop: 30,
//     color: '#888',
//   },
// });


import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  SafeAreaView, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';  // <-- Import axios

type Collecte = {
  id: number;
  date: string;
  poids: number;
  commentaire: string | null;
  statut: string;
  tarif_applique: number | null;
  type_metaux: {
    id: number;
    nom: string;
  };
  lieu: {
    id: number;
    nom: string;
  };
};

// ✅ Fonction pour formater la date en JJ-MM-AAAA
const formatDate = (val: string) => {
  const [y, m, d] = val.split('-');
  return `${d}-${m}-${y}`;
};

const TourneeScreen: React.FC = () => {
  const [collectes, setCollectes] = useState<Collecte[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://10.0.2.2:8000/api/collectes/';

  const fetchCollectes = async () => {
    const token = await AsyncStorage.getItem('access');
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCollectes(response.data.reverse()); // plus récent en haut
    } catch (error) {
      console.error('Erreur de chargement des collectes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectes();
  }, []);

  const renderItem = ({ item }: { item: Collecte }) => (
    <View style={styles.card}>
      <Text style={styles.date}>{formatDate(item.date)} • {item.lieu.nom}</Text>
      <Text style={styles.type}>{item.type_metaux.nom}</Text>
      <Text style={styles.details}>
        Poids : {item.poids} kg | Statut : {item.statut || 'N/A'}
      </Text>
      {item.commentaire ? (
        <Text style={styles.commentaire}>💬 {item.commentaire}</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Suivi des Tournées</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#A45C40" />
        ) : (
          <FlatList
            data={collectes}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <Text style={styles.empty}>Aucune collecte enregistrée</Text>
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TourneeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
    paddingHorizontal: 16,
    marginTop:15
  },
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#6e4e2e',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#444',
  },
  type: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  details: {
    fontSize: 14,
    marginTop: 4,
    color: '#555',
  },
  commentaire: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
    color: '#888',
  },
  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: '#888',
  },
});
