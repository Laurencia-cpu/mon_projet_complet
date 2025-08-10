import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';

interface Achat {
  id: number;
  fournisseur: string;
  article: string;
  quantite: number;
  prix: number;
  total: number;
}

export default function AchatScreen() {
  const [fournisseur, setFournisseur] = useState('');
  const [article, setArticle] = useState('');
  const [quantite, setQuantite] = useState('');
  const [prix, setPrix] = useState('');
  const [achats, setAchats] = useState<Achat[]>([]);

  const ajouterAchat = () => {
    if (!fournisseur || !article || !quantite || !prix) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    const newAchat: Achat = {
      id: achats.length + 1,
      fournisseur,
      article,
      quantite: parseFloat(quantite),
      prix: parseFloat(prix),
      total: parseFloat(quantite) * parseFloat(prix),
    };

    setAchats([...achats, newAchat]);
    setFournisseur('');
    setArticle('');
    setQuantite('');
    setPrix('');
  };

  const renderItem = ({ item }: { item: Achat }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>Fournisseur : {item.fournisseur}</Text>
      <Text style={styles.itemText}>Article : {item.article}</Text>
      <Text style={styles.itemText}>
        Qté : {item.quantite} × {item.prix} = {item.total} Ar
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🛒 Page d’Achat</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom du fournisseur"
        value={fournisseur}
        onChangeText={setFournisseur}
      />
      <TextInput
        style={styles.input}
        placeholder="Nom de l'article"
        value={article}
        onChangeText={setArticle}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantité"
        keyboardType="numeric"
        value={quantite}
        onChangeText={setQuantite}
      />
      <TextInput
        style={styles.input}
        placeholder="Prix unitaire"
        keyboardType="numeric"
        value={prix}
        onChangeText={setPrix}
      />

      <TouchableOpacity style={styles.button} onPress={ajouterAchat}>
        <Text style={styles.buttonText}>Ajouter Achat</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>🧾 Historique des Achats</Text>
      <FlatList
        data={achats}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f6fa',
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 10,
    color: '#34495e',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  itemText: {
    fontSize: 15,
    color: '#2d3436',
  },
});
