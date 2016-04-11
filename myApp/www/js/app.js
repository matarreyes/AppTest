// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var localDB = new PouchDB("eventLocal", {auto_compaction:true, adapter: 'websql'});

angular.module('starter', ['ionic', 'starter.controllers'])
  .run(function ($ionicPlatform, $PouchDBListener) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }

      $PouchDBListener.sync(""); //TODO Change ip 192.168.0.114
    });
  })
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })

      .state('app.today', {
        url: '/today',
        views: {
          'menuContent': {
            templateUrl: 'templates/today.html',
            controller:'TodayCtrl'
          }
        }
      })
      .state('app.playlists', {
        url: '/playlists',
        views: {
          'menuContent': {
            templateUrl: 'templates/agenda.html',
            controller: 'PlaylistsCtrl'
          }
        }
      })

      .state('app.single', {
        url: '/playlists/:dayId',
        views: {
          'menuContent': {
            templateUrl: 'templates/schedule.html',
            controller: 'PlaylistCtrl'
          }
        }
      })

      .state('app.activity', {
        url: '/playlists/:dayId/:activityId',
        views: {
          'menuContent': {
            templateUrl: 'templates/activity.html',
            controller: 'ActivityCtrl'
          }
        }
      });


    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/playlists');

  })
  .service('$PouchDBListener', ['$rootScope', function ($rootScope) {
    var changeListener;

    /**
     * The base of the service is look for changes on the db, when something changes, sends the rows to the controller to repaint
     */
    this.startListening = function () {
      changeListener = localDB.changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on('change', function (change) {
        if (!change.deleted) {
          $rootScope.$broadcast("$PouchDBListener:change", change);
        } else {
          $rootScope.$broadcast("$PouchDBListener:delete", change);
        }
      })
    };

    /**
     * This function do the sync between databases, the retry options is like an interval is looking to connect all the time
     * @param remoteDatabase
     */
    this.sync = function (remoteDatabase) {
      localDB.replicate.from(remoteDatabase, {live: true, retry: true});

    }
  }]);
