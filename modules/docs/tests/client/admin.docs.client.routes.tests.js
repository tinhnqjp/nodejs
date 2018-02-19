(function () {
  'use strict';

  describe('Docs Route Tests', function () {
    // Initialize global variables
    var $scope,
      DocsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _DocsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      DocsService = _DocsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('admin.docs');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/docs');
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
          liststate = $state.get('admin.docs.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('/modules/docs/client/views/admin/list-docs.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          DocsAdminController,
          mockDoc;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.docs.create');
          $templateCache.put('/modules/docs/client/views/admin/form-doc.client.view.html', '');

          // Create mock doc
          mockDoc = new DocsService();

          // Initialize Controller
          DocsAdminController = $controller('DocsAdminController as vm', {
            $scope: $scope,
            docResolve: mockDoc
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.docResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/docs/create');
        }));

        it('should attach an doc to the controller scope', function () {
          expect($scope.vm.doc._id).toBe(mockDoc._id);
          expect($scope.vm.doc._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('/modules/docs/client/views/admin/form-doc.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          DocsAdminController,
          mockDoc;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.docs.edit');
          $templateCache.put('/modules/docs/client/views/admin/form-doc.client.view.html', '');

          // Create mock doc
          mockDoc = new DocsService({
            _id: '525a8422f6d0f87f0e407a33',
            meishou: 'An Doc about MEAN',
            hourei_nasuta: 'MEAN rocks!'
          });

          // Initialize Controller
          DocsAdminController = $controller('DocsAdminController as vm', {
            $scope: $scope,
            docResolve: mockDoc
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:docId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.docResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            docId: 1
          })).toEqual('/admin/docs/1/edit');
        }));

        it('should attach an doc to the controller scope', function () {
          expect($scope.vm.doc._id).toBe(mockDoc._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('/modules/docs/client/views/admin/form-doc.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
