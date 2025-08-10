import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  ActivityIndicator, Alert, Platform, SafeAreaView, KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from '../services/api'; // ← ici on importe l'axiosInstance

type TypeMetaux = {
  id: number;
  nom: string;
};

type Grille = {
  id: number;
  type_metaux: TypeMetaux;
  poids_min: number;
  poids_max: number;
  tarif: number;
};

const GrilleTarifaire = () => {
  const [grilles, setGrilles] = useState<Grille[]>([]);
  const [typesMetaux, setTypesMetaux] = useState<TypeMetaux[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [poidsMin, setPoidsMin] = useState('');
  const [poidsMax, setPoidsMax] = useState('');
  const [tarif, setTarif] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resGrilles, resTypes] = await Promise.all([
        axios.get('grilles-tarifaires/'),
        axios.get('types-metaux/'),
      ]);
      setGrilles(resGrilles.data);
      setTypesMetaux(resTypes.data);
    } catch (error) {
      Alert.alert('Erreur', 'Chargement des données impossible.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const ajouterGrille = async () => {
    if (!selectedTypeId || !poidsMin || !poidsMax || !tarif) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires.');
      return;
    }

    try {
      const response = await axios.post('grilles-tarifaires/', {
        type_metaux_id: selectedTypeId,
        poids_min: parseFloat(poidsMin),
        poids_max: parseFloat(poidsMax),
        tarif: parseFloat(tarif),
      });

      if (response.status === 201) {
        setPoidsMin('');
        setPoidsMax('');
        setTarif('');
        setSelectedTypeId(null);
        fetchAll();
      }
    } catch (error: any) {
      if (error.response) {
        Alert.alert('Erreur', JSON.stringify(error.response.data));
      } else {
        Alert.alert('Erreur', 'Erreur de connexion.');
      }
    }
  };

  const supprimerGrille = async (id: number) => {
    try {
      await axios.delete(`grilles-tarifaires/${id}/`);
      setGrilles((prev) => prev.filter((g) => g.id !== id));
    } catch {
      Alert.alert('Erreur', 'Suppression échouée.');
    }
  };

  const renderItem = ({ item }: { item: Grille }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.nom}>{item.type_metaux.nom}</Text>
        <Text style={styles.desc}>
          De {item.poids_min}kg à {item.poids_max}kg :{' '}
          <Text style={{ fontWeight: 'bold' }}>{item.tarif} Ar/kg</Text>
        </Text>
      </View>
      <TouchableOpacity
        onPress={() =>
          Alert.alert('Confirmation', 'Supprimer cette grille ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Supprimer', style: 'destructive', onPress: () => supprimerGrille(item.id) },
          ])
        }
      >
        <Icon name="trash-can-outline" size={26} color="#cc4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          <Text style={styles.title}>Grilles tarifaires</Text>
          <Text style={styles.subtitle}>Ajouter une grille</Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedTypeId}
              onValueChange={(val) => setSelectedTypeId(val)}
            >
              <Picker.Item label="-- Choisir un métal --" value={null} />
              {typesMetaux.map((t) => (
                <Picker.Item key={t.id} label={t.nom} value={t.id} />
              ))}
            </Picker>
          </View>

          <TextInput
            placeholder="Poids min (kg)"
            style={styles.input}
            keyboardType="decimal-pad"
            value={poidsMin}
            onChangeText={setPoidsMin}
          />
          <TextInput
            placeholder="Poids max (kg)"
            style={styles.input}
            keyboardType="decimal-pad"
            value={poidsMax}
            onChangeText={setPoidsMax}
          />
          <TextInput
            placeholder="Tarif (Ar/kg)"
            style={styles.input}
            keyboardType="decimal-pad"
            value={tarif}
            onChangeText={setTarif}
          />

          <TouchableOpacity style={styles.addBtn} onPress={ajouterGrille}>
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>

          <Text style={[styles.subtitle, { marginTop: 30 }]}>Liste des grilles</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#6e4e2e" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={[...grilles].reverse()}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              ListEmptyComponent={<Text style={styles.emptyText}>Aucune grille trouvée</Text>}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GrilleTarifaire;
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 , marginTop:15},
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6e4e2e',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 25,
    color: '#6e4e2e',
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  nom: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  desc: {
    color: '#555',
    fontSize: 14,
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  addBtn: {
    backgroundColor: '#6e4e2e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#888',
  },
});