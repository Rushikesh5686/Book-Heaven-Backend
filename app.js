const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());

// ✅ Setup CORS properly
app.use(cors({
  origin: ['http://localhost:5173', 'https://bookheavencom.netlify.app'], // Allow local + deployed frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
  credentials: true // if you're using cookies/auth
}));

// ✅ Connect to DB
require('./conn/conn');

// ✅ Routes
const user = require('./routes/user');
const Books = require('./routes/book');
const favourites = require('./routes/favourties');
const cart = require('./routes/cart');
const order = require('./routes/order');

app.use('/api', user);
app.use('/api', Books);
app.use('/api', favourites);
app.use('/api', cart);
app.use('/api', order);

// ✅ Test route
app.get('/', (req, res) => {
  res.send('Hello from backend');
});

// ✅ Start server
app.listen(process.env.PORT, () => {
  console.log('Server started on port ' + process.env.PORT);
});
