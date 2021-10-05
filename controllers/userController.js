const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const imgur = require('imgur-node-api')
const helpers = require('../_helpers.js')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const Favorite = db.Favorite
const Like = db.Like

const userController = {
    signUpPage: (req, res) => {
        return res.render('signup')
    },

    signUp: (req, res) => {
        if (req.body.passwordCheck !== req.body.password) {
            req.flash('error_messages', '兩次密碼輸入不同！')
            return res.redirect('/signup')
        } else {
            // confirm unique user
            User.findOne({ where: { email: req.body.email } }).then(user => {
                if (user) {
                    req.flash('error_messages', '信箱重複！')
                    return res.redirect('/signup')
                } else {

                    User.create({
                        name: req.body.name,
                        email: req.body.email,
                        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
                    }).then(user => {
                        req.flash('success_messages', '成功註冊帳號！')
                        return res.redirect('/signin')
                    })
                }
            })
        }
    },
    signInPage: (req, res) => {
        return res.render('signin')
    },
    signIn: (req, res) => {
        req.flash('success_messages', '成功登入！')
        res.redirect('/restaurants')
    },
    logout: (req, res) => {
        req.flash('success_messages', '登出成功！')
        req.logout()
        res.redirect('/signin')
    },
    getUser: async (req, res) => {
        const id = req.params.id
        const userId = helpers.getUser(req).id
        const user = await User.findByPk(id)
        const commentData = await Comment.findAndCountAll({
            where: { UserId: id }, raw: true, nest: true, attributes: ['RestaurantId'],
            include: { model: Restaurant, attributes: ['id', 'image'] }
        })

        return res.render('user', {
            userData: user.toJSON(), userId,
            comment: commentData.rows, n_comments: commentData.count
        })
    },
    editUser: async (req, res) => {
        const id = req.params.id
        const userId = helpers.getUser(req).id

        if (Number(id) !== Number(userId)) {
            req.flash('error_messages', '只能編輯自己的profile。')
            return res.redirect(`/users/${userId}`)
        }

        const user = await User.findByPk(id)
        return res.render('userEdit', { user: user.toJSON() })
    },
    putUser: (req, res) => {
        const { name, email } = req.body
        const { file } = req
        const id = req.params.id

        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID);
            imgur.upload(file.path, (err, img) => {
                return User.findByPk(id)
                    .then((user) => {
                        user.update({ name, email, image: file ? img.data.link : user.image })
                            .then(() => {
                                req.flash('success_messages', 'user was updated successfully')
                                res.redirect(`/users/${id}`)
                            })
                    })
            })
        } else {
            return User.findByPk(id)
                .then((user) => {
                    user.update({ name, email, image: user.image })
                        .then(() => {
                            req.flash('success_messages', 'user was updated successfully')
                            res.redirect(`/users/${id}`)
                        })
                })
        }
    },
    addFavorite: (req, res) => {
        return Favorite.create({
            UserId: req.user.id,
            RestaurantId: req.params.restaurantId
        })
            .then((restaurant) => {
                return res.redirect('back')
            })
    },
    removeFavorite: (req, res) => {
        return Favorite.findOne({
            where: {
                UserId: req.user.id,
                RestaurantId: req.params.restaurantId
            }
        })
            .then((favorite) => {
                favorite.destroy()
                    .then((restaurant) => {
                        return res.redirect('back')
                    })
            })
    },
    addLike: (req, res) => {
        return Like.findOrCreate({
            where: {
                UserId: req.user.id,
                RestaurantId: req.params.restaurantId
            }
        }).then((result) => {
            return res.redirect('back')
        })
    },
    removeLike: (req, res) => {
        return Like.findOne({
            where: {
                UserId: req.user.id,
                RestaurantId: req.params.restaurantId
            }
        })
            .then(like => {
                if (!like) {
                    return res.redirect('back')
                } else {
                    like.destroy()
                        .then(restaurant => {
                            return res.redirect('back')
                        })
                }
            })
    }
}
module.exports = userController