const express = require('express')
const bcrypt = require('bcrypt')
const { db } = require('../config/db')

const SALT_ROUNDS = 10

const router = express.Router();


// ===={ AUTH MIDDLEWARE }==== \\
//
// Protects user-scoped routes (/profile/:id, /change-password).
// Every request to those routes must include an `x-user-id` header
// whose value matches the userId being accessed.  This prevents any
// authenticated client from reading or modifying another user's data.

function requireSelf(req, res, next) {
  const headerUserId = req.headers['x-user-id'];

  // Determine the target userId from the route param or request body.
  const targetUserId = String(req.params.id ?? req.body?.userId ?? '');

  if (!headerUserId || String(headerUserId) !== targetUserId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  next();
}


// ===={ SIGNUP ROUTE }==== \\

router.post('/signup', async (req, res) => {

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password required' });
  }

  try {
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ?', [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    await db.execute(
      'INSERT INTO users(name, email, password) VALUES (?, ?, ?)',
      [name, email, await bcrypt.hash(password, SALT_ROUNDS)]
    );

    return res.status(201).json({ message: 'Account created' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});


// ===={ LOGIN ROUTE }==== \\

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const [users] = await db.execute(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email]
    );

    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});


// ===={ PROFILE ROUTE }==== \\
// Protected: caller must own the requested profile.

router.get('/profile/:id', requireSelf, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, name, email FROM users WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(users[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});


// ===={ CHANGE PASSWORD ROUTE }==== \\
// Protected: caller must own the account being updated.

router.post('/change-password', requireSelf, async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (
    !userId ||
    typeof currentPassword !== 'string' ||
    typeof newPassword !== 'string' ||
    !currentPassword ||
    !newPassword.trim()
  ) {
    return res.status(400).json({
      message: 'User ID, current password and new password required'
    });
  }

  try {
    const [users] = await db.execute(
      'SELECT id, password FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0];

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ message: 'Invalid user or current password' });
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({ message: 'New password must be different' });
    }

    const hashedNew = await bcrypt.hash(newPassword, SALT_ROUNDS);

    const [result] = await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedNew, user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(409).json({ message: 'Password changed already. Please try again.' });
    }

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});


// ===={ ADD PRODUCTS ROUTE }==== \\

router.post('/add-product', async (req, res) => {
  const { name, category, price, stock } = req.body;

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof category !== 'string' || !category.trim() ||
    price === undefined || price === null || price === '' ||
    stock === undefined || stock === null || stock === ''
  ) {
    return res.status(400).json({ message: 'Name, category, price and stock required' });
  }

  const productPrice = Number(price);
  const productStock = Number(stock);

  if (!Number.isFinite(productPrice) || productPrice < 0) {
    return res.status(400).json({ message: 'Price must be a valid number, zero or greater.' });
  }

  if (!Number.isInteger(productStock) || productStock < 0 || productStock > 1000) {
    return res.status(400).json({ message: 'Stock must be a whole number between 0 and 1000.' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)',
      [name.trim(), category.trim(), productPrice, productStock]
    );

    return res.status(201).json({ message: 'Product added successfully', productId: result.insertId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});


// ===={ SHOW PRODUCTS ROUTE }==== \\

router.get('/add-product', async (req, res) => {
  try {
    const [products] = await db.execute(
      'SELECT id, name, category, price, stock, image FROM products ORDER BY id DESC'
    );

    return res.status(200).json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});


// ===={ EDIT - DELETE ROUTE }==== \\

// Edit product
router.put('/product/:id', async (req, res) => {
  const { name, category, price, stock } = req.body;

  if (!name || !category || price === undefined || stock === undefined) {
    return res.status(400).json({ message: 'Name, category, price and stock required' });
  }

  try {
    const [result] = await db.execute(
      'UPDATE products SET name=?, category=?, price=?, stock=? WHERE id=?',
      [name.trim(), category.trim(), Number(price), Number(stock), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/product/:id', async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM products WHERE id=?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});


// ===={ COMPLETE SALE ROUTE }==== \\

router.post('/complete-sale', async (req, res) => {
  const { cart, total } = req.body;

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  // Acquire a dedicated connection so we can run a transaction.
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // =========================
    // 1. VERIFY STOCK FOR ALL ITEMS BEFORE TOUCHING ANYTHING
    //    Lock the rows with SELECT ... FOR UPDATE so concurrent requests
    //    cannot race past this check.
    // =========================
    for (const item of cart) {
      const qty = Number(item.quantity);
      const id  = Number(item.id);

      if (!Number.isInteger(qty) || qty < 1) {
        await conn.rollback();
        return res.status(400).json({ message: `Invalid quantity for product ID ${id}` });
      }

      const [[product]] = await conn.execute(
        'SELECT id, name, stock FROM products WHERE id = ? FOR UPDATE',
        [id]
      );

      if (!product) {
        await conn.rollback();
        return res.status(404).json({ message: `Product ID ${id} not found` });
      }

      if (product.stock < qty) {
        await conn.rollback();
        return res.status(409).json({
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${qty}`
        });
      }
    }

    // =========================
    // 2. CREATE SALE RECORD
    // =========================
    const [saleResult] = await conn.execute(
      'INSERT INTO sales (total) VALUES (?)',
      [total]
    );

    const saleId = saleResult.insertId;

    // =========================
    // 3. INSERT SALE ITEMS + DECREMENT STOCK
    // =========================
    for (const item of cart) {
      await conn.execute(
        `INSERT INTO sale_items (sale_id, product_id, product_name, price, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [saleId, item.id, item.name, item.price, item.quantity]
      );

      await conn.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.id]
      );
    }

    await conn.commit();

    return res.status(201).json({ message: 'Sale completed successfully', saleId });

  } catch (error) {
    await conn.rollback();
    console.error('Complete sale error:', error);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
});


// ===={ GET SALE ITEMS ROUTE }==== \\

router.get('/sale/:id/items', async (req, res) => {
  const saleId = Number(req.params.id);

  if (!Number.isInteger(saleId) || saleId < 1) {
    return res.status(400).json({ message: 'Invalid sale ID' });
  }

  try {
    const [[sale]] = await db.execute(
      'SELECT id, total, returned, created_at FROM sales WHERE id = ?',
      [saleId]
    );

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    const [items] = await db.execute(
      `SELECT product_id AS id, product_name AS name, price, quantity
       FROM sale_items WHERE sale_id = ?`,
      [saleId]
    );

    return res.status(200).json({ sale, items });
  } catch (error) {
    console.error('Get sale items error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


// ===={ SALES ROUTE }==== \\

router.get('/sales', async (req, res) => {
  try {
    const [sales] = await db.query(`
      SELECT s.id, s.total, s.returned, s.created_at, COUNT(si.id) AS item_count
      FROM sales AS s
      LEFT JOIN sale_items AS si ON s.id = si.sale_id
      GROUP BY s.id, s.total, s.returned, s.created_at
      ORDER BY s.created_at DESC
    `);

    return res.status(200).json(sales);
  } catch (error) {
    console.error('Get sales error:', error);
    return res.status(500).json({ message: 'Failed to fetch data' });
  }
});


// ===={ RETURN SALE ROUTE }==== \\

router.post('/return-sale/:id', async (req, res) => {
  const saleId = Number(req.params.id);

  if (!Number.isInteger(saleId) || saleId < 1) {
    return res.status(400).json({ message: 'Invalid sale ID' });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Lock the sale row and verify it exists and hasn't been returned yet
    const [[sale]] = await conn.execute(
      'SELECT id, returned FROM sales WHERE id = ? FOR UPDATE',
      [saleId]
    );

    if (!sale) {
      await conn.rollback();
      return res.status(404).json({ message: 'Sale not found' });
    }

    if (sale.returned) {
      await conn.rollback();
      return res.status(409).json({ message: 'Sale has already been returned' });
    }

    // 2. Fetch all items for this sale
    const [items] = await conn.execute(
      'SELECT product_id, quantity FROM sale_items WHERE sale_id = ?',
      [saleId]
    );

    // 3. Restore stock for each item
    for (const item of items) {
      await conn.execute(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // 4. Mark the sale as returned
    await conn.execute(
      'UPDATE sales SET returned = 1 WHERE id = ?',
      [saleId]
    );

    await conn.commit();

    return res.status(200).json({ message: 'Sale returned successfully' });

  } catch (error) {
    await conn.rollback();
    console.error('Return sale error:', error);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
});


module.exports = router;
