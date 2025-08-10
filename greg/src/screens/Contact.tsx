import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Linking, Button, Alert, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../app';

// Type de navigation
type NavigationProp = StackNavigationProp<RootStackParamList, 'Contact'>;

const Contact: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const envoyerContact = async () => {
    if (!nom || !email || !sujet || !message) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const reponse = await fetch('http://10.0.2.2:8000/api/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',"X-Client-Type": "mobile"
        },
        body: JSON.stringify({ nom, email, sujet, message }),
      });

      if (reponse.ok) {
        Alert.alert('Succès', 'Message envoyé avec succès.');
        setNom('');
        setEmail('');
        setSujet('');
        setMessage('');
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de l’envoi.');
      }
    } catch (error) {
      console.error('Erreur API:', error);
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Erreur lors de l\'ouverture du lien', err));
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Image source={require('../assets/gestion.png')} style={styles.logo} />
        <View style={styles.navIcons}>
          <Icon name="home" size={25} color="black" style={{ marginRight: 15 }} onPress={() => navigation.navigate('lis')} />
          <Icon name="eur" size={25} color="black" style={{ marginRight: 15 }} onPress={() => navigation.navigate('Offres')} />
          <TouchableOpacity onPress={() => navigation.navigate('EspaceClient')}>
            <Text style={styles.clientButton}>Espace Client</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>Contactez-nous</Text>
        <Text style={styles.contactText}>Par e-mail pour toutes questions sur nos collaborations</Text>
        <Text style={styles.contactText}>Par téléphone pour un RDV ou réponses immédiates</Text>
        <Text style={styles.contactText}>Suivez-nous sur nos réseaux sociaux pour nos actualités</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={nom}
          onChangeText={setNom}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Sujet"
          value={sujet}
          onChangeText={setSujet}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Message"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={5}
        />

        <Button
          title={loading ? 'Envoi en cours...' : 'Envoyer'}
          onPress={envoyerContact}
          disabled={loading}
          color="#8B4513" // Marron
        />
      </View>

      <View style={styles.contactDetails}>
        <View style={styles.contactRow}>
          <Text style={styles.infoText}>
            <Icon name="mobile" size={20} color="gray" />
            {'\n'}06 18 97 34 39
          </Text>
          <Text style={styles.infoText}>
            <Icon name="map-marker" size={20} color="gray" />
            {'\n'}86 rue Saint Denis, 93120 La Courneuve
          </Text>
        </View>
        <View style={styles.socials}>
          <TouchableOpacity onPress={() => openUrl('https://www.facebook.com/gestion.recuperation')}>
            <Text style={styles.socialText}>
              <Icon name="facebook-square" size={25} color="gray" />
              {'\n'}gestion.récuperation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openUrl('https://twitter.com/gestion.recuperation')}>
            <Text style={styles.socialText}>
              <Icon name="twitter-square" size={25} color="gray" />
              {'\n'}gestion.récuperation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openUrl('https://www.linkedin.com/company/gestion-recuperation')}>
            <Text style={styles.socialText}>
              <Icon name="linkedin-square" size={25} color="gray" />
              {'\n'}gestion.récuperation
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: '#FFF5E1', // Couleur claire pour l'arrière-plan
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginVertical: 30,
  },
  logo: {
    width: 120,
    height: 30,
    resizeMode: 'contain',
  },
  navIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientButton: {
    backgroundColor: '#FFF',
    color: '#8B4513', // Marron
    fontWeight: 'bold',
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  contactInfo: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513', // Marron
    marginBottom: 10,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 16,
    color: '#333', // Texte en couleur plus sombre pour améliorer la lisibilité
    marginBottom: 5,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: '#DDD',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#F9F9F9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  contactDetails: {
    marginTop: 30,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
  },
  contactRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  infoText: {
    fontSize: 16,
    color: '#333', // Texte en couleur plus sombre pour une meilleure lisibilité
    textAlign: 'center',
  },
  socials: {
    marginTop: 10,
    alignItems: 'center',
  },
  socialText: {
    fontSize: 18, // Taille augmentée pour plus de lisibilité
    color: '#8B4513', // Marron plus foncé
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold', // Pour rendre le texte plus visible
  },
});

export default Contact;
