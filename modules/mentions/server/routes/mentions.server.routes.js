'use strict';

/**
 * Module dependencies
 */
var mentionsPolicy = require('../policies/mentions.server.policy'),
  mentions = require('../controllers/mentions.server.controller');

module.exports = function (app) {
  // Mentions collection routes
  app.route('/api/mentions').all(mentionsPolicy.isAllowed)
    .get(mentions.list)
    .post(mentions.create);

  // Single mention routes
  app.route('/api/mentions/:mentionId').all(mentionsPolicy.isAllowed)
    .get(mentions.read)
    .put(mentions.update)
    .delete(mentions.delete);

  app.route('/api/mentions/:mentionId/copy').post(mentions.copy);
  // Finish by binding the mention middleware
  app.param('mentionId', mentions.mentionByID);
};
