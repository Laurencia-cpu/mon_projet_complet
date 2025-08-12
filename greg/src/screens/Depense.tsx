import React,{useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  SafeAreaView, Alert, TouchableOpacity, Platform, PermissionsAndroid
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import axios from '../services/api'; // ✅ Mampiasa ny instance voa-config
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Types ---
interface Depense {
  type_metaux: string;
  poids_total: number;
  depense_totale: number;
}

const DepenseScreen = () => {
  // --- States ---
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fonctions ---
  const fetchDepenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('access');
      if (!token) {
        throw new Error("Vous devez être connecté.");
      }

      const response = await axios.get('depense/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepenses(response.data);
    } catch (err: any) {
      console.error("Erreur axios:", err);
      if (err.response?.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
      } else {
        setError("Erreur lors du chargement des données.");
      }
    } finally {
      setLoading(false);
    }
  };

  const requestWritePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    if (Platform.Version >= 30) return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Permission d'écriture",
          message: "L'application a besoin d'accéder à votre stockage pour sauvegarder les fichiers.",
          buttonPositive: "Accepter"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      return false;
    }
  };

  const exportFile = async (type: 'pdf' | 'excel') => {
    const hasPermission = await requestWritePermission();
    if (!hasPermission) {
      Alert.alert("Permission refusée", "L'exportation a été annulée.");
      return;
    }
    
    if (depenses.length === 0) {
      Alert.alert("Action impossible", "Aucune donnée à exporter.");
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    if (type === 'pdf') {
      const fileName = `Rapport_Depenses_${timestamp}.pdf`;
      const htmlContent = `
        <html><head><style>body{font-family:Helvetica,sans-serif;font-size:12px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ccc;padding:8px;text-align:left;} th{background-color:#f2f2f2;}</style></head>
        <body>
          <h1>Résumé des Dépenses par Métal</h1>
          <p>Rapport généré le: ${new Date().toLocaleString('fr-FR')}</p>
          <table>
            <thead><tr><th>Type de Métal</th><th>Poids Total (kg)</th><th>Dépense Totale (Ar)</th></tr></thead>
            <tbody>${depenses.map(item => `<tr><td>${item.type_metaux}</td><td>${item.poids_total.toLocaleString('fr-FR')}</td><td>${item.depense_totale.toLocaleString('fr-FR')}</td></tr>`).join('')}</tbody>
          </table>
        </body></html>
      `;
      try {
        const file = await RNHTMLtoPDF.convert({ html: htmlContent, fileName, directory: 'Documents' });
        await Share.open({ url: `file://${file.filePath}`, title: 'Partager le rapport PDF' });
      } catch (err) {
        Alert.alert("Erreur", "Échec de l'export PDF.");
      }
    } else { // Excel
      const fileName = `Rapport_Depenses_${timestamp}.xlsx`;
      const dataForSheet = depenses.map(item => ({
        'Type de Métal': item.type_metaux,
        'Poids Total (kg)': item.poids_total,
        'Dépense Totale (Ar)': item.depense_totale
      }));
      const ws = XLSX.utils.json_to_sheet(dataForSheet);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dépenses');
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      try {
        await RNFS.writeFile(path, wbout, 'base64');
        await Share.open({
          url: `file://${path}`,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          title: 'Partager le rapport Excel',
        });
      } catch (err) {
        Alert.alert("Erreur", "Échec de l'export Excel.");
      }
    }
  };

  useEffect(() => {
    fetchDepenses();
  }, []);

  const renderItem = ({ item }: { item: Depense }) => (
    <View style={styles.item}>
      <Text style={styles.metal}>{item.type_metaux}</Text>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsText}>Poids total : <Text style={styles.bold}>{item.poids_total.toLocaleString('fr-FR')} kg</Text></Text>
        <Text style={styles.detailsText}>Dépense totale : <Text style={styles.bold}>{item.depense_totale.toLocaleString('fr-FR')} Ar</Text></Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={depenses}
        keyExtractor={(item) => item.type_metaux}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>📊 Dépenses par Métal</Text>
            <View style={styles.exportContainer}>
              <TouchableOpacity style={styles.exportButton} onPress={() => exportFile('pdf')}>
                <Icon name="file-pdf-box" size={18} color="#fff"/>
                <Text style={styles.exportText}>Exporter en PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exportButton} onPress={() => exportFile('excel')}>
                <Icon name="file-excel-outline" size={18} color="#fff"/>
                <Text style={styles.exportText}>Exporter en Excel</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={renderItem}
        ListEmptyComponent={
            !loading ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error || 'Aucune dépense à afficher.'}</Text>
                </View>
            ) : null
        }
        refreshing={loading}
        onRefresh={fetchDepenses}
        contentContainerStyle={{ padding: 16 }}
      />
      {loading && <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color="#6e4e2e" />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  title: { fontSize: 22, marginBottom: 16, fontWeight: 'bold', color: '#6e4e2e', textAlign: 'center' },
  item: { backgroundColor: '#fff', marginVertical: 8, padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#eee' },
  metal: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  detailsContainer: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8 },
  detailsText: { fontSize: 16, color: '#555', lineHeight: 24 },
  bold: { fontWeight: '700' },
  errorContainer: { padding: 16, backgroundColor: '#ffcdd2', borderRadius: 8, margin: 16, alignItems: 'center' },
  errorText: { color: '#b00020', textAlign: 'center' },
  exportContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  exportButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6e4e2e', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, elevation: 2 },
  exportText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
});

export default DepenseScreen;




// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   ActivityIndicator,
//   StyleSheet,
//   SafeAreaView,
//   Alert,
//   TouchableOpacity,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import RNHTMLtoPDF from 'react-native-html-to-pdf';
// import Share from 'react-native-share';
// import XLSX from 'xlsx';
// import RNFS from 'react-native-fs';
// import axios from 'axios'; // ✅ Tsotra ihany no ilaina

// const API_URL = 'http://10.0.2.2:8000/api/depense/';


// interface Depense {
//   type_metaux: string;
//   poids_total: number;
//   depense_totale: number;
// }

// const DepenseScreen = () => {
//   const [depenses, setDepenses] = useState<Depense[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchDepenses = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const token = await AsyncStorage.getItem('access');
//       if (!token) {
//         setError("Vous devez être connecté.");
//         setLoading(false);
//         return;
//       }

//       const response = await axios.get(API_URL, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           Accept: 'application/json',
//         },
//       });

//       setDepenses(response.data);
//     } catch (err: any) {
//       console.error("Erreur axios:", err);
//       if (err.response?.status === 401) {
//         setError("Non autorisé. Veuillez vous reconnecter.");
//       } else if (err.response?.data?.detail) {
//         setError(err.response.data.detail);
//       } else {
//         setError("Erreur réseau ou serveur.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const exportToPDF = async () => {
//     let htmlContent = `
//       <h1>Résumé des Dépenses</h1>
//       <table border="1" style="width:100%;border-collapse:collapse;">
//         <tr>
//           <th>Type Métal</th><th>Poids Total (kg)</th><th>Dépense Totale (Ar)</th>
//         </tr>
//         ${depenses.map(item => `
//           <tr>
//             <td>${item.type_metaux}</td>
//             <td>${item.poids_total}</td>
//             <td>${item.depense_totale}</td>
//           </tr>
//         `).join('')}
//       </table>
//     `;

//     try {
//       const file = await RNHTMLtoPDF.convert({
//         html: htmlContent,
//         fileName: 'depenses_metaux',
//         directory: 'Documents',
//       });

//       await Share.open({
//         url: `file://${file.filePath}`,
//         title: 'Exporter en PDF',
//       });
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Erreur", "Échec de l'export PDF.");
//     }
//   };

//   const exportToExcel = async () => {
//     try {
//       const wsData = [
//         ['Type Métal', 'Poids Total (kg)', 'Dépense Totale (Ar)'],
//         ...depenses.map(item => [
//           item.type_metaux,
//           item.poids_total,
//           item.depense_totale
//         ])
//       ];

//       const ws = XLSX.utils.aoa_to_sheet(wsData);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, 'Depenses');

//       const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
//       const path = `${RNFS.DocumentDirectoryPath}/depenses_metaux.xlsx`;
//       await RNFS.writeFile(path, wbout, 'ascii');

//       await Share.open({
//         url: `file://${path}`,
//         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//         title: 'Partager Excel',
//       });
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Erreur", "Échec de l'export Excel.");
//     }
//   };

//   useEffect(() => {
//     fetchDepenses();
//   }, []);

//   const renderItem = ({ item }: { item: Depense }) => (
//     <View style={styles.item}>
//       <Text style={styles.metal}>{item.type_metaux}</Text>
//       <Text>Poids : {item.poids_total} kg</Text>
//       <Text>Dépense : {item.depense_totale} Ar</Text>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>Dépenses par Métal</Text>

//       <View style={styles.exportContainer}>
//         <TouchableOpacity style={styles.exportButton} onPress={exportToPDF}>
//           <Text style={styles.exportText}>Exporter en PDF</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.exportButton} onPress={exportToExcel}>
//           <Text style={styles.exportText}>Exporter en Excel</Text>
//         </TouchableOpacity>
//       </View>

//       {loading && <ActivityIndicator size="large" color="#6e4e2e" />}

//       {error && (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//         </View>
//       )}

//       {!loading && !error && (
//         <FlatList
//           data={depenses}
//           keyExtractor={(item, index) => index.toString()}
//           renderItem={renderItem}
//           ListEmptyComponent={<Text>Aucune dépense trouvée.</Text>}
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#fff',
//     marginTop:15
//   },
//   title: {
//     fontSize: 22,
//     marginBottom: 12,
//     fontWeight: 'bold',
//     color: '#6e4e2e',
//     textAlign: 'center',
//   },
//   item: {
//     backgroundColor: '#f4f4f4',
//     marginVertical: 8,
//     padding: 14,
//     borderRadius: 10,
//   },
//   metal: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 4,
//   },
//   errorContainer: {
//     padding: 10,
//     backgroundColor: '#ffcdd2',
//     borderRadius: 8,
//     marginVertical: 8,
//   },
//   errorText: {
//     color: '#b00020',
//   },
//   exportContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 16,
//   },
//   exportButton: {
//     backgroundColor: '#6e4e2e',
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//   },
//   exportText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });

// export default DepenseScreen;
