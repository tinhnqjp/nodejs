(function (app) {
  'use strict';

  app.registerModule('mentions', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('mentions.admin', ['core.admin']);
  app.registerModule('mentions.admin.routes', ['core.admin.routes']);
  app.registerModule('mentions.services');
  app.registerModule('mentions.routes', ['ui.router', 'core.routes', 'mentions.services']);
}(ApplicationConfiguration));
