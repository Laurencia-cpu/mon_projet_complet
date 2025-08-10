import React from 'react';
import { View, Text, ImageBackground, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

// Définir le type de navigation
type NavigationProp = StackNavigationProp<RootStackParamList, 'Accueil'>;

const Accueil: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ImageBackground source={require('../assets/background.jpg')} style={styles.background} resizeMode="cover">
      <View style={styles.content}>
        <Text style={styles.text}>Entrez dans le monde de</Text>
        <Text style={styles.title}>Greg</Text>
        <Text style={styles.subtitle}>
          La gestion et valorisation{'\n'}des déchets métalliques
        </Text>
        <Image source={require('../assets/gestion.png')} style={styles.image} />
      </View>

      <TouchableOpacity style={styles.playButton} onPress={() => navigation.navigate('lis')}>
        <Icon name="play" size={60} color="black" />
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  content: {
    alignItems: 'flex-start',
    marginLeft: 40,
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 120,
  },
  title: {
    color: 'red',
    fontSize: 80,
    fontWeight: 'bold',
    marginTop:80,
    
  },
  subtitle: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
    marginTop: 20,
    alignSelf: 'flex-end',
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginTop: 30,
  },
  playButton: {
    alignSelf: 'flex-end',
    marginRight: 40,
  },
});

export default Accueil;
