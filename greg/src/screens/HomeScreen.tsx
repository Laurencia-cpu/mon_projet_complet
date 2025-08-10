import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, Alert } from 'react-native';

export default function HomeScreen() {
  const [client, setClient] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    description: '',
    mentions_legales: '',
  });

  const [loading, setLoading] = useState(true);

  // --------- Fetch initial info (GET) --------------
  const fetchClientInfo = async () => {
    try {
      const response = await fetch('http://10.0.2.2:8000/api/client/1/');
      const data = await response.json();
      setClient(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  // ------------- Save updated info (PUT) ------------
  const updateClientInfo = async () => {
    try {
      const response = await fetch('http://10.0.2.2:8000/api/client/1/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      });
      if (response.ok) {
        Alert.alert('Succès', 'Données mises à jour !');
      } else {
        Alert.alert('Erreur', 'Échec de la mise à jour');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Connexion au serveur impossible');
    }
  };

  useEffect(() => {
    fetchClientInfo();
  }, []);

  // ------------- UI Display + Formulaire -----------
  if (loading) return <Text style={styles.loading}>Chargement...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profil du Client</Text>

      <TextInput style={styles.input} placeholder="Nom" value={client.nom}
        onChangeText={(text) => setClient({ ...client, nom: text })} />

      <TextInput style={styles.input} placeholder="Adresse" value={client.adresse}
        onChangeText={(text) => setClient({ ...client, adresse: text })} />

      <TextInput style={styles.input} placeholder="Téléphone" value={client.telephone}
        onChangeText={(text) => setClient({ ...client, telephone: text })} />

      <TextInput style={styles.input} placeholder="Email" value={client.email}
        onChangeText={(text) => setClient({ ...client, email: text })} />

      <TextInput style={styles.textarea} placeholder="Description" value={client.description}
        multiline numberOfLines={4}
        onChangeText={(text) => setClient({ ...client, description: text })} />

      <TextInput style={styles.textarea} placeholder="Mentions Légales" value={client.mentions_legales}
        multiline numberOfLines={4}
        onChangeText={(text) => setClient({ ...client, mentions_legales: text })} />

      <Button title="💾 Enregistrer" onPress={updateClientInfo} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  textarea: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    textAlignVertical: 'top',
  },
  loading: {
    marginTop: 100,
    textAlign: 'center',
    fontSize: 18,
  },
});
