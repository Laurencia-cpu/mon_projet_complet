import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import axios from 'axios'; // ✅ Tsotra ihany no ilaina

const API_URL = 'http://10.0.2.2:8000/api/depense/';


interface Depense {
  type_metaux: string;
  poids_total: number;
  depense_totale: number;
}

const DepenseScreen = () => {
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepenses = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('access');
      if (!token) {
        setError("Vous devez être connecté.");
        setLoading(false);
        return;
      }

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      setDepenses(response.data);
    } catch (err: any) {
      console.error("Erreur axios:", err);
      if (err.response?.status === 401) {
        setError("Non autorisé. Veuillez vous reconnecter.");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Erreur réseau ou serveur.");
      }
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    let htmlContent = `
      <h1>Résumé des Dépenses</h1>
      <table border="1" style="width:100%;border-collapse:collapse;">
        <tr>
          <th>Type Métal</th><th>Poids Total (kg)</th><th>Dépense Totale (Ar)</th>
        </tr>
        ${depenses.map(item => `
          <tr>
            <td>${item.type_metaux}</td>
            <td>${item.poids_total}</td>
            <td>${item.depense_totale}</td>
          </tr>
        `).join('')}
      </table>
    `;

    try {
      const file = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: 'depenses_metaux',
        directory: 'Documents',
      });

      await Share.open({
        url: `file://${file.filePath}`,
        title: 'Exporter en PDF',
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Échec de l'export PDF.");
    }
  };

  const exportToExcel = async () => {
    try {
      const wsData = [
        ['Type Métal', 'Poids Total (kg)', 'Dépense Totale (Ar)'],
        ...depenses.map(item => [
          item.type_metaux,
          item.poids_total,
          item.depense_totale
        ])
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Depenses');

      const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
      const path = `${RNFS.DocumentDirectoryPath}/depenses_metaux.xlsx`;
      await RNFS.writeFile(path, wbout, 'ascii');

      await Share.open({
        url: `file://${path}`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        title: 'Partager Excel',
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Échec de l'export Excel.");
    }
  };

  useEffect(() => {
    fetchDepenses();
  }, []);

  const renderItem = ({ item }: { item: Depense }) => (
    <View style={styles.item}>
      <Text style={styles.metal}>{item.type_metaux}</Text>
      <Text>Poids : {item.poids_total} kg</Text>
      <Text>Dépense : {item.depense_totale} Ar</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Dépenses par Métal</Text>

      <View style={styles.exportContainer}>
        <TouchableOpacity style={styles.exportButton} onPress={exportToPDF}>
          <Text style={styles.exportText}>Exporter en PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButton} onPress={exportToExcel}>
          <Text style={styles.exportText}>Exporter en Excel</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#6e4e2e" />}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={depenses}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text>Aucune dépense trouvée.</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    marginTop:15
  },
  title: {
    fontSize: 22,
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#6e4e2e',
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#f4f4f4',
    marginVertical: 8,
    padding: 14,
    borderRadius: 10,
  },
  metal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffcdd2',
    borderRadius: 8,
    marginVertical: 8,
  },
  errorText: {
    color: '#b00020',
  },
  exportContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  exportButton: {
    backgroundColor: '#6e4e2e',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  exportText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DepenseScreen;
