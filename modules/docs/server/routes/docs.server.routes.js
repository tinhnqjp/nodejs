'use strict';

/**
 * Module dependencies
 */
var docsPolicy = require('../policies/docs.server.policy'),
  docs = require('../controllers/docs.server.controller');

module.exports = function (app) {
  // Docs collection routes
  app.route('/api/docs').all(docsPolicy.isAllowed)
    .get(docs.list)
    .post(docs.create);

  // Single doc routes
  app.route('/api/docs/:docId').all(docsPolicy.isAllowed)
    .get(docs.read)
    .put(docs.update)
    .delete(docs.delete);

  // Finish by binding the doc middleware
  app.param('docId', docs.docByID);
  app.route('/api/listMasterCheckSheetForm4').get(docs.listMasterCheckSheetForm4);
  app.route('/api/listMasterCheckSheetForm7').get(docs.listMasterCheckSheetForm7);
};
