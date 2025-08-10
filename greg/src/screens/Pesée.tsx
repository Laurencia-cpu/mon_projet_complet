import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';

interface Pesee {
  fournisseur: string;
  poidsBrut: number;
  poidsTare: number;
  poidsNet: number;
  date: string;
}

const PeseeScreen = () => {
  const [fournisseur, setFournisseur] = useState('');
  const [poidsBrut, setPoidsBrut] = useState('');
  const [poidsTare, setPoidsTare] = useState('');
  const [pesees, setPesees] = useState<Pesee[]>([]);

  const handleEnregistrer = () => {
    const brut = parseFloat(poidsBrut);
    const tare = parseFloat(poidsTare);

    if (!fournisseur || isNaN(brut) || isNaN(tare)) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs correctement');
      return;
    }

    const net = brut - tare;
    const nouvellePesee: Pesee = {
      fournisseur,
      poidsBrut: brut,
      poidsTare: tare,
      poidsNet: net,
      date: new Date().toLocaleString(),
    };

    setPesees([nouvellePesee, ...pesees]);

    // Reset du formulaire
    setFournisseur('');
    setPoidsBrut('');
    setPoidsTare('');

    Alert.alert('Succès', 'Pesée enregistrée avec succès');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>📝 Saisie de Pesée</Text>

        <Text>Fournisseur</Text>
        <TextInput
          style={styles.input}
          value={fournisseur}
          onChangeText={setFournisseur}
          placeholder="Nom du fournisseur"
        />

        <Text>Poids Brut (kg)</Text>
        <TextInput
          style={styles.input}
          value={poidsBrut}
          onChangeText={setPoidsBrut}
          keyboardType="numeric"
          placeholder="Ex: 1200"
        />

        <Text>Poids Tare (kg)</Text>
        <TextInput
          style={styles.input}
          value={poidsTare}
          onChangeText={setPoidsTare}
          keyboardType="numeric"
          placeholder="Ex: 200"
        />

        <Button title="Enregistrer Pesée" onPress={handleEnregistrer} />

        <Text style={styles.title}>📋 Liste des Pesées</Text>
        <FlatList
          data={pesees}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>
                ✅ {item.fournisseur} - {item.poidsBrut}kg brut → {item.poidsNet}kg net
              </Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PeseeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    marginVertical: 12,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  itemText: {
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
});
