import React from 'react';
import {ScrollView,View, Text,TouchableOpacity, StyleSheet,Image,ImageBackground, Linking} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';


type NavigationProp = StackNavigationProp<RootStackParamList, 'Accueil'>;
const Tarifs = () => {
  const navigation = useNavigation();
const handleFacebookLink = () => {
        const facebookUrl = "https://www.facebook.com"; // URF vers Facebook
        Linking.openURL(facebookUrl).catch((err) => console.error("Erreur d'ouverture de lien:", err));
    };

const handleTwitterLink = () => {
      const twitterUrl = "https://twitter.com"; //URL vers twitter
      Linking.openURL(twitterUrl).catch((err) => console.error("Erreur d'ouverture de lien:", err));
  };

const handleLinkedInLink = () => {
      const linkedInUrl = "https://www.linkedin.com"; // URL vers linkendine
      Linking.openURL(linkedInUrl).catch((err) => console.error("Erreur d'ouverture de lien:", err));
  }; 
  
//   return (
//     <View style={[styles.card, isPremium && styles.premiumCard]}>
//       <View style={styles.header}>
//         <Text style={styles.headerText}>{title}</Text>
//       </View>
//       <View style={styles.body} />
//       <TouchableOpacity style={styles.chooseButton}>
//         <Text style={styles.chooseButtonText}>choisir</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const Offres = () => {
//   const navigation = useNavigation(); // 👈 Utilisation de useNavigation()

  return (
    <View style={styles.container}>
      
      <ScrollView>
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
            <TouchableOpacity  onPress={handleFacebookLink}>
                <Icon name="facebook" size={15} color="black" style={{ marginRight: 10 }} />
            </TouchableOpacity>
            <TouchableOpacity  onPress={handleTwitterLink}>
                <Icon name="twitter" size={15} color="black" style={{ marginRight: 10 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLinkedInLink}>              
                <Icon name="linkedin" size={15} color="black" style={{ marginRight: 10 }} />  
           </TouchableOpacity>
          </View>
        </View>
        <ImageBackground source={require('../assets/fer.jpg')} style={styles.background}>
                <View style={styles.buttonContainer}>
                    {/* Accueil */}
                    <TouchableOpacity style={styles.rond} onPress={() => navigation.navigate('lis')}>
                        <View style={styles.iconWrapper}>
                            <Icon name="home" size={25} color="#000" />
                        </View>
                        <Text style={styles.button}>Accueil</Text>
                    </TouchableOpacity>
        
                    {/* Tarif */}
                    <TouchableOpacity style={styles.rond} onPress={() => navigation.navigate('Offres')}>
                        <View style={styles.iconWrapper}>
                            <Icon name="eur" size={25} color="#000" />
                        </View>
                        <Text style={styles.button}>Tarif</Text>
                    </TouchableOpacity>
        
                    {/* Contact */}
                    <TouchableOpacity style={styles.rond} onPress={() => navigation.navigate('Contact')}>
                        <View style={styles.iconWrapper}>
                            <Icon name="phone" size={25} color="#000" />
                        </View>
                        <Text style={styles.button}>Contact</Text>
                    </TouchableOpacity>
                </View>
        
                  {/* Navigation vers l'écran "Devenir" */}
                  <TouchableOpacity style={styles.buttons} onPress={() => navigation.navigate('Ac')}>
                    <Text style={styles.buttonText}>Devenir Client</Text>
                  </TouchableOpacity>
                </ImageBackground>

                <ScrollView style={styles.container}>
        
              {/* Offres */}
              <Text style={styles.sectionTitle}>Nos offres</Text>
              <View style={styles.containerRed}>
              <View style={styles.square} />
                <Text style={styles.text}>Sans engagement</Text>
              </View>
              <View style={styles.containerRed}>
              <View style={styles.square} />
                <Text style={styles.text}>Adaptés à vos besoins</Text>
              </View>
              <View style={styles.containerRed}>
              <View style={styles.square} />
                <Text style={styles.text}>Support  client gratuit</Text>
              </View>
              {[{
                plan: 'Basic',
                price: '235$/an',
                monthly: '20$/mois',
                features: [
                  'Pesee et encaissement',
                  'Un seul utilisateur',
                ],
                color: '#8B4513',
              },
               {
                plan: 'Standard',
                price: '590$/an',
                monthly: '50$/mois',
                features: [
                  'Pesee et encaissement',
                  'Facturation des fournisseurs',
                  'Tableaux de bord et statistiques',
                  'Jusqu{\'} à 10 utilisateurs',
                ],
                color: '#6C757D',
              }, {
                plan: 'Premium',
                price: '1150$/an',
                monthly: '100$/mois',
                features: [
                  'Gestion de la pesee',
                  'Encaissement des fournisseurs',
                  'Tableaux de bord et statistiques',
                  'Jusqu{\'} à 10 utilisateurs',
                ],
                color: '#DC3545',
              }].map((offer, index) => (
                <View key={index} style={[styles.card, { borderColor: offer.color }]}>  
                  <View style={[styles.cardHeader, { backgroundColor: offer.color }]}>  
                    <Text style={styles.cardTitle}>{offer.plan}</Text>  
                  </View>  
                  <View style={styles.cardBody}>  
                    <Text>{offer.monthly}</Text>  
                    <Text style={styles.price}>{offer.price}</Text>  
                    {offer.features.map((feature, i) => (  
                      <Text key={i} style={styles.feature}>{feature}</Text>  
                    ))}  
                    <TouchableOpacity style={[styles.chooseButton, { backgroundColor: offer.color }]}>  
                      <Text style={styles.chooseButtonText}>Choisir</Text>  
                    </TouchableOpacity>  
                  </View>  
                </View>
              ))}
        
            </ScrollView>
  
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex:1,
    // backgroundColor: '#F9E3D0',
    // paddingTop: 10,
    // paddingLeft: 2,
    // height: 800,
    marginTop:15,
  },
  containers: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    padding: 15,
    // marginTop:40,
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
    marginTop: 40,
  },
  clientButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  background: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 5,
    color: '#FFF',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row', // Aligner les icônes en ligne
    justifyContent: 'space-around', // Espacer les icônes
    marginVertical: 20,
},
rond: {
    alignItems: 'center', // Centrer l'icône et le texte verticalement
    margin:20,
},
iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30, // Cercle parfait
    backgroundColor: 'white',
    justifyContent: 'center', // Centrer l'icône horizontalement
    alignItems: 'center', // Centrer l'icône verticalement
    elevation: 5, // Ombre pour Android
    shadowColor: '#000', // Ombre pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
},
button: {
    marginTop: 8, // Espacement entre l'icône et le texte
    color: '#fff', // Couleur du texte
    fontSize: 14, // Taille du texte
},
buttons:{
  borderWidth:2,
  borderColor:"orange",
  borderRadius:5,
  marginBottom:35,
  paddingVertical: 5,
  paddingHorizontal: 10,
},
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    textAlign: 'center',
  },
  offresTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  offresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 400,
    height: 300,
  },
  containerRed: {
    flexDirection: 'row', // Aligne en ligne (horizontale)
    alignItems: 'center', // Centre verticalement
    marginVertical: 8, // Espacement vertical
    marginLeft:12,
  },
  square: {
    width: 14, // Largeur du carré
    height: 14, // Hauteur du carré
    backgroundColor: '#E64A19', // Couleur du carré (rouge-orangé)
    borderRadius: 4, // Coins arrondis
    marginRight: 10, // Espacement avec le texte
  },
  text: {
    fontSize: 16, // Taille du texte
    color: '#2E2E2E', // Couleur du texte (noir foncé)
    fontWeight: '600', // Épaisseur du texte (semi-gras)
  },
  // card: {
  //   backgroundColor: '#EAE1D2',
  //   borderRadius: 10,
  //   elevation: 5,
  //   width: '30%',
  //   margin: 5,
  // },
  premiumCard: {
    backgroundColor: '#D4B3A0',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#D4B3A0',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  body: {
    padding: 20,
  },
  // chooseButton: {
  //   backgroundColor: '#C65D3B',
  //   borderRadius: 5,
  //   padding: 5,
  //   margin: 10,
  //   marginTop: 150,
  //   alignItems: 'center',
  // },
  // chooseButtonText: {
  //   color: '#FFFFFF',
  //   fontWeight: 'bold',
  // },
  //  container: { flex: 1, backgroundColor: '#fff' },
  // header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  // title: { fontSize: 24, fontWeight: 'bold' },
  // clientButton: { backgroundColor: '#DC3545', padding: 10, borderRadius: 8 },
  // clientButtonText: { color: '#fff', fontWeight: 'bold' },

  navContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
  navButton: { borderWidth: 1, borderColor: '#DC3545', padding: 10, borderRadius: 8 },
  navButtonText: { color: '#DC3545', fontWeight: 'bold' },
  iconContainer: { alignItems: 'center' },
  icon: { fontSize: 30 },

  sectionTitle: { textAlign: 'center', fontSize: 24, marginVertical: 20 },

  card: { borderWidth: 2, borderRadius: 8, margin: 10 },
  cardHeader: { padding: 10, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  cardTitle: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  cardBody: { padding: 20 },
  price: { fontSize: 24, fontWeight: 'bold', marginVertical: 10 },
  feature: { marginVertical: 5 },

  chooseButton: { padding: 10, borderRadius: 8, marginTop: 20 },
  chooseButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },

});

export default Tarifs;
