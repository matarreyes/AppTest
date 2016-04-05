angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data,
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  //$scope.loginData = {};
  //
  //// Create the login modal that we will use later
  //$ionicModal.fromTemplateUrl('templates/login.html', {
  //  scope: $scope
  //}).then(function(modal) {
  //  $scope.modal = modal;
  //});
  //
  //// Triggered in the login modal to close it
  //$scope.closeLogin = function() {
  //  $scope.modal.hide();
  //};
  //
  //// Open the login modal
  //$scope.login = function() {
  //  $scope.modal.show();
  //};
  //
  //// Perform the login action when the user submits the login form
  //$scope.doLogin = function() {
  //  console.log('Doing login', $scope.loginData);
  //
  //  // Simulate a login delay. Remove this and replace with your login
  //  // code if using a login system
  //  $timeout(function() {
  //    $scope.closeLogin();
  //  }, 1000);
  //};
})

.controller('PlaylistsCtrl', function($scope, $q, $PouchDBListener) {
    $PouchDBListener.startListening();

    $q.when(
      localDB.get('days')
    ).then(function(doc){
        $scope.days = doc.rows;
    }).catch(function (err){
      console.log(err);
    });

    /**
     * Puts the new data when changes
     */
    $scope.$on('$PouchDBListener:change', function(event, data) {
      if(data.id == 'days') {
        $scope.days = data.doc.rows;
        $scope.$apply();
      }
    });
})

.controller('PlaylistCtrl', function ($scope, $q, $stateParams) {
    $q.when(
      localDB.get('days')
    ).then(function (doc) {
        $scope.day = doc.rows.filter(function (element) {
          return element.id == $stateParams.dayId;
        })[0];
        $scope.day.fields.Day = moment($scope.day.fields.Day).format("DD MMMM YY");
      }).catch(function (err) {
        console.log(err);
      });

    $q.when(
      localDB.get('schedule')
    ).then(function (doc) {
        $scope.activities = doc.rows.filter(function (element) {
          return element.fields.Day[0] == $stateParams.dayId;
        }).map(function(element){
          element.fields.Hour = moment(element.fields.Hour).format("HH:mm");
          return element;
        });
      }).catch(function (err) {
        console.log(err);
      });
  })
  .controller('ActivityCtrl', function ($scope, $q, $stateParams){
    $q.when(
      localDB.get('schedule')
    ).then(function (doc) {
        $scope.activity = doc.rows.filter(function (element) {
          return element.id == $stateParams.activityId;
        })[0];
        $scope.activity.fields.Hour = moment($scope.activity.fields.Hour).format("HH:mm");
      }).catch(function (err) {
        console.log(err);
      });
  })
  .controller('TodayCtrl', function ($scope, $q, $stateParams){
    $q.when(
      localDB.get('days')
    ).then(function (doc) {
        var todayList = doc.rows.filter(function (element) {
          return moment(element.fields.Day).format("DD-MM-YYYY") == moment().format("DD-MM-YYYY");
        });

        if(todayList.length > 0){
          $scope.today = todayList[0];
          $scope.isNotToday = false;
          return todayList.length;
        }else{
          $scope.isNotToday = true;
          return 0;
        }
      }).then(function(len){
        if(len > 0) {
          $q.when(
            localDB.get('schedule')
          ).then(function (doc) {
              $scope.activities = doc.rows.filter(function (element) {
                return element.fields.Day[0] == $scope.today.id;
              }).map(function (element) {
                element.fields.Hour = moment(element.fields.Hour).format("HH:mm");
                return element;
              });
            }).catch(function (err) {
              console.log(err);
            });
        }
      }
      )
      .catch(function (err) {
        console.log(err);
      });


  });
