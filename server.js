// server.js 

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());

// ===== Custom Middleware =====

// Logger middleware
app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.originalUrl}`);
  next();
});

// Authentication middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'mysecretkey') {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }
  next();
};

// Validation middleware
const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  if (!name || !description || price == null || !category || inStock == null) {
    return res.status(400).json({ error: 'Validation Error: Missing required fields' });
  }
  next();
};

// ===== Sample In-Memory Database =====
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true,
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true,
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false,
  },
  {
    id: '4',
    name: 'Headphones',
    description: 'Noise-cancelling wireless headphones',
    price: 150,
    category: 'electronics',
    inStock: true,
  },
  {
    id: '5',
    name: 'Microwave',
    description: '800W digital microwave oven',
    price: 100,
    category: 'kitchen',
    inStock: true,
  },
];

// ===== Routes =====

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// GET /api/products - List all products with filtering, pagination, and search
app.get('/api/products', (req, res) => {
  let results = [...products];
  const { category, page = 1, limit = 5, search } = req.query;

  if (category) {
    results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    results = results.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + Number(limit);
  const paginatedResults = results.slice(startIndex, endIndex);

  res.json({
    total: results.length,
    page: Number(page),
    limit: Number(limit),
    data: paginatedResults,
  });
});

// GET /api/products/:id - Get a specific product
app.get('/api/products/:id', (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return next(new NotFoundError('Product not found'));
  res.json(product);
});

// POST /api/products - Create a new product
app.post('/api/products', authenticate, validateProduct, (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price,
    category,
    inStock,
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update an existing product
app.put('/api/products/:id', authenticate, validateProduct, (req, res, next) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  if (productIndex === -1) return next(new NotFoundError('Product not found'));

  products[productIndex] = { ...products[productIndex], ...req.body };
  res.json(products[productIndex]);
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', authenticate, (req, res, next) => {
  const productIndex = products.findIndex(p => p.id
