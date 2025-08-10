// import React from 'react';
// import { View, ScrollView, Text, Button, Alert, StyleSheet } from 'react-native';

// const AdminDashboard = () => {
//   // Simuler les actions de l'administrateur

//   const handlePress = (title: string) => {
//     Alert.alert('Action Admin', `Fonctionnalité : ${title}`);
//     // Tu peux ici naviguer ou appeler des API ou enregistrer des tâches
//   };

//   const actions = [
//     { title: 'Gérer les utilisateurs', onPress: () => handlePress('Gérer les utilisateurs') },
//     { title: 'Gérer les paramètres', onPress: () => handlePress('Gérer les paramètres') },
//     { title: 'Importer les données', onPress: () => handlePress('Importer les données') },
//     { title: 'Exporter les données', onPress: () => handlePress('Exporter les données') },
//     { title: 'Corriger les données', onPress: () => handlePress('Corriger les données') },
//     { title: 'Annuler un bon', onPress: () => handlePress('Annuler un bon') },
//     { title: 'Imprimer une lettre chèque', onPress: () => handlePress('Imprimer une lettre chèque') },
//     { title: 'Réimprimer une lettre chèque', onPress: () => handlePress('Réimprimer une lettre chèque') },
//     { title: 'Sauvegarder les données', onPress: () => handlePress('Sauvegarder les données') },
//     { title: 'Restaurer les données', onPress: () => handlePress('Restaurer les données') },
//     { title: 'Consulter les rapports', onPress: () => handlePress('Consulter les rapports') },
//     { title: 'Superviser les tâches', onPress: () => handlePress('Superviser les tâches') },
//     { title: 'Gérer la facturation', onPress: () => handlePress('Gérer la facturation') },
//     { title: 'Transfert comptable', onPress: () => handlePress('Transfert comptable') },
//   ];

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Tableau de bord - Administrateur</Text>
//       {actions.map((action, index) => (
//         <View key={index} style={styles.buttonContainer}>
//           <Button title={action.title} onPress={action.onPress} />
//         </View>
//       ))}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#f8f9fa',
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   buttonContainer: {
//     marginVertical: 8,
//   },
// });

// export default AdminDashboard;


// import React from 'react';
// import { View, ScrollView, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';

// const AdminDashboard = () => {
//   const handlePress = (title: string) => {
//     Alert.alert('Action Admin', `Fonctionnalité : ${title}`);
//   };

//   const actions = [
//     { title: 'Gérer les utilisateurs' },
//     { title: 'Gérer les paramètres' },
//     { title: 'Importer les données' },
//     { title: 'Exporter les données' },
//     { title: 'Corriger les données' },
//     { title: 'Annuler un bon' },
//     { title: 'Imprimer une lettre chèque' },
//     { title: 'Réimprimer une lettre chèque' },
//     { title: 'Sauvegarder les données' },
//     { title: 'Restaurer les données' },
//     { title: 'Consulter les rapports' },
//     { title: 'Superviser les tâches' },
//     { title: 'Gérer la facturation' },
//     { title: 'Transfert comptable' },
//   ];

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>📊 Tableau de bord - Administrateur</Text>
//       <View style={styles.grid}>
//         {actions.map((action, index) => (
//           <TouchableOpacity
//             key={index}
//             style={styles.card}
//             onPress={() => handlePress(action.title)}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.cardText}>{action.title}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     marginTop:30,
//     backgroundColor: '#eef2f7', // fond bleu clair
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#34495e',
//   },
//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   card: {
//     width: '48%',
//     backgroundColor: '#ffffff',
//     padding: 20,
//     marginBottom: 16,
//     borderRadius: 12,
//     elevation: 4, // ombre ho an'ny Android
//     shadowColor: '#000', // ombre ho an'ny iOS
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   cardText: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#2c3e50',
//     textAlign: 'center',
//   },
// });

// export default AdminDashboard;


import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const avatarUri = 'https://example.com/myavatar.png';



const AdminDashboard = () => {
  const navigation = useNavigation();

  const actions = [
    { title: 'Utilisateurs', screen: 'UserManagement', icon: '👥' },
    { title: 'Fournisseurs', screen: 'SupplierScreen', icon: '🏭' },
    { title: 'Bons de caisse', screen: 'BonCaisseScreen', icon: '🧾' },
    { title: 'Réception articles', screen: 'ReceptionScreen', icon: '📦' },
    { title: 'Éditions', screen: 'EditionsScreen', icon: '🖨️' },
    { title: 'Statistiques', screen: 'StatsScreen', icon: '📊' },
    { title: 'Facturation', screen: 'BillingScreen', icon: '💳' },
    { title: 'Paramètres', screen: 'SettingsScreen', icon: '⚙️' },
  ];

  const handlePress = (screen: string) => {
    // mandeha mankany amin'ilay écran mifanaraka
    navigation.navigate(screen as never);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: avatarUri }}
          style={styles.avatar}
        />
        <Text style={styles.welcome}>Bienvenue, Admin</Text>
        <Text style={styles.subtitle}>Tableau de bord administratif</Text>
      </View>

      <View style={styles.grid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => handlePress(action.screen)}
          >
            <Text style={styles.icon}>{action.icon}</Text>
            <Text style={styles.cardText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafe',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardText: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  icon: {
    fontSize: 30,
  },
});

export default AdminDashboard;
