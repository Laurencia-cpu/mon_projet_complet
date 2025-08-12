import React from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
  Linking,
  Text
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../app'; // Ataovy azo antoka fa marina ity lalana ity

type ParttroisProps = {
  navigation: StackNavigationProp<RootStackParamList, 'lis'>;
};

// ... (ireo fonctions handleLink... tsy miova)
const handleFacebookLink = () => {
    const facebookUrl = "https://www.facebook.com";
    Linking.openURL(facebookUrl).catch((err) => console.error("Erreur d'ouverture de lien:", err));
};

const handleTwitterLink = () => {
    const twitterUrl = "https://twitter.com";
    Linking.openURL(twitterUrl).catch((err) => console.error("Erreur d'ouverture de lien:", err));
};

const handleLinkedInLink = () => {
    const linkedInUrl = "https://www.linkedin.com";
    Linking.openURL(linkedInUrl).catch((err) => console.error("Erreur d'ouverture de lien:", err));
};


const Parttrois: React.FC<ParttroisProps> = ({ navigation }) => {
  const data = [
    { id: '1', title: 'Support client et aide à la prise en main' },
    { id: '2', title: 'Encaissement intuitif et automatique' },
    { id: '3', title: 'Devis et facturation en un clic' },
    { id: '4', title: 'Gestion des pesées' },
    { id: '5', title: 'Journal de police et génération des lettres chèques' },
    { id: '6', title: 'Statistiques des articles et tableaux de bord' },
    { id: '7', title: 'Transfert comptable et opérations assimilées' },
  ];

  const renderItem = ({ item }: { item: { id: string; title: string } }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.title}</Text>
    </View>
  );

  const ListHeader = () => (
    <>
      {/* Fandaharana mitovy tanteraka amin'ny kaody nampiasanao ScrollView */}
      <View style={styles.containers}>
        <View style={{ flex: 1 }}>
          <Image source={require('../assets/gestion.png')} style={styles.image} />
        </View>
        <View>
          <TouchableOpacity
            style={styles.clientButton}
            onPress={() => navigation.navigate('EspaceClient')}
          >
            <Text style={styles.clientButtonText}>Espace Client</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.Fonts}>
          <TouchableOpacity onPress={handleFacebookLink}>
            <Icon name="facebook" size={15} color="black" style={{ marginRight: 10 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleTwitterLink}>
            <Icon name="twitter" size={15} color="black" style={{ marginRight: 10 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLinkedInLink}>
            <Icon name="linkedin" size={15} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <ImageBackground source={require('../assets/feu.jpg')} style={styles.background}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.rond} onPress={() => navigation.navigate('lis')}>
            <View style={styles.iconWrapper}><Icon name="home" size={25} color="#000" /></View>
            <Text style={styles.button}>Accueil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rond} onPress={() => navigation.navigate('Offres')}>
            <View style={styles.iconWrapper}><Icon name="eur" size={25} color="#000" /></View>
            <Text style={styles.button}>Tarif</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rond} onPress={() => navigation.navigate('Contact')}>
            <View style={styles.iconWrapper}><Icon name="phone" size={25} color="#000" /></View>
            <Text style={styles.button}>Contact</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Le meilleur allié des professionnels {'\n'} de récupération et de valorisation {'\n'} des déchets métalliques
        </Text>
        <TouchableOpacity style={styles.buttons} onPress={() => navigation.navigate('Ac')}>
          <Text style={styles.buttonText}>Devenir Client</Text>
        </TouchableOpacity>
      </ImageBackground>
    </>
  );

  return (
    <FlatList
      ListHeaderComponent={ListHeader}
      data={data}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      // Ny style ho an'ny lisitra dia apetraka eto mba tsy hisy padding be loatra
      contentContainerStyle={styles.listContainer}
    />
  );
};

// Ireto ny styles nalaina mivantana avy amin'ny kaody voalohany nomenao
const styles = StyleSheet.create({
  containers: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    padding: 15,
    marginTop: 15,
  },
  image: {
    width: 120,
    height: 30,
    resizeMode: 'contain',
  },
  Fonts: {
    width: 80,
    height: 25,
    marginTop: -5,
    alignItems: 'center',
    flexDirection: 'row',
  },
  clientButton: {
    backgroundColor: '#FF6F61',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 40, // Ity no tena nanome ilay endrika manokana
  },
  clientButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  background: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 5,
    color: '#FFF',
    textAlign: 'right',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    width: '100%',
  },
  rond: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  button: {
    marginTop: 8,
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttons: {
    borderWidth: 2,
    borderColor: "orange",
    borderRadius: 5,
    marginBottom: 35,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    textAlign: 'center',
  },
  // Style ho an'ny FlatList sy ny singa ao anatiny
  listContainer: {
    // Esorina ny padding ambony sy ambany be loatra
    paddingBottom: 20,
  },
  item: {
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 20, // Ity no manome ny elanelana amin'ny sisiny
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  title: {
    fontSize: 16,
    color: '#000',
    fontWeight: "bold",
  },
});

export default Parttrois;

// import React from 'react';
// import { ScrollView, Text, StyleSheet, View, ImageBackground, Image,TouchableOpacity, FlatList, Linking } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { RootStackParamList } from '../../app';

// // Type des props pour la navigation
// type ParttroisProps = {
//   navigation: StackNavigationProp<RootStackParamList, 'lis'>;
// };
// const handleFacebookLink = () => {
//         const facebookUrl = "https://www.facebook.com"; // Ato no apetraka ny URL mankany amin'ny pejy Facebook-nao
//         Linking.openURL(facebookUrl).catch((err) => console.error("Erreur d'ouverture de lien:", err));
//     };

// const handleTwitterLink = () => {
//       const twitterUrl = "https://twitter.com"; // Ato no apetraka ny URL mankany amin'ny kaonty Twitter-nao
//       Linking.openURL(twitterUrl).catch((err) => console.error("Erreur d'ouverture de lien:", err));
//   };

// const handleLinkedInLink = () => {
//       const linkedInUrl = "https://www.linkedin.com"; // Ato no apetraka ny URL mankany amin'ny pejy LinkedIn-nao
//       Linking.openURL(linkedInUrl).catch((err) => console.error("Erreur d'ouverture de lien:", err));
//   }; 
// const Parttrois: React.FC<ParttroisProps> = ({ navigation }) => {
//   const data = [
//     { id: '1', title: 'Support client et aide à la prise en main' },
//     { id: '2', title: 'Encaissement intuitif et automatique' },
//     { id: '3', title: 'Devis et facturation en un clic' },
//     { id: '4', title: 'Gestion des pesées' },
//     { id: '5', title: 'Journal de police et génération des lettres chèques' },
//     { id: '6', title: 'Statistiques des articles et tableaux de bord' },
//     { id: '7', title: 'Transfert comptable et opérations assimilées' },
//   ];

//   const renderItem = ({ item }: { item: { id: string; title: string } }) => (
//     <View style={styles.item}>
//       <Text style={styles.title}>{item.title}</Text>
//     </View>
//   );

//   return (
//     <View>
//       <ScrollView>
//         <View style={styles.containers}>
//                   <View style={{ flex: 1 }}>
//                     <Image source={require('../assets/gestion.png')} style={styles.image} />
//                   </View>
//                   <View>
//                     <TouchableOpacity
//                       style={styles.clientButton}
//                       onPress={() => navigation.navigate('EspaceClient')} 
//                     >
//                       <Text style={styles.clientButtonText}>Espace Client</Text>
//                     </TouchableOpacity>
//                   </View>
//                   <View style={styles.Fonts}>
//                     <TouchableOpacity  onPress={handleFacebookLink}>
//                             <Icon name="facebook" size={15} color="black" style={{ marginRight: 10 }} />
//                     </TouchableOpacity>
//                     <TouchableOpacity  onPress={handleTwitterLink}>
//                             <Icon name="twitter" size={15} color="black" style={{ marginRight: 10 }} />
//                     </TouchableOpacity>
//                     <TouchableOpacity onPress={handleLinkedInLink}>              
//                             <Icon name="linkedin" size={15} color="black" style={{ marginRight: 10 }} />  
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//         <ImageBackground source={require('../assets/feu.jpg')} style={styles.background}>
//         <View style={styles.buttonContainer}>
//             {/* Accueil */}
//             <TouchableOpacity style={styles.rond} onPress={() => navigation.navigate('lis')}>
//                 <View style={styles.iconWrapper}>
//                     <Icon name="home" size={25} color="#000" />
//                 </View>
//                 <Text style={styles.button}>Accueil</Text>
//             </TouchableOpacity>

//             {/* Tarif */}
//             <TouchableOpacity style={styles.rond} onPress={() => navigation.navigate('Offres')}>
//                 <View style={styles.iconWrapper}>
//                     <Icon name="eur" size={25} color="#000" />
//                 </View>
//                 <Text style={styles.button}>Tarif</Text>
//             </TouchableOpacity>

//             {/* Contact */}
//             <TouchableOpacity style={styles.rond} onPress={() => navigation.navigate('Contact')}>
//                 <View style={styles.iconWrapper}>
//                     <Icon name="phone" size={25} color="#000" />
//                 </View>
//                 <Text style={styles.button}>Contact</Text>
//             </TouchableOpacity>
//         </View>

//           <Text style={styles.subtitle}>
//             Le meilleur allié des professionnels {'\n'} de récupération et de valorisation {'\n'} des déchets métalliques
//           </Text>

//           {/* Navigation vers l'écran "Devenir" */}
//           <TouchableOpacity style={styles.buttons} onPress={() => navigation.navigate('Ac')}>
//             <Text style={styles.buttonText}>Devenir Client</Text>
//           </TouchableOpacity>
//         </ImageBackground>

//         <View style={styles.container}>
//           <FlatList
//             data={data}
//             renderItem={renderItem}
//             keyExtractor={item => item.id}
//           />
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   containers: {
//     backgroundColor: '#FFF',
//     flexDirection: 'row',
//     padding: 15,
//     marginTop:15
//   },
//   image: {
//     width: 120,
//     height: 30,
//     resizeMode: 'contain',
//   },
//   Fonts: {
//     width: 80,
//     height: 25,
//     marginTop: -5,
//     alignItems: 'center',
//     flexDirection: 'row',
//   },
//   clientButton: {
//     backgroundColor: '#FF6F61',
//     borderRadius: 5,
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     marginTop: 40,
//   },
//   clientButtonText: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//   },
//   background: {
//     width: '100%',
//     height: 300,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   subtitle: {
//     fontSize: 20,
//     marginBottom: 5,
//     color: '#FFF',
//     textAlign: 'right',
//     fontWeight: 'bold',
//   },
//   buttonContainer: {
//     flexDirection: 'row', // Aligner les icônes en ligne
//     justifyContent: 'space-around', // Espacer les icônes
//     marginVertical: 20,
// },
// rond: {
//     alignItems: 'center', // Centrer l'icône et le texte verticalement
//     margin:20,
// },
// iconWrapper: {
//     width: 60,
//     height: 60,
//     borderRadius: 30, // Cercle parfait
//     backgroundColor: 'white',
//     justifyContent: 'center', // Centrer l'icône horizontalement
//     alignItems: 'center', // Centrer l'icône verticalement
//     elevation: 5, // Ombre pour Android
//     shadowColor: '#000', // Ombre pour iOS
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
// },
// button: {
//     marginTop: 8, // Espacement entre l'icône et le texte
//     color: '#fff', // Couleur du texte
//     fontSize: 14, // Taille du texte
// },
// buttons:{
//   borderWidth:2,
//   borderColor:"orange",
//   borderRadius:5,
//   marginBottom:35,
//   paddingVertical: 5,
//   paddingHorizontal: 10,
// },
//   buttonText: {
//     color: '#FFF',
//     fontSize: 15,
//     textAlign: 'center',
//   },
//   container: {
//     padding: 20, 
//     color:"#000"   
//   },
//   item: {
//     padding: 15,
//     marginVertical: 8,
//     borderRadius: 20,
//     backgroundColor: '#fff',
//     // fontWeight:"bold",
//     // shadowColor: '#000',
//     // shadowOffset: { width: 0, height: 2 },
//     // shadowOpacity: 0.1,
//     // shadowRadius: 2.5,
//     // elevation: 2,
//   },
//   title: {
//     fontSize: 16,
//     color: '#000',
//     fontWeight:"bold",
//   },
// });

// export default Parttrois;


