var app = angular.module('Vidzy', ['ngResource', 'ngRoute']);

(function () {
  angular
    .module('Vidzy')
    .service('authentication', authentication)

  authentication.$inject = ['$window']
  // authentication.$inject = ['$window']
  function authentication ($window) {
    var saveToken = function (token) {
      $window.localStorage['Vidzy-token'] = token
    }

    var getToken = function (token) {
      return $window.localStorage['Vidzy-token']
    }

    var logout = function() {
      $window.localStorage.removeItem('Vidzy-token');
    };

    var register = function(user, $http) {
      return $http.post('/api/auth/register', user).success(function(data){
        saveToken(data.token);
      });
    };

    var login = function(user, $http) {
      return $http.post('/api/auth/login', user).success(function(data) {
        saveToken(data.token);
      });
    };

    var isLoggedIn = function () {
      var token = getToken()

      if (token) {
        var payload = JSON.parse($window.atob(token.split('.')[1]))

        return payload.exp > (Date.now() / 1000)
      } else {
        return false
      }
    }

    var currentUser = function() {
      if(isLoggedIn()) {
        var token = getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));
        return {
          email : payload.email,
          name : payload.name
        };
      }
    };

    return {
      saveToken: saveToken,
      getToken: getToken,
      logout: logout,
      register: register,
      login: login,
      isLoggedIn: isLoggedIn,
      currentUser: currentUser
    }
  }
})()

app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl'
        })
        .when('/add-video', {
            templateUrl: 'partials/video-form.html',
            controller: 'AddVideoCtrl'
        })
        .when('/video/:id', {
            templateUrl: 'partials/video-form.html',
            controller: 'EditVideoCtrl'
        })
        .when('/delete/:id', {
            templateUrl: 'partials/delete-confirm-view.html',
            controller: 'DeleteVideoCtrl'
        })
        .when('/register', {
            templateUrl: 'partials/auth/register-view.html',
            controller: 'RegisterCtrl',
            controllerAs: 'vm'
        })
        .when('/login', {
            templateUrl: 'partials/auth/login-view.html',
            controller: 'LoginCtrl',
            controllerAs: 'vm'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

app.controller('HomeCtrl', ['$scope', '$resource',
    function($scope, $resource){
      var Videos = $resource('/api/videos');
        Videos.query(function(videos){
            $scope.videos = videos;
        });
    }]);

app.controller('AddVideoCtrl', ['$scope', '$resource', '$location', 'authentication',
    function($scope, $resource, $location, authentication){
        $scope.save = function(){
            var Videos = $resource('/api/videos', {}, {
              save: {
                method: 'POST',
                headers: { Authorization: 'Bearer '+ authentication.getToken() }
              }
            });
            Videos.save($scope.video, function(){
                $location.path('/');
            });
        };
    }]);

app.controller('EditVideoCtrl', ['$scope', '$resource', '$location', '$routeParams', 'authentication',
    function($scope, $resource, $location, $routeParams, authentication) {
        var Videos = $resource('/api/videos/:id', { id: '@_id' }, {
            update: {
              method: 'PUT',
              headers: { Authorization: 'Bearer '+ authentication.getToken() }
            }
        });

        Videos.get({ id: $routeParams.id }, function(video){
            $scope.video = video;
        });

        $scope.save = function(){
            Videos.update($scope.video, function(){
                $location.path('/');
            });
        }
    }]);

app.controller('DeleteVideoCtrl', ['$scope', '$resource', '$location', '$routeParams', 'authentication',
    function($scope, $resource, $location, $routeParams, authentication) {
        var Videos = $resource('/api/videos/:id', { id: '@_id' }, {
          delete: {
            method: 'DELETE',
            headers: { Authorization: 'Bearer '+ authentication.getToken() }
          }
        });

        Videos.get({ id: $routeParams.id }, function(video){
            $scope.video = video;
        });

        $scope.delete = function(){
            Videos.delete({ id: $routeParams.id }, function(){
                $location.path('/');
            });
        }
    }]);

app.controller('RegisterCtrl', ['$location', '$http', 'authentication',
    function($location, $http, authentication){
        var vm = this

        vm.pageHeader = {
          title: 'Create a new Vidzy account'
        }
        vm.credentials = {
          name: '',
          email: '',
          password: ''
        }
        vm.returnPage = $location.search().page || '/'
        vm.onSubmit = function () {
          vm.formError = ''

          if (!vm.credentials.name || !vm.credentials.email ||
            !vm.credentials.password) {
            vm.formError = 'All fields are required. Please try again.'
            return false
          } else {
            vm.doRegister()
          }
        }

        vm.doRegister = function () {
          vm.formError = ''

          authentication
            .register(vm.credentials, $http)
            .error(function (err) {
              vm.formError = err
            })
            .then(function () {
              $location.search('page', null)
              $location.path(vm.returnPage)
            })
        }
    }]);

app.controller('LoginCtrl', ['$location', '$http', 'authentication',
    function($location, $http, authentication) {
        var vm = this
        console.log('LoinCtrl works')
        vm.pageHeader = {
          title: 'Sign in to Vidzy'
        }
        vm.credentials = {
          email: '',
          password: ''
        }
        vm.returnPage = $location.search().page || '/'
        vm.onSubmit = function () {
          vm.formError = ''
          console.log('on submit function is present')
          if (!vm.credentials.email ||
            !vm.credentials.password) {
            vm.formError = 'All fields are required. Please try again.'
            return false
          } else {
            vm.doLogin()
          }
        }

        vm.doLogin = function () {
          vm.formError = ''

          authentication
            .login(vm.credentials, $http)
            .error(function (err) {
              vm.formError = err
            })
            .then(function () {
              $location.search('page', null)
              $location.path(vm.returnPage)
            })
        }
    }]);
