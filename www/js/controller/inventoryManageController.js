angular.module('fyp.inventoryManageController', [])

    .controller('InventoryManageCtrl', function ($scope, $ionicPopup, $state, $location, $ionicModal, apiService, $localStorage) {
        $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        $scope.testUser = { username: 'test123', password: 'test123' };
        // $scope.inventoryList = [];
        $scope.deleteInventoryId;
        $scope.createInventoryForm = { productId: '', iName: '', checkInTime: '', distance: '', status: '', price: '', location: '', beacon: '' };
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
            $scope.showInventoryList = [];
            apiService.getInventoryList().then(function (data) {
                $scope.inventoryList = data;
                $scope.showInventoryList = $scope.inventoryList;
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
                '<span class="input-label">Beacon</span>' +
                '<input type="text" ng-model="createInventoryForm.beacon" placeholder="">' +
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


        $scope.startScanBeaconById = function (_id) {
            return new Promise((resolve, reject) => {
                console.log("start scan")
                scanInverval = setInterval(function () {
                    ble.startScan([], function (device) {
                        // console.log(JSON.stringify(device));
                        if (_id == device.id) {
                            $scope.beacon = device
                            console.log($scope.beacon.rssi)
                            $scope.$apply();
                        }
                    });
                    setTimeout(ble.stopScan,
                        2000,
                        function () { console.log("Scan complete"); resolve('success') },
                        function () { console.log("stopScan failed"); reject(new Error('something wrong')) }
                    );
                }, 3000);
            })
        }



        $scope.findInventoryByName = function () {
            $scope.findInventoryName = {}
            findInventoryTemplate = '<div class="list">' +
                '<label class="item item-input item-stacked-label" style="border: 0">' +
                '<input type="text" ng-model="findInventoryName.value" placeholder="">' +
                '</label>'
            '</div>'
            var findInventoryPopup = $ionicPopup.show({
                template: findInventoryTemplate,
                title: "Enter inventory name",
                //subTitle: 'Subtitle',
                scope: $scope,

                buttons: [
                    { text: 'Cancel' }, {
                        text: '<b>Submit</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            console.log($scope.findInventoryName.value)
                            updateShowInventoryListByName($scope.findInventoryName.value);
                        }
                    }
                ]
            });
        }

        $scope.getDistance = function (rssi) {
            if (rssi == 0) {
                return "Not detected"
            } else
                if (rssi > -50) {
                    return "Very Close(<0.3M)"
                } else
                    if (rssi > -55) {
                        return "Close(<0.6M)"
                    } else
                        if (rssi > -60) {
                            return "Far(<1M)"
                        } else
                            if (rssi > -70) {
                                return "Quite Far(<1.3M)"
                            } else
                                if (rssi > -80) {
                                    return "Very Far(<1.6M)"
                                } else
                                    if (rssi > -90) {
                                        return "Very Far(<2M)"
                                    } else
                                        if (rssi > -100) {
                                            return "Extremely Far(<2.5M)"
                                        } else {
                                            return "Not detected"
                                        }
        }


        $scope.scanBeaconQR = function () {
            // console.log(">>>")
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    console.log(result.text);
                    $scope.editInventoryform.beacon = result.text
                    $scope.$apply();
                },
                function (error) {
                    console.log("Scanning failed: " + error);
                }
            );
        }



        $scope.showInventoryPopup = function (inventory) {
            console.log(inventory)
            $scope.data = {}
            $scope.inventory = inventory;
            var distance = 0;
            // $scope.inventory.checkInTime = moment(inventory.checkInTime).format('MMMM Do YYYY, h:mm:ss a')
            // $scope.startScanBeacon();
            // $scope.openInventoryModal();
            console.log(JSON.stringify($scope.inventory))
            // for (var i = 0; i < $scope.beacons.length; i++) {
            //     if ($scope.beacons[i].id == inventory.beacon) {
            //         $scope.inventory.distance = rssiToDistance($scope.beacons[i].rssi).toFixed(2);
            //     }
            // }

            $scope.startScanBeaconById(inventory.beacon)

            inventoryPopupTemplate = '<div class="row"><div class="col" style="font-weight:bold">ItemId </div> <div class="col">' + inventory.itemId + '</div></div> <div class="row"><div class="col" style="font-weight:bold">ProductId</div><div class="col"> ' + inventory.productId + '</div></div> <div class="row"><div class="col" style="font-weight:bold"> Check-in time </div> <div class="col"> ' + moment(inventory.checkInTime).format('MMMM Do YYYY, h:mm:ss a') + '</div></div><div class="row"><div class="col" style="font-weight:bold">Beacon </div> <div class="col">' + inventory.beacon + '</div></div><div class="row"><div class="col" style="font-weight:bold">Distance </div> <div class="col">{{getDistance(beacon.rssi)}}</div></div><div class="row"><div class="col" style="font-weight:bold">RSSI </div> <div class="col">{{beacon.rssi}}</div></div>'
            var inventoryDetailPopup = $ionicPopup.show({
                //templateUrl: 'templates/popup/inventory-popup.html',
                template: inventoryPopupTemplate,
                title: inventory.iName,
                //subTitle: 'Subtitle',
                scope: $scope,

                buttons: [
                    { text: 'Cancel' }, {
                        text: '<b>Edit</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            $scope.editInventoryform = inventory
                            $scope.openEditInventoryModal();
                        }
                    }
                ]
            });

            inventoryDetailPopup.then(function (res) {
                clearInterval(scanInverval)
            });


        };

        $ionicModal.fromTemplateUrl('editInventoryModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (editInventoryModal) {
            $scope.editInventoryModal = editInventoryModal;
        });
        $scope.openEditInventoryModal = function () {
            $scope.editInventoryModal.show();
        };
        $scope.closeEditInventoryModal = function () {
            $scope.editInventoryModal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.editInventoryModal.remove();
        });



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
                    $scope.assignBeacon();
                },
                function (error) {
                    console.log("Scanning failed: " + error);
                }
            );
        }

        $scope.startScanBeaconQR = function () {
            console.log("scanning..");
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    // alert("We got a barcode\n" +
                    //     "Result: " + result.text + "\n" +
                    //     "Format: " + result.format + "\n" +
                    //     "Cancelled: " + result.cancelled);
                    // createInventoryPopup.close();
                    console.log(result.text);
                    var pass = true;
                    for (var i = 0; i < $scope.inventoryList.length; i++) {
                        if ($scope.inventoryList[i].beacon == result.text) {
                            console.log($scope.inventoryList[i].beacon)
                            pass = false;
                            break;
                        }
                    }
                    if (pass) {
                        $scope.createInventoryForm.beacon = result.text;
                        $scope.createInventory();
                    }else{
                        swal({
                            title: "Oops !",
                            text: "Beacon has already in use!",
                            icon: "error",
                        }).then((value) => {
                            // location.reload();
                        });
                    }
                },
                function (error) {
                    console.log("Scanning failed: " + error);
                }
            );
        }

        function getInventoryObject(_productId) {
            for (var i = 0; i < $scope.inventoryList.length; i++) {
                if (_productId == $scope.inventoryList[i].productId) {
                    return $scope.inventoryList[i]
                }
            }

        }

        function updateShowInventoryListByProId(_productId) {
            $scope.showInventoryList = []
            for (var i = 0; i < $scope.inventoryList.length; i++) {
                if (_productId == $scope.inventoryList[i].productId) {
                    $scope.showInventoryList.push($scope.inventoryList[i]);
                }
            }

            if ($scope.showInventoryList.length < 1) {
                swal({
                    title: "Oops !",
                    text: "No inventory found!",
                    icon: "error",
                }).then((value) => {
                    location.reload();
                });
            }
        }

        function updateShowInventoryListByName(_iName) {
            $scope.showInventoryList = []
            for (var i = 0; i < $scope.inventoryList.length; i++) {
                if (_iName == $scope.inventoryList[i].iName) {
                    $scope.showInventoryList.push($scope.inventoryList[i]);
                }
            }

            if ($scope.showInventoryList.length < 1) {
                swal({
                    title: "Oops !",
                    text: "No inventory found!",
                    icon: "error",
                }).then((value) => {
                    location.reload();
                });
            }
        }

        $scope.findInventoryById = function () {
            console.log("scanning..");
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    // alert("We got a barcode\n" +
                    //     "Result: " + result.text + "\n" +
                    //     "Format: " + result.format + "\n" +
                    //     "Cancelled: " + result.cancelled);
                    // createInventoryPopup.close();
                    console.log(result.text);
                    updateShowInventoryListByProId(result.text);
                    $scope.$apply();
                },
                function (error) {
                    console.log("Scanning failed: " + error);
                }
            );
        }

        $scope.resetFilter = function () {
            $scope.showInventoryList = $scope.inventoryList;
            $scope.$apply();
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
                            $scope.assignBeacon();
                        }
                    }
                ]
            });

            createInventoryPopup.then(function (res) {
                console.log('Tapped!', res);
            });
        };

        $scope.assignBeacon = function () {
            var assignBeaconTemplate = '<h4 style="margin: auto; display: block; text-align: center;">Assign beacon by Scaning the QR code</h4><img ng-click="startScanBeaconQR()" style="margin: auto; display: block;width: 90%; height: 90%"src="./img/scan.png"><input ng-model="createInventoryForm.beacon"></input>'
            var assignBeaconPopup = $ionicPopup.show({
                //templateUrl: 'templates/popup/inventory-popup.html',
                template: assignBeaconTemplate,
                // title: inventory.iName,
                //subTitle: 'Subtitle',
                scope: $scope,

                buttons: [
                    { text: 'Cancel' }, {
                        text: '<b>Next</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            assignBeaconPopup.close();
                            // $scope.createInventoryForm.beacon = result.text;
                            $scope.createInventory();
                        }
                    }
                ]
            });

            // assignBeacon.then(function (res) {
            //     console.log('Tapped!', res);
            // });

        }



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

        $scope.deleteInventoryAlert = function (_itemId) {
            console.log(_itemId)
            var deleteConfirmPopup = $ionicPopup.confirm({
                title: 'Are you sure to delete this item ?',
                buttons: [
                    { text: 'Cancel' }, {
                        text: '<b>Confirm</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            apiService.deleteItem(_itemId).then(function (data) {
                                swal({
                                    title: "Success !",
                                    text: "Inventory has successfully deleted !",
                                    icon: "success",
                                }).then((value) => {
                                    location.reload();
                                });
                            });
                        }
                    }
                ]
            });
        }

        $scope.submitInventoryEdit = function () {
            console.log($scope.editInventoryform)
            for (var i = 0; i < $scope.inventory.length; i++) {
                if ($scope.editInventoryform.beacon == $scope.inventory[i].beacon && $scope.editInventoryform.itemId != $scope.inventory[i].itemId) {
                    swal({
                        title: "Oops !",
                        text: "This beacon has already in use!",
                        icon: "error",
                    }).then((value) => {
                        return;
                    });
                }
            }


            apiService.updateInventory($scope.editInventoryform).then(function (data) {
                swal({
                    title: "Sccess !",
                    // text: "Inventory has been created!",
                    icon: "success",
                }).then((value) => {
                    location.reload();
                });
            });



        }

        // $scope.showCreateInventoryPopup();

    })

