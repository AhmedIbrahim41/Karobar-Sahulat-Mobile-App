import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// The base URL for the entire API (IP and port)
const BASE_URL = 'https://your-app-name.onrender.com/api/products';
const PRODUCTS_API_URL = `${BASE_URL}/products`;
const SALES_API_URL = `${BASE_URL}/sales`;

// Function to get products from the backend (deprecated, use getAllProducts)
const getProducts = async () => {
    const token = await AsyncStorage.getItem('token');
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    // Using PRODUCTS_API_URL
    const response = await axios.get(PRODUCTS_API_URL, config);
    return response.data;
};


// Function to create a new sale
const completeSale = async (cartItems, totalAmount) => {
    const token = await AsyncStorage.getItem('token');
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };

    // Using SALES_API_URL
    const response = await axios.post(
        SALES_API_URL,
        { cartItems, totalAmount },
        config
    );
    return response.data;
};


const getSales = async () => {
    const token = await AsyncStorage.getItem('token');
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    // Using SALES_API_URL
    const response = await axios.get(
        SALES_API_URL,
        config
    );
    return response.data;
};
// Add this new function
const getLowStockProducts = async () => {
    const token = await AsyncStorage.getItem('token');
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    // Using PRODUCTS_API_URL with specific route
    const response = await axios.get(
        `${PRODUCTS_API_URL}/low-stock`,
        config
    );
    return response.data;
};

// Add this new function
const getPreBuiltProducts = async (categories) => {
    const token = await AsyncStorage.getItem('token');
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            categories: categories.join(','), // Convert the array of categories to a comma-separated string
        },
    };
    // Using PRODUCTS_API_URL with specific route
    const response = await axios.get(
        `${PRODUCTS_API_URL}/pre-built`,
        config
    );
    return response.data;
};

// New function to save the final list of products
const savePreBuiltProducts = async (products) => {
    const token = await AsyncStorage.getItem('token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };

    // Using PRODUCTS_API_URL with specific route
    const response = await axios.post(
        `${PRODUCTS_API_URL}/quick-save`,
        products, // The array of products is sent in the body
        config
    );
    return response.data;
};

const getAllProducts = async () => {
    const token = await AsyncStorage.getItem('token');
    
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    
    // Using PRODUCTS_API_URL
    const response = await axios.get(PRODUCTS_API_URL, config); 
    return response.data;
};

// FIX: Using PRODUCTS_API_URL constant for cleaner endpoint construction
const updateProduct = async (id, productData) => {
    const token = await AsyncStorage.getItem('token');
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };
    
    // PUT /api/products/:id
    const response = await axios.put(`${PRODUCTS_API_URL}/${id}`, productData, config);
    return response.data;
};

// FIX: Using PRODUCTS_API_URL constant for cleaner endpoint construction
const deleteProduct = async (id) => {
    const token = await AsyncStorage.getItem('token');
    
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    
    // DELETE /api/products/:id
    const response = await axios.delete(`${PRODUCTS_API_URL}/${id}`, config);
    return response.data;
};

// Update the export statement to include all functions
const productService = {
    getProducts,
    completeSale,
    getSales,
    getLowStockProducts,
    getPreBuiltProducts,
    savePreBuiltProducts,
    getAllProducts, 
    updateProduct,
    deleteProduct, 
};

export default productService;
