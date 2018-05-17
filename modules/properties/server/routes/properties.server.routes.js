'use strict';

/**
 * Module dependencies
 */
var propertiesPolicy = require('../policies/properties.server.policy'),
  properties = require('../controllers/properties.server.controller');

module.exports = function (app) {
  // Properties collection routes
  app.route('/api/properties').all(propertiesPolicy.isAllowed)
    .get(properties.list)
    .post(properties.create);

  // Single property routes
  app.route('/api/properties/:propertyId').all(propertiesPolicy.isAllowed)
    .get(properties.read)
    .put(properties.update)
    .delete(properties.delete);

  // Finish by binding the property middleware
  app.param('propertyId', properties.propertyByID);

  app.route('/api/importPropertyFormMysql').post(properties.importPropertyFormMysql);
  app.route('/api/requestPropertiesMysql').post(properties.requestPropertiesMysql);
  app.route('/api/listMasterCheckSheetForm4').get(properties.listMasterCheckSheetForm4);
  app.route('/api/listMasterCheckSheetForm7').get(properties.listMasterCheckSheetForm7);
};
