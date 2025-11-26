import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import productService from '../services/productService';
import { useRouter } from 'expo-router';

// Define the categories for the Pakistani market
const categories = [
  'General Store', 'Groceries', 'Electronics', 'Apparel/Clothing',
  'Stationery', 'Bakery', 'Medical Store',
];

const QuickAddProductsScreen = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Function to handle category selection (Multi-Select)
  const toggleCategory = (category) => {
    setSelectedCategories(prev => prev.includes(category) 
      ? prev.filter(c => c !== category) 
      : [...prev, category]
    );
  };

  // Function to load products from the backend
  const handleLoadProducts = async () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Please select at least one category.');
      return;
    }

    setLoading(true);
    try {
      const data = await productService.getPreBuiltProducts(selectedCategories);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load pre-built products:', err);
      Alert.alert('Error', 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  // NEW FUNCTION: Handles saving the loaded products to the database
  const handleSaveProducts = async () => {
    if (products.length === 0) {
        Alert.alert('Error', 'Please load products before attempting to save.');
        return;
    }
    
    setLoading(true);
    try {
        // Sends the list of products to the backend for batch saving
        const response = await productService.savePreBuiltProducts(products);
        
        Alert.alert('Success', response.message);
        setProducts([]); // Clear the list after saving
        // In a real app, you would navigate back or refresh the main product list
        router.back(); 

    } catch (err) {
        console.error('Failed to save products:', err);
        const message = err.response?.data?.message || 'Failed to save products.';
        Alert.alert('Error', message);
    } finally {
        setLoading(false);
    }
  };

  // Correctly placed render function for the FlatList items
  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>Price: PKR {item.price}</Text> 
        <Text style={styles.productCategory}>Category: {item.category}</Text>
    </View>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategories.includes(item) && styles.selectedCategory
      ]}
      onPress={() => toggleCategory(item)}
    >
      <Text style={styles.categoryText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Product Setup</Text>
      <Text style={styles.subtitle}>Select categories to load products:</Text>
      
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={item => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />

      {/* Load Products Button */}
      <TouchableOpacity
        style={styles.loadButton}
        onPress={handleLoadProducts}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Load Products</Text>
        )}
      </TouchableOpacity>
      
      {/* NEW: Save Products Button (only appears if products are loaded) */}
      {products.length > 0 && (
        <TouchableOpacity
            style={[styles.loadButton, styles.saveButton]} 
            onPress={handleSaveProducts}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.buttonText}>Save Products to Inventory ({products.length})</Text>
            )}
        </TouchableOpacity>
      )}

      {/* Conditional Rendering of the Product List */}
      {products.length > 0 && (
        <View style={styles.productListContainer}>
          <Text style={styles.productListTitle}>Loaded Products ({products.length})</Text>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            contentContainerStyle={styles.productList}
          />
        </View>
      )}
    </View>
  );
};

export default QuickAddProductsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 15, color: '#555' },
  categoryList: { marginBottom: 20 },
  categoryButton: {
    paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20,
    backgroundColor: '#e0e0e0', marginRight: 10,
  },
  selectedCategory: { backgroundColor: '#007bff' },
  categoryText: { fontSize: 14, color: '#333' },
  loadButton: {
    backgroundColor: '#28a745', padding: 15, borderRadius: 10,
    alignItems: 'center', marginBottom: 20,
  },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
  // NEW STYLE: Different color for the Save button
  saveButton: {
    backgroundColor: '#007bff', 
    marginBottom: 20, 
  },
  productListContainer: { flex: 1, marginBottom: 20 },
  productListTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  productList: { flexGrow: 1 },
  productCard: {
    backgroundColor: 'white', padding: 15, borderRadius: 10,
    marginBottom: 10, elevation: 2, 
  },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  productPrice: { fontSize: 14, color: '#333' },
  productCategory: { fontSize: 14, color: '#555', marginTop: 5 },
});
