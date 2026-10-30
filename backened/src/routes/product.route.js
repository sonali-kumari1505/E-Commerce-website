import express from 'express';
import { adminRoute, protectRoute } from '../middleware/auth.middlware.js';
import { createProduct, deleteProduct, getFeatureProduct, getProductController, getSingleProduct, toggleFeatureProducts } from '../controller/product.controller.js';
import { upload } from '../middleware/uploadImage.js';

const productRoute = express.Router();

productRoute.post('/createProduct', protectRoute, adminRoute, upload.single('image'), createProduct);
productRoute.get('/getAllProduct', getProductController);
productRoute.post('/toggleProduct/:id', protectRoute, adminRoute, toggleFeatureProducts);
productRoute.post('/deleteProduct/:id', protectRoute, adminRoute, deleteProduct);
productRoute.get('/getSingleProduct/:id', getSingleProduct);
productRoute.get('/getFeaturedProduct', getFeatureProduct);

export default productRoute;
