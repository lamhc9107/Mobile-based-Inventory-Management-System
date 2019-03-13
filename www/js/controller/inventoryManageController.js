angular.module('fyp.inventoryManageController', [])

    .controller('InventoryManageCtrl', function ($scope, $ionicPopup, $state, $location, $ionicModal, apiService,$localStorage) {
        $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        $scope.testUser = { username: 'test123', password: 'test123' };
        $scope.inventoryList = [];
        var nextItemId ='';
        $scope.testInventory = { itemId: '000001', productId: '000001', iName: 'testInventory', checkInTime: '2019-01-25T12:00:00Z', distance: '33.2', status: 'Available',price:'30'}
        $scope.userLogin = function (username, password) {
            console.log("User login request");
            checkUserLogin();
            console.log("Username: " + $scope.formUser.username + ", Password: " + $scope.formUser.password)
        }
        getInventoryList();

        function getInventoryList() {
            apiService.getInventoryList().then(function (data) {
                $scope.inventoryList = data.data.recordset;
                console.log("User List: " + $scope.inventoryList);
                console.log($scope.inventoryList);
                for(var i = 0; i< $scope.inventoryList.length;i++){
                    if($scope.inventoryList[i].item > nextItemId){
                        nextItemId = $scope.inventoryList[i].itemId
                    }
                }
                nextUserId = Number(nextItemId) +1;
                console.log(nextItemId);
            });
        }

        $scope.storageInit = function () {
            if ($localStorage.currentUser == undefined) {
                $state.go('tab.login');
            }
            $scope.$storage = $localStorage;
            $scope.currentUser = $scope.$storage.currentUser;
            console.log($scope.currentUser);
        }

        $scope.storageInit();
        $scope.logout = function () {
            delete $localStorage.currentUser;
            $state.go('tab.login');
        }

        $scope.back = function () {
            $state.go('tab.menu');
        }

        $scope.showInventoryPopup = function (inventory) {
            $scope.data = {}
            inventoryPopupTemplate = '<div class="row"><div class="col" style="font-weight:bold">ItemId </div> <div class="col">' + inventory.itemId + '</div></div> <div class="row"><div class="col" style="font-weight:bold">ProductId</div><div class="col"> ' + inventory.productId + '</div></div> <div class="row"><div class="col" style="font-weight:bold"> Check-in time </div> <div class="col"> ' + moment(inventory.checkInTime).format('MMMM Do YYYY, h:mm:ss a') + '</div></div><div class="row"><div class="col" style="font-weight:bold">Distance </div> <div class="col">' + inventory.distance + ' m</div></div>'
            var myPopup = $ionicPopup.show({
                //templateUrl: 'templates/popup/inventory-popup.html',
                template: inventoryPopupTemplate,
                title: inventory.iName,
                //subTitle: 'Subtitle',
                scope: $scope,

                buttons: [
                    { text: 'Cancel' }, {
                        text: '<b>Delete</b>',
                        type: 'button-positive',
                        onTap: function (e) {

                            if (!$scope.data.model) {
                                //don't allow the user to close unless he enters model...
                                e.preventDefault();
                            } else {
                                return $scope.data.model;
                            }
                        }
                    }
                ]
            });

            myPopup.then(function (res) {
                console.log('Tapped!', res);
            });
        };

    })

