import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
  ActivityIndicator, Platform, PermissionsAndroid, SafeAreaView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../services/api'; // <-- Mampiasa ny axios instance voa-config
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Types ---
type TypeMetaux = {
  id: number;
  nom: string;
};

type StockItem = {
  id: number;
  type_metaux: TypeMetaux;
  quantite: number;
};

const StockScreen = () => {
  // --- States ---
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [typeMetauxList, setTypeMetauxList] = useState<TypeMetaux[]>([]);
  const [filtreType, setFiltreType] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Fonctions ---
  const fetchStocks = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access');
      if (!token) {
        Alert.alert("Erreur d'authentification", "Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }
      
      const response = await axios.get('stocks/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: StockItem[] = response.data;
      
      setStocks(data);

      const tousTypes: TypeMetaux[] = data.map(item => item.type_metaux);
      const unique: TypeMetaux[] = Array.from(
        new Map(tousTypes.map(type => [type.id, type])).values()
      ).sort((a, b) => a.nom.localeCompare(b.nom));
      setTypeMetauxList(unique);

    } catch (err: any) {
      Alert.alert('Erreur', 'Impossible de charger les stocks.');
      console.error("Erreur fetchStocks:", err.response?.data || err.message);
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
              message: "L'application a besoin d'accéder à votre stockage pour sauvegarder les fichiers exportés.",
              buttonPositive: "Accepter",
              buttonNegative: "Refuser",
            }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
        console.warn(err);
        return false;
    }
  };

  const exportFile = async (type: 'excel' | 'pdf') => {
    const hasPermission = await requestWritePermission();
    if (!hasPermission) {
      Alert.alert('Permission refusée', "L'exportation a été annulée car la permission d'écriture a été refusée.");
      return;
    }

    const dataToExport = stocksFiltres.map(s => ({
      'Type de Métal': s.type_metaux.nom,
      'Quantité en Stock (kg)': s.quantite,
    }));

    if (dataToExport.length === 0) {
      Alert.alert("Action impossible", "Il n'y a aucune donnée à exporter.");
      return;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const directory = Platform.OS === 'android' ? RNFS.DownloadDirectoryPath : RNFS.DocumentDirectoryPath;

    if (type === 'excel') {
      const fileName = `Export_Stock_${timestamp}.xlsx`;
      const filePath = `${directory}/${fileName}`;
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Stocks');
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      
      try {
        await RNFS.writeFile(filePath, wbout, 'base64');
        Alert.alert('Exportation réussie', `Le fichier Excel a été enregistré dans votre dossier de téléchargements:\n${fileName}`);
      } catch (e: any) {
        Alert.alert('Erreur', "L'exportation Excel a échoué.");
        console.error(e);
      }
    } else { // PDF
      const fileName = `Export_Stock_${timestamp}.pdf`;
      const html = `
        <html>
          <head><style>body{font-family:sans-serif;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background-color:#f2f2f2;}</style></head>
          <body>
            <h1>Rapport de Stock</h1>
            <p>Généré le: ${new Date().toLocaleString('fr-FR')}</p>
            <table>
              <thead><tr><th>Type de Métal</th><th>Quantité en Stock (kg)</th></tr></thead>
              <tbody>${dataToExport.map(s => `<tr><td>${s['Type de Métal']}</td><td>${s['Quantité en Stock (kg)']}</td></tr>`).join('')}</tbody>
            </table>
          </body>
        </html>
      `;
      const options = { html, fileName, directory: Platform.OS === 'android' ? 'Download' : 'Documents' };
      
      try {
        const file = await RNHTMLtoPDF.convert(options);
        Alert.alert('Exportation réussie', `Le fichier PDF a été enregistré:\n${file.filePath}`);
      } catch (e: any) {
        Alert.alert('Erreur', "L'exportation PDF a échoué.");
        console.error(e);
      }
    }
  };
  
  useEffect(() => {
    fetchStocks();
  }, []);

  const stocksFiltres = filtreType
    ? stocks.filter(s => s.type_metaux.id === filtreType)
    : stocks;

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#6e4e2e" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* FANATSARANA 2: Nafindra ety ivelany ny lohateny mba tsy hiara-mikorisa amin'ny lisitra */}
      <Text style={styles.title}>📦 Gestion de Stock</Text>

      <FlatList
        data={stocksFiltres}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={
          <>
            {/* FANATSARANA 2: Nesorina teto ny lohateny */}
            <View style={styles.pickerContainer}>
              <Picker selectedValue={filtreType} onValueChange={setFiltreType} style={styles.picker}>
                <Picker.Item label="Afficher tous les métaux" value={null} />
                {typeMetauxList.map(type => (
                  <Picker.Item key={type.id} label={type.nom} value={type.id} />
                ))}
              </Picker>
            </View>
            <View style={styles.exportButtons}>
              <TouchableOpacity onPress={() => exportFile('excel')} style={styles.exportBtn}>
                <Icon name="file-excel-outline" size={16} color="#1D6F42" />
                <Text style={styles.exportText}>Export Excel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => exportFile('pdf')} style={styles.exportBtn}>
                <Icon name="file-pdf-box" size={16} color="#B30B00" />
                <Text style={styles.exportText}>Export PDF</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.header}>
              <Text style={styles.headerText}>🧱 Métal</Text>
              <Text style={[styles.headerText, { textAlign: 'right' }]}>⚖️ Quantité (kg)</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.type_metaux.nom}</Text>
            <Text style={[styles.cell, { textAlign: 'right' }]}>{item.quantite.toLocaleString('fr-FR')}</Text>
          </View>
        )}
        refreshing={loading}
        onRefresh={fetchStocks}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun stock trouvé pour ce filtre.</Text>}
        showsVerticalScrollIndicator={false} // Soso-kevitra: esory ny scrollbar mitsangana raha tiana
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // FANITSINA 1: Nampiana paddingHorizontal mba hisy elanelana amin'ny sisiny
  container: { 
    flex: 1, 
    backgroundColor: '#f9f5f0',
    paddingHorizontal: 16,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // FANATSARANA 3: Nampiana marginTop kely ho an'ny Android
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginVertical: 16, 
    color: '#5e3b1f', 
    textAlign: 'center',
    marginTop: Platform.OS === 'android' ? 20 : 16
  },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 16, overflow: 'hidden', backgroundColor: '#fff' },
  picker: { height: 50, color: '#333' },
  exportButtons: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10, marginBottom: 20 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#eee' },
  exportText: { color: '#333', fontWeight: '600', marginLeft: 8 },
  header: { flexDirection: 'row', borderBottomWidth: 2, borderColor: '#ddd', paddingBottom: 10 },
  headerText: { flex: 1, fontWeight: 'bold', color: '#333', fontSize: 16 },
  row: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  cell: { flex: 1, color: '#444', fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#888', fontSize: 16 },
});

export default StockScreen;



// import React, { useEffect, useState } from 'react';
// import {
//   View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform, PermissionsAndroid
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// import XLSX from 'xlsx';
// import RNFS from 'react-native-fs';
// import RNHTMLtoPDF from 'react-native-html-to-pdf';

// type TypeMetaux = {
//   id: number;
//   nom: string;
// };

// type StockItem = {
//   id: number;
//   type_metaux: TypeMetaux;
//   quantite: number;
// };

// const StockScreen = () => {
//   const [stocks, setStocks] = useState<StockItem[]>([]);
//   const [typeMetauxList, setTypeMetauxList] = useState<TypeMetaux[]>([]);
//   const [filtreType, setFiltreType] = useState<number | null>(null);
//   const [loading, setLoading] = useState(false);

//   const fetchStocks = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('access');
//       const res = await fetch('http://10.0.2.2:8000/api/stocks/', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const data: StockItem[] = await res.json();
//       setStocks(data);

//       const tousTypes: TypeMetaux[] = data.map(item => item.type_metaux);
//       const unique: TypeMetaux[] = Array.from(
//         new Map(tousTypes.map(typeMetaux => [typeMetaux.id, typeMetaux])).values()
//       );
//       setTypeMetauxList(unique);
//     } catch (err) {
//       Alert.alert('Erreur', 'Impossible de charger les stocks.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const requestWritePermission = async () => {
//     if (Platform.OS !== 'android') return true;

//     if (Platform.Version < 29) {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//         {
//           title: "Permission d'écriture sur stockage",
//           message: "L'application a besoin d'accéder au stockage pour sauvegarder les fichiers.",
//           buttonPositive: "OK",
//           buttonNegative: "Annuler",
//         }
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     } else {
//       return true; // Android 10+ scoped storage
//     }
//   };

//   const exportExcel = async () => {
//     const hasPermission = await requestWritePermission();
//     if (!hasPermission) {
//       Alert.alert('Permission refusée', 'Impossible d\'exporter sans permission.');
//       return;
//     }

//     try {
//       const ws = XLSX.utils.json_to_sheet(
//         stocks.map(s => ({
//           'Type Métal': s.type_metaux.nom,
//           'Quantité (kg)': s.quantite,
//         }))
//       );
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, 'Stocks');
//       const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

//       const fileName = `stocks_${Date.now()}.xlsx`;
//       const path = Platform.OS === 'android'
//         ? `${RNFS.DownloadDirectoryPath}/${fileName}`
//         : `${RNFS.DocumentDirectoryPath}/${fileName}`;

//       await RNFS.writeFile(path, wbout, 'base64');
//       Alert.alert('Succès', `Export Excel enregistré :\n${path}`);
//     } catch (error) {
//       Alert.alert('Erreur', 'Échec de l\'export Excel.');
//       console.error(error);
//     }
//   };

//   const exportPDF = async () => {
//     const hasPermission = await requestWritePermission();
//     if (!hasPermission) {
//       Alert.alert('Permission refusée', 'Impossible d\'exporter sans permission.');
//       return;
//     }
//     try {
//       const html = `
//         <h1>Liste des Stocks</h1>
//         <table border="1" style="border-collapse: collapse; width: 100%;">
//           <thead>
//             <tr>
//               <th>Type Métal</th>
//               <th>Quantité (kg)</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${stocks.map(s => `
//               <tr>
//                 <td>${s.type_metaux.nom}</td>
//                 <td>${s.quantite}</td>
//               </tr>
//             `).join('')}
//           </tbody>
//         </table>
//       `;

//       const fileName = `stocks_${Date.now()}.pdf`;
//       const options = {
//         html,
//         fileName,
//         directory: 'Download',
//       };

//       const file = await RNHTMLtoPDF.convert(options);

//       Alert.alert('Succès', `Export PDF enregistré :\n${file.filePath}`);
//     } catch (error) {
//       Alert.alert('Erreur', 'Échec de l\'export PDF.');
//       console.error(error);
//     }
//   };

//   useEffect(() => {
//     fetchStocks();
//   }, []);

//   const stocksFiltres = filtreType
//     ? stocks.filter(s => s.type_metaux.id === filtreType)
//     : stocks;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>📦 Gestion de Stock</Text>

//       <View style={styles.pickerContainer}>
//         <Picker
//           selectedValue={filtreType}
//           onValueChange={setFiltreType}
//           style={styles.picker}
//         >
          
//           <Picker.Item label="Tous les métaux" value={null} />
//           {typeMetauxList.map(type => (
//             <Picker.Item key={type.id} label={type.nom} value={type.id} />
//           ))}
//         </Picker>
        
//       </View>
      


//       <View style={styles.exportButtons}>
//         <TouchableOpacity onPress={exportExcel} style={styles.exportBtn}>
//           <Text style={styles.exportText}>📥 Export Excel</Text>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={exportPDF} style={styles.exportBtn}>
//           <Text style={styles.exportText}>📄 Export PDF</Text>
//         </TouchableOpacity>
//       </View>

//       {loading ? (
//         <ActivityIndicator size="large" color="#0000ff" />
//       ) : (
//         <FlatList
//           data={stocksFiltres}
//           keyExtractor={item => item.id.toString()}
//           ListHeaderComponent={() => (
//             <View style={styles.header}>
//               <Text style={styles.headerText}>🧱 Métal</Text>
//               <Text style={styles.headerText}>⚖️ Quantité (kg)</Text>
//             </View>
//           )}
//           renderItem={({ item }) => (
//             <View style={styles.row}>
//               <Text style={styles.cell}>{item.type_metaux.nom}</Text>
//               <Text style={styles.cell}>{item.quantite}</Text>
//             </View>
//           )}
//           refreshing={loading}
//           onRefresh={fetchStocks}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fffaf4',
//     padding: 16,
//     marginTop:15
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 12,
//     color: '#5e3b1f',
//   },
//   // pickerContainer: {
//   //   marginBottom: 10,
//   //   backgroundColor: '#f2f2f2',
//   //   borderRadius: 8,
//   // },
//    pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#aaa',
//     borderRadius: 8,
//     marginBottom: 12,
//     overflow: 'hidden',
//   },
//   picker: {
//     height: 40,
//     color: '#333',
//   },
//   exportButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginVertical: 10,
//   },
//   exportBtn: {
//     backgroundColor: '#e2c290',
//     padding: 10,
//     borderRadius: 8,
//   },
//   exportText: {
//     color: '#4a2e0b',
//     fontWeight: '600',
//   },
//   header: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderColor: '#ccc',
//     paddingBottom: 6,
//   },
//   headerText: {
//     flex: 1,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   row: {
//     flexDirection: 'row',
//     paddingVertical: 10,
//     borderBottomWidth: 0.5,
//     borderColor: '#ccc',
//   },
//   cell: {
//     flex: 1,
//     color: '#444',
//   },
// });

// export default StockScreen;
