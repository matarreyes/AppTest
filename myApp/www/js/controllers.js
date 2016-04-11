angular.module('starter.controllers', [])

  .controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

  })

  .controller('PlaylistsCtrl', function ($scope, $q, $PouchDBListener, $ionicLoading) {
    $PouchDBListener.startListening();

    $q.when(
      localDB.get('days')
    ).then(function (doc) {
        $scope.days = doc.rows;
      }).catch(function (err) {
        console.log(err);
        $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0
        });
      });

    /**
     * Puts the new data when changes
     */
    $scope.$on('$PouchDBListener:change', function (event, data) {
      if (data.id == 'days') {
        $scope.days = data.doc.rows;
        $ionicLoading.hide();
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
        }).map(function (element) {
          element.fields.Hour = moment(element.fields.Hour).format("HH:mm");
          return element;
        });
      }).catch(function (err) {
        console.log(err);
      });
  })
  .controller('ActivityCtrl', function ($scope, $q, $stateParams) {
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
  .controller('ModalCtrl', function($scope, $ionicModal) {

    $ionicModal.fromTemplateUrl('templates/speaker.html', {
      scope: $scope,
      animation: 'slide-in-up',
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function () {
      $scope.modal.show();
    };

    $scope.closeModal = function () {
      $scope.modal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });
  })
  .controller('TodayCtrl', function ($scope, $q, $stateParams) {
    $q.when(
      localDB.get('days')
    ).then(function (doc) {
        var todayList = doc.rows.filter(function (element) {
          return moment(element.fields.Day).format("DD-MM-YYYY") == moment().format("DD-MM-YYYY");
        });

        if (todayList.length > 0) {
          $scope.today = todayList[0];
          $scope.isNotToday = false;
          return todayList.length;
        } else {
          $scope.isNotToday = true;
          return 0;
        }
      }).then(function (len) {
        if (len > 0) {
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
