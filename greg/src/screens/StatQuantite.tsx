import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions, // Nampiana ity mba hahazoana ny sakan'ny efijery
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// --- FANAFARANA VAOVAO ---
import { PieChart } from "react-native-gifted-charts";

const screenWidth = Dimensions.get('window').width;

type QuantiteItem = {
  type_metaux__nom: string;
  poids_total: number;
};

// Fonction kely hanamboarana loko samihafa
const getRandomColor = () => ('#' + ((Math.random() * 0xffffff) << 0).toString(16) + '000000').slice(0, 7);

const QuantiteRecupereeScreen = () => {
  const [data, setData] = useState<QuantiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pieData, setPieData] = useState<any[]>([]);
  const [totalPoids, setTotalPoids] = useState(0);

  const fetchQuantite = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('access');
    try {
      const response = await axios.get<QuantiteItem[]>(
        'http://10.0.2.2:8000/api/quantite-par-metaux/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const fetchedData = response.data;
      setData(fetchedData);

      // --- Fanomanana ny angona ho an'ilay "Fromage" ---
      let total = 0;
      const chartData = fetchedData.map((item, index) => {
        total += item.poids_total;
        return {
          value: item.poids_total,
          color: getRandomColor(),
          text: `${((item.poids_total / fetchedData.reduce((acc, curr) => acc + curr.poids_total, 0)) * 100).toFixed(0)}%`, // Asehoy ny isan-jato
          label: item.type_metaux__nom, // Tazomina ny anarany ho an'ny "legend"
        };
      });
      
      setPieData(chartData);
      setTotalPoids(total);

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

  // Ny lisitra misy ny loko sy ny anarany (Legend)
  const renderLegend = (item: any) => (
    <View key={item.label} style={styles.legendItem}>
      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
      <Text style={styles.legendText}>{item.label}: {item.value.toFixed(2)} kg</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚖️ Quantité Récupérée</Text>

      <TouchableOpacity style={styles.refreshButton} onPress={fetchQuantite}>
        <Text style={styles.refreshText}>🔄 Rafraîchir</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#A45C40" style={{ marginTop: 50 }} />
      ) : data.length === 0 ? (
        <Text style={styles.empty}>Aucune donnée disponible.</Text>
      ) : (
        <View style={styles.chartContainer}>
          {/* --- Fampisehoana ilay "Fromage" vaovao --- */}
          <PieChart
            data={pieData}
            donut
            showText
            textColor="black"
            radius={screenWidth / 3.5}
            innerRadius={screenWidth / 8}
            textSize={14}
            focusOnPress
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text style={{ fontSize: 18, color: '#333', fontWeight: 'bold' }}>
                  {totalPoids.toFixed(2)}
                </Text>
                <Text style={{ fontSize: 14, color: 'gray' }}>kg Total</Text>
              </View>
            )}
          />

          {/* Fampisehoana ny "Legend" */}
          <View style={styles.legendContainer}>
            {pieData.map(renderLegend)}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default QuantiteRecupereeScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F5F2',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    color: '#6E4E2E',
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
  },
  refreshButton: {
    backgroundColor: '#A45C40',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  refreshText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centerLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendContainer: {
    width: '100%',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#444',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});

// // import React, { useEffect, useState } from 'react';
// // import {
// //   View,
// //   Text,
// //   FlatList,
// //   ActivityIndicator,
// //   StyleSheet,
// //   TouchableOpacity,
// //   Alert,
// // } from 'react-native';
// // import AsyncStorage from '@react-native-async-storage/async-storage';

// // type QuantiteItem = {
// //   type_metaux__nom: string;
// //   poids_total: number;
// // };

// // const QuantiteRecupereeScreen = () => {
// //   const [data, setData] = useState<QuantiteItem[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   const fetchQuantite = async () => {
// //     setLoading(true);
// //     const token = await AsyncStorage.getItem('access');

// //     try {
// //       const response = await fetch('http://10.0.2.2:8000/api/quantite-par-metaux/', {
// //         headers: {
// //           Authorization: `Bearer ${token}`,
// //         },
// //       });

// //       if (!response.ok) throw new Error('Erreur de chargement');

// //       const result: QuantiteItem[] = await response.json();
// //       setData(result);
// //     } catch (error) {
// //       console.error(error);
// //       Alert.alert('Erreur', "Impossible de récupérer les données.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchQuantite();
// //   }, []);

// //   const renderItem = ({ item }: { item: QuantiteItem }) => (
// //     <View style={styles.card}>
// //       <Text style={styles.metal}>{item.type_metaux__nom}</Text>
// //       <Text style={styles.poids}>{item.poids_total.toFixed(2)} kg</Text>
// //     </View>
// //   );

// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.title}>⚖️ Quantité Récupérée</Text>

// //       <TouchableOpacity style={styles.refreshButton} onPress={fetchQuantite}>
// //         <Text style={styles.refreshText}>🔄 Rafraîchir</Text>
// //       </TouchableOpacity>

// //       {loading ? (
// //         <ActivityIndicator size="large" color="#A45C40" />
// //       ) : data.length === 0 ? (
// //         <Text style={styles.empty}>Aucune donnée disponible.</Text>
// //       ) : (
// //         <FlatList
// //           data={data}
// //           keyExtractor={(item, index) => item.type_metaux__nom + index}
// //           renderItem={renderItem}
// //           contentContainerStyle={{ paddingBottom: 30 }}
// //         />
// //       )}
// //     </View>
// //   );
// // };

// // export default QuantiteRecupereeScreen;

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#F9F5F2',
// //     padding: 16,
// //     marginTop:15,
// //   },
// //   title: {
// //     fontSize: 20,
// //     color: '#6E4E2E',
// //     fontWeight: 'bold',
// //     marginBottom: 16,
// //     textAlign: 'center',
// //   },
// //   refreshButton: {
// //     backgroundColor: '#A45C40',
// //     padding: 10,
// //     borderRadius: 10,
// //     marginBottom: 10,
// //   },
// //   refreshText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //     textAlign: 'center',
// //   },
// //   card: {
// //     backgroundColor: '#fff',
// //     padding: 14,
// //     borderRadius: 10,
// //     marginBottom: 10,
// //     elevation: 2,
// //   },
// //   metal: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#4A3428',
// //   },
// //   poids: {
// //     fontSize: 14,
// //     color: '#555',
// //     marginTop: 4,
// //   },
// //   empty: {
// //     textAlign: 'center',
// //     color: '#888',
// //     marginTop: 20,
// //   },
// // });

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
// import axios from 'axios';

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
//       const response = await axios.get<QuantiteItem[]>(
//         'http://10.0.2.2:8000/api/quantite-par-metaux/',
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setData(response.data);
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
//     marginTop:15
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
