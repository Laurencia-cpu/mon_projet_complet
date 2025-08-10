import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet, TouchableOpacity } from 'react-native';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'Administrateur' | 'Agent' | 'Gérant';
}

const UserManagementScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Administrateur' | 'Agent' | 'Gérant'>('Agent');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch users from backend (mocked here)
  useEffect(() => {
    // replace with real fetch
    setUsers([
      { id: 1, username: 'admin', email: 'admin@example.com', role: 'Administrateur' },
      { id: 2, username: 'agent1', email: 'agent1@example.com', role: 'Agent' },
    ]);
  }, []);

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setRole('Agent');
    setEditingId(null);
  };

  const handleSave = () => {
    if (!username || !email) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires.');
      return;
    }

    if (editingId !== null) {
      setUsers(users.map(u => u.id === editingId ? { ...u, username, email, role } : u));
    } else {
      const newUser: User = {
        id: users.length + 1,
        username,
        email,
        role,
      };
      setUsers([...users, newUser]);
    }
    resetForm();
  };

  const handleEdit = (user: User) => {
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role);
    setEditingId(user.id);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirmation', 'Supprimer cet utilisateur ?', [
      { text: 'Annuler' },
      { text: 'Supprimer', onPress: () => setUsers(users.filter(u => u.id !== id)) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des utilisateurs</Text>

      <TextInput
        placeholder="Nom utilisateur"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <View style={styles.roleContainer}>
        {['Administrateur', 'Agent', 'Gérant'].map(r => (
          <TouchableOpacity key={r} onPress={() => setRole(r as User['role'])} style={[styles.roleButton, role === r && styles.selectedRole]}>
            <Text style={styles.roleText}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title={editingId ? 'Modifier' : 'Ajouter'} onPress={handleSave} />

      <FlatList
        data={users}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <View>
              <Text style={styles.username}>{item.username} ({item.role})</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
            <View style={styles.actionButtons}>
              <Button title="✏️" onPress={() => handleEdit(item)} />
              <Button title="🗑️" onPress={() => handleDelete(item.id)} color="red" />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 6 },
  roleContainer: { flexDirection: 'row', marginBottom: 12, justifyContent: 'space-around' },
  roleButton: { padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#666' },
  selectedRole: { backgroundColor: '#ddd' },
  roleText: { fontWeight: 'bold' },
  userRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  username: { fontWeight: 'bold' },
  email: { color: '#666' },
  actionButtons: { flexDirection: 'row', gap: 8 },
});

export default UserManagementScreen;
