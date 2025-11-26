import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import productService from '../services/productService';

// =========================================================
// 1. Edit Product Modal Component
// =========================================================
const EditProductModal = ({ isVisible, onClose, product, onSave }) => {
    // Local state for the product being edited
    const [name, setName] = useState(product ? product.name : '');
    const [price, setPrice] = useState(product ? String(product.price) : '');
    const [stock, setStock] = useState(product ? String(product.stock) : '');
    const [category, setCategory] = useState(product ? product.category : '');
    const [saving, setSaving] = useState(false);

    // Update local state when the 'product' prop changes
    // FIX: Changed useState to useEffect to correctly synchronize state with the 'product' prop.
    useEffect(() => {
        if (product) {
            setName(product.name);
            setPrice(String(product.price));
            setStock(String(product.stock));
            setCategory(product.category);
        }
    }, [product]);

    const handleSave = async () => {
        if (!name || !price || !stock || !category) {
            Alert.alert("Missing Fields", "Please fill out all product details.");
            return;
        }

        setSaving(true);
        const updatedData = {
            name,
            price: Number(price),
            stock: Number(stock),
            category,
        };

        try {
            await onSave(product._id, updatedData);
            setSaving(false);
            onClose(); // Close the modal on success
        } catch (error) {
            setSaving(false);
            Alert.alert("Save Error", error.message || "Failed to update product.");
        }
    };

    if (!product) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={modalStyles.centeredView}
            >
                <View style={modalStyles.modalView}>
                    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                        <Text style={modalStyles.modalTitle}>Edit Product: {product.name}</Text>

                        <TextInput 
                            style={modalStyles.input} 
                            placeholder="Product Name"
                            value={name}
                            onChangeText={setName}
                            editable={!saving}
                        />
                        <TextInput 
                            style={modalStyles.input} 
                            placeholder="Price (PKR)"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            editable={!saving}
                        />
                        <TextInput 
                            style={modalStyles.input} 
                            placeholder="Stock Quantity"
                            value={stock}
                            onChangeText={setStock}
                            keyboardType="numeric"
                            editable={!saving}
                        />
                        {/* Note: In a production app, category would use a picker/dropdown */}
                        <TextInput 
                            style={modalStyles.input} 
                            placeholder="Category"
                            value={category}
                            onChangeText={setCategory}
                            editable={!saving}
                        />

                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.buttonSave]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={modalStyles.buttonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.buttonClose]}
                            onPress={onClose}
                            disabled={saving}
                        >
                            <Text style={modalStyles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};


// =========================================================
// 2. Main Products Screen Component
// =========================================================
const ProductsScreen = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const router = useRouter();

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await productService.getAllProducts(); 
            setProducts(data);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            Alert.alert('Error', 'Could not load products.');
        } finally {
            setLoading(false);
        }
    }, []); 

    // Auto-refresh data when screen is focused
    // FIX: Wrap the async fetchProducts call in a synchronous useCallback 
    // to satisfy the useFocusEffect requirement of not returning a Promise.
    useFocusEffect(useCallback(() => {
        fetchProducts();
    }, [fetchProducts])); 

    // --- Action Handlers ---

    // Handler to open the modal for a selected product
    const handleEditPress = (product) => {
        setSelectedProduct(product);
        setEditModalVisible(true);
    };

    // Handler for updating product data (called by the modal)
    const handleUpdateProduct = async (id, updatedData) => {
        // Log the data and ID to help debug the 404 API error
        console.log(`Attempting PUT/PATCH for product ID: ${id} with data:`, updatedData);
        try {
            await productService.updateProduct(id, updatedData);
            Alert.alert("Success", "Product updated successfully!");
            // Refresh the product list after a successful update
            await fetchProducts(); 
        } catch (error) {
            console.error('Update failed:', error);
            // Re-throwing the error so the modal can catch it and display the alert
            throw new Error(error.response?.data?.message || "Update failed on server.");
        }
    };

    // Handler for deleting a product
    const handleDeleteProduct = (id, name) => {
        Alert.alert(
            "Confirm Delete",
            `Are you sure you want to delete ${name}? This cannot be undone.`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true); // Show loader during deletion
                        // Log the ID before deletion attempt
                        console.log(`Attempting DELETE for product ID: ${id}`);
                        try {
                            await productService.deleteProduct(id);
                            Alert.alert("Success", `${name} deleted.`);
                            // Refresh the list immediately
                            await fetchProducts(); 
                        } catch (error) {
                            Alert.alert("Error", error.response?.data?.message || "Failed to delete product.");
                            setLoading(false); // Hide loader on error
                        }
                        // Note: If successful, fetchProducts() hides the loader.
                    }
                }
            ],
            { cancelable: false }
        );
    };


    // --- Low Stock Logic ---
    const lowStockProducts = products.filter(p => p.stock <= 5);

    // --- Render Functions ---
    const renderProduct = ({ item }) => {
        // FIX: Add a debug check here to identify products missing the MongoDB '_id' field.
        if (!item._id) {
            console.warn('Product missing _id field, Edit/Delete will fail:', item.name, item);
        }

        return (
            <TouchableOpacity style={styles.productCard} activeOpacity={0.8}>
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productDetails}>Category: {item.category}</Text>
                </View>
                
                <View style={styles.stockAndActions}>
                    <View style={styles.stockContainer}>
                        <Text style={styles.productDetails}>Price: PKR {item.price}</Text>
                        <Text style={[
                            styles.stock, 
                            item.stock <= 5 && styles.lowStock
                        ]}>
                            Stock: {item.stock}
                        </Text>
                    </View>

                    {/* EDIT/DELETE ACTIONS */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.editButton]}
                            onPress={() => handleEditPress(item)}
                        >
                            <Text style={styles.actionText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDeleteProduct(item._id, item.name)}
                        >
                            <Text style={styles.actionText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // --- Loading State ---
    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text>Loading Inventory...</Text>
            </View>
        );
    }
    
    // --- Main JSX Return ---
    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Available Products</Text>

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
                <View style={styles.alertBox}>
                    <Text style={styles.alertText}>⚠️ Low Stock Alert: {lowStockProducts.length} items need restocking!</Text>
                </View>
            )}

            {/* Add New Product Button */}
            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/quickAddProducts')} 
            >
                <Text style={styles.addButtonText}>➕ Add New Products</Text>
            </TouchableOpacity>

            {/* Product List */}
            {products.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No products found. Use the button above to add inventory!</Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={item => item._id || item.name}
                    contentContainerStyle={styles.listContent}
                />
            )}

            {/* Edit Modal Component */}
            <EditProductModal
                isVisible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                product={selectedProduct}
                onSave={handleUpdateProduct}
            />
        </View>
    );
};

export default ProductsScreen;


// =========================================================
// 3. Styles
// =========================================================

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent overlay
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'stretch', // Allow content to stretch horizontally
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    input: {
        height: 50,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    button: {
        borderRadius: 10,
        padding: 15,
        elevation: 2,
        marginTop: 10,
        alignItems: 'center',
    },
    buttonSave: {
        backgroundColor: '#28a745', // Green
    },
    buttonClose: {
        backgroundColor: '#6c757d', // Gray
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 15, color: '#333', textAlign: 'center' },
    alertBox: {
        backgroundColor: '#ffdddd', padding: 10, borderRadius: 8,
        borderLeftWidth: 5, borderLeftColor: '#ff0000', marginBottom: 15,
    },
    alertText: { color: '#ff0000', fontWeight: 'bold', fontSize: 14 },
    addButton: {
        backgroundColor: '#28a745', padding: 15, borderRadius: 10,
        alignItems: 'center', marginBottom: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 5, elevation: 3,
    },
    addButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
    listContent: { paddingBottom: 20 },
    productCard: {
        flexDirection: 'row', justifyContent: 'space-between',
        backgroundColor: 'white', padding: 15, borderRadius: 10,
        marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    },
    productInfo: { flex: 1, marginRight: 10 },
    stockAndActions: { alignItems: 'flex-end', justifyContent: 'space-between' },
    stockContainer: { alignItems: 'flex-end', marginBottom: 5 },
    productName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    productDetails: { fontSize: 14, color: '#666', marginTop: 2 },
    stock: { fontSize: 14, fontWeight: 'bold', color: '#28a745', marginTop: 5 },
    lowStock: { color: '#dc3545' },
    emptyText: { fontSize: 16, color: '#888', marginTop: 50 },

    // Action Button Styles
    actionButtons: { flexDirection: 'row', marginTop: 5 },
    actionButton: {
        paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5,
        marginLeft: 5, 
    },
    editButton: { backgroundColor: '#007bff' }, // Blue
    deleteButton: { backgroundColor: '#dc3545' }, // Red
    actionText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
});
