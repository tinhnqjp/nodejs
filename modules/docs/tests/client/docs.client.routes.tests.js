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
          mainstate = $state.get('docs');
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
          liststate = $state.get('docs.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('/modules/docs/client/views/list-docs.client.view.html');
        });
      });

      describe('View Route', function () {
        var viewstate,
          DocsController,
          mockDoc;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('docs.view');
          $templateCache.put('/modules/docs/client/views/view-doc.client.view.html', '');

          // create mock doc
          mockDoc = new DocsService({
            _id: '525a8422f6d0f87f0e407a33',
            meishou: 'An Doc about MEAN',
            hourei_nasuta: 'MEAN rocks!'
          });

          // Initialize Controller
          DocsController = $controller('DocsController as vm', {
            $scope: $scope,
            docResolve: mockDoc
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:docId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.docResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            docId: 1
          })).toEqual('/docs/1');
        }));

        it('should attach an doc to the controller scope', function () {
          expect($scope.vm.doc._id).toBe(mockDoc._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('/modules/docs/client/views/view-doc.client.view.html');
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/docs/client/views/list-docs.client.view.html', '');

          $state.go('docs.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('docs/');
          $rootScope.$digest();

          expect($location.path()).toBe('/docs');
          expect($state.current.templateUrl).toBe('/modules/docs/client/views/list-docs.client.view.html');
        }));
      });
    });
  });
}());
