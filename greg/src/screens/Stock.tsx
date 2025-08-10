




import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform, PermissionsAndroid
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

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
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [typeMetauxList, setTypeMetauxList] = useState<TypeMetaux[]>([]);
  const [filtreType, setFiltreType] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access');
      const res = await fetch('http://10.0.2.2:8000/api/stocks/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data: StockItem[] = await res.json();
      setStocks(data);

      const tousTypes: TypeMetaux[] = data.map(item => item.type_metaux);
      const unique: TypeMetaux[] = Array.from(
        new Map(tousTypes.map(typeMetaux => [typeMetaux.id, typeMetaux])).values()
      );
      setTypeMetauxList(unique);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les stocks.');
    } finally {
      setLoading(false);
    }
  };

  const requestWritePermission = async () => {
    if (Platform.OS !== 'android') return true;

    if (Platform.Version < 29) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Permission d'écriture sur stockage",
          message: "L'application a besoin d'accéder au stockage pour sauvegarder les fichiers.",
          buttonPositive: "OK",
          buttonNegative: "Annuler",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      return true; // Android 10+ scoped storage
    }
  };

  const exportExcel = async () => {
    const hasPermission = await requestWritePermission();
    if (!hasPermission) {
      Alert.alert('Permission refusée', 'Impossible d\'exporter sans permission.');
      return;
    }

    try {
      const ws = XLSX.utils.json_to_sheet(
        stocks.map(s => ({
          'Type Métal': s.type_metaux.nom,
          'Quantité (kg)': s.quantite,
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Stocks');
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

      const fileName = `stocks_${Date.now()}.xlsx`;
      const path = Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      await RNFS.writeFile(path, wbout, 'base64');
      Alert.alert('Succès', `Export Excel enregistré :\n${path}`);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'export Excel.');
      console.error(error);
    }
  };

  const exportPDF = async () => {
    const hasPermission = await requestWritePermission();
    if (!hasPermission) {
      Alert.alert('Permission refusée', 'Impossible d\'exporter sans permission.');
      return;
    }
    try {
      const html = `
        <h1>Liste des Stocks</h1>
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th>Type Métal</th>
              <th>Quantité (kg)</th>
            </tr>
          </thead>
          <tbody>
            ${stocks.map(s => `
              <tr>
                <td>${s.type_metaux.nom}</td>
                <td>${s.quantite}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      const fileName = `stocks_${Date.now()}.pdf`;
      const options = {
        html,
        fileName,
        directory: 'Download',
      };

      const file = await RNHTMLtoPDF.convert(options);

      Alert.alert('Succès', `Export PDF enregistré :\n${file.filePath}`);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'export PDF.');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const stocksFiltres = filtreType
    ? stocks.filter(s => s.type_metaux.id === filtreType)
    : stocks;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Gestion de Stock</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={filtreType}
          onValueChange={setFiltreType}
          style={styles.picker}
        >
          
          <Picker.Item label="Tous les métaux" value={null} />
          {typeMetauxList.map(type => (
            <Picker.Item key={type.id} label={type.nom} value={type.id} />
          ))}
        </Picker>
        
      </View>
      


      <View style={styles.exportButtons}>
        <TouchableOpacity onPress={exportExcel} style={styles.exportBtn}>
          <Text style={styles.exportText}>📥 Export Excel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={exportPDF} style={styles.exportBtn}>
          <Text style={styles.exportText}>📄 Export PDF</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={stocksFiltres}
          keyExtractor={item => item.id.toString()}
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <Text style={styles.headerText}>🧱 Métal</Text>
              <Text style={styles.headerText}>⚖️ Quantité (kg)</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.cell}>{item.type_metaux.nom}</Text>
              <Text style={styles.cell}>{item.quantite}</Text>
            </View>
          )}
          refreshing={loading}
          onRefresh={fetchStocks}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffaf4',
    padding: 16,
    marginTop:15
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#5e3b1f',
  },
  // pickerContainer: {
  //   marginBottom: 10,
  //   backgroundColor: '#f2f2f2',
  //   borderRadius: 8,
  // },
   pickerContainer: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    color: '#333',
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  exportBtn: {
    backgroundColor: '#e2c290',
    padding: 10,
    borderRadius: 8,
  },
  exportText: {
    color: '#4a2e0b',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 6,
  },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  cell: {
    flex: 1,
    color: '#444',
  },
});

export default StockScreen;
