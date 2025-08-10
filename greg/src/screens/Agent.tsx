import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, FlatList, Alert } from 'react-native';

interface Article {
  id: string;
  nom: string;
  quantite: number;
  prix: number;
  codeOp: string;
}

const AgentScreen = () => {
  const [fournisseur, setFournisseur] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [nomArticle, setNomArticle] = useState('');
  const [quantite, setQuantite] = useState('');
  const [prix, setPrix] = useState('');
  const [codeOp, setCodeOp] = useState('');
  const [reception, setReception] = useState('');
  const [bons, setBons] = useState<string[]>([]);

  const ajouterArticle = () => {
    if (!nomArticle || !quantite || !prix || !codeOp) {
      Alert.alert('Champs manquants', 'Veuillez remplir tous les champs de l’article');
      return;
    }
    const newArticle: Article = {
      id: Date.now().toString(),
      nom: nomArticle,
      quantite: parseFloat(quantite),
      prix: parseFloat(prix),
      codeOp,
    };
    setArticles([...articles, newArticle]);
    setNomArticle('');
    setQuantite('');
    setPrix('');
    setCodeOp('');
  };

  const enregistrerBon = () => {
    if (!fournisseur || articles.length === 0) {
      Alert.alert('Erreur', 'Fournisseur ou articles manquants');
      return;
    }
    const bonId = `BON-${Date.now()}`;
    setBons([...bons, bonId]);
    setArticles([]);
    setFournisseur('');
    Alert.alert('Bon enregistré', `Lettre chèque imprimée pour ${bonId}`);
  };

  const reimprimerBon = (bon: string) => {
    Alert.alert('Réimpression', `Bon ${bon} réimprimé avec succès`);
  };

  const annulerBon = (bon: string) => {
    Alert.alert('Confirmation', `Bon ${bon} annulé`);
  };

  const enregistrerReception = () => {
    if (!reception) {
      Alert.alert('Erreur', 'Champ réception vide');
      return;
    }
    Alert.alert('Réception enregistrée', `Provenance : ${reception}`);
    setReception('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📦 Bon de caisse</Text>

      {/* Fournisseur */}
      <Text style={styles.label}>Fournisseur</Text>
      <TextInput style={styles.input} value={fournisseur} onChangeText={setFournisseur} placeholder="Nom du fournisseur" />

      {/* Articles */}
      <Text style={styles.label}>Ajouter un article</Text>
      <TextInput style={styles.input} value={nomArticle} onChangeText={setNomArticle} placeholder="Article (Fer, Cuivre...)" />
      <TextInput style={styles.input} value={quantite} onChangeText={setQuantite} keyboardType="numeric" placeholder="Quantité (kg)" />
      <TextInput style={styles.input} value={prix} onChangeText={setPrix} keyboardType="numeric" placeholder="Prix (Ar)" />
      <TextInput style={styles.input} value={codeOp} onChangeText={setCodeOp} placeholder="Code Opération" />
      <Button title="Ajouter article" onPress={ajouterArticle} />

      <Text style={styles.subsection}>Articles ajoutés :</Text>
      {articles.map(article => (
        <Text key={article.id}>• {article.nom} - {article.quantite}kg - {article.prix}Ar - CodeOp: {article.codeOp}</Text>
      ))}

      <Button title="🧾 Enregistrer Bon de caisse & Imprimer chèque" onPress={enregistrerBon} />

      {/* Réimpression / Annulation */}
      <Text style={styles.subsection}>🧾 Bons enregistrés :</Text>
      <FlatList
        data={bons}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <View style={styles.bonItem}>
            <Text>{item}</Text>
            <Button title="Réimprimer" onPress={() => reimprimerBon(item)} />
            <Button title="Annuler" onPress={() => annulerBon(item)} color="red" />
          </View>
        )}
      />

      {/* Réception */}
      <Text style={styles.label}>📥 Réception</Text>
      <TextInput style={styles.input} value={reception} onChangeText={setReception} placeholder="Provenance / Référence" />
      <Button title="Enregistrer Réception" onPress={enregistrerReception} />

      {/* Statistique simple */}
      <Text style={styles.subsection}>📊 Total articles enregistrés : {articles.length}</Text>
    </ScrollView>
  );
};
//izy

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { marginTop: 10, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    marginBottom: 10,
    borderRadius: 6,
  },
  subsection: { marginTop: 20, fontWeight: 'bold', fontSize: 16 },
  bonItem: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#f3f3f3',
    borderRadius: 5,
  },
});


export default AgentScreen;
