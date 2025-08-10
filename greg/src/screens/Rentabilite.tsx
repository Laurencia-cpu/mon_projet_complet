import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RentabiliteScreen = () => {
  const [data, setData] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const chargerRentabilite = async () => {
      const token = await AsyncStorage.getItem("access");
      const res = await fetch("http://10.0.2.2:8000/api/rentabilite/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      setData(json);
      setChargement(false);
    };

    chargerRentabilite();
  }, []);

  if (chargement) {
    return (
      <View style={styles.zoneChargement}>
        <ActivityIndicator size="large" color="#A45C40" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Rentabilité par type de métal</Text>
      <FlatList
        data={data}
        keyExtractor={(item, index) => `${item.type_metaux}_${index}`}
        renderItem={({ item }) => (
          <View style={styles.ligne}>
            <Text style={styles.nom}>{item.type_metaux}</Text>
            <Text style={styles.detail}>Poids : {item.poids_total} kg</Text>
            <Text style={styles.detail}>Rentabilité : {item.rentabilite_totale.toFixed(2)} €</Text>
          </View>
        )}
      />
    </View>
  );
};

export default RentabiliteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EFE3',
    padding: 20,
  },
  titre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6e4e2e',
    marginBottom: 16,
    textAlign: 'center',
  },
  ligne: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  nom: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A45C40',
  },
  detail: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  zoneChargement: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
