// Importation des bibliothèques nécessaires
import React from 'react';
import {ScrollView, SafeAreaView, Text, StyleSheet, Button, View, ImageBackground, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';



const Parttrois = () => {
  const data = [
    { id: '1', title: 'Support client et aide à la prise en main' },
    { id: '2', title: 'Encaissement intuitif et automatique' },
    { id: '3', title: 'Devis et facturation en un clic' },
    { id: '4', title: 'Gestion des pesées' },
    { id: '5', title: 'Journal de police et génération des lettres chèques' },
    { id: '6', title: 'Statistiques des articles et tableaux de bord' },
    { id: '7', title: 'Transfert comptable et opérations assimilées' },
  ];

  // Fonction pour rendre chaque élément de la liste
    const renderItem = ({ item }) => (
      <View style={styles.item}>
        <Text style={styles.title}>{item.title}</Text>
      </View>
    );


  return (
    <View>
      <ScrollView>
      <View>
      <ImageBackground source={require('../assets/fer.jpg')} style={styles.background}>
        {/* Boutons de navigation */}
        <TouchableOpacity style={styles.buttonContainer}>    
          <Text style={styles.buttonContainer}><Icon name="home" size={25}/>{'\n'}Accueil</Text>
          <Text style={styles.buttonContainer}><Icon name="eur" size={25}/>{'\n'}Tarif</Text>
          <Text style={styles.buttonContainer}><Icon name="phone" size={25}/>{'\n'}Contact</Text>
        </TouchableOpacity>
        
        <Text style={styles.subtitle}>Le meilleur allié des professionnels {'\n'} de récupération et de valorisation {'\n'} des déchets métalliques</Text>

        

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Devenir')}>
          <Text style={styles.buttonText}>Devenir Client</Text>
        </TouchableOpacity>
      </ImageBackground>
      </View >
      <View style={styles.container}>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item.id}
          />
      </View>
      </ScrollView>
    </View>
    
  );
};

// Styles pour le composant
const styles = StyleSheet.create({
  background:{
    width:'100%',
    height:300,
    justifyContent:'center',
    alignItems:'center',
  },
  Fonts: {
    marginLeft:-160,
    flexDirection: 'row',
    gap:5,
  },
  subtitle: {
    fontSize: 20, // Taille de la police du sous-titre
    marginBottom: 5, // Espace en bas du sous-titre
    color: '#FFF', // Couleur du texte
    justifyContent:'center',
    alignItems:'flex-end',
    textAlign: 'right', // Alignement à droite
    fontWeight:'bold',
  },
  buttonContainer: {
    flexDirection: 'row', // Aligne les boutons horizontalement
    color:'#000',
    marginLeft: 10, // Marge à gauche
    fontWeight:'bold',
    fontSize: 15, // Taille de la police
    alignSelf: 'flex-start', // Alignement à gauche
    marginVertical: 20, // Marge verticale
    textAlign:'center',
    marginTop: -15,

  },
  
  button:{
    borderWidth:2,
    borderColor:'#FF5733',
    borderRadius:10,
    paddingVertical:3,
    paddingHorizontal:10,
    backgroundColor:'transparent',
    marginTop:50,
    
  },
  buttonText:{
    color:'#FFF',
    fontSize:15,
    textAlign:'center',
  },
  container: {
    //flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8', // Couleur de fond
  },
  item: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 5,
    backgroundColor: '#ffffff', // Couleur de fond des éléments de la liste
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.5,
    elevation: 2, // Pour Android
  },
  title: {
    fontSize: 16,
    color: '#000', // Couleur du texte
  },
});

// Exportation du composant
export default Parttrois;
