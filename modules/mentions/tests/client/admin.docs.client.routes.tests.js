﻿(function () {
  'use strict';

  describe('Mentions Route Tests', function () {
    // Initialize global variables
    var $scope,
      MentionsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _MentionsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      MentionsService = _MentionsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('admin.mentions');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/mentions');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('List Route', function () {
        var liststate;
        beforeEach(inject(function ($state) {
          liststate = $state.get('admin.mentions.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('/modules/mentions/client/views/admin/list-mentions.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          MentionsAdminController,
          mockMention;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.mentions.create');
          $templateCache.put('/modules/mentions/client/views/admin/form-mention.client.view.html', '');

          // Create mock mention
          mockMention = new MentionsService();

          // Initialize Controller
          MentionsAdminController = $controller('MentionsAdminController as vm', {
            $scope: $scope,
            mentionResolve: mockMention
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.mentionResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/mentions/create');
        }));

        it('should attach an mention to the controller scope', function () {
          expect($scope.vm.mention._id).toBe(mockMention._id);
          expect($scope.vm.mention._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('/modules/mentions/client/views/admin/form-mention.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          MentionsAdminController,
          mockMention;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.mentions.edit');
          $templateCache.put('/modules/mentions/client/views/admin/form-mention.client.view.html', '');

          // Create mock mention
          mockMention = new MentionsService({
            _id: '525a8422f6d0f87f0e407a33',
            meishou: 'An Mention about MEAN',
            hourei_nasuta: 'MEAN rocks!'
          });

          // Initialize Controller
          MentionsAdminController = $controller('MentionsAdminController as vm', {
            $scope: $scope,
            mentionResolve: mockMention
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:mentionId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.mentionResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            mentionId: 1
          })).toEqual('/admin/mentions/1/edit');
        }));

        it('should attach an mention to the controller scope', function () {
          expect($scope.vm.mention._id).toBe(mockMention._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('/modules/mentions/client/views/admin/form-mention.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
