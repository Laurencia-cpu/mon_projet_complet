import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { TextInput, Button, Divider, List, Snackbar } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';

// API natif fetch (tsy mampiasa axios)
const API_URL = 'http://10.0.2.2:8000'; // soloina amin'ny IP backend-nao

const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }
  return await response.json();
};

type Fournisseur = {
  id: number;
  nom: string;
};

type Article = {
  id: number;
  nom: string;
  code_operation: string;
};

export default function BonCaisseForm() {
  const { control, handleSubmit, setValue, reset } = useForm();
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedFournisseur, setSelectedFournisseur] = useState<number | null>(null);
  const [lignes, setLignes] = useState<any[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const fournisseursRes = await fetch('http://10.0.2.2:8000/api/fournisseurs/');
        const articlesRes = await fetch('http://10.0.2.2:8000/api/articles/');
  
        const fournisseursData = await fournisseursRes.json();
        const articlesData = await articlesRes.json();
  
        setFournisseurs(fournisseursData);
        setArticles(articlesData);
      } catch (error) {
        console.error(error);
      }
    };
  
    loadData();
  }, []);
  
  

  const ajouterLigne = (ligne: any) => {
    setLignes([...lignes, ligne]);
    reset({ article: '', quantite: '', prix_unitaire: '' });
  };

  const onSubmit = (data: any) => {
    const bon = {
      fournisseur: selectedFournisseur,
      moyen_reglement: data.moyen_reglement,
      lignes: lignes,
    };
    console.log("BON ENVOYÉ :", bon); 
    fetchAPI('http://10.0.2.2:8000/api/bons/', {
      method: 'POST',
      body: JSON.stringify(bon),
    })
      .then(() => {
        setSnackbarVisible(true);
        setLignes([]);
        reset();
      })
      .catch(error => {
        console.error('Erreur:', error);
      });
  };

  return (
    <ScrollView style={{ padding: 10, marginTop:30, marginBottom:30 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Saisie Bon de Caisse</Text>

      {/* Sélection fournisseur */}
      <Text style={{ marginTop: 10 }}>Fournisseur</Text>
      {fournisseurs.map(f => (
        <Button
          key={f.id}
          mode={selectedFournisseur === f.id ? 'contained' : 'outlined'}
          onPress={() => setSelectedFournisseur(f.id)}
          style={{ marginVertical: 2 }}
        >
          {f.nom}
        </Button>
      ))}

      <Divider style={{ marginVertical: 10 }} />

      {/* Moyen de règlement */}
      <Controller
        control={control}
        name="moyen_reglement"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Moyen de règlement"
            value={value}
            onChangeText={onChange}
            style={{ marginBottom: 10 }}
          />
        )}
      />

      <Text style={{ marginBottom: 5 }}>Ajouter un article</Text>

      {/* Article */}
      <Controller
        control={control}
        name="article"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="ID Article"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            style={{ marginBottom: 5 }}
          />
        )}
      />
      {/* Quantité */}
      <Controller
        control={control}
        name="quantite"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Quantité"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            style={{ marginBottom: 5 }}
          />
        )}
      />
      {/* Prix */}
      <Controller
        control={control}
        name="prix_unitaire"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Prix unitaire"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            style={{ marginBottom: 5 }}
          />
        )}
      />

      <Button
        mode="outlined"
        onPress={() =>
          ajouterLigne({
            article: parseInt(control._formValues.article),
            quantite: parseInt(control._formValues.quantite),
            prix_unitaire: parseFloat(control._formValues.prix_unitaire),
          })
        }
      >
        Ajouter article
      </Button>

      {/* Liste des articles */}
      <List.Section title="Articles ajoutés">
        {lignes.map((l, index) => (
          <List.Item
            key={index}
            title={`Article ID: ${l.article}`}
            description={`Qté: ${l.quantite} x ${l.prix_unitaire} €`}
          />
        ))}
      </List.Section>

      {/* Bouton Valider */}
      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        style={{ marginTop: 10 }}
        disabled={!selectedFournisseur || lignes.length === 0}
      >
        Valider le Bon de Caisse
      </Button>

      {/* Notification */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        Bon de caisse enregistré avec succès !
      </Snackbar>
    </ScrollView>
  );
}


// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
// import { Picker } from '@react-native-picker/picker'; // Updated import

// const BonDeCaisse = () => {
//     const [fournisseur, setFournisseur] = useState('');
//     const [article, setArticle] = useState('');
//     const [codeOP, setCodeOP] = useState('');
//     const [quantite, setQuantite] = useState('');
//     const [prix, setPrix] = useState('');
//     const [moyenReglement, setMoyenReglement] = useState('cheque');

//     return (
//         <View style={styles.container}>
//             <Text style={styles.title}>Bon de Caisse</Text>
//             <TextInput
//                 style={styles.input}
//                 placeholder="Nom du fournisseur"
//                 value={fournisseur}
//                 onChangeText={setFournisseur}
//             />
//             <TextInput
//                 style={styles.input}
//                 placeholder="Nom de l'article"
//                 value={article}
//                 onChangeText={setArticle}
//             />
//             <TextInput
//                 style={styles.input}
//                 placeholder="Code opération"
//                 value={codeOP}
//                 onChangeText={setCodeOP}
//             />
//             <TextInput
//                 style={styles.input}
//                 placeholder="Quantité"
//                 keyboardType="numeric"
//                 value={quantite}
//                 onChangeText={setQuantite}
//             />
//             <TextInput
//                 style={styles.input}
//                 placeholder="Prix"
//                 keyboardType="numeric"
//                 value={prix}
//                 onChangeText={setPrix}
//             />
//             <Picker
//                 selectedValue={moyenReglement}
//                 style={styles.picker}
//                 onValueChange={(itemValue) => setMoyenReglement(itemValue)}
//             >
//                 <Picker.Item label="Chèque" value="cheque" />
//                 <Picker.Item label="Espèces" value="espece" />
//                 <Picker.Item label="Carte" value="carte" />
//             </Picker>
//             <View style={styles.buttonContainer}>
//                 <Button title="Imprimer Lettre Chèque" onPress={() => {}} />
//                 <Button title="Réimprimer Bon" onPress={() => {}} />
//                 <Button title="Annuler Bon" onPress={() => {}} />
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: 20,
//         backgroundColor: '#f9f9f9',
//     },
//     title: {
//         fontSize: 24,
//         textAlign: 'center',
//         marginBottom: 20,
//     },
//     input: {
//         height: 40,
//         borderColor: '#ccc',
//         borderWidth: 1,
//         marginBottom: 15,
//         paddingLeft: 10,
//     },
//     picker: {
//         height: 50,
//         marginBottom: 15,
//     },
//     buttonContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//     },
// });

// export default BonDeCaisse;