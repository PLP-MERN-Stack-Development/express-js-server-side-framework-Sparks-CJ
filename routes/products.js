// routes/products.js

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory "database"
let products = [
  { id: '1', name: 'Laptop', description: '16GB RAM', price: 1200, category: 'electronics', inStock: true },
  { id: '2', name: 'Smartphone', description: '128GB Storage', price: 800, category: 'electronics', inStock: true },
  { id: '3', name: 'Coffee Maker', description: 'Programmable', price: 50, category: 'kitchen', inStock: false },
];

// ✅ GET all products (with optional filtering, pagination, and search)
router.get('/', (req, res) => {
  let result = [...products];
  const { category, search, page = 1, limit = 5 } = req.query;

  // Filtering
  if (category) result = result.filter(p => p.category === category);

  // Searching
  if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  // Pagination
  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginated = result.slice(start, end);

  res.json({ total: result.length, page: Number(page), data: paginated });
});

// ✅ GET single product
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// ✅ POST new product
router.post('/', (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  if (!name || !price) return res.status(400).json({ message: 'Name and price are required' });

  const newProduct = { id: uuidv4(), name, description, price, category, inStock };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// ✅ PUT update product
router.put('/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  Object.assign(product, req.body);
  res.json(product);
});

// ✅ DELETE product
router.delete('/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Product not found' });

  const deleted = products.splice(index, 1);
  res.json({ message: 'Product deleted', deleted });
});

module.exports = router;
