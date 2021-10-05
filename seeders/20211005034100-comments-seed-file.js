'use strict';
const faker = require('faker')
const userRandomId = [5, 10, 15]

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Comments',
      Array.from({ length: 50 }).map((d, i) =>
      ({
        text: faker.lorem.words(Math.ceil(Math.random() * 30)),
        UserId: userRandomId[(Math.floor(Math.random() * 3))],
        RestaurantId: Math.floor((Math.random() * 60)) * 5,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      ), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  }
};
