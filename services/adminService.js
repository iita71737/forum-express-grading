const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = {
    getRestaurants: (req, res, callback) => {
        return Restaurant.findAll({
            raw: true,
            nest: true,
            include: [Category]
        }).then(restaurants => {

            callback({ restaurants: restaurants })
        })
    },
    getRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id, {
            include: [Category]
        }).then(restaurant => {
            callback({ restaurant: restaurant.toJSON() })
        })
    },
    deleteRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id)
            .then((restaurant) => {
                restaurant.destroy()
                    .then((restaurant) => {
                        callback({ status: 'success', message: '' })
                    })
            })
    },
    postRestaurant: (req, res, callback) => {
        if (!req.body.name) {
            console.log(req.body)
            req.flash('error_messages', "name didn't exist")
            return res.redirect('back')
        }
        const { file } = req
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID);
            imgur.upload(file.path, (err, img) => {
                return Restaurant.create({
                    name: req.body.name,
                    tel: req.body.tel,
                    address: req.body.address,
                    opening_hours: req.body.opening_hours,
                    description: req.body.description,
                    image: file ? img.data.link : null,
                    CategoryId: req.body.categoryId
                }).then((restaurant) => {
                    req.flash('success_messages', 'restaurant was successfully created')
                    callback({ status: 'success', message: 'restaurant was successfully created' })
                })
            })

        } else {
            return Restaurant.create({
                name: req.body.name,
                tel: req.body.tel,
                address: req.body.address,
                opening_hours: req.body.opening_hours,
                description: req.body.description,
                image: null,
                CategoryId: req.body.categoryId
            })
                .then((restaurant) => {
                    req.flash('success_messages', 'restaurant was successfully created')
                    callback({ status: 'success', message: 'restaurant was successfully created' })
                })
        }
    },
    putRestaurant: (req, res, callback) => {
        if (!req.body.name) {
            req.flash('error_messages', "name didn't exist")
            return res.redirect('back')
        }
        const { file } = req
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID);
            imgur.upload(file.path, (err, img) => {
                return Restaurant.findByPk(req.params.id)
                    .then((restaurant) => {
                        restaurant.update({
                            name: req.body.name,
                            tel: req.body.tel,
                            address: req.body.address,
                            opening_hours: req.body.opening_hours,
                            description: req.body.description,
                            image: file ? img.data.link : restaurant.image,
                            CategoryId: req.body.categoryId
                        }).then((restaurant) => {
                            req.flash('success_messages', 'restaurant was successfully to update')
                            callback({ status: 'success', message: 'restaurant was successfully created' })
                        })
                    })
            })
        } else {
            return Restaurant.findByPk(req.params.id)
                .then((restaurant) => {
                    restaurant.update({
                        name: req.body.name,
                        tel: req.body.tel,
                        address: req.body.address,
                        opening_hours: req.body.opening_hours,
                        description: req.body.description,
                        image: restaurant.image,
                        CategoryId: req.body.categoryId
                    })
                        .then((restaurant) => {
                            req.flash('success_messages', 'restaurant was successfully to update')
                            callback({ status: 'success', message: 'restaurant was successfully created' })
                        })
                })
        }
    },
    getUsers: (req, res, callback) => {
        return User.findAll({
            raw: true,
        }).then(users => {
            callback({ users: users, status: 'success', message: 'get data success' })
        }).catch((err) => console.log(err))
    },
    putUsers: (req, res, callback) => {
        return User.findByPk(req.params.id)
            .then((user) => {
                if (user.email === 'root@example.com') {
                    callback({ status: 'error', message: '禁止變更管理者權限' })
                }
                else {
                    user.isAdmin === false ? (user.isAdmin = true) : (user.isAdmin = false)
                    return user
                        .update({
                            isAdmin: user.isAdmin,
                        })
                        .then((user) => {
                            callback({ status: 'success', message: '使用者權限變更成功' })
                        })
                }
            })
            .catch((err) => console.console.log(err))
    }

}

module.exports = adminService