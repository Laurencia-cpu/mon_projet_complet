// src/components/CategoryCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// Manafatra ny karazana 'ListeNavigationPrincipale' avy amin'ilay pejy lehibe isika.
// Izany dia miantoka fa mitovy foana ny karazana ampiasaina.
import type { ListeNavigationPrincipale } from '../screens/Application'; 

// --- Famaritana ireo Karazana (Types) ---

// Ity dia mamaritra hoe ny 'NavigationTarget' dia tsy maintsy iray amin'ireo anaran'ny pejy
// voasoratra ao anatin'ny ListeNavigationPrincipale (ohatra: 'TypeMetaux', 'Stock', sns.).
type NavigationTarget = keyof ListeNavigationPrincipale;

// Mamaritra ny endriky ny bokotra iray: misy soratra (label) sy tanjona (target)
interface CategoryItem {
  label: string;
  target: NavigationTarget;
}

// Mamaritra ny endriky ny karazana iray manontolo: misy lohateny (title) sy lisitry ny bokotra (items)
interface Category {
  title: string;
  items: CategoryItem[];
}

// Mamaritra ny "props" (zavatra ampitaina avy any ivelany) ilain'ity singa ity:
// - 'category': ilay karazana haseho
// - 'onNavigate': ilay fomba fiasa (function) hantsoina rehefa misy manindry bokotra
interface CategoryCardProps {
  category: Category;
  onNavigate: (target: NavigationTarget) => void;
}


// --- Ilay Singa (Component) ---

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onNavigate }) => {
  // Ity no mandrafitra ny fisehoana an-tsary
  return (
    // 'View' lehibe misolo tena ilay karatra fotsy
    <View style={styles.card}>
      {/* Soratra ho an'ny lohatenin'ilay karazana (ohatra: 'CONFIGURATION') */}
      <Text style={styles.cardTitle}>{category.title}</Text>

      {/* Manao "boucle" isika amin'ireo bokotra rehetra ao anatin'ilay karazana */}
      {category.items.map((item) => (
        // Bokotra azo tsindriana
        <TouchableOpacity
          // 'key' dia ilaina mba hahafantaran'i React ny singa tsirairay
          key={item.label}
          style={styles.button}
          // Rehefa tsindriana dia antsoina ilay fomba fiasa 'onNavigate'
          // ary omena azy ilay tanjona (ohatra: 'TypeMetaux')
          onPress={() => onNavigate(item.target)}
        >
          {/* Soratra eo ambonin'ilay bokotra */}
          <Text style={styles.buttonText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};


// --- Ireo Fomba (Styles) ---

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
    color: '#6e4e2e',
    borderBottomWidth: 1,
    borderBottomColor: '#f0e6d2',
    paddingBottom: 8,
  },
  button: {
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
  },
});


// Aondrana ilay singa mba ho azon'ny hafa ampiasaina
export default CategoryCard;