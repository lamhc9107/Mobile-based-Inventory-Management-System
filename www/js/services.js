angular.module('fyp.services', [])

  .factory('apiService', function ($http) {
    var apiUrl = "http://localhost:9000/";
    return {
      getUserList: function () {
        return $http({
          method: "GET",
          url: apiUrl + "users",
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }).then(function mySucces(response) {
          // console.log(response);
          return response;
        }, function myError(response) {

        })
      },
      getUserById: function (_userId) {
        return $http({
          method: "GET",
          url: apiUrl + "users/" + _userId,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }).then(function mySucces(response) {
          // console.log(response);
          return response;
        }, function myError(response) {

        })
      },
      createNewUser: function (createUserform, nextUserId) {
        console.log(nextUserId);
        return $http({
          method: "POST",
          url: apiUrl + "users",
          // withCredentials: true,
          data: {
            userId: nextUserId,
            username: createUserform.username,
            password: createUserform.password,
            role: createUserform.role,
            email: createUserform.email,
            phone: createUserform.phone
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then(function mySucces(response) {
          // console.log(response);
          return response;
        }, function myError(response) {

        })
      },
      deleteUser: function (_userId) {
        console.log(_userId);
        return $http({
          method: "DELETE",
          url: apiUrl + "users",
          // withCredentials: true,
          data: {
            userId: Number(_userId),
          },
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }).then(function mySucces(response) {
          // console.log(response);
          return response;
        }, function myError(response) {

        })
      },
      getInventoryList: function () {
        return $http({
          method: "GET",
          url: apiUrl + "inventories",
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }).then(function mySucces(response) {
          // console.log(response);
          return response;
        }, function myError(response) {

        })
      },
      getInventoryById: function (_itemId) {
        return $http({
          method: "GET",
          url: apiUrl + "inventories/" + _itemId,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }).then(function mySucces(response) {
          // console.log(response);
          return response;
        }, function myError(response) {

        })
      },
      createNewInventory: function (createInventoryform, nextItemId) {
        console.log(nextItemId);
        return $http({
          method: "POST",
          url: apiUrl + "inventories",
          // withCredentials: true,
          data: {
            userId: nextItemId,
            productId: createInventoryform.productId,
            iName: createInventoryform.iName,
            checkInTime: createInventoryform.checkInTime,
            distance: createInventoryform.distance,
            status: createInventoryform.status,
            price: createInventoryform.price
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then(function mySucces(response) {
          // console.log(response);
          return response;
        }, function myError(response) {

        })
      },
      deleteUser: function (_itemId) {
        console.log(_itemId);
        return $http({
          method: "DELETE",
          url: apiUrl + "inventories",
          // withCredentials: true,
          data: {
            userId: Number(_itemId),
          },
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }).then(function mySucces(response) {
          // console.log(response);
          return response;
        }, function myError(response) {

        })
      }
    }
  })

  .directive('hideTabs', function ($rootScope) {
    return {
      restrict: 'A',
      link: function ($scope, $el) {
        $rootScope.hideTabs = 'tabs-item-hide';
        $scope.$on('$destroy', function () {
          $rootScope.hideTabs = '';
        });
      }
    };
  });
