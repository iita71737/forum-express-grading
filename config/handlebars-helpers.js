const moment = require('moment')

module.exports = {
    ifCond: function (a, b, options) {
        if (a === b) {
            return options.fn(this)
        }
        return options.inverse(this)
    },
    moment: function (a) {
        return moment(a).fromNow()
    },
    imageNull: function (a) {
        if (!a) {
            return 'https://icon-library.com/images/default-user-icon/default-user-icon-13.jpg'
        }
        return a
    }
}

