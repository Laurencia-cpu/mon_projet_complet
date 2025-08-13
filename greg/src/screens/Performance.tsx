import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions,
  Alert, TouchableOpacity, PermissionsAndroid, Platform, ActivityIndicator,
  RefreshControl // <-- DINGANA 1: NAFARANA
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { LineChart } from 'react-native-chart-kit';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../App';

const screenWidth = Dimensions.get('window').width;

// Interfaces... (Tsy miova)
interface TypeMetal { id: number; nom: string; }
interface Collecte { id: number; date: string; poids: string; type_metaux: TypeMetal | null; statut: string; }
interface PDFFile { filePath: string; base64?: string; numberOfPages?: number; }

const AnalyseDesPerformances = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [collectes, setCollectes] = useState<Collecte[]>([]);
  const [typesMetaux, setTypesMetaux] = useState<TypeMetal[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportingType, setExportingType] = useState<'excel' | 'pdf' | null>(null);

  // DINGANA 2: NAMPINA STATE HO AN'NY REFRESH
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  const [filtreType, setFiltreType] = useState<string | null>(null);
  const [filtreAnnee, setFiltreAnnee] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [collectesRes, typesMetauxRes] = await Promise.all([
        fetch('http://10.0.2.2:8000/api/collectes/', { headers }),
        fetch('http://10.0.2.2:8000/api/types-metaux/', { headers })
      ]);
      if (!collectesRes.ok || !typesMetauxRes.ok) throw new Error('Erreur réseau');
      const collectesData = (await collectesRes.json()) as Collecte[];
      const typesMetauxData = (await typesMetauxRes.json()) as TypeMetal[];
      setCollectes(collectesData.filter((c) => c.statut === 'valide'));
      setTypesMetaux(typesMetauxData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Impossible de charger les données.';
      Alert.alert('Erreur', msg);
    }
  }, [token]);

  useEffect(() => {
    const getToken = async () => {
      try {
        const t = await AsyncStorage.getItem('access');
        if (!t) {
          Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
          navigation.navigate('EspaceClient');
        } else {
          setToken(t);
        }
      } catch (e) {
        console.error("Erreur lors de la récupération du token:", e);
        navigation.navigate('EspaceClient');
      }
    };
    getToken();
  }, [navigation]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchData().finally(() => setLoading(false));
    }
  }, [token, fetchData]);

  // DINGANA 3: NAMORONA FONCTION ONREFRESH
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);

  // useMemos... (Tsy miova)
  const anneesDisponibles = useMemo(() => {
    if (!collectes.length) return [];
    const years = collectes.map(c => new Date(c.date).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a).map(String);
  }, [collectes]);

  const filteredCollectes = useMemo(() => {
    return collectes.filter(c => {
      const anneeCollecte = new Date(c.date).getFullYear().toString();
      const typeMatch = !filtreType || (c.type_metaux?.id.toString() === filtreType);
      const anneeMatch = !filtreAnnee || anneeCollecte === filtreAnnee;
      return typeMatch && anneeMatch;
    });
  }, [collectes, filtreType, filtreAnnee]);

  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredCollectes.forEach(c => {
      const date = new Date(c.date);
      const mois = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      grouped[mois] = (grouped[mois] || 0) + parseFloat(c.poids || '0');
    });
    const moisAvecDonnees = Object.keys(grouped).filter(mois => grouped[mois] > 0).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return {
      labels: moisAvecDonnees,
      datasets: [{
        data: moisAvecDonnees.map(mois => parseFloat(grouped[mois].toFixed(2))),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      }],
      legend: ["Poids Total (kg)"],
    };
  }, [filteredCollectes]);
  
  const chartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    color: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
    strokeWidth: 2,
    propsForDots: { r: "2", strokeWidth: "2", stroke: "#4CAF50" },
  };

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || Platform.Version >= 30) {
      return true;
    }
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
          title: "Permission d'accès au stockage",
          message: "L'application a besoin d'accéder à votre stockage pour sauvegarder les fichiers.",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const exportToFile = useCallback(async (exporter: 'excel' | 'pdf') => {
    if (exportingType) return;
    if (filteredCollectes.length === 0) {
      Alert.alert("Aucune donnée", "Il n'y a aucune donnée à exporter.");
      return;
    }
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert("Permission refusée", "Impossible d'exporter sans la permission.");
      return;
    }
    setExportingType(exporter);
    try {
      const timestamp = new Date().getTime();
      const downloadDirectory = Platform.OS === 'android' ? RNFS.DownloadDirectoryPath : RNFS.DocumentDirectoryPath;
      if (exporter === 'excel') {
        const dataForSheet = filteredCollectes.map(c => ({ 'Date': new Date(c.date).toLocaleDateString('fr-FR'), 'Type de Métal': c.type_metaux?.nom ?? 'N/A', 'Poids (kg)': parseFloat(c.poids), }));
        const ws = XLSX.utils.json_to_sheet(dataForSheet);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Performances");
        const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        const fileName = `Analyse-Performances-Excel-${timestamp}.xlsx`;
        const filePath = `${downloadDirectory}/${fileName}`;
        await RNFS.writeFile(filePath, wbout, 'base64');
        Alert.alert("Exportation réussie!", `Fichier sauvegardé:\n${fileName}`);
      } else {
        const rows = filteredCollectes.map(c => `<tr><td>${new Date(c.date).toLocaleDateString('fr-FR')}</td><td>${c.type_metaux?.nom ?? 'N/A'}</td><td>${parseFloat(c.poids).toFixed(2)} kg</td></tr>`).join('');
        const selectedType = typesMetaux.find(t => t.id.toString() === filtreType)?.nom || 'Tous les types';
        const htmlContent = `<html><head><style>body{font-family:Helvetica,sans-serif;color:#333}h1{text-align:center;color:#4CAF50}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background-color:#f2f2f2}</style></head><body><h1>Analyse des Performances</h1><p><strong>Année:</strong> ${filtreAnnee || 'Toutes'}</p><p><strong>Type:</strong> ${selectedType}</p><table><thead><tr><th>Date</th><th>Type</th><th>Poids</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
        const fileName = `Analyse-Performances-PDF-${timestamp}.pdf`;
        const options = { html: htmlContent, fileName: fileName, directory: Platform.OS === 'android' ? 'Download' : 'Documents' };
        await RNHTMLtoPDF.convert(options);
        Alert.alert("Exportation réussie!", `Fichier sauvegardé:\n${fileName}`);
      }
    } catch (error) {
      console.error(`Erreur lors de l'exportation ${exporter}:`, error);
      Alert.alert("Erreur", `Une erreur est survenue lors de l'exportation.`);
    } finally {
      setExportingType(null);
    }
  }, [exportingType, filteredCollectes, typesMetaux, filtreType, filtreAnnee]);

  return (
    // DINGANA 4: NAMPIANA REFRESHCONTROL
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#4CAF50"]} />
      }
    >
      <View style={styles.contentContainer}>
        <Text style={styles.headerTitle}>Analyse des performances mensuelles</Text>
        
        <View style={styles.filtersContainer}>
            <View style={styles.pickerWrapper}>
                <Text style={styles.label}>Type de métal</Text>
                <RNPickerSelect onValueChange={(value) => setFiltreType(value)} value={filtreType} placeholder={{ label: 'Tous les types', value: null }} items={typesMetaux.map(t => ({ label: t.nom, value: t.id.toString() }))} style={pickerSelectStyles} />
            </View>
            <View style={styles.pickerWrapper}>
                <Text style={styles.label}>Année</Text>
                <RNPickerSelect onValueChange={(value) => setFiltreAnnee(value)} value={filtreAnnee} placeholder={{ label: 'Toutes les années', value: null }} items={anneesDisponibles.map(a => ({ label: a, value: a }))} style={pickerSelectStyles} />
            </View>
        </View>

        <View style={styles.chartWrapper}>
          {loading ? ( <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#4CAF50" /></View>
          ) : chartData.labels.length === 0 ? ( <Text style={styles.noData}>Aucune donnée à afficher pour la période.</Text>
          ) : ( <LineChart data={chartData} width={screenWidth - 32} height={320} formatYLabel={(y) => `${Number(y) < 1000 ? Math.round(Number(y)) + 'kg' : (Number(y)/1000).toFixed(1) + 't'}`} chartConfig={chartConfig} bezier style={styles.chartStyle} fromZero={true} withVerticalLines={false} horizontalLabelRotation={-25} xLabelsOffset={5} />
          )}
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={() => exportToFile('excel')} style={[styles.button, styles.excelButton]} disabled={exportingType !== null}>
            {exportingType === 'excel' ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Exporter en Excel</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => exportToFile('pdf')} style={[styles.button, styles.pdfButton]} disabled={exportingType !== null}>
            {exportingType === 'pdf' ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Exporter en PDF</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default AnalyseDesPerformances;

// Styles... (Tsy miova)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  contentContainer: { padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  filtersContainer: { marginBottom: 20 },
  pickerWrapper: { marginBottom: 10 },
  label: { marginBottom: 5, fontSize: 14, color: '#333' },
  chartWrapper: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 10, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
  chartStyle: { marginVertical: 8, borderRadius: 16 },
  loadingContainer: { height: 320, justifyContent: 'center', alignItems: 'center' },
  noData: { textAlign: 'center', fontSize: 16, color: 'gray', paddingVertical: 120 },
  buttonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  excelButton: { backgroundColor: '#2E7D32', marginRight: 8 },
  pdfButton: { backgroundColor: '#C62828', marginLeft: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
const pickerSelectStyles = StyleSheet.create({
  inputIOS: { fontSize: 16, paddingVertical: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, color: 'black', paddingRight: 30, backgroundColor: '#fff' },
  inputAndroid: { fontSize: 16, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, color: 'black', paddingRight: 30, backgroundColor: '#fff' },
});
