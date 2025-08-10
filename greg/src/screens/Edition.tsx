import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

const EditionScreen = () => {
  const handlePress = (feature: string) => {
    Alert.alert(`Fonctionnalité : ${feature}`, `Action ou redirection pour "${feature}"`);
  };

  const features = [
    "Journal de Police",
    "Liste des Bons /Jour",
    "Transfert Comptable",
    "Statistique Qualité par Date",
    "Statistique CA Fournisseur par Date",
    "Statistique Qualité / Fournisseur par Date",
    "Stat Bon Fournisseur",
    "Stat Bon Fournisseur Details",
    "Export des bons fournisseurs",
    "Déclaration Fichier Informatique"
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📄 Page d’Édition</Text>

      {features.map((feature, index) => (
        <TouchableOpacity key={index} style={styles.card} onPress={() => handlePress(feature)}>
          <Text style={styles.cardText}>{feature}</Text>
        </TouchableOpacity>
      ))}

    </ScrollView>
  );
};

export default EditionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2a2a2a',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});
