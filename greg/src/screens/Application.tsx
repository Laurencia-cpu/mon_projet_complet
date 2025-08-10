import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  useColorScheme,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Pdp from './Pdp'; // Composant pour photo de profil

type ListeNavigationPrincipale = {
  EspaceClient: undefined;
  EcranConfiguration: undefined;
  EcranExploitation: undefined;
  EcranEdition: undefined;
  SupplierDashord: undefined;
  TypeMetaux: undefined;
  LieuCollecte: undefined;
  GrilleTarifaire: undefined;
  CollecteEnregistre: undefined;
  Tournee: undefined;
  Stock: undefined;
  CorrigerCollecte: undefined;
  FusionLotsScreen: undefined;
  HistoriqueCorrection: undefined;
  StatQuantite: undefined;
  Depense: undefined;
  Performance: undefined;
  FusionLots: undefined;
};

type TypeNavigation = StackNavigationProp<ListeNavigationPrincipale>;

const { width } = Dimensions.get('window');

const CATEGORIES = [
  {
    title: 'CONFIGURATION',
    items: ['Créer types de métaux', 'Définir lieux de collecte', 'Grille tarifaire'],
  },
  {
    title: 'EXPLOITATION',
    items: ['Enregistrer collectes', 'Suivi des tournées', 'Gérer les stocks'],
  },
  {
    title: 'EDITION',
    items: ['Corriger collectes', 'Fusionner des lots', 'Historique des corrections '],
  },
  {
    title: 'STATISTIQUES',
    items: ['Quantité récupérée', 'Depense', 'Analyse des performances'],
  },
];

const Application = () => {
  const navigation = useNavigation<TypeNavigation>();
  const [chargement, setChargement] = useState(true);
  const [entreprise, setEntreprise] = useState({
    nom: '',
    email: '',
    adresse: '',
    siret: '',
    tva: '',
    telephone: '',
    logo: '',
  });

  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const verifierToken = async () => {
      const token = await AsyncStorage.getItem('access');
      if (!token) {
        navigation.navigate('EspaceClient');
        return;
      }

      try {
        const res = await fetch('http://10.0.2.2:8000/api/me/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorDetails = await res.text();
          console.error('Erreur brut:', errorDetails);
          throw new Error('Erreur lors de la récupération des données.');
        }

        const data = await res.json();
        console.log('Entreprise connectée :', data);
        setEntreprise(data.entreprise);
      } catch (error) {
        console.error("Erreur lors du chargement de l'entreprise :", error);
        Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter.');
        await AsyncStorage.multiRemove(['access', 'refresh']);
        navigation.navigate('EspaceClient');
      } finally {
        setChargement(false);
      }
    };

    verifierToken();
  }, [navigation]);

  useEffect(() => {
    const refreshAccessToken = async () => {
      const currentRefreshToken = await AsyncStorage.getItem('refresh');
      if (!currentRefreshToken) return;

      try {
        const response = await fetch('http://10.0.2.2:8000/api/refresh/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: currentRefreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          await AsyncStorage.setItem('access', data.access);
          if (data.refresh) {
            await AsyncStorage.setItem('refresh', data.refresh);
          }
          console.log('🔄 Token rafraîchi automatiquement');
        } else {
          console.warn('⚠️ Refresh token expiré ou invalide');
          await AsyncStorage.multiRemove(['access', 'refresh']);
          navigation.navigate('EspaceClient');
        }
      } catch (err) {
        console.error('Erreur lors du refresh :', err);
      }
    };

    const intervalId = setInterval(refreshAccessToken, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [navigation]);

  if (chargement) {
    return (
      <View style={styles.zoneChargement}>
        <ActivityIndicator size="large" color="#A45C40" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={[styles.conteneur, { backgroundColor: isDarkMode ? '#222' : '#F5EFE3' }]}>
        {/* En-tête */}
        <View style={styles.entete}>
          <Image source={require('../assets/gestion.png')} style={styles.logoApp} />
          <View style={styles.sectionUtilisateur}>
            <Pdp />
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.container}>
          {CATEGORIES.map((category, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{category.title}</Text>
              {category.items.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.button}
                  onPress={() => {
                    switch (item) {
                      case 'Créer types de métaux':
                        navigation.navigate('TypeMetaux');
                        break;
                      case 'Définir lieux de collecte':
                        navigation.navigate('LieuCollecte');
                        break;
                      case 'Grille tarifaire':
                        navigation.navigate('GrilleTarifaire');
                        break;
                      case 'Enregistrer collectes':
                        navigation.navigate('CollecteEnregistre');
                        break;
                      case 'Suivi des tournées':
                        navigation.navigate('Tournee');
                        break;
                      case 'Gérer les stocks':
                        navigation.navigate('Stock');
                        break;
                      case 'Corriger collectes':
                        navigation.navigate('CorrigerCollecte');
                        break;
                      case 'Fusionner des lots':
                        navigation.navigate('FusionLots');
                        break;
                      case 'Historique des corrections ':
                        navigation.navigate('HistoriqueCorrection');
                        break;
                      case 'Quantité récupérée':
                        navigation.navigate('StatQuantite');
                        break;
                      case 'Depense':
                        navigation.navigate('Depense');
                        break;
                      case 'Analyse des performances':
                        navigation.navigate('Performance');
                        break;
                      default:
                        console.warn('Action non définie pour :', item);
                    }
                  }}
                >
                  <Text style={styles.buttonText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Pied de page */}
        <View style={styles.pied}>
          <Text style={styles.textePied}>{entreprise.nom}</Text>
          <Text style={styles.textePied}>{entreprise.adresse}</Text>
          <Text style={styles.textePied}>
            SIRET : {entreprise.siret} | TVA : {entreprise.tva}
          </Text>
          <Text style={styles.textePied}>
            Téléphone : {entreprise.telephone} | Email : {entreprise.email}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

// const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  conteneur: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  entete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 50,
  },
  logoApp: {
    width: width * 0.3,
    height: 40,
    resizeMode: 'contain',
  },
  sectionUtilisateur: {
    alignItems: 'center',
    marginTop: -20,
    marginRight: 20,
  },
  container: {
    padding: 16,
  },
  card: {
    width: '100%',
    backgroundColor: '#f3f3f3',
    padding: 16,
    marginBottom: 20,
    borderRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
    color: '#6e4e2e',
  },
  button: {
    marginBottom: 10,
    backgroundColor: '#e8e8e8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 14,
  },
  pied: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#f0e6d2',
    marginTop: 40,
  },
  textePied: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  zoneChargement: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Application;


// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
//   Dimensions,
//   useColorScheme,
//   ScrollView,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Pdp from './Pdp';


// // Types de navigation
// type ListeNavigationPrincipale = {
//   EspaceClient: undefined;
//   EcranConfiguration: undefined;
//   EcranExploitation: undefined;
//   EcranEdition: undefined;
//   SupplierDashord: undefined;
//   TypeMetaux: undefined;
//   LieuCollecte: undefined;
//   GrilleTarifaire: undefined;
//   CollecteEnregistre: undefined;
//   Tournee: undefined;
//   Stock: undefined;
//   CorrigerCollecte: undefined;
//   FusionLotsScreen: undefined;
//   HistoriqueCorrection: undefined;
//   StatQuantite: undefined;
//   Depense: undefined;
//   Performance: undefined;
//   FusionLots:undefined;
// };

// type TypeNavigation = StackNavigationProp<ListeNavigationPrincipale>;

// const { width } = Dimensions.get('window');

// const CATEGORIES = [
//   {
//     title: 'CONFIGURATION',
//     items: ['Créer types de métaux', 'Définir lieux de collecte', 'Grille tarifaire'],
//   },
//   {
//     title: 'EXPLOITATION',
//     items: ['Enregistrer collectes', 'Suivi des tournées', 'Gérer les stocks'],
//   },
//   {
//     title: 'EDITION',
//     items: ['Corriger collectes', 'Fusionner des lots', 'Historique des corrections '],
//   },
//   {
//     title: 'STATISTIQUES',
//     items: ['Quantité récupérée', 'Depense', 'Analyse des performances'],
//   },
// ];

// const Application = () => {
//   const navigation = useNavigation<TypeNavigation>();
//   const [chargement, setChargement] = useState(true);
//   const [entreprise, setEntreprise] = useState({
//     nom: '',
//     email: '',
//     adresse: '',
//     siret: '',
//     tva: '',
//     telephone: '',
//     logo: '',
//   });

//   const isDarkMode = useColorScheme() === 'dark';

//   useEffect(() => {
//     const verifierToken = async () => {
//       const token = await AsyncStorage.getItem('access');
//       if (!token) {
//         navigation.navigate('EspaceClient');
//         return;
//       }

//       fetch('http://10.0.2.2:8000/api/me/', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })
//         .then(async (res) => {
//           if (!res.ok) {
//             const errorDetails = await res.text();
//             console.error('Erreur brut:', errorDetails);
//             throw new Error('Erreur lors de la récupération des données.');
//           }
//           return res.json();
//         })
//         .then((data) => {
//           console.log('Entreprise connectée :', data);
//           setEntreprise(data.entreprise);
//         })
//         .catch((error) => {
//           console.error("Erreur lors du chargement de l'entreprise :", error);
//         })
//         .finally(() => setChargement(false));
//     };

//     verifierToken();
//   }, [navigation]);

//   if (chargement) {
//     return (
//       <View style={styles.zoneChargement}>
//         <ActivityIndicator size="large" color="#A45C40" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.scrollContainer}>
//       <View style={[styles.conteneur, { backgroundColor: isDarkMode ? '#222' : '#F5EFE3' }]}>
//         {/* En-tête */}
//         <View style={styles.entete}>
//           <Image source={require('../assets/gestion.png')} style={styles.logoApp} />
//           <View style={styles.sectionUtilisateur}>
//             <Pdp />
//             {/* <Text style={styles.nomUtilisateur}>{entreprise.nom || 'Nom non disponible'}</Text> */}
//           </View>
//         </View>

//         {/* Navigation par catégories */}
//         <View style={styles.container}>
//           {CATEGORIES.map((category, index) => (
//             <View key={index} style={styles.card}>
//               <Text style={styles.cardTitle}>{category.title}</Text>
//               {category.items.map((item, idx) => (
//                 <TouchableOpacity
//                   key={idx}
//                   style={styles.button}
//                   onPress={() => {
//                     switch (item) {
//                       case 'Créer types de métaux':
//                         navigation.navigate('TypeMetaux');
//                         break;
//                       case 'Définir lieux de collecte':
//                         navigation.navigate('LieuCollecte');
//                         break;
//                       case 'Grille tarifaire':
//                         navigation.navigate('GrilleTarifaire');
//                         break;
//                       case 'Enregistrer collectes':
//                         navigation.navigate('CollecteEnregistre');
//                         break;
//                       case 'Suivi des tournées':
//                         navigation.navigate('Tournee');
//                         break;
//                       case 'Gérer les stocks':
//                         navigation.navigate('Stock');
//                         break;
//                       case 'Corriger collectes':
//                         navigation.navigate('CorrigerCollecte');
//                         break;
//                       case 'Fusionner des lots':
//                         navigation.navigate('FusionLots');
//                         break;
//                       case 'Historique des corrections ':
//                         navigation.navigate('HistoriqueCorrection');
//                         break;
//                       case 'Quantité récupérée':
//                         navigation.navigate('StatQuantite');
//                         break;
//                       case 'Depense':
//                         navigation.navigate('Depense');
//                         break;
//                       case 'Analyse des performances':
//                         navigation.navigate('Performance');
//                         break;
//                       default:
//                         console.warn('Action non définie pour :', item);
//                     }
//                   }}
//                 >
//                   <Text style={styles.buttonText}>{item}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           ))}
//         </View>

//         {/* Déconnexion (optionnel, à décommenter si besoin) */}
//         {/* <TouchableOpacity
//           onPress={async () => {
//             await AsyncStorage.removeItem('access');
//             navigation.navigate('EspaceClient');
//           }}
//           style={styles.boutonDeconnexion}
//         >
//           <Text style={styles.texteDeconnexion}>Se déconnecter</Text>
//         </TouchableOpacity> */}

//         {/* Pied de page */}
//         <View style={styles.pied}>
//           <Text style={styles.textePied}>{entreprise.nom}</Text>
//           <Text style={styles.textePied}>{entreprise.adresse}</Text>
//           <Text style={styles.textePied}>
//             SIRET : {entreprise.siret} | TVA : {entreprise.tva}
//           </Text>
//           <Text style={styles.textePied}>
//             Téléphone : {entreprise.telephone} | Email : {entreprise.email}
//           </Text>
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   scrollContainer: {
//     flexGrow: 1,
//   },
//   conteneur: {
//     flex: 1,
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingBottom: 30,
//   },
//   entete: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     paddingTop: 50,
//   },
//   logoApp: {
//     width: width * 0.3,
//     height: 40,
//     resizeMode: 'contain',
//   },
//   sectionUtilisateur: {
//     alignItems: 'center',
//     marginTop: -20,
//     marginRight:20,
//   },
//   nomUtilisateur: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#A45C40',
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   container: {
//     padding: 16,
//   },
//   card: {
//     width: '100%',
//     backgroundColor: '#f3f3f3',
//     padding: 16,
//     marginBottom: 20,
//     borderRadius: 10,
//     elevation: 2,
//   },
//   cardTitle: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginBottom: 12,
//     color: '#6e4e2e',
//   },
//   button: {
//     marginBottom: 10,
//     backgroundColor: '#e8e8e8',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//   },
//   buttonText: {
//     fontSize: 14,
//   },
//   boutonDeconnexion: {
//     marginTop: 20,
//   },
//   texteDeconnexion: {
//     color: 'red',
//     fontWeight: 'bold',
//   },
//   pied: {
//     alignItems: 'center',
//     paddingVertical: 20,
//     borderTopWidth: 1,
//     borderColor: '#DDD',
//     backgroundColor: '#f0e6d2',
//     marginTop: 40,
//   },
//   textePied: {
//     fontSize: 13,
//     color: '#666',
//     textAlign: 'center',
//   },
//   zoneChargement: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default Application;
