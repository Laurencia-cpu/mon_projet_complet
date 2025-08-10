import React, { useState } from 'react';
import {View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, TouchableOpacity,} from 'react-native';
const typesFournisseur = ['Particulier', 'Entreprise'];
const statuts = ['Actif', 'Inactif'];

export default function FormulaireFournisseur() {
  const [nom, setNom] = useState('');
  const [type, setType] = useState(typesFournisseur[0]);
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [cin, setCin] = useState('');
  const [statut, setStatut] = useState(statuts[0]);
  const [notes, setNotes] = useState('');

  const validerFormulaire = () => {
    if (!nom.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire.');
      return;
    }
    if (!telephone.trim()) {
      Alert.alert('Erreur', 'Le téléphone est obligatoire.');
      return;
    }
    // Tu peux ajouter plus de validations ici

    // Simuler enregistrement
    const fournisseur = {
      nom,
      type,
      adresse,
      telephone,
      email,
      cin,
      statut,
      notes,
    };

    console.log('Fournisseur enregistré:', fournisseur);
    Alert.alert('Succès', 'Fournisseur enregistré avec succès !');

    // Réinitialiser formulaire (optionnel)
    setNom('');
    setType(typesFournisseur[0]);
    setAdresse('');
    setTelephone('');
    setEmail('');
    setCin('');
    setStatut(statuts[0]);
    setNotes('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Formulaire Fournisseur</Text>

      <Text style={styles.label}>Nom :</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom complet ou raison sociale"
        value={nom}
        onChangeText={setNom}
      />

      <Text style={styles.label}>Type :</Text>
      <View style={styles.optionContainer}>
        {typesFournisseur.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.optionButton, type === t && styles.optionButtonSelected]}
            onPress={() => setType(t)}
          >
            <Text style={type === t ? styles.optionTextSelected : styles.optionText}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Adresse :</Text>
      <TextInput
        style={styles.input}
        placeholder="Adresse complète"
        value={adresse}
        onChangeText={setAdresse}
      />

      <Text style={styles.label}>Téléphone :</Text>
      <TextInput
        style={styles.input}
        placeholder="+261 34 XX XX XX"
        keyboardType="phone-pad"
        value={telephone}
        onChangeText={setTelephone}
      />

      <Text style={styles.label}>Email :</Text>
      <TextInput
        style={styles.input}
        placeholder="email@example.com"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>CIN :</Text>
      <TextInput
        style={styles.input}
        placeholder="Numéro de carte d'identité"
        value={cin}
        onChangeText={setCin}
      />

      <Text style={styles.label}>Statut :</Text>
      <View style={styles.optionContainer}>
        {statuts.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.optionButton, statut === s && styles.optionButtonSelected]}
            onPress={() => setStatut(s)}
          >
            <Text style={statut === s ? styles.optionTextSelected : styles.optionText}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Notes :</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Informations complémentaires"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Enregistrer" onPress={validerFormulaire} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f7f7',
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  optionContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#ddd',
    borderRadius: 20,
    marginRight: 10,
  },
  optionButtonSelected: {
    backgroundColor: '#2a86ff',
  },
  optionText: {
    color: '#333',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
});
