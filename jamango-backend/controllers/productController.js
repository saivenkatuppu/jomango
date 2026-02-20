const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get all active products (including out-of-stock, so frontend can show badge)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ active: true }).sort({ weight: 1, price: 1 });
    res.json(products);
});

// @desc    Get all products (including inactive) for admin
// @route   GET /api/admin/products
// @access  Private/Admin
const getAdminProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
});

// @desc    Create a product
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const { name, variety, weight, price, stock, active, description, badge, mrp, showDiscount, discountLabel, showBadge, badgeType } = req.body;

    const product = await Product.create({
        name,
        variety,
        weight,
        price,
        stock: stock || 0,
        active: active !== undefined ? active : true,
        description: description || '',
        badge: badge || '',
        showBadge: showBadge || false,
        badgeType: badgeType || 'custom',
        mrp: mrp || undefined,
        showDiscount: showDiscount || false,
        discountLabel: discountLabel || '',
        priceHistory: [{ price, date: Date.now() }]
    });

    res.status(201).json(product);
});

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const { name, variety, weight, price, stock, active, description, badge, mrp, showDiscount, discountLabel } = req.body;

    // Check if price changed for history
    if (price !== undefined && price !== product.price) {
        product.priceHistory.push({ price: product.price, date: Date.now() });
    }

    product.name = name ?? product.name;
    product.variety = variety ?? product.variety;
    product.weight = weight ?? product.weight;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;
    product.active = active !== undefined ? active : product.active;
    product.description = description ?? product.description;
    product.badge = badge ?? product.badge;

    // New Pricing Fields
    product.mrp = mrp ?? product.mrp;
    product.showDiscount = showDiscount !== undefined ? showDiscount : product.showDiscount;
    product.discountLabel = discountLabel ?? product.discountLabel;

    // New Badge Fields
    const { showBadge, badgeType } = req.body;
    product.showBadge = showBadge !== undefined ? showBadge : product.showBadge;
    product.badgeType = badgeType ?? product.badgeType;

    const updated = await product.save();
    res.json(updated);
});

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
});

module.exports = {
    getProducts,
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
};
