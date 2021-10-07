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

const userService = {
    getUser: async (req, res, callback) => {
        const id = req.params.id
        const userId = helpers.getUser(req).id

        const user = await User.findByPk(id, {
            include: [
                { model: User, as: 'Followers', attributes: ['image', 'id'] },
                { model: User, as: 'Followings', attributes: ['image', 'id'] },
                { model: Restaurant, as: 'FavoritedRestaurants', attributes: ['image', 'id'] },
            ]
        })
        const commentData = await Comment.findAndCountAll({
            where: { UserId: id }, raw: true, nest: true, attributes: ['RestaurantId'],
            include: [
                { model: Restaurant, attributes: ['id', 'image'] }
            ]
        })

        const isFollowed = user.Followers.map(d => d.id).includes(helpers.getUser(req).id)
        //console.log('userId,req.params.userId, id::', userId, req.params.userId, id, typeof (id)
        return callback({
            userData: user.toJSON(),
            userId,
            comment: commentData.rows, n_comments: commentData.count,
            isFollowed
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
    putUser: (req, res, callback) => {
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
                                return callback({ status: 'success', message: 'updated successfully' })
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
                            return callback({ status: 'success', message: 'updated successfully' })
                        })
                })
        }
    },
    addFavorite: (req, res, callback) => {
        const userId = helpers.getUser(req).id
        return Favorite.create({
            UserId: userId,
            RestaurantId: req.params.restaurantId
        })
            .then((restaurant) => {
                return callback({ status: 'success', message: '' })
            })
    },
    removeFavorite: (req, res, callback) => {
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
                        return callback({ status: 'success', message: '' })
                    })
            })
    },
    addLike: (req, res, callback) => {
        const userId = helpers.getUser(req).id
        return Like.findOrCreate({
            where: {
                UserId: userId,
                RestaurantId: req.params.restaurantId
            }
        }).then(() => {
            return callback({ status: 'success', message: '' })
        }).catch((err) => res.send(err))
    },
    removeLike: (req, res, callback) => {
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
                        return callback({ status: 'success', message: '' })
                        //return res.redirect('back')
                    }).catch((err) => res.send(err))
            })
    },
    getTopUser: (req, res, callback) => {
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
            callback({ users: users })
        })
    },
    addFollowing: (req, res, callback) => {
        const userId = helpers.getUser(req).id
        return Followship.create({
            followerId: userId,
            followingId: req.params.userId
        })
            .then((followship) => {
                return callback({ status: 'success', message: '' })
            })
    },

    removeFollowing: (req, res, callback) => {
        const userId = helpers.getUser(req).id
        return Followship.findOne({
            where: {
                followerId: userId,
                followingId: req.params.userId
            }
        })
            .then((followship) => {
                followship.destroy()
                    .then((followship) => {
                        return callback({ status: 'success', message: '' })
                    })
            })
    }
}
module.exports = userService