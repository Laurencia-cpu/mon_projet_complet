import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const Dashboard = () => {
  const navigation = useNavigation();

  const statistiques = [
    { label: 'Fournisseurs', value: 12, icon: 'account-group', route: 'DashbordScreen' },
    { label: 'Bons de caisse', value: 47, icon: 'file-document', route: 'EcranSaisieAchat' },
    { label: 'Réceptions', value: 34, icon: 'package-variant', route: 'EcranReceptionArticles' },
    { label: 'Déchets', value: 8, icon: 'trash-can-outline', route: 'EcranCodeDechet' },
  ];

  const chartData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai'],
    datasets: [
      {
        data: [50, 45, 70, 60, 90],
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Tableau de bord</Text>

      {/* Section Statistiques */}
      <View style={styles.statContainer}>
        {statistiques.map((item, index) => ( 
          <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate(item.route)}>
            <Icon name={item.icon} size={30} color="#4a90e2" />
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section Graphique */}
      <Text style={styles.sectionTitle}>Statistique mensuelle</Text>
      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: () => '#000',
          decimalPlaces: 0,
        }}
        bezier
        style={styles.chart}
      />

      {/* Section Navigation rapide */}
      <Text style={styles.sectionTitle}>Navigation rapide</Text>
      <View style={styles.quickNav}>
        <TouchableOpacity onPress={() => navigation.navigate('EcranCorrection')}>
          <Text style={styles.link}>Correction données</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('EcranStatistiques')}>
          <Text style={styles.link}>Statistiques globales</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('EcranFacturation')}>
          <Text style={styles.link}>Facturation</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f6f8', marginTop:20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  statContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    backgroundColor: '#fff',
    width: '47%',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  cardLabel: { marginTop: 8, fontSize: 14, color: '#666' },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: '#4a90e2' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 12, color: '#444' },
  chart: { borderRadius: 12, marginVertical: 8 },
  quickNav: { marginTop: 8 },
  link: { fontSize: 16, color: '#007AFF', marginVertical: 4 },
});

export default Dashboard;


// import React from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { RootStackParamList } from '../../App';

// // Définir le type de navigation
// type NavigationProp = StackNavigationProp<RootStackParamList, 'DashboardScreen'>;


// const DashboardScreen = () => {
//     const navigation = useNavigation<NavigationProp>();
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Bienvenue, Fournisseur</Text>
//       <Button title="Saisir un Bon" onPress={() => navigation.navigate('Saisie Bon')} />
//       <Button title="Voir Historique" onPress={() => navigation.navigate('Historique')} />
//       <Button title="Réception / Livraison" onPress={() => navigation.navigate('Réception')} />
//       <Button title="Profil" onPress={() => navigation.navigate('Profil')} />
//       <Button title="Statistiques" onPress={() => navigation.navigate('Statistiques')} />
//       <Button title="Support" onPress={() => navigation.navigate('Support')} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20 },
//   title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
// });

// export default DashboardScreen;
