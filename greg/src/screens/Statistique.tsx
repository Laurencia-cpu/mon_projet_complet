import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

const StatistiquesScreen = () => {
  const statistiques = [
    {
      title: '📊 Statistique Jpolice',
      description: 'Liste générale des factures par période + détails',
    },
    {
      title: '📈 Statistique Fournisseur',
      description: 'Liste des factures du fournisseur par période + détails',
    },
    {
      title: '🧾 Statistique Bon Fournisseur Détails',
      description: 'Détail des bons fournisseurs (par période)',
    },
  ];

  const handlePress = (stat) => {
    Alert.alert('Fonctionnalité sélectionnée', `${stat.title}\n\n${stat.description}`);
    // Remplace par une navigation ou appel API plus tard
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📋 Page des Statistiques</Text>

      {statistiques.map((stat, index) => (
        <TouchableOpacity key={index} style={styles.card} onPress={() => handlePress(stat)}>
          <Text style={styles.title}>{stat.title}</Text>
          <Text style={styles.description}>{stat.description}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default StatistiquesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1d3557',
  },
  description: {
    fontSize: 14,
    color: '#555',
  },
});
