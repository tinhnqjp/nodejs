(function (app) {
  'use strict';

  app.registerModule('laws', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('laws.admin', ['core.admin']);
  app.registerModule('laws.admin.routes', ['core.admin.routes']);
  app.registerModule('laws.services');
  app.registerModule('laws.routes', ['ui.router', 'core.routes', 'laws.services']);
}(ApplicationConfiguration));
