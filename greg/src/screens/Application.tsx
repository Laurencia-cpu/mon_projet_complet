// src/screens/Application.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, ActivityIndicator,
  Dimensions, useColorScheme, ScrollView, Alert, RefreshControl, SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Pdp from './Pdp';
import CategoryCard from './CategoryCard';

// --- Famaritana ireo karazana (Types) ---
export type ListeNavigationPrincipale = {
  EspaceClient: undefined;
  TypeMetaux: undefined;
  LieuCollecte: undefined;
  GrilleTarifaire: undefined;
  CollecteEnregistre: undefined;
  Tournee: undefined;
  Stock: undefined;
  CorrigerCollecte: undefined;
  FusionLots: undefined;
  HistoriqueCorrection: undefined;
  StatQuantite: undefined;
  Depense: undefined;
  Performance: undefined;
};

type TypeNavigation = StackNavigationProp<ListeNavigationPrincipale>;
type NavigationTarget = keyof ListeNavigationPrincipale;

interface Entreprise {
  nom: string;
  email: string;
  adresse: string;
  siret: string;
  tva: string;
  telephone: string;
  logo: string;
}

const API_BASE_URL = 'http://10.0.2.2:8000/api'; 

const CATEGORIES = [
  {
    title: 'CONFIGURATION',
    items: [
      { label: 'Créer types de métaux', target: 'TypeMetaux' as const },
      { label: 'Définir lieux de collecte', target: 'LieuCollecte' as const },
      { label: 'Grille tarifaire', target: 'GrilleTarifaire' as const },
    ],
  },
  {
    title: 'EXPLOITATION',
    items: [
      { label: 'Enregistrer collectes', target: 'CollecteEnregistre' as const },
      { label: 'Suivi des tournées', target: 'Tournee' as const },
      { label: 'Gérer les stocks', target: 'Stock' as const },
    ],
  },
  {
    title: 'EDITION',
    items: [
      { label: 'Corriger collectes', target: 'CorrigerCollecte' as const },
      { label: 'Fusionner des lots', target: 'FusionLots' as const },
      { label: 'Historique des corrections', target: 'HistoriqueCorrection' as const },
    ],
  },
  {
    title: 'STATISTIQUES',
    items: [
      { label: 'Quantité récupérée', target: 'StatQuantite' as const },
      { label: 'Dépenses', target: 'Depense' as const },
      { label: 'Analyse des performances', target: 'Performance' as const },
    ],
  },
];

const { width } = Dimensions.get('window');

const Application = () => {
  const navigation = useNavigation<TypeNavigation>();
  const isDarkMode = useColorScheme() === 'dark';

  const [chargement, setChargement] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);

  const fetchEnterpriseData = useCallback(async () => {
    // ... (ny atiny tsy miova)
    const token = await AsyncStorage.getItem('access');
    if (!token) {
      navigation.navigate('EspaceClient');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Session expirée ou invalide.');
      const data = await res.json();
      setEntreprise(data.entreprise);
    } catch (error) {
      console.error("Erreur lors du chargement de l'entreprise :", error);
      Alert.alert('Erreur de session', 'Veuillez vous reconnecter.', [
        { text: 'OK', onPress: async () => {
            await AsyncStorage.multiRemove(['access', 'refresh']);
            navigation.navigate('EspaceClient');
        }},
      ]);
    }
  }, [navigation]);
  
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchEnterpriseData();
    setIsRefreshing(false);
  }, [fetchEnterpriseData]);

  useEffect(() => {
    setChargement(true);
    fetchEnterpriseData().finally(() => setChargement(false));
  }, [fetchEnterpriseData]);

  useEffect(() => {
    // ... (ny atin'ny useEffect an'ny refresh token dia tsy miova)
    const refreshAccessToken = async () => {
      const currentRefreshToken = await AsyncStorage.getItem('refresh');
      if (!currentRefreshToken) return;
      try {
        const response = await fetch(`${API_BASE_URL}/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: currentRefreshToken }),
        });
        if (response.ok) {
          const data = await response.json();
          await AsyncStorage.setItem('access', data.access);
          if (data.refresh) await AsyncStorage.setItem('refresh', data.refresh);
        } else {
          await AsyncStorage.multiRemove(['access', 'refresh']);
          navigation.navigate('EspaceClient');
        }
      } catch (err) {
        console.error('Erreur lors du refresh :', err);
      }
    };
    const intervalId = setInterval(refreshAccessToken, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [navigation]);


  if (chargement) {
    return (
      <View style={styles.zoneChargement}>
        <ActivityIndicator size="large" color="#A45C40" />
      </View>
    );
  }

  // --- FANITSIANA NY RAFITRA ---
  return (
    // SafeAreaView no ampiasaina mba tsy hidiran'ny atiny ao ambanin'ny "notch"
    <SafeAreaView style={[styles.conteneur, { backgroundColor: isDarkMode ? '#222' : '#F5EFE3' }]}>
      {/* ScrollView no mamono ny atiny azo korisa-midina */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#A45C40"]} />
        }
      >
        <View style={styles.entete}>
          <Image source={require('../assets/gestion.png')} style={styles.logoApp} />
          <View style={styles.sectionUtilisateur}>
            <Pdp />
          </View>
        </View>

        <View style={styles.container}>
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.title}
              category={category}
              onNavigate={(target: NavigationTarget) => navigation.navigate(target)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Ity fizarana ity dia ivelan'ny ScrollView mba hijanona eo ambany foana */}
      {entreprise && (
          <View style={styles.pied}>
              <Text style={styles.textePiedNom}>{entreprise.nom}</Text>
              <Text style={styles.textePied}>{entreprise.adresse}</Text>
              <Text style={styles.textePied}>SIRET : {entreprise.siret} | TVA : {entreprise.tva}</Text>
              <Text style={styles.textePied}>Tél : {entreprise.telephone} | Email : {entreprise.email}</Text>
          </View>
      )}
    </SafeAreaView>
  );
};

// --- FANITSIANA NY STYLES ---
const styles = StyleSheet.create({
  conteneur: { 
    flex: 1, 
  },
  scrollContainer: { 
    // Tsy mila flexGrow intsony fa ny padding no ampiasaina
    paddingHorizontal: 16, 
    paddingBottom: 20, 
  },
  entete: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 20, // Nesorina ilay 50 be loatra
    marginBottom: 20, 
  },
  logoApp: { 
    width: width * 0.3, 
    height: 40, 
    resizeMode: 'contain', 
  },
  sectionUtilisateur: { 
    alignItems: 'center', 
  },
  container: { 
    paddingHorizontal: 4, 
  },
  pied: { 
    alignItems: 'center', 
    paddingVertical: 15, // Nohakelezina kely
    borderTopWidth: 1, 
    borderColor: '#DDD', 
    backgroundColor: '#f0e6d2', 
    paddingBottom: 20, // Mba hisy elanelana amin'ny farany ambany
  },
  textePiedNom: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 4, 
  },
  textePied: { 
    fontSize: 12, 
    color: '#666', 
    textAlign: 'center', 
    lineHeight: 18, 
  },
  zoneChargement: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F5EFE3' 
  },
});

export default Application;