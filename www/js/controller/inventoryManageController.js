angular.module('fyp.inventoryManageController', [])

    .controller('InventoryManageCtrl', function ($scope, $ionicPopup, $state, $location, $ionicModal, apiService,$localStorage) {
        $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        $scope.testUser = { username: 'test123', password: 'test123' };
        $scope.inventoryList = [];
        var nextItemId = 0;
        $scope.createInventoryForm = {productId:'',iName:'',checkInTime:'',distance:'',status:'', price:'', location:''};
        $scope.userLogin = function (username, password) {
            console.log("User login request");
            checkUserLogin();
            console.log("Username: " + $scope.formUser.username + ", Password: " + $scope.formUser.password)
        }
        getInventoryList();

        function getInventoryList() {
            apiService.getInventoryList().then(function (data) {
                $scope.inventoryList = data;
                console.log("Inventory List: ");
                console.log($scope.inventoryList);
                for(var i = 0; i< $scope.inventoryList.length;i++){
                    if(Number($scope.inventoryList[i].itemId) > nextItemId){
                        nextItemId = $scope.inventoryList[i].itemId
                    }
                }
                nextItemId = Number(nextItemId) +1;
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

        $scope.deleteInventory = function(itemId){
            apiService.deleteItem(itemId).then(function (data) {
                location.reload();
            });

        }

        $scope.createInventory = function () {
            userPopupTemplate = '<div class="list">' +
                '<label class="item item-input item-stacked-label">' +
                '<span class="input-label">ProductId</span>' +
                '<input type="text" ng-model="createInventoryForm.productId" placeholder="">' +
                '</label>' +
                '<label class="item item-input item-stacked-label">' +
                '<span class="input-label">Item Name</span>' +
                '<input type="text" ng-model="createInventoryForm.iName" placeholder="">' +
                '</label>' +
                '<label class="item item-input item-stacked-label">' +
                '<span class="input-label">Price</span>' +
                '<input type="text" ng-model="createInventoryForm.price" placeholder="">' +
                '</label>' +
                '<label class="item item-input item-stacked-label">' +
                '<span class="input-label">Location</span>' +
                '<input type="text" ng-model="createInventoryForm.location" placeholder="">' +
                '</label>' +
                '</div>'
            var myPopup = $ionicPopup.show({
                template: userPopupTemplate,
                title: "Create new inventory",
                //subTitle: 'Subtitle',
                scope: $scope,

                buttons: [
                    { text: 'Cancel' }, {
                        text: '<b>Submit</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            console.log($scope.createInventoryForm);
                            apiService.createNewInventory($scope.createInventoryForm, nextItemId).then(function (data) {
                                console.log("Success");
                                location.reload();
                            });
                        }
                    }
                ]
            });
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

