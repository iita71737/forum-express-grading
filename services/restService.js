const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const pageLimit = 10
const Comment = db.Comment
const User = db.User
const helpers = require('../_helpers.js')

const restService = {
    getRestaurants: (req, res, callback) => {
        let offset = 0
        const whereQuery = {}
        let categoryId = ''
        if (req.query.page) {
            offset = (req.query.page - 1) * pageLimit
        }
        if (req.query.categoryId) {
            categoryId = Number(req.query.categoryId)
            whereQuery.CategoryId = categoryId
        }
        Restaurant.findAndCountAll({
            include: Category,
            where: whereQuery,
            offset: offset,
            limit: pageLimit
        }).then(result => {
            // data for pagination
            const page = Number(req.query.page) || 1
            const pages = Math.ceil(result.count / pageLimit)
            const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
            const prev = page - 1 < 1 ? 1 : page - 1
            const next = page + 1 > pages ? pages : page + 1

            const data = result.rows.map(r => ({
                ...r.dataValues,
                description: r.dataValues.description.substring(0, 50),
                categoryName: r.Category.name,
                isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
                isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
            }))
            Category.findAll({
                raw: true,
                nest: true
            }).then(categories => {
                return callback({
                    restaurants: data,
                    categories: categories,
                    categoryId: categoryId,
                    page: page,
                    totalPage: totalPage,
                    prev: prev,
                    next: next
                })
            })
        })
    },
    getRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id, {
            include: [
                Category,
                { model: User, as: 'FavoritedUsers' },
                { model: User, as: 'LikedUsers' },
                { model: Comment, include: [User] }
            ]
        }).then(restaurant => {
            const userId = helpers.getUser(req).id
            const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(userId)
            const isLiked = restaurant.LikedUsers.map(d => d.id).includes(userId)
            restaurant.increment('viewCounts', { by: 1 })
            callback({
                restaurant: restaurant.toJSON(),
                isFavorited: isFavorited,
                isLiked: isLiked
            })
        })
    },
    getFeeds: (req, res, callback) => {
        return Promise.all([
            Restaurant.findAll({
                limit: 10,
                raw: true,
                nest: true,
                order: [['createdAt', 'DESC']],
                include: [Category]
            }),
            Comment.findAll({
                limit: 10,
                raw: true,
                nest: true,
                order: [['createdAt', 'DESC']],
                include: [User, Restaurant]
            })
        ]).then(([restaurants, comments]) => {
            callback({
                restaurants: restaurants,
                comments: comments
            })
        })
    },
    getDashboard: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id, {
            include: [
                Category,
                { model: Comment, include: [User] }
            ]
        }).then(restaurant => restaurant.increment('viewCounts', { by: 1 }))
            .then(restaurant => {
                return callback({ restaurant: restaurant.toJSON() })
            })
    },
    getTopRestaurant: async (req, res, callback) => {
        let restaurants = await Restaurant.findAll({ include: [{ model: User, as: 'FavoritedUsers' }] })
            .then(restaurants => {
                restaurants = restaurants.map(r => ({
                    ...r.dataValues,
                    description: r.dataValues.description.substring(0, 50),
                    FavoritedCount: r.FavoritedUsers.length,
                    isFavorited: helpers.getUser(req).FavoritedRestaurants.map(d => d.id).includes(r.id)
                }))
                restaurants.sort((a, b) => b.FavoritedCount - a.FavoritedCount)
                restaurants = restaurants.slice(0, 10)
                return callback({ restaurants })
            })

    }
}
module.exports = restService