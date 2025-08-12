import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions,
  Alert, TouchableOpacity, Share, PermissionsAndroid, Platform, ActivityIndicator
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { LineChart } from 'react-native-chart-kit';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../App';

const screenWidth = Dimensions.get('window').width;

const AnalyseDesPerformances = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [collectes, setCollectes] = useState<any[]>([]);
  const [typesMetaux, setTypesMetaux] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  const [filtreType, setFiltreType] = useState('');
  const [filtreAnnee, setFiltreAnnee] = useState('');

  useEffect(() => {
    const getToken = async () => {
      const t = await AsyncStorage.getItem('access');
      if (!t) {
        Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
        navigation.navigate('EspaceClient');
      } else {
        setToken(t);
      }
    };
    getToken();
  }, [navigation]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [collectesRes, typesMetauxRes] = await Promise.all([
          fetch('http://10.0.2.2:8000/api/collectes/', { headers }),
          fetch('http://10.0.2.2:8000/api/types-metaux/', { headers })
        ]);
        if (!collectesRes.ok || !typesMetauxRes.ok) throw new Error('Erreur réseau');
        
        const collectesData = await collectesRes.json();
        const typesMetauxData = await typesMetauxRes.json();
        
        setCollectes(collectesData);
        setTypesMetaux(typesMetauxData);
      } catch (err) {
        Alert.alert('Erreur', 'Impossible de charger les données de performance.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const anneesDisponibles = useMemo(() => {
    const years = collectes.map(c => new Date(c.date).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  }, [collectes]);

  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};

    collectes.forEach(c => {
      if (c.statut !== 'valide') return;
      if (filtreType && c.type_metaux?.id !== parseInt(filtreType)) return;

      const date = new Date(c.date);
      // Ny sivana amin'ny taona dia efa ampiharina eto ambany
      
      const mois = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      grouped[mois] = (grouped[mois] || 0) + parseFloat(c.poids || 0);
    });

    let moisAffiches: string[];

    if (filtreAnnee) {
      // Raha misy taona voafidy, mamorona lisitry ny 12 volan'io taona io
      const annee = parseInt(filtreAnnee);
      moisAffiches = Array.from({ length: 12 }, (_, i) => `${annee}-${String(i + 1).padStart(2, '0')}`);
    } else {
      // --- ILAY FANITSANA LEHIBE DIA ETO ---
      // Raha TSY misy taona voafidy, mamorona lisitra feno ho an'ny 12 volana farany
      const today = new Date();
      moisAffiches = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
      }).reverse(); // Atao .reverse() mba handeha amin'ny laoniny (volana taloha -> ankehitriny)
    }

    // Fenoy amin'ny angona ilay lisitra feno
    return moisAffiches.map(mois => ({
      mois,
      poidsTotal: parseFloat((grouped[mois] || 0).toFixed(2)),
    }));

  }, [collectes, filtreType, filtreAnnee]);

  // ... (Ny ambin'ny kaody dia mitovy)
  const chartConfig = {
    backgroundColor: '#fff', backgroundGradientFrom: '#F0F8FF', backgroundGradientTo: '#E6E6FA',
    decimalPlaces: 1, color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#0066CC' },
  };

  const exportToExcel = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setIsExporting(false); return;
        }
      } catch (err) { setIsExporting(false); return; }
    }

    const exportData = chartData.map(item => ({ 'Mois': item.mois, 'Poids total (kg)': item.poidsTotal }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Performances');
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const path = `${RNFS.CachesDirectoryPath}/analyse_performances.xlsx`;
    try {
      await RNFS.writeFile(path, wbout, 'base64');
      await Share.share({ title: 'Analyse des Performances', url: `file://${path}` });
    } catch (e) { Alert.alert('Erreur', "Une erreur est survenue."); }
    finally { setIsExporting(false); }
  }, [isExporting, chartData]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>📈 Analyse des performances</Text>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📌 Filtres</Text>
        <Text style={styles.label}>Type de métal</Text>
        <RNPickerSelect onValueChange={setFiltreType} value={filtreType} placeholder={{ label: 'Tous les types', value: '' }} items={typesMetaux.map(t => ({ label: t.nom, value: String(t.id) }))} style={pickerSelectStyles} />
        <Text style={styles.label}>Année</Text>
        <RNPickerSelect onValueChange={setFiltreAnnee} value={filtreAnnee} placeholder={{ label: '12 derniers mois', value: '' }} items={anneesDisponibles.map(a => ({ label: String(a), value: String(a) }))} style={pickerSelectStyles} />
      </View>
      <View style={styles.chartContainer}>
        {loading ? <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0066CC" /></View> : chartData.length === 0 || chartData.every(d => d.poidsTotal === 0) ? <Text style={styles.noData}>Aucune donnée à afficher</Text> : <LineChart data={{ labels: chartData.map(d => d.mois.substring(5)), datasets: [{ data: chartData.map(d => d.poidsTotal) }] }} width={screenWidth - 32} height={300} yAxisSuffix=" kg" chartConfig={chartConfig} bezier style={{ borderRadius: 16 }} fromZero={true} />}
      </View>
      <TouchableOpacity onPress={exportToExcel} style={styles.exportButton} disabled={isExporting}>
        {isExporting ? <ActivityIndicator color="#fff" /> : <><MaterialIcons name="file-excel" size={20} color="#fff" /><Text style={styles.exportButtonText}>Exporter en Excel</Text></>}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AnalyseDesPerformances;
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f4f4f4' }, contentContainer: { padding: 16 }, title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }, card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 }, sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 }, label: { marginTop: 10, marginBottom: 4, fontSize: 14, color: '#333' }, chartContainer: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, elevation: 2, overflow: 'hidden' }, loadingContainer: { height: 300, justifyContent: 'center', alignItems: 'center' }, noData: { textAlign: 'center', fontSize: 16, color: 'gray', paddingVertical: 120 }, exportButton: { backgroundColor: '#1D6F42', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 10, elevation: 2 }, exportButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8 }, });
const pickerSelectStyles = StyleSheet.create({ inputIOS: { fontSize: 14, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, color: 'black', paddingRight: 30, backgroundColor: '#f9f9f9', marginBottom: 8 }, inputAndroid: { fontSize: 14, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, color: 'black', paddingRight: 30, backgroundColor: '#f9f9f9', marginBottom: 8 }, });





// import React, { useEffect, useState, useMemo } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, Dimensions,
//   Alert, TouchableOpacity
// } from 'react-native';
// import RNPickerSelect from 'react-native-picker-select';
// import { LineChart } from 'react-native-chart-kit';
// import XLSX from 'xlsx';
// import RNFS from 'react-native-fs';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { useNavigation, NavigationProp } from '@react-navigation/native';
// import type { RootStackParamList } from '../../App';

// const screenWidth = Dimensions.get('window').width;

// const AnalyseDesPerformances = () => {
//   const navigation = useNavigation<NavigationProp<RootStackParamList>>();
//   const [collectes, setCollectes] = useState<any[]>([]);
//   const [typesMetaux, setTypesMetaux] = useState<any[]>([]);
//   const [filtreType, setFiltreType] = useState('');
//   const [filtreAnnee, setFiltreAnnee] = useState('');
//   const [token, setToken] = useState<string | null>(null);

//   useEffect(() => {
//     AsyncStorage.getItem('access').then(t => {
//       if (!t) {
//         Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
//         navigation.navigate('EspaceClient');
//       } else {
//         setToken(t);
//       }
//     });
//   }, []);

//   useEffect(() => {
//     if (!token) return;

//     fetch('http://10.0.2.2:8000/api/collectes/', {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//       .then(res => res.json())
//       .then(setCollectes)
//       .catch(err => console.error('Erreur collectes:', err));

//     fetch('http://10.0.2.2:8000/api/types-metaux/', {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//       .then(res => res.json())
//       .then(setTypesMetaux)
//       .catch(err => console.error('Erreur types métaux:', err));
//   }, [token]);

//   const moisComplets = useMemo(() => {
//     if (!filtreAnnee) return [];
//     const annee = parseInt(filtreAnnee);
//     const moisList = [];
//     for (let m = 1; m <= 12; m++) {
//       const moisStr = `${annee}-${String(m).padStart(2, '0')}`;
//       moisList.push(moisStr);
//     }
//     return moisList;
//   }, [filtreAnnee]);

//   const anneesDisponibles = useMemo(() => {
//     const years = collectes.map(c => new Date(c.date).getFullYear());
//     return [...new Set(years)].sort((a, b) => b - a);
//   }, [collectes]);

//   const chartData = useMemo(() => {
//     const grouped: Record<string, number> = {};

//     collectes.forEach(c => {
//       if (c.statut !== 'valide') return;
//       if (filtreType && c.type_metaux?.id !== parseInt(filtreType)) return;

//       const date = new Date(c.date);
//       if (filtreAnnee && date.getFullYear() !== parseInt(filtreAnnee)) return;

//       const mois = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
//       grouped[mois] = (grouped[mois] || 0) + parseFloat(c.poids || 0);
//     });

//     if (filtreAnnee) {
//       return moisComplets.map(mois => ({
//         mois,
//         poidsTotal: parseFloat((grouped[mois] || 0).toFixed(2)),
//       }));
//     }

//     return Object.entries(grouped)
//       .map(([mois, poidsTotal]) => ({
//         mois,
//         poidsTotal: parseFloat(poidsTotal.toFixed(2)),
//       }))
//       .sort((a, b) => new Date(a.mois).getTime() - new Date(b.mois).getTime());
//   }, [collectes, filtreType, filtreAnnee, moisComplets]);

//   const chartConfig = {
//     backgroundColor: '#fff',
//     backgroundGradientFrom: '#e0f7e9',
//     backgroundGradientTo: '#d0f0d9',
//     decimalPlaces: 2,
//     color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
//     labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
//     propsForDots: {
//       r: '4',
//       strokeWidth: '2',
//       stroke: '#007AFF',
//     },
//   };

//   const exportToExcel = () => {
//     const exportData = chartData.map(item => ({
//       Mois: item.mois,
//       'Poids total (kg)': item.poidsTotal
//     }));

//     const ws = XLSX.utils.json_to_sheet(exportData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Performances');
//     const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });

//     const path = `${RNFS.DownloadDirectoryPath}/analyse_performances.xlsx`;

//     RNFS.writeFile(path, wbout, 'ascii')
//       .then(() => Alert.alert('Succès', 'Fichier Excel exporté dans Téléchargements'))
//       .catch(e => console.error('Erreur export Excel', e));
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>📈 Analyse des performances</Text>

//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>📌 Filtres</Text>
//         <Text style={styles.label}>Type de métal</Text>
//         <RNPickerSelect
//           onValueChange={setFiltreType}
//           value={filtreType}
//           placeholder={{ label: 'Tous les types', value: '' }}
//           items={typesMetaux.map(t => ({ label: t.nom, value: String(t.id) }))}
//           style={pickerSelectStyles}
//         />
//         <Text style={styles.label}>Année</Text>
//         <RNPickerSelect
//           onValueChange={setFiltreAnnee}
//           value={filtreAnnee}
//           placeholder={{ label: 'Toutes les années', value: '' }}
//           items={anneesDisponibles.map(a => ({ label: String(a), value: String(a) }))}
//           style={pickerSelectStyles}
//         />
//       </View>

//       <View style={styles.chartContainer}>
//         {chartData.length === 0 ? (
//           <Text style={styles.noData}>Aucune donnée à afficher</Text>
//         ) : (
//           <LineChart
//             data={{
//               labels: chartData.map(d => d.mois.substring(5)), // MM uniquement
//               datasets: [{ data: chartData.map(d => d.poidsTotal) }]
//             }}
//             width={screenWidth - 32}
//             height={300}
//             yAxisSuffix=" kg"
//             withInnerLines={true}
//             withVerticalLines={true}
//             withHorizontalLines={true}
//             withOuterLines={true}
//             chartConfig={chartConfig}
//             bezier
//             style={{ borderRadius: 16 }}
//           />
//         )}
//       </View>

//       <TouchableOpacity onPress={exportToExcel} style={styles.exportButton}>
//         <MaterialIcons name="file-download" size={20} color="#fff" />
//         <Text style={styles.exportButtonText}>Exporter Excel</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// export default AnalyseDesPerformances;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#f4f4f4',
//     marginTop:15
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     elevation: 2,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 12,
//   },
//   label: {
//     marginTop: 10,
//     marginBottom: 4,
//     fontSize: 14,
//     color: '#333',
//   },
//   chartContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 16,
//     elevation: 2,
//   },
//   noData: {
//     textAlign: 'center',
//     fontSize: 16,
//     color: 'gray',
//     paddingVertical: 20,
//   },
//   exportButton: {
//     backgroundColor: '#8B4513',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 12,
//     borderRadius: 10,
//   },
//   exportButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     marginLeft: 8,
//   },
// });

// const pickerSelectStyles = {
//   inputIOS: {
//     fontSize: 14,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     color: 'black',
//     paddingRight: 30,
//     backgroundColor: '#f9f9f9',
//     marginBottom: 8,
//   },
//   inputAndroid: {
//     fontSize: 14,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     color: 'black',
//     paddingRight: 30,
//     backgroundColor: '#f9f9f9',
//     marginBottom: 8,
//   },
// };




// import React, { useEffect, useState, useMemo } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, Dimensions,
//   Alert, TouchableOpacity, Platform
// } from 'react-native';
// import RNPickerSelect from 'react-native-picker-select';
// import { LineChart } from 'react-native-chart-kit';
// import XLSX from 'xlsx';
// import RNFS from 'react-native-fs';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { useNavigation, NavigationProp } from '@react-navigation/native';
// import type { RootStackParamList } from '../../App'


// const screenWidth = Dimensions.get('window').width;

// const AnalyseDesPerformances = () => {
//   const navigation = useNavigation<NavigationProp<RootStackParamList>>();
//   const [collectes, setCollectes] = useState<any[]>([]);
//   const [typesMetaux, setTypesMetaux] = useState<any[]>([]);
//   const [filtreType, setFiltreType] = useState('');
//   const [filtreAnnee, setFiltreAnnee] = useState('');
//   const [token, setToken] = useState<string | null>(null);

//   useEffect(() => {
//     AsyncStorage.getItem('access').then(t => {
//       if (!t) {
//         Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
//         navigation.navigate('EspaceClient');
//       } else {
//         setToken(t);
//       }
//     });
//   }, []);

//   useEffect(() => {
//     if (!token) return;

//     fetch('http://10.0.2.2:8000/api/collectes/', {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//       .then(res => res.json())
//       .then(setCollectes)
//       .catch(err => console.error('Erreur collectes:', err));

//     fetch('http://10.0.2.2:8000/api/types-metaux/', {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//       .then(res => res.json())
//       .then(setTypesMetaux)
//       .catch(err => console.error('Erreur types métaux:', err));
//   }, [token]);

//   const anneesDisponibles = useMemo(() => {
//     const years = collectes.map(c => new Date(c.date).getFullYear());
//     return [...new Set(years)].sort((a, b) => b - a);
//   }, [collectes]);

//   const data = useMemo(() => {
//     const grouped: Record<string, number> = {};

//     collectes.forEach(c => {
//       if (c.statut !== 'valide') return;
//       if (filtreType && c.type_metaux?.id !== parseInt(filtreType)) return;

//       const date = new Date(c.date);
//       if (filtreAnnee && date.getFullYear() !== parseInt(filtreAnnee)) return;

//       const mois = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
//       if (!grouped[mois]) grouped[mois] = 0;
//       grouped[mois] += parseFloat(c.poids || 0);
//     });

//     return Object.entries(grouped)
//       .map(([mois, poidsTotal]) => ({
//         mois,
//         poidsTotal: parseFloat(poidsTotal.toFixed(2))
//       }))
//       .sort((a, b) => new Date(a.mois).getTime() - new Date(b.mois).getTime());
//   }, [collectes, filtreType, filtreAnnee]);

//   const exportToExcel = () => {
//     const exportData = data.map(item => ({
//       Mois: item.mois,
//       'Poids total (kg)': item.poidsTotal
//     }));

//     const ws = XLSX.utils.json_to_sheet(exportData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Performances');
//     const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });

//     const path = `${RNFS.DownloadDirectoryPath}/analyse_performances.xlsx`;

//     RNFS.writeFile(path, wbout, 'ascii')
//       .then(() => Alert.alert('Succès', 'Fichier Excel exporté dans Téléchargements'))
//       .catch(e => console.error('Erreur export Excel', e));
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>📈 Analyse des performances</Text>

//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>📌 Filtres</Text>
//         <Text style={styles.label}>Type de métal</Text>
//         <RNPickerSelect
//           onValueChange={setFiltreType}
//           value={filtreType}
//           placeholder={{ label: 'Tous les types', value: '' }}
//           items={typesMetaux.map(t => ({ label: t.nom, value: String(t.id) }))}
//           style={pickerSelectStyles}
//         />
//         <Text style={styles.label}>Année</Text>
//         <RNPickerSelect
//           onValueChange={setFiltreAnnee}
//           value={filtreAnnee}
//           placeholder={{ label: 'Toutes les années', value: '' }}
//           items={anneesDisponibles.map(a => ({ label: String(a), value: String(a) }))}
//           style={pickerSelectStyles}
//         />
//       </View>

//       <View style={styles.chartContainer}>
//         {data.length === 0 ? (
//           <Text style={styles.noData}>Aucune donnée à afficher</Text>
//         ) : (
//           <LineChart
//             data={{
//               labels: data.map(d => d.mois),
//               datasets: [{ data: data.map(d => d.poidsTotal) }]
//             }}
//             width={screenWidth - 32}
//             height={300}
//             yAxisSuffix=" kg"
//             chartConfig={{
//               backgroundColor: '#fff',
//               backgroundGradientFrom: '#e0f7e9',
//               backgroundGradientTo: '#d0f0d9',
//               decimalPlaces: 2,
//               color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
//               labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
//             }}
//             bezier
//             style={{ borderRadius: 16 }}
//           />
//         )}
//       </View>

//       <TouchableOpacity onPress={exportToExcel} style={styles.exportButton}>
//         <MaterialIcons name="file-download" size={20} color="#fff" />
//         <Text style={styles.exportButtonText}>Exporter Excel</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// export default AnalyseDesPerformances;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#f4f4f4',
//     marginTop:15,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     textAlign: 'center'
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     elevation: 2
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 12
//   },
//   label: {
//     marginTop: 10,
//     marginBottom: 4,
//     fontSize: 14,
//     color: '#333'
//   },
//   chartContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 16,
//     elevation: 2
//   },
//   noData: {
//     textAlign: 'center',
//     fontSize: 16,
//     color: 'gray',
//     paddingVertical: 20
//   },
//   exportButton: {
//     backgroundColor: '#007AFF',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 12,
//     borderRadius: 10
//   },
//   exportButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     marginLeft: 8
//   }
// });

// const pickerSelectStyles = {
//   inputIOS: {
//     fontSize: 14,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     color: 'black',
//     paddingRight: 30,
//     backgroundColor: '#f9f9f9',
//     marginBottom: 8
//   },
//   inputAndroid: {
//     fontSize: 14,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     color: 'black',
//     paddingRight: 30,
//     backgroundColor: '#f9f9f9',
//     marginBottom: 8
//   }
// };
