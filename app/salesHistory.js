import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import productService from '../services/productService';

const SalesHistoryScreen = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch sales data when the screen loads
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const data = await productService.getSales();
        setSales(data);
      } catch (err) {
        console.error('Failed to fetch sales:', err);
        setError('Failed to load sales history.');
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  // Helper function to render each sale item in the list
  const renderSaleItem = ({ item }) => (
    <View style={styles.saleItem}>
      <Text style={styles.saleHeader}>Sale ID: {item._id.substring(18)}</Text>
      <Text style={styles.saleInfo}>Date: {format(new Date(item.createdAt), 'MM/dd/yyyy hh:mm a')}</Text>
      <Text style={styles.saleTotal}>Total: ${item.totalAmount.toFixed(2)}</Text>
      <View style={styles.cartItemsContainer}>
        {item.cartItems.map((cartItem, index) => (
          <Text key={index} style={styles.cartItemText}>
            • {cartItem.name} (x{cartItem.quantity})
          </Text>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sales History</Text>
      <FlatList
        data={sales}
        renderItem={renderSaleItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default SalesHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  saleItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saleHeader: {
    fontSize: 14,
    color: '#888',
  },
  saleInfo: {
    fontSize: 16,
    color: '#555',
  },
  saleTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  cartItemsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  cartItemText: {
    fontSize: 14,
    color: '#333',
  },
});