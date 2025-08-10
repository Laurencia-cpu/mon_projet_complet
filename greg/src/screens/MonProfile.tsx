// // MonProfil.tsx
// import React from 'react';
// import { View, Text, Image, StyleSheet } from 'react-native';

// const MonProfil = () => {
//   return (
//     <View style={styles.container}>
//       <Image
//         source={{ uri: 'https://i.pravatar.cc/150?img=12' }} // Soloina amin’ny sary tena izy raha ilaina
//         style={styles.profileImage}
//       />
//       <Text style={styles.name}>Jean Rakoto</Text>
//       <Text style={styles.info}>rakoto@example.com</Text>
//     </View>
//   );
// };

// export default MonProfil;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'
//   },
//   profileImage: {
//     width: 150, height: 150, borderRadius: 75, marginBottom: 20
//   },
//   name: {
//     fontSize: 24, fontWeight: 'bold'
//   },
//   info: {
//     fontSize: 16, color: 'gray'
//   }
// });

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

const MonProfil = () => {
  const route = useRoute();
  const { photoUri } = route.params;

  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.profileImage} />
      <Text style={styles.name}>Jean Rakoto</Text>
      <Text style={styles.info}>rakoto@example.com</Text>
    </View>
  );
};

export default MonProfil;

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'
  },
  profileImage: {
    width: 150, height: 150, borderRadius: 75, marginBottom: 20
  },
  name: {
    fontSize: 24, fontWeight: 'bold'
  },
  info: {
    fontSize: 16, color: 'gray'
  }
});
