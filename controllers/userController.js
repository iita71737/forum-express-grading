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
const Followship = db.Followship

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
        const userId = helpers.getUser(req).id
        return Favorite.create({
            UserId: userId,
            RestaurantId: req.params.restaurantId
        })
            .then((restaurant) => {
                return res.redirect('back')
            })
    },
    removeFavorite: (req, res) => {
        const userId = helpers.getUser(req).id
        return Favorite.findOne({
            where: {
                UserId: userId,
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
        const userId = helpers.getUser(req).id
        return Like.findOrCreate({
            where: {
                UserId: userId,
                RestaurantId: req.params.restaurantId
            }
        }).then(() => {
            return res.redirect('back')
        }).catch((err) => res.send(err))
    },
    removeLike: (req, res) => {
        const userId = helpers.getUser(req).id
        return Like.findOne({
            where: {
                UserId: userId,
                RestaurantId: req.params.restaurantId
            }
        })
            .then((like) => {
                like.destroy()
                    .then(() => {
                        return res.redirect('back')
                    }).catch((err) => res.send(err))
            })
    },
    getTopUser: (req, res) => {
        // 撈出所有 User 與 followers 資料
        return User.findAll({
            include: [
                { model: User, as: 'Followers' }
            ]
        }).then(users => {
            // 整理 users 資料
            users = users.map(user => ({
                ...user.dataValues,
                // 計算追蹤者人數
                FollowerCount: user.Followers.length,
                // 判斷目前登入使用者是否已追蹤該 User 物件
                isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
            }))
            // 依追蹤者人數排序清單
            users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
            return res.render('topUser', { users: users })
        })
    },
    addFollowing: (req, res) => {
        return Followship.create({
            followerId: req.user.id,
            followingId: req.params.userId
        })
            .then((followship) => {
                return res.redirect('back')
            })
    },

    removeFollowing: (req, res) => {
        return Followship.findOne({
            where: {
                followerId: req.user.id,
                followingId: req.params.userId
            }
        })
            .then((followship) => {
                followship.destroy()
                    .then((followship) => {
                        return res.redirect('back')
                    })
            })
    }
}
module.exports = userController