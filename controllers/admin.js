const { validationResult } = require('express-validator/check');

const Product = require('../models/product');


exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null
    });
};

exports.postAddProduct = (req, res, next) => {

    const title = req.body.title;
    const price = req.body.price;
    const imageURL = req.body.imageURL;
    const description = req.body.description;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            product: {
                title: title,
                price: price,
                imageURL: imageURL,
                description: description
            },
            hasError: true,
            errorMessage: errors.array()[0].msg
        });
    }

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageURL: imageURL,
        userId: req.user._id
    });
    product
        .save()
        .then(result => {
            console.log('Created Product');
            res.redirect('/admin/products');
        })
        .catch(err => {

            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);

        });
};

exports.getProducts = (req, res, next) => {

    Product.find()
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        }).catch(err => {
            console.log(err);
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Add Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
                hasError: false,
                errorMessage: null
            });
        }).catch(err => {
            const error = new Error();
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageURL = req.body.imageURL;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            product: {
                title: updatedTitle,
                imageURL: updatedImageURL,
                price: updatedPrice,
                description: updatedDescription,
                _id: productId
            }
        });
    }

    Product.findById(productId)
        .then(product => {

            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }

            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDescription;
            product.imageURL = updatedImageURL;
            product.userId = req.session.user._id;

            return product.save().then(result => {
                console.log('UPDATED PRODUCT')
                res.redirect('/admin/products');
            }).catch(err => {
                console.log(err);
            });
        })
        .catch(err => {
            console.log(err);
        })


};

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteOne({ _id: productId, userId: req.user._id })
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
        });
};