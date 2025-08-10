import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator,
  StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ToastAndroid
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';


type TypeMetaux = {
  id: number;
  nom: string;
  description: string;
};

const TypeMetauxScreen: React.FC = () => {
  const [typesMetaux, setTypesMetaux] = useState<TypeMetaux[]>([]);
  const [filteredMetaux, setFilteredMetaux] = useState<TypeMetaux[]>([]);
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://10.0.2.2:8000/api/types-metaux/';

const fetchData = async () => {
  setLoading(true);
  const token = await AsyncStorage.getItem('access');
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = response.data;
    setTypesMetaux(data);
    setFilteredMetaux(data);
  } catch (error) {
    Alert.alert('Erreur', 'Impossible de charger les types de métaux.');
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchData();
  }, []);

const ajouterTypeMetaux = async () => {
  if (!nom.trim()) {
    Alert.alert('Erreur', 'Le nom est obligatoire.');
    return;
  }

  const token = await AsyncStorage.getItem('access');
  try {
    const res = await axios.post(
      API_URL,
      { nom, description },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (res.status === 201) {
      setNom('');
      setDescription('');
      fetchData();
      ToastAndroid.show('Type ajouté avec succès', ToastAndroid.SHORT);
    }
  } catch (error: any) {
    if (error.response?.data) {
      Alert.alert('Erreur', JSON.stringify(error.response.data));
    } else {
      Alert.alert('Erreur', 'Erreur de communication avec le serveur.');
    }
  }
};


const supprimer = async (id: number) => {
  const token = await AsyncStorage.getItem('access');
  try {
    await axios.delete(`${API_URL}${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTypesMetaux(typesMetaux.filter(item => item.id !== id));
    setFilteredMetaux(filteredMetaux.filter(item => item.id !== id));
    ToastAndroid.show('Type supprimé', ToastAndroid.SHORT);
  } catch (error) {
    Alert.alert('Erreur', 'La suppression a échoué.');
  }
};


  const rechercher = (text: string) => {
    setSearchText(text);
    const filtered = typesMetaux.filter(item =>
      item.nom.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredMetaux(filtered);
  };

  const renderItem = ({ item }: { item: TypeMetaux }) => (
    <TouchableOpacity
      style={styles.card}
      onLongPress={() => Alert.alert('Édition à venir', `Modifier "${item.nom}" bientôt.`)}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.nom}</Text>
        <Text style={styles.cardText}>{item.description || '—'}</Text>
      </View>
      <TouchableOpacity
        onPress={() =>
          Alert.alert('Confirmation', `Supprimer "${item.nom}" ?`, [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Supprimer',
              style: 'destructive',
              onPress: () => supprimer(item.id),
            },
          ])
        }
      >
        <Icon name="trash-can-outline" size={26} color="#cc4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Ajouter un type de métal</Text>

          <TextInput
            placeholder="Nom du type"
            style={styles.input}
            value={nom}
            onChangeText={setNom}
          />
          <TextInput
            placeholder="Description"
            style={[styles.input, { height: 90 }]}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TouchableOpacity style={styles.addButton} onPress={ajouterTypeMetaux}>
            <Icon name="plus" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.addButtonText}>Créer</Text>
          </TouchableOpacity>

          <Text style={styles.subtitle}>Types de Métaux existants</Text>

          <TextInput
            placeholder="🔍 Rechercher un type..."
            style={styles.searchInput}
            value={searchText}
            onChangeText={rechercher}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#A45C40" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={filteredMetaux}
              keyExtractor={item => item.id.toString()}
              renderItem={renderItem}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Aucun type trouvé</Text>
              }
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default TypeMetauxScreen;
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  container: {
    flex: 1,
    padding: 16,
    marginTop: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3e2f1c',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    color: '#6e4e2e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
    backgroundColor: '#f2f2f2',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#6e4e2e',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
    color: '#888',
  },
});
