const restService = require('../../services/restService.js')

const restController = {
    getRestaurants: (req, res) => {
        restService.getRestaurants(req, res, (data) => {
            return res.json(data)
        })
    },
    getRestaurant: (req, res) => {
        restService.getRestaurant(req, res, (data) => {
            return res.json(data)
        })
    },
    getFeeds: (req, res) => {
        restService.getFeeds(req, res, (data) => {
            return res.json(data)
        })
    },
    getDashboard: (req, res) => {
        restService.getDashboard(req, res, (data) => {
            return res.json(data)
        })
    },
    getTopRestaurant: (req, res) => {
        restService.getTopRestaurant(req, res, (data) => {
            return res.json(data)
        })
    }
}

module.exports = restController