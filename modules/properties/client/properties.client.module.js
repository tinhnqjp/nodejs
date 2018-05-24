(function (app) {
  'use strict';

  app.registerModule('properties', ['core']);
  app.registerModule('properties.admin', ['core.admin']);
  app.registerModule('properties.admin.routes', ['core.admin.routes']);
  app.registerModule('properties.services', ['autocheck.services']);
  app.registerModule('properties.routes', ['ui.router', 'core.routes', 'properties.services']);
}(ApplicationConfiguration));
