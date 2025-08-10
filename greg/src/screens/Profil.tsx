import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, TextInput, Modal, Alert, ScrollView, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultAvatar = require('../assets/pdp.jpg');

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

const ProfilScreen = () => {
  const navigation = useNavigation();

  const [entreprise, setEntreprise] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [updatedSociete, setUpdatedSociete] = useState('');
  const [updatedSiret, setUpdatedSiret] = useState('');
  const [updatedTva, setUpdatedTva] = useState('');
  const [updatedAdresse, setUpdatedAdresse] = useState('');
  const [updatedTelephone, setUpdatedTelephone] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('access');
      if (!token) return;

      try {
        const res = await fetch(`${BASE_URL}/api/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setEntreprise(data.entreprise);
        setEmail(data.email);

        const profilPath = data.entreprise?.photo_profil;
        if (profilPath) {
          setPhotoURL(`${BASE_URL}${profilPath}`);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleEdit = () => {
    if (!entreprise) return;
    setUpdatedSociete(entreprise.societe);
    setUpdatedSiret(entreprise.siret);
    setUpdatedTva(entreprise.tva);
    setUpdatedAdresse(entreprise.adresse);
    setUpdatedTelephone(entreprise.telephone);
    setUpdatedEmail(email);
    setShowModal(true);
  };

  const handleConfirmedUpdate = async () => {
    const token = await AsyncStorage.getItem('access');
    if (!token || !entreprise) return;

    try {
      const entrepriseRes = await fetch(`${BASE_URL}/api/entreprises/${entreprise.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          societe: updatedSociete,
          siret: updatedSiret,
          tva: updatedTva,
          adresse: updatedAdresse,
          telephone: updatedTelephone,
        }),
      });

      if (!entrepriseRes.ok) throw new Error('Échec mise à jour entreprise');
      const updatedEntreprise = await entrepriseRes.json();
      setEntreprise(updatedEntreprise);

      const emailRes = await fetch(`${BASE_URL}/api/update-email/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: updatedEmail }),
      });

      if (!emailRes.ok) throw new Error('Échec mise à jour email');
      const emailData = await emailRes.json();
      setEmail(emailData.email);
      setShowConfirmation(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', "La mise à jour a échoué.");
    }
  };

  const handlePickImage = async () => {
    const token = await AsyncStorage.getItem('access');
    if (!entreprise?.slug || !token) return;

    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });

    if (result.assets && result.assets.length > 0) {
      const formData = new FormData();
      const image = result.assets[0];
      formData.append('profil', {
        uri: image.uri!,
        type: image.type!,
        name: image.fileName!,
      });

      try {
        const res = await fetch(`${BASE_URL}/api/entreprises/${entreprise.slug}/upload-profil/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        const data = await res.json();
        setPhotoURL(`${BASE_URL}${data.profil_url}`);
      } catch (err) {
        console.error(err);
        Alert.alert('Erreur', 'Échec du téléchargement de la photo');
      }
    }
  };

  const handleDeletePhoto = async () => {
    const token = await AsyncStorage.getItem('access');
    if (!entreprise?.slug || !token) return;

    try {
      const res = await fetch(`${BASE_URL}/api/entreprises/${entreprise.slug}/delete-profil/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Suppression échouée');
      setPhotoURL(null);
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Échec de la suppression');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {showSuccess && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>Mise à jour réussie !</Text>
        </View>
      )}

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Profil</Text>

      <TouchableOpacity onPress={() => setOpen(!open)}>
        <Image
          source={photoURL ? { uri: photoURL } : defaultAvatar}
          style={styles.avatar}
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.optionBox}>
          {photoURL ? (
            <>
              <TouchableOpacity onPress={handlePickImage}>
                <Text style={styles.option}>Modifier photo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeletePhoto}>
                <Text style={styles.option}>Supprimer photo</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={handlePickImage}>
              <Text style={styles.option}>Ajouter photo</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.infoBox}>
        <Text>Entreprise: {entreprise?.societe}</Text>
        <Text>Adresse: {entreprise?.adresse}</Text>
        <Text>SIRET: {entreprise?.siret}</Text>
        <Text>TVA: {entreprise?.tva}</Text>
        <Text>Téléphone: {entreprise?.telephone}</Text>
        <Text>Email: {email}</Text>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <Text style={styles.editButtonText}>Modifier les infos</Text>
      </TouchableOpacity>

      {/* Modal modification */}
      <Modal visible={showModal} animationType="slide">
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>Modifier l'entreprise</Text>
          <TextInput style={styles.input} placeholder="Société" value={updatedSociete} onChangeText={setUpdatedSociete} />
          <TextInput style={styles.input} placeholder="SIRET" value={updatedSiret} onChangeText={setUpdatedSiret} />
          <TextInput style={styles.input} placeholder="TVA" value={updatedTva} onChangeText={setUpdatedTva} />
          <TextInput style={styles.input} placeholder="Adresse" value={updatedAdresse} onChangeText={setUpdatedAdresse} />
          <TextInput style={styles.input} placeholder="Téléphone" value={updatedTelephone} onChangeText={setUpdatedTelephone} />
          <TextInput style={styles.input} placeholder="Email" value={updatedEmail} onChangeText={setUpdatedEmail} />
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.cancelBtn}>
              <Text style={{ color: 'white' }}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowModal(false); setShowConfirmation(true); }} style={styles.saveBtn}>
              <Text style={{ color: 'white' }}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>

      {/* Modal confirmation */}
      <Modal visible={showConfirmation} transparent animationType="fade">
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationBox}>
            <Text style={styles.confirmationText}>Confirmer les modifications ?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowConfirmation(false)} style={styles.cancelBtn}>
                <Text style={{ color: 'white' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmedUpdate} style={styles.saveBtn}>
                <Text style={{ color: 'white' }}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
  backBtn: { marginBottom: 10 },
  backText: { color: 'blue' },
  avatar: { width: 150, height: 150, borderRadius: 75, alignSelf: 'center', marginVertical: 10 },
  optionBox: { alignItems: 'center', marginBottom: 10 },
  option: { color: 'blue', padding: 5 },
  infoBox: { marginVertical: 10 },
  editButton: { backgroundColor: '#e5461a', padding: 10, borderRadius: 5, alignItems: 'center' },
  editButtonText: { color: 'white' },
  modalContent: { padding: 20 },
  modalTitle: { fontSize: 20, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { backgroundColor: 'gray', padding: 10, borderRadius: 5 },
  saveBtn: { backgroundColor: '#28a745', padding: 10, borderRadius: 5 },
  successBox: { backgroundColor: '#d4edda', padding: 10, borderRadius: 5, marginBottom: 10 },
  successText: { color: '#155724', textAlign: 'center' },
  confirmationOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'
  },
  confirmationBox: {
    backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%'
  },
  confirmationText: { fontSize: 18, marginBottom: 20, textAlign: 'center' }
});

export default ProfilScreen;