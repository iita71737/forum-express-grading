'use strict';
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Comments',
      Array.from({ length: 50 }).map((d, i) =>
      ({
        text: faker.lorem.words(Math.ceil(Math.random() * 30)),
        UserId: Math.floor(Math.random() * 3) + 1,
        RestaurantId: Math.floor(Math.random() * 50) + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      ), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  }
};
