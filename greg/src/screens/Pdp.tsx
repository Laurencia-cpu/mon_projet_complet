// import React, { useEffect, useState } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity,
//   Image, TextInput, Modal, Alert, ScrollView, Platform
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { launchImageLibrary } from 'react-native-image-picker';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const defaultAvatar = require('../assets/pdp.jpg');

// const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

// const ProfilScreen = () => {
//   const navigation = useNavigation();

//   const [entreprise, setEntreprise] = useState<any>(null);
//   const [email, setEmail] = useState('');
//   const [photoURL, setPhotoURL] = useState<string | null>(null);
//   const [open, setOpen] = useState(false);

//   const [showModal, setShowModal] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [showConfirmation, setShowConfirmation] = useState(false);

//   const [updatedSociete, setUpdatedSociete] = useState('');
//   const [updatedSiret, setUpdatedSiret] = useState('');
//   const [updatedTva, setUpdatedTva] = useState('');
//   const [updatedAdresse, setUpdatedAdresse] = useState('');
//   const [updatedTelephone, setUpdatedTelephone] = useState('');
//   const [updatedEmail, setUpdatedEmail] = useState('');

//   useEffect(() => {
//     const fetchData = async () => {
//       const token = await AsyncStorage.getItem('access');
//       if (!token) return;

//       try {
//         const res = await fetch(`${BASE_URL}/api/me/`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const data = await res.json();
//         setEntreprise(data.entreprise);
//         setEmail(data.email);

//         const profilPath = data.entreprise?.photo_profil;
//         if (profilPath) {
//           setPhotoURL(`${BASE_URL}${profilPath}`);
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleEdit = () => {
//     if (!entreprise) return;
//     setUpdatedSociete(entreprise.societe);
//     setUpdatedSiret(entreprise.siret);
//     setUpdatedTva(entreprise.tva);
//     setUpdatedAdresse(entreprise.adresse);
//     setUpdatedTelephone(entreprise.telephone);
//     setUpdatedEmail(email);
//     setShowModal(true);
//   };

//   const handleConfirmedUpdate = async () => {
//     const token = await AsyncStorage.getItem('access');
//     if (!token || !entreprise) return;

//     try {
//       const entrepriseRes = await fetch(`${BASE_URL}/api/entreprises/${entreprise.id}/`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           societe: updatedSociete,
//           siret: updatedSiret,
//           tva: updatedTva,
//           adresse: updatedAdresse,
//           telephone: updatedTelephone,
//         }),
//       });

//       if (!entrepriseRes.ok) throw new Error('Échec mise à jour entreprise');
//       const updatedEntreprise = await entrepriseRes.json();
//       setEntreprise(updatedEntreprise);

//       const emailRes = await fetch(`${BASE_URL}/api/update-email/`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ email: updatedEmail }),
//       });

//       if (!emailRes.ok) throw new Error('Échec mise à jour email');
//       const emailData = await emailRes.json();
//       setEmail(emailData.email);
//       setShowConfirmation(false);
//       setShowSuccess(true);
//       setTimeout(() => setShowSuccess(false), 3000);
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Erreur', "La mise à jour a échoué.");
//     }
//   };

//   const handlePickImage = async () => {
//     const token = await AsyncStorage.getItem('access');
//     if (!entreprise?.slug || !token) return;

//     const result = await launchImageLibrary({
//       mediaType: 'photo',
//       quality: 0.7,
//     });

//     if (result.assets && result.assets.length > 0) {
//       const formData = new FormData();
//       const image = result.assets[0];
//       formData.append('profil', {
//         uri: image.uri!,
//         type: image.type!,
//         name: image.fileName!,
//       });

//       try {
//         const res = await fetch(`${BASE_URL}/api/entreprises/${entreprise.slug}/upload-profil/`, {
//           method: 'POST',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'multipart/form-data',
//           },
//           body: formData,
//         });

//         const data = await res.json();
//         setPhotoURL(`${BASE_URL}${data.profil_url}`);
//       } catch (err) {
//         console.error(err);
//         Alert.alert('Erreur', 'Échec du téléchargement de la photo');
//       }
//     }
//   };

//   const handleDeletePhoto = async () => {
//     const token = await AsyncStorage.getItem('access');
//     if (!entreprise?.slug || !token) return;

//     try {
//       const res = await fetch(`${BASE_URL}/api/entreprises/${entreprise.slug}/delete-profil/`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error('Suppression échouée');
//       setPhotoURL(null);
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Erreur', 'Échec de la suppression');
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {showSuccess && (
//         <View style={styles.successBox}>
//           <Text style={styles.successText}>Mise à jour réussie !</Text>
//         </View>
//       )}

//       <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//         <Text style={styles.backText}>← Retour</Text>
//       </TouchableOpacity>

//       <Text style={styles.title}>Profil</Text>

//       <TouchableOpacity onPress={() => setOpen(!open)}>
//         <Image
//           source={photoURL ? { uri: photoURL } : defaultAvatar}
//           style={styles.avatar}
//         />
//       </TouchableOpacity>

//       {open && (
//         <View style={styles.optionBox}>
//           {photoURL ? (
//             <>
//               <TouchableOpacity onPress={handlePickImage}>
//                 <Text style={styles.option}>Modifier photo</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={handleDeletePhoto}>
//                 <Text style={styles.option}>Supprimer photo</Text>
//               </TouchableOpacity>
//             </>
//           ) : (
//             <TouchableOpacity onPress={handlePickImage}>
//               <Text style={styles.option}>Ajouter photo</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       )}

//       <View style={styles.infoBox}>
//         <Text>Entreprise: {entreprise?.societe}</Text>
//         <Text>Adresse: {entreprise?.adresse}</Text>
//         <Text>SIRET: {entreprise?.siret}</Text>
//         <Text>TVA: {entreprise?.tva}</Text>
//         <Text>Téléphone: {entreprise?.telephone}</Text>
//         <Text>Email: {email}</Text>
//       </View>

//       <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
//         <Text style={styles.editButtonText}>Modifier les infos</Text>
//       </TouchableOpacity>

//       {/* Modal modification */}
//       <Modal visible={showModal} animationType="slide">
//         <ScrollView style={styles.modalContent}>
//           <Text style={styles.modalTitle}>Modifier l'entreprise</Text>
//           <TextInput style={styles.input} placeholder="Société" value={updatedSociete} onChangeText={setUpdatedSociete} />
//           <TextInput style={styles.input} placeholder="SIRET" value={updatedSiret} onChangeText={setUpdatedSiret} />
//           <TextInput style={styles.input} placeholder="TVA" value={updatedTva} onChangeText={setUpdatedTva} />
//           <TextInput style={styles.input} placeholder="Adresse" value={updatedAdresse} onChangeText={setUpdatedAdresse} />
//           <TextInput style={styles.input} placeholder="Téléphone" value={updatedTelephone} onChangeText={setUpdatedTelephone} />
//           <TextInput style={styles.input} placeholder="Email" value={updatedEmail} onChangeText={setUpdatedEmail} />
//           <View style={styles.modalButtons}>
//             <TouchableOpacity onPress={() => setShowModal(false)} style={styles.cancelBtn}>
//               <Text style={{ color: 'white' }}>Annuler</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => { setShowModal(false); setShowConfirmation(true); }} style={styles.saveBtn}>
//               <Text style={{ color: 'white' }}>Sauvegarder</Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </Modal>

//       {/* Modal confirmation */}
//       <Modal visible={showConfirmation} transparent animationType="fade">
//         <View style={styles.confirmationOverlay}>
//           <View style={styles.confirmationBox}>
//             <Text style={styles.confirmationText}>Confirmer les modifications ?</Text>
//             <View style={styles.modalButtons}>
//               <TouchableOpacity onPress={() => setShowConfirmation(false)} style={styles.cancelBtn}>
//                 <Text style={{ color: 'white' }}>Annuler</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={handleConfirmedUpdate} style={styles.saveBtn}>
//                 <Text style={{ color: 'white' }}>Confirmer</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { padding: 20 },
//   title: { fontSize: 26, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
//   backBtn: { marginBottom: 10 },
//   backText: { color: 'blue' },
//   avatar: { width: 150, height: 150, borderRadius: 75, alignSelf: 'center', marginVertical: 10 },
//   optionBox: { alignItems: 'center', marginBottom: 10 },
//   option: { color: 'blue', padding: 5 },
//   infoBox: { marginVertical: 10 },
//   editButton: { backgroundColor: '#e5461a', padding: 10, borderRadius: 5, alignItems: 'center' },
//   editButtonText: { color: 'white' },
//   modalContent: { padding: 20 },
//   modalTitle: { fontSize: 20, marginBottom: 10 },
//   input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 },
//   modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
//   cancelBtn: { backgroundColor: 'gray', padding: 10, borderRadius: 5 },
//   saveBtn: { backgroundColor: '#28a745', padding: 10, borderRadius: 5 },
//   successBox: { backgroundColor: '#d4edda', padding: 10, borderRadius: 5, marginBottom: 10 },
//   successText: { color: '#155724', textAlign: 'center' },
//   confirmationOverlay: {
//     flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'
//   },
//   confirmationBox: {
//     backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%'
//   },
//   confirmationText: { fontSize: 18, marginBottom: 20, textAlign: 'center' }
// });

// export default ProfilScreen;







// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   StyleSheet,
//   Modal,
//   ScrollView,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import { useNavigation } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { RootStackParamList } from '../../App';

// // Définir le type de navigation
// type NavigationProp = StackNavigationProp<RootStackParamList, 'Accueil'>;


// const API_BASE_URL = 'http://10.0.2.2:8000/api';

// type Entreprise = {
//   id: number;
//   societe: string;
//   slug: string;
//   photo_profil?: string | null;
// };

// export default function ProfileScreen() {
//   const [loading, setLoading] = useState(true);
//   const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const navigation = useNavigation<NavigationProp>();

//   // Récupérer données
//   const fetchUserData = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('access');
//       if (!token) throw new Error('Token manquant');
//       const res = await fetch(`${API_BASE_URL}/me/`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error(`Erreur API ${res.status}`);
//       const data = await res.json();
//       setEntreprise(data.entreprise);
//     } catch (e: any) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Upload photo
//   const uploadProfilePhoto = async (photo: any) => {
//     if (!entreprise) return;
//     const token = await AsyncStorage.getItem('access');
//     if (!token) return;
//     const formData = new FormData();
//     formData.append('photo_profil', {
//       uri: photo.uri,
//       name: photo.fileName || 'photo.jpg',
//       type: photo.type || 'image/jpeg',
//     } as any);
//     setUploading(true);
//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/entreprises/${entreprise.slug}/upload-profil/`,
//         {
//           method: 'PATCH',
//           headers: { Authorization: `Bearer ${token}` },
//           body: formData,
//         }
//       );
//       if (!res.ok) {
//         const err = await res.text();
//         Alert.alert('Erreur', err);
//         return;
//       }
//       Alert.alert('Succès', 'Photo mise à jour');
//       fetchUserData();
//     } catch (e: any) {
//       Alert.alert('Erreur', e.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   // Supprimer photo
//   const deleteProfilePhoto = async () => {
//     if (!entreprise) return;
//     const token = await AsyncStorage.getItem('access');
//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/entreprises/${entreprise.slug}/delete-profil/`,
//         {
//           method: 'DELETE',
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       if (!res.ok) {
//         const msg = await res.text();
//         Alert.alert('Erreur', msg);
//         return;
//       }
//       Alert.alert('Supprimée', 'Photo supprimée');
//       fetchUserData();
//     } catch (e: any) {
//       Alert.alert('Erreur', e.message);
//     }
//   };

//   const onChangePhoto = () => {
//     Alert.alert('Photo', 'Choisissez une option', [
//       {
//         text: 'Prendre photo',
//         onPress: () => {
//           launchCamera({ mediaType: 'photo' }, (res) => {
//             if (res.assets?.[0]) uploadProfilePhoto(res.assets[0]);
//           });
//         },
//       },
//       {
//         text: 'Depuis la galerie',
//         onPress: () => {
//           launchImageLibrary({ mediaType: 'photo' }, (res) => {
//             if (res.assets?.[0]) uploadProfilePhoto(res.assets[0]);
//           });
//         },
//       },
//       { text: 'Annuler', style: 'cancel' },
//     ]);
//   };

//   const onLogout = async () => {
//     await AsyncStorage.clear();
//     Alert.alert('Déconnecté', 'Vous avez été déconnecté.');
//     // Naviguer vers login ici si il y en a
//   };

//   useEffect(() => {
//     fetchUserData();
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.center}>
//         <Text style={{ color: 'red' }}>Erreur : {error}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity onPress={() => navigation.navigate('Profil')}>
//         <Image
//           source={require('../assets/pdp.jpg')}
//           style={styles.avatarSmall}
//         />
//       </TouchableOpacity>

//       {/* <TouchableOpacity onPress={() => setModalVisible(true)}>

//         <Image
//           source={
//             entreprise?.photo_profil
//               ? { uri: `${entreprise.photo_profil}?t=${Date.now()}` }
//               : require('../assets/pdp.jpg')
//           }
//           style={styles.avatarSmall}
//         />
//       </TouchableOpacity> */}
//       <Text style={styles.societeText}>{entreprise?.societe}</Text>

//       {/* Modal */}
//       <Modal
//         visible={modalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Image
//               source={
//                 entreprise?.photo_profil
//                   ? { uri: `${entreprise.photo_profil}?t=${Date.now()}` }
//                   : require('../assets/pdp.jpg')
//               }
//               style={styles.avatarLarge}
//               resizeMode="cover"
//             />

//             <TouchableOpacity style={styles.button} onPress={onChangePhoto} disabled={uploading}>
//               <Text style={styles.buttonText}>
//                 {uploading ? 'Chargement...' : 'Changer la photo'}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.button, { backgroundColor: 'orange' }]}
//               onPress={deleteProfilePhoto}
//               disabled={uploading}
//             >
//               <Text style={styles.buttonText}>Supprimer la photo</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.button, { backgroundColor: 'red' }]}
//               onPress={onLogout}
//             >
//               <Text style={styles.buttonText}>Se déconnecter</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.button, { backgroundColor: '#999' }]}
//               onPress={() => setModalVisible(false)}
//             >
//               <Text style={styles.buttonText}>Fermer</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   avatarSmall: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     borderWidth: 2,
//     borderColor: '#ccc',
//     marginTop:20,
//   },
//   avatarLarge: {
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     borderWidth: 2,
//     borderColor: '#ccc',
//     marginBottom: 10,
//   },
//   societeText: {
//     fontSize: 18,
//     // fontWeight: 'bold',
//     marginTop: 10,
//   },
//   button: {
//     backgroundColor: '#0066cc',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     marginVertical: 5,
//     width: '100%',
//   },
//   buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 20,
//     width: '100%',
//     maxWidth: 350,
//     alignItems: 'center',
//   },
// });


import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Ampifanaraho amin'ny firafitry ny fampiharanao ity
// Aoka ho azo antoka fa misy 'Login' na izay anaran'ny pejy fidiranao
// ao anatin'ny RootStackParamList ao amin'ny App.tsx na izay misy azy
export type RootStackParamList = {
  Accueil: undefined;
  Profil: undefined; // Efa misy
  Login: undefined; // Ampiana ity
};

// --- Aza ovaina manomboka eto raha efa mety ---

// Définir le type de navigation
type NavigationProp = StackNavigationProp<RootStackParamList, 'Accueil'>;

// Ataovy anaty variable ny adiresy, tandremo raha an-téléphone no andramana
// dia mila ny IP an'ny solosaina fa tsy 10.0.2.2
const API_BASE_URL = 'http://10.0.2.2:8000/api';

type Entreprise = {
  id: number;
  societe: string;
  slug: string;
  photo_profil?: string | null;
};

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  // Récupérer données
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access');
      if (!token) throw new Error('Token manquant, veuillez vous reconnecter.');
      const res = await fetch(`${API_BASE_URL}/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Erreur API ${res.status}`);
      const data = await res.json();
      setEntreprise(data.entreprise);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Upload photo
  const uploadProfilePhoto = async (photo: any) => {
    if (!entreprise) return;
    const token = await AsyncStorage.getItem('access');
    if (!token) return;
   // In ProfileScreen.tsx inside uploadProfilePhoto function

const formData = new FormData();
// 1. Ovaina ho 'profil' ny anaran'ny champ
formData.append('profil', { 
  uri: photo.uri,
  name: photo.fileName || 'photo.jpg',
  type: photo.type || 'image/jpeg',
} as any);

setUploading(true);
try {
  const res = await fetch(
    `${API_BASE_URL}/entreprises/${entreprise.slug}/upload-profil/`,
    {
      method: 'POST', // 2. Ovaina ho 'POST' ny méthode
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }
  );
  // ... ny tohiny dia mitovy
      if (!res.ok) {
        const err = await res.text();
        Alert.alert('Erreur', err);
        return;
      }
      Alert.alert('Succès', 'Photo mise à jour');
      await fetchUserData(); // Antsoina indray mba haka ny sary vaovao
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setUploading(false);
      setModalVisible(false); // Akatona ny modal aorian'ny upload
    }
  };

  // Supprimer photo
  const deleteProfilePhoto = async () => {
    if (!entreprise) return;
    const token = await AsyncStorage.getItem('access');
    if (!token) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/entreprises/${entreprise.slug}/delete-profil/`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const msg = await res.text();
        Alert.alert('Erreur', msg);
        return;
      }
      Alert.alert('Supprimée', 'Photo supprimée');
      await fetchUserData(); // Haka ny sata vaovao (tsy misy sary)
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
        setModalVisible(false); // Akatona ny modal
    }
  };

  const onChangePhoto = () => {
    Alert.alert('Photo de profil', 'Choisissez une option', [
      {
        text: 'Prendre une photo',
        onPress: () => {
          launchCamera({ mediaType: 'photo', quality: 0.7 }, (res) => {
            if (res.didCancel) return;
            if (res.assets?.[0]) uploadProfilePhoto(res.assets[0]);
          });
        },
      },
      {
        text: 'Choisir depuis la galerie',
        onPress: () => {
          launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (res) => {
            if (res.didCancel) return;
            if (res.assets?.[0]) uploadProfilePhoto(res.assets[0]);
          });
        },
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const onLogout = async () => {
    await AsyncStorage.clear();
    Alert.alert('Déconnecté', 'Vous avez été déconnecté.');
    // Miverina any amin'ny pejy fidirana
    // Mampiasa 'replace' mba tsy hahafahan'ny mpampiasa miverina amin'ny alalan'ny bokotra "back"
    navigation.replace('Login');
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Erreur : {error}</Text>
        <TouchableOpacity style={styles.button} onPress={fetchUserData}>
           <Text style={styles.buttonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Ity no bokotra marina manokatra ny modal */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image
          source={
            entreprise?.photo_profil
              ? { uri: `${entreprise.photo_profil}?t=${Date.now()}` }
              : require('../assets/pdp.jpg')
          }
          style={styles.avatarSmall}
        />
      </TouchableOpacity>
      <Text style={styles.societeText}>{entreprise?.societe}</Text>

      {/* Modal ho an'ny sary sy ny safidy */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image
              source={
                entreprise?.photo_profil
                  ? { uri: `${entreprise.photo_profil}?t=${Date.now()}` }
                  : require('../assets/pdp.jpg')
              }
              style={styles.avatarLarge}
              resizeMode="cover"
            />

            <TouchableOpacity style={styles.button} onPress={onChangePhoto} disabled={uploading}>
              <Text style={styles.buttonText}>
                {uploading ? 'Chargement...' : 'Changer la photo'}
              </Text>
            </TouchableOpacity>

            {entreprise?.photo_profil && ( // Asehoy fotsiny raha misy sary
                 <TouchableOpacity
                 style={[styles.button, { backgroundColor: 'orange' }]}
                 onPress={deleteProfilePhoto}
                 disabled={uploading}
               >
                 <Text style={styles.buttonText}>Supprimer la photo</Text>
               </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: 'red' }]}
              onPress={onLogout}
            >
              <Text style={styles.buttonText}>Se déconnecter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#999' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, alignItems: 'center', paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  avatarLarge: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  societeText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 8,
    width: '100%',
    elevation: 2, // Android shadow
  },
  buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
});