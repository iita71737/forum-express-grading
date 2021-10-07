const express = require('express')
const router = express.Router()

const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController.js')

const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const userController = require('../controllers/api/userController.js')


router.get('/admin/restaurants', adminController.getRestaurants)
router.get('/admin/restaurant/:id', adminController.getRestaurant)
router.get('/admin/categories', categoryController.getCategories)
router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)
router.post('/admin/restaurants', upload.single('image'), adminController.postRestaurant)
router.put('/admin/restaurants/:id', upload.single('image'), adminController.putRestaurant)
router.post('/admin/categories', categoryController.postCategory)
router.put('/admin/categories/:id', categoryController.putCategory)
router.delete('/admin/categories/:id', categoryController.deleteCategory)

// JWT signin
router.post('/signin', userController.signIn)

module.exports = router