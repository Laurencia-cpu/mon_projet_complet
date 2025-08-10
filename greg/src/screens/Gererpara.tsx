import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet, TouchableOpacity } from 'react-native';

interface Parametre {
  id: number;
  type: 'Code Opération' | 'Prix' | 'Type Article';
  valeur: string;
}

const ParameterManagementScreen = () => {
  const [parametres, setParametres] = useState<Parametre[]>([]);
  const [type, setType] = useState<Parametre['type']>('Code Opération');
  const [valeur, setValeur] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const resetForm = () => {
    setType('Code Opération');
    setValeur('');
    setEditingId(null);
  };

  const handleSave = () => {
    if (!valeur) {
      Alert.alert('Erreur', 'Le champ valeur est requis.');
      return;
    }

    if (editingId !== null) {
      setParametres(parametres.map(p => p.id === editingId ? { ...p, type, valeur } : p));
    } else {
      const newParam: Parametre = {
        id: parametres.length + 1,
        type,
        valeur,
      };
      setParametres([...parametres, newParam]);
    }
    resetForm();
  };

  const handleEdit = (param: Parametre) => {
    setType(param.type);
    setValeur(param.valeur);
    setEditingId(param.id);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirmation', 'Supprimer ce paramètre ?', [
      { text: 'Annuler' },
      { text: 'Supprimer', onPress: () => setParametres(parametres.filter(p => p.id !== id)) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des paramètres</Text>

      <View style={styles.typeContainer}>
        {['Code Opération', 'Prix', 'Type Article'].map(t => (
          <TouchableOpacity key={t} onPress={() => setType(t as Parametre['type'])} style={[styles.typeButton, type === t && styles.selectedType]}>
            <Text>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Valeur"
        value={valeur}
        onChangeText={setValeur}
        style={styles.input}
      />

      <Button title={editingId ? 'Modifier' : 'Ajouter'} onPress={handleSave} />

      <FlatList
        data={parametres}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.paramRow}>
            <View>
              <Text style={styles.paramText}>{item.type} : {item.valeur}</Text>
            </View>
            <View style={styles.actions}>
              <Button title="✏️" onPress={() => handleEdit(item)} />
              <Button title="🗑️" color="red" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 10 },
  typeContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  typeButton: { borderWidth: 1, borderColor: '#888', borderRadius: 6, padding: 8 },
  selectedType: { backgroundColor: '#ddd' },
  paramRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 10 },
  paramText: { fontSize: 16 },
  actions: { flexDirection: 'row', gap: 8 },
});

export default ParameterManagementScreen;
