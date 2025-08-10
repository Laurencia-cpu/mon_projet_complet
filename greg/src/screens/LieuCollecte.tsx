import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, ToastAndroid
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import axiosInstance from '../services/api/axiosInstance'; // adapte le chemin si besoin
import axiosInstance from '../services/api';

type LieuCollecte = {
  id: number;
  nom: string;
};

const LieuCollecteScreen = () => {
  const [lieux, setLieux] = useState<LieuCollecte[]>([]);
  const [filteredLieux, setFilteredLieux] = useState<LieuCollecte[]>([]);
  const [chargement, setChargement] = useState(false);
  const [nom, setNom] = useState('');
  const [recherche, setRecherche] = useState('');

  const chargerLieux = async () => {
    setChargement(true);
    try {
      const res = await axiosInstance.get('/lieux-collecte/');
      setLieux(res.data);
      setFilteredLieux(res.data);
    } catch (error) {
      Alert.alert('Erreur', "Impossible de charger les lieux.");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerLieux();
  }, []);

  const ajouterLieu = async () => {
    if (!nom.trim()) {
      Alert.alert('Validation', 'Le nom est obligatoire.');
      return;
    }
    try {
      const res = await axiosInstance.post('/lieux-collecte/', { nom });
      if (res.status === 201) {
        setNom('');
        chargerLieux();
        ToastAndroid.show('Lieu ajouté avec succès', ToastAndroid.SHORT);
      }
    } catch (error: any) {
      if (error.response?.data) {
        Alert.alert('Erreur', JSON.stringify(error.response.data));
      } else {
        Alert.alert('Erreur', "Impossible d’ajouter ce lieu.");
      }
    }
  };

  const supprimerLieu = async (id: number) => {
    try {
      const res = await axiosInstance.delete(`/lieux-collecte/${id}/`);
      if (res.status === 204) {
        setLieux((prev) => prev.filter((item) => item.id !== id));
        setFilteredLieux((prev) => prev.filter((item) => item.id !== id));
        ToastAndroid.show('Lieu supprimé', ToastAndroid.SHORT);
      }
    } catch (error) {
      Alert.alert('Erreur', "Erreur lors de la suppression.");
    }
  };

  const filtrer = (texte: string) => {
    setRecherche(texte);
    const filtered = lieux.filter(lieu =>
      lieu.nom.toLowerCase().includes(texte.toLowerCase())
    );
    setFilteredLieux(filtered);
  };

  const renderItem = ({ item }: { item: LieuCollecte }) => (
    <View style={styles.item}>
      <Text style={styles.nom}>{item.nom}</Text>
      <TouchableOpacity
        onPress={() =>
          Alert.alert('Confirmer', `Supprimer "${item.nom}" ?`, [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Supprimer',
              style: 'destructive',
              onPress: () => supprimerLieu(item.id),
            },
          ])
        }
      >
        <Icon name="trash-can-outline" size={26} color="#cc4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.titre}>Définir un lieu de collecte</Text>

          <TextInput
            placeholder="Nom du lieu"
            style={styles.input}
            value={nom}
            onChangeText={setNom}
          />

          <TouchableOpacity style={styles.boutonAjouter} onPress={ajouterLieu}>
            <Icon name="plus" color="#fff" size={18} style={{ marginRight: 6 }} />
            <Text style={styles.texteAjouter}>Ajouter</Text>
          </TouchableOpacity>

          <Text style={styles.sousTitre}>Liste des lieux</Text>

          <TextInput
            placeholder="🔍 Rechercher..."
            style={styles.inputRecherche}
            value={recherche}
            onChangeText={filtrer}
          />

          {chargement ? (
            <ActivityIndicator size="large" color="#A45C40" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={filteredLieux}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              ListEmptyComponent={<Text style={styles.empty}>Aucun lieu trouvé.</Text>}
              scrollEnabled={false}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LieuCollecteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 15,
  },
  content: {
    padding: 20,
  },
  titre: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#3e2f1c',
  },
  sousTitre: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 16,
    color: '#6e4e2e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  inputRecherche: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
    backgroundColor: '#f1f1f1',
  },
  boutonAjouter: {
    flexDirection: 'row',
    backgroundColor: '#6e4e2e',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  texteAjouter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
  },
  nom: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginTop: 20,
  },
});
