import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';

export default function ReceptionScreen() {
  // --- States pour saisie ---
  const [provenance, setProvenance] = useState('');
  const [article, setArticle] = useState('');
  const [quantite, setQuantite] = useState('');

  // --- Données simulées ---
  const stats = [
    { article: 'Fer', total: 120 },
    { article: 'Cuivre', total: 75 },
    { article: 'Alu', total: 50 },
  ];

  const receptions = [
    { id: 'BR001', date: '2025-05-10', article: 'Fer', quantite: 30 },
    { id: 'BR002', date: '2025-05-11', article: 'Cuivre', quantite: 15 },
  ];

  const fichiers = [
    { br: 'BR001', bc: 'BC101', fournisseur: 'Rajaonarivelo', montant: '500 000 Ar' },
    { br: 'BR002', bc: 'BC102', fournisseur: 'Metalim SARL', montant: '1 200 000 Ar' },
  ];

  const handleSave = () => {
    if (!article || !quantite) {
      Alert.alert('Erreur', 'Article et quantité sont obligatoires.');
      return;
    }

    console.log('Réception enregistrée :', { provenance, article, quantite });
    Alert.alert('Succès', 'Réception enregistrée');
    setProvenance('');
    setArticle('');
    setQuantite('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Section 1 : Saisie */}
      <Text style={styles.sectionTitle}>📥 Réception d'article </Text>
      <TextInput
        placeholder="Provenance"
        style={styles.input}
        value={provenance}
        onChangeText={setProvenance}
      />
      
      <Button title="Consulter" onPress={handleSave} />

      {/* Section 2 : Stat par article */}
      <Text style={styles.sectionTitle}>📊 Statistique par Article</Text>
      <FlatList
        data={stats}
        keyExtractor={(item) => item.article}
        renderItem={({ item }) => (
          <Text style={styles.item}>
            {item.article} : {item.total} kg
          </Text>
        )}
      />

      {/* Section 3 : Liste des bons de réception */}
      <Text style={styles.sectionTitle}>📄 Liste des Bons de Réception</Text>
      <FlatList
        data={receptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.item}>
            {item.id} - {item.date} - {item.article} : {item.quantite} kg
          </Text>
        )}
      />

      {/* Section 4 : Fichier Réception */}
      <Text style={styles.sectionTitle}>🔗 Fichier Réception (BR ↔ BC)</Text>
      <FlatList
        data={fichiers}
        keyExtractor={(item) => item.br}
        renderItem={({ item }) => (
          <Text style={styles.item}>
            {item.br} ↔ {item.bc} | {item.fournisseur} : {item.montant}
          </Text>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#f7f7f7',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  item: {
    fontSize: 16,
    marginBottom: 10,
  },
});
