angular.module('fyp.inventoryManageController', [])

    .controller('InventoryManageCtrl', function ($scope, $ionicPopup, $state, $location, $ionicModal, apiService, $localStorage) {
        $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        $scope.testUser = { username: 'test123', password: 'test123' };
        // $scope.inventoryList = [];
        $scope.deleteInventoryId;
        $scope.createInventoryForm = { productId: '', iName: '', checkInTime: '', distance: '', status: '', price: '', location: '' };
        $scope.userLogin = function (username, password) {
            console.log("User login request");
            checkUserLogin();
            console.log("Username: " + $scope.formUser.username + ", Password: " + $scope.formUser.password)
        }

        $scope.$on("$ionicView.beforeEnter", function (scopes, states) {
            $scope.storageInit();
            getInventoryList();
        });


        function getInventoryList() {
            apiService.getInventoryList().then(function (data) {
                $scope.inventoryList = data;
                console.log("Inventory List: ");
                console.log($scope.inventoryList);
                $scope.$apply();
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

        $scope.logout = function () {
            delete $localStorage.currentUser;
            $state.go('tab.login');
        }

        $scope.back = function () {
            $state.go('tab.menu');
        }

        $scope.deleteInventory = function (itemId) {
            apiService.deleteItem(itemId).then(function (data) {
                showSuccessAlert();
            });

        }

        function showSuccessAlert() {
            swal({
                title: "Sccess !",
                // text: "Inventory has been created!",
                icon: "success",
            }).then((value) => {
                location.reload();
            });
        }



        function rssiToDistance(rssi) {
            // if (rssi === 0) {
            //   return -1;
            // }
            // var ratio = rssi * 1 / txPower;
            // if (ratio < 1.0) {
            //   return Math.pow(ratio, 10);
            // } else {
            //   return (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
            // }
            // return 10 ^ ((txPower-rssi) / 10 * 2) 
            return -rssi / 26.6666666666
        }

        console.log(rssiToDistance(2, -61))

        $ionicModal.fromTemplateUrl('inventoryModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });
        $scope.openInventoryModal = function () {
            $scope.modal.show();
        };
        $scope.closeInventoryModal = function () {
            $scope.modal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.modal.remove();
        });
        // Execute action on hide modal
        $scope.$on('modal.hidden', function () {
            // Execute action
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function () {
            // Execute action
        });

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
            var createInventoryFormPopup = $ionicPopup.show({
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
                            apiService.createNewInventory($scope.createInventoryForm).then(function (data) {
                                console.log("Success");
                                createInventoryFormPopup.close();
                                showSuccessAlert();
                            });
                        }
                    }
                ]
            });
        }

        $scope.beacons = [];

        $scope.startScanBeacon = function () {
            // console.log("start scan")
            // ble.startScan([], function (device) {
            //     console.log(JSON.stringify(device));
            //     $scope.beacons.push(device)
            // });

            // setTimeout(ble.stopScan,
            //     2000,
            //     function () { console.log("Scan complete"); },
            //     function () { console.log("stopScan failed"); }
            // );
            return new Promise((resolve, reject) => {
                console.log("start scan")
                var scanInverval = setInterval(function () {
                    ble.startScan([], function (device) {
                        console.log(JSON.stringify(device));
                        $scope.beacons = [];
                        $scope.beacons.push(device);
                    });

                    setTimeout(ble.stopScan,
                        2000,
                        function () { console.log("Scan complete"); resolve('success') },
                        function () { console.log("stopScan failed"); reject(new Error('something wrong')) }
                    );
                }, 3000);
            })
        }



        $scope.showInventoryPopup = function (inventory) {
            console.log(inventory)
            $scope.data = {}
            $scope.inventory = inventory;
            var distance = 0;
            // $scope.inventory.checkInTime = moment(inventory.checkInTime).format('MMMM Do YYYY, h:mm:ss a')
            // $scope.startScanBeacon();
            // $scope.openInventoryModal();
            $scope.startScanBeacon().then(function (data) {
                console.log(JSON.stringify($scope.inventory))
                for (var i = 0; i < $scope.beacons.length; i++) {
                    if ($scope.beacons[i].id == inventory.beacon) {
                        $scope.inventory.distance = rssiToDistance($scope.beacons[i].rssi).toFixed(2);
                    }
                }

                inventoryPopupTemplate = '<div class="row"><div class="col" style="font-weight:bold">ItemId </div> <div class="col">' + inventory.itemId + '</div></div> <div class="row"><div class="col" style="font-weight:bold">ProductId</div><div class="col"> ' + inventory.productId + '</div></div> <div class="row"><div class="col" style="font-weight:bold"> Check-in time </div> <div class="col"> ' + moment(inventory.checkInTime).format('MMMM Do YYYY, h:mm:ss a') + '</div></div><div class="row"><div class="col" style="font-weight:bold">Distance </div> <div class="col"><span class="biggerText">{{inventory.distance}} M</span></div></div>'
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

            });

        };



        $scope.startScan = function () {
            console.log("scanning..");
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    // alert("We got a barcode\n" +
                    //     "Result: " + result.text + "\n" +
                    //     "Format: " + result.format + "\n" +
                    //     "Cancelled: " + result.cancelled);
                    // createInventoryPopup.close();
                    console.log(result.text);
                    $scope.createInventoryForm.productId = result.text;
                    $scope.createInventory();
                },
                function (error) {
                    console.log("Scanning failed: " + error);
                }
            );
        }

        $scope.startDeleteScan = function () {
            console.log("scanning..");
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    // alert("We got a barcode\n" +
                    //     "Result: " + result.text + "\n" +
                    //     "Format: " + result.format + "\n" +
                    //     "Cancelled: " + result.cancelled);
                    deleteInventoryPopup.close();
                    deleteInventoryId = result.text;
                    $scope.deleteInventory(deleteInventoryId);
                },
                function (error) {
                    console.log("Scanning failed: " + error);
                }
            );
        }

        $scope.showCreateInventoryPopup = function () {

            var createInventoryPopupTemplate = '<h4 style="margin: auto; display: block; text-align: center;">Scan the barcode or QR code of the inventory</h4><img ng-click="startScan()" style="margin: auto; display: block;width: 90%; height: 90%"src="./img/scan.png"><input ng-model="createInventoryForm.productId"></input>'
            var createInventoryPopup = $ionicPopup.show({
                //templateUrl: 'templates/popup/inventory-popup.html',
                template: createInventoryPopupTemplate,
                // title: inventory.iName,
                //subTitle: 'Subtitle',
                scope: $scope,

                buttons: [
                    { text: 'Cancel' }, {
                        text: '<b>Next</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            createInventoryPopup.close();
                            // createInventoryForm.productId = result.text;
                            $scope.createInventory();
                        }
                    }
                ]
            });

            createInventoryPopup.then(function (res) {
                console.log('Tapped!', res);
            });
        };

        $scope.showDeleteInventoryPopup = function () {
            $scope.data = {}
            var deleteInventoryPopupTemplate = '<h4 style="margin: auto; display: block; text-align: center;">Scan the barcode or QR code of the inventory</h4><img ng-click="startScan()" style="margin: auto; display: block;width: 90%; height: 90%"src="./img/scan.png"><input ng-model="deleteInventoryId"></input>'
            var deleteInventoryPopup = $ionicPopup.show({
                //templateUrl: 'templates/popup/inventory-popup.html',
                template: deleteInventoryPopupTemplate,
                // title: inventory.iName,
                //subTitle: 'Subtitle',
                scope: $scope,

                buttons: [
                    { text: 'Cancel' }
                ]
            });

            deleteInventoryPopup.then(function (res) {
                console.log('Tapped!', res);
            });
        };

        // $scope.showCreateInventoryPopup();

    })

