import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

type Onglet = 'favoris' | 'proximite' | 'existants';

const App = () => {
  const [selectedTab, setSelectedTab] = useState<Onglet>('favoris');
  const [search, setSearch] = useState('');

  const lieux = {
    favoris: ['Centre Principal', 'Base dépôt'],
    proximite: ['Marché Anosy', 'Place 67Ha'],
    existants: ['Dépôt Mahamasina', 'Zone industrielle Tanjombato'],
  };

  const lieuxFiltres = lieux[selectedTab].filter((lieu) =>
    lieu.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Définir un lieu de collecte</Text>

      {/* Barre de recherche */}
      <TextInput
        placeholder="Rechercher un lieu..."
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />

      {/* Onglets */}
      <View style={styles.tabContainer}>
        {(['favoris', 'proximite', 'existants'] as Onglet[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste des lieux */}
      <FlatList
        data={lieuxFiltres}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  activeTab: {
    backgroundColor: '#007bff',
  },
  tabText: {
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  item: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    marginVertical: 4,
    borderRadius: 6,
  },
  itemText: {
    fontSize: 16,
  },
});

export default App;
