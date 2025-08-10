import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.1.100:8000/api/bl/'; // <-- à adapter

export default function FacturationScreen() {
  const [bonsLivraison, setBonsLivraison] = useState([]);
  const [fournisseur, setFournisseur] = useState('');
  const [articles, setArticles] = useState('');
  const [date, setDate] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBonsLivraison();
  }, []);

  const fetchBonsLivraison = async () => {
    try {
      const response = await axios.get(API_URL);
      setBonsLivraison(response.data);
    } catch (error) {
      Alert.alert('Erreur', "Échec de chargement des bons de livraison.");
    }
  };

  const ajouterBL = async () => {
    if (!fournisseur || !articles || !date) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      await axios.post(API_URL, {
        fournisseur,
        articles,
        date,
      });
      Alert.alert('Succès', 'Bon de livraison ajouté !');
      setFournisseur('');
      setArticles('');
      setDate('');
      fetchBonsLivraison();
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'ajouter le BL.");
    }
  };

  const filteredBL = bonsLivraison.filter((bl) =>
    bl.fournisseur.toLowerCase().includes(search.toLowerCase()) ||
    bl.date.includes(search)
  );

  const renderBLItem = ({ item }) => (
    <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#ccc' }}>
      <Text style={{ fontWeight: 'bold' }}>Fournisseur : {item.fournisseur}</Text>
      <Text>Date : {item.date}</Text>
      <Text>Articles : {item.articles}</Text>
      <TouchableOpacity
        style={{ marginTop: 6 }}
        onPress={() => Alert.alert('Impression', 'Impression du BL en cours...')}
      >
        <Text style={{ color: 'blue' }}>🖨️ Imprimer ce BL</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
        📦 Facturation -BL
    
      </Text>

      {/* ➕ Formulaire Ajout */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>➕ Ajouter un Bon :</Text>
        <TextInput
          placeholder="Fournisseur"
          value={fournisseur}
          onChangeText={setFournisseur}
          style={{ borderBottomWidth: 1, marginBottom: 8 }}
        />
        <TextInput
          placeholder="Articles (séparés par ,)"
          value={articles}
          onChangeText={setArticles}
          style={{ borderBottomWidth: 1, marginBottom: 8 }}
        />
        <TextInput
          placeholder="Date (AAAA-MM-JJ)"
          value={date}
          onChangeText={setDate}
          style={{ borderBottomWidth: 1, marginBottom: 8 }}
        />
        <TouchableOpacity
          onPress={ajouterBL}
          style={{ backgroundColor: 'green', padding: 10, borderRadius: 5 }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>➕ Enregistrer</Text>
        </TouchableOpacity>
      </View>

      {/* 🔍 Recherche */}
      <TextInput
        placeholder="🔍 Rechercher BL par fournisseur ou date"
        value={search}
        onChangeText={setSearch}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 8,
          marginBottom: 12,
          borderColor: '#aaa',
        }}
      />

      {/* 📜 Liste des BL */}
      <FlatList
        data={filteredBL}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBLItem}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#888' }}>
            Aucun bon de livraison trouvé.
          </Text>
        }
      />
    </ScrollView>
  );
}
