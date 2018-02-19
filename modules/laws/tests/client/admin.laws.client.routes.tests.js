(function () {
  'use strict';

  describe('Laws Route Tests', function () {
    // Initialize global variables
    var $scope,
      LawsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _LawsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      LawsService = _LawsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('admin.laws');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/laws');
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
          liststate = $state.get('admin.laws.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('/modules/laws/client/views/admin/list-laws.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          LawsAdminController,
          mockLaw;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.laws.create');
          $templateCache.put('/modules/laws/client/views/admin/form-law.client.view.html', '');

          // Create mock law
          mockLaw = new LawsService();

          // Initialize Controller
          LawsAdminController = $controller('LawsAdminController as vm', {
            $scope: $scope,
            lawResolve: mockLaw
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.lawResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/laws/create');
        }));

        it('should attach an law to the controller scope', function () {
          expect($scope.vm.law._id).toBe(mockLaw._id);
          expect($scope.vm.law._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('/modules/laws/client/views/admin/form-law.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          LawsAdminController,
          mockLaw;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.laws.edit');
          $templateCache.put('/modules/laws/client/views/admin/form-law.client.view.html', '');

          // Create mock law
          mockLaw = new LawsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Law about MEAN',
            hourei_nasuta: 'MEAN rocks!'
          });

          // Initialize Controller
          LawsAdminController = $controller('LawsAdminController as vm', {
            $scope: $scope,
            lawResolve: mockLaw
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:lawId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.lawResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            lawId: 1
          })).toEqual('/admin/laws/1/edit');
        }));

        it('should attach an law to the controller scope', function () {
          expect($scope.vm.law._id).toBe(mockLaw._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('/modules/laws/client/views/admin/form-law.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
