angular.module('fyp.orderController', [])

    .controller('OrderCtrl', function ($scope, $ionicPopup, $state, $location, $ionicModal, apiService, $localStorage, $ionicModal) {
        $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        $scope.testUser = { username: 'test123', password: 'test123' };
        // $scope.inventoryList = [];
        $scope.deleteInventoryId;
        $scope.createInventoryForm = { productId: '', iName: '', checkInTime: '', distance: '', status: '', price: '', location: '' };
        $scope.beacon = { rssi: 0 }
        $scope.$on("$ionicView.enter", function (scopes, states) {
            $scope.storageInit();
            getInventoryList();
            getOrderList();
        });


        function getInventoryList() {
            apiService.getInventoryList().then(function (data) {
                $scope.inventoryList = data;
                console.log("Inventory List: ");
                console.log($scope.inventoryList);
                $scope.$apply();
            });
        }

        function getOrderList() {
            apiService.getOrderList().then(function (data) {
                $scope.orderList = data;
                $scope.orderListForEmp = [];
                console.log("Order List: ");
                console.log($scope.orderList);
                if ($scope.currentUser.role == "Employee" || $scope.currentUser.role == "Admin") {
                    for (var i = 0; i < $scope.orderList.length; i++) {
                        $scope.orderList[i].orderTime = moment($scope.orderList[i].orderTime).format('MMMM Do YYYY, h:mm:ss a')
                        if ($scope.orderList[i].orderStatus == "Pending" || $scope.orderList[i].orderStatus == "Processing") {
                            $scope.orderListForEmp.push($scope.orderList[i]);
                        }
                    }
                }
                console.log($scope.orderListForEmp)
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
                }, 1500);
            })
        }

        $scope.checkOut = function (history) {
            console.log(history)
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    console.log(result.text);
                    if (history.orderId == result.text) {
                        apiService.updateOrderStatus(result.text, "Finished").then(function (data) {
                            swal({
                                title: "Sccess !",
                                // text: "Inventory has been created!",
                                icon: "success",
                            }).then((value) => {
                                apiService.updateInventoryStatus(history.itemId, "Sold").then(function (data) {
                                    location.reload();
                                });
                            });
                        });
                    } else {
                        swal({
                            title: "Oops !",
                            text: "Wrong QR code scanned !",
                            icon: "error",
                        }).then((value) => {
                            location.reload();
                        });
                    }
                },
                function (error) {
                    console.log("Scanning failed: " + error);
                }
            );

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

        $scope.startScanBeaconById = function (_id) {
            return new Promise((resolve, reject) => {
                console.log("start scan")
                scanInverval = setInterval(function () {
                    ble.startScan([], function (device) {
                        // console.log(JSON.stringify(device));
                        if (_id == device.id) {
                            $scope.beacon = device
                            $scope.distance = 10 ^ ((-81 - $scope.beacon.rssi) / (10 * 4.66))
                            console.log($scope.distance)
                            console.log($scope.beacon.rssi)
                            $scope.$apply();
                        }
                    });
                    setTimeout(ble.stopScan,
                        2000,
                        function () { console.log("Scan complete"); resolve('success') },
                        function () { console.log("stopScan failed"); reject(new Error('something wrong')) }
                    );
                }, 1500);
            })
        }


        $scope.startOrder = function (order) {
            console.log(JSON.stringify(order))
            $scope.orderInventory = {};
            apiService.updateOrderStatus(order.orderId, "Processing").then(function (data) {
                // $scope.startScanBeacon().then(function (data) {
                $scope.currentOrder = order;
                $scope.openStartOrderModal();
                for (var i = 0; i < $scope.inventoryList.length; i++) {
                    if ($scope.inventoryList[i].productId == order.productId) {
                        $scope.orderInventory = $scope.inventoryList[i];
                        $scope.startScanBeaconById($scope.inventoryList[i].beacon)
                    }
                }
                // $scope.$apply();
                // });
            })
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
                            apiService.createNewInventory($scope.createInventoryForm, nextItemId).then(function (data) {
                                console.log("Success");
                                createInventoryFormPopup.close();
                                showSuccessAlert();
                            });
                        }
                    }
                ]
            });
        }

        $scope.cancelOrder = function (_history) {
            console.log(_history)
            apiService.updateOrderStatus(_history.orderId, "Cancelled").then(function (data) {
                swal({
                    title: "Sccess !",
                    // text: "Inventory has been created!",
                    icon: "success",
                }).then((value) => {
                    location.reload();
                });
            });

        }


        $ionicModal.fromTemplateUrl('orderHistoryModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (orderHistoryModal) {
            $scope.orderHistoryModal = orderHistoryModal;
        });
        $scope.openOrderHistoryModal = function () {
            $scope.orderHistoryModal.show();
        };
        $scope.closeOrderHistoryModal = function () {
            $scope.orderHistoryModal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.orderHistoryModal.remove();
        });


        $ionicModal.fromTemplateUrl('startOrderModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (startOrderModal) {
            $scope.startOrderModal = startOrderModal;
        });
        $scope.openStartOrderModal = function () {
            $scope.startOrderModal.show();
        };
        $scope.closeStartOrderModal = function () {
            $scope.startOrderModal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.startOrderModal.remove();
            clearInterval(scanInverval);
        });
        // Execute action on hide modal
        $scope.$on('modal.hidden', function () {
            // Execute action
            console.log("hidden event")
            clearInterval(scanInverval);
            // location.reload();
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function () {
            // Execute action
            console.log("removed event")
            clearInterval(scanInverval);
            // location.reload();
        });

        $ionicModal.fromTemplateUrl('waitForReceiveModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (waitForReceiveModal) {
            $scope.waitForReceiveModal = waitForReceiveModal;
        });
        $scope.openWaitForReceiveModal = function () {
            $scope.waitForReceiveModal.show();
        };
        $scope.closeWaitForReceiveModal = function () {
            $scope.waitForReceiveModal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.waitForReceiveModal.remove();
        });
        // Execute action on hide modal
        $scope.$on('waitForReceiveModal.hidden', function () {
            // Execute action
        });
        // Execute action on remove modal
        $scope.$on('waitForReceiveModal.removed', function () {
            // Execute action
        });


        $scope.showOrderHistoryPopup = function () {
            $scope.historyList = [];
            for (var i = 0; i < $scope.orderList.length; i++) {

                if ($scope.orderList[i].userId == $scope.currentUser.userId) {
                    console.log($scope.orderList[i])
                    for (var k = 0; k < $scope.inventoryList.length; k++) {
                        if ($scope.inventoryList[k].itemId == $scope.orderList[i].itemId) {
                            console.log($scope.orderList[i])
                            $scope.historyList.push(_.extend($scope.orderList[i], $scope.inventoryList[k]));
                            // $scope.historyList.push(_.extend($scope.inventoryList[k], $scope.orderList[i]));
                            $scope.historyList = _.sortBy($scope.historyList, -'orderTime');
                        }
                    }

                }
            }
            console.log($scope.historyList);
            if ($scope.historyList.length < 1) {
                swal({
                    title: "Oops !",
                    text: "No order history found!",
                    icon: "error",
                }).then((value) => {
                    location.reload();
                });
            } else {
                $scope.openOrderHistoryModal();

            }

        };




        $scope.showInventoryPopup = function (inventory) {
            $scope.data = {}
            inventoryPopupTemplate = '<div class="row"><div class="col" style="font-weight:bold">ItemId </div> <div class="col">' + inventory.itemId + '</div></div> <div class="row"><div class="col" style="font-weight:bold">ProductId</div><div class="col"> ' + inventory.productId + '</div></div> <div class="row"><div class="col" style="font-weight:bold"> Check-in time </div> <div class="col"> ' + moment(inventory.checkInTime).format('MMMM Do YYYY, h:mm:ss a') + '</div></div><div class="row"><div class="col" style="font-weight:bold">Price</div> <div class="col">$ ' + inventory.price + ' </div></div>'
            var inventoryPopup = $ionicPopup.show({
                //templateUrl: 'templates/popup/inventory-popup.html',
                template: inventoryPopupTemplate,
                title: inventory.iName,
                //subTitle: 'Subtitle',
                scope: $scope,

                buttons: [
                    { text: 'Cancel' }, {
                        text: '<b>order</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            makeOrder(inventory.itemId, inventory.productId);
                        }
                    }
                ]
            });

            inventoryPopup.then(function (res) {
                console.log('Tapped!', res);
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
                    // createInventoryForm.productId = result.text;
                    // $scope.createInventory();
                    console.log($scope.orderInventory.productId)
                    console.log(result.text)
                    if (result.text == $scope.orderInventory.productId) {
                        $scope.closeStartOrderModal();
                        // swal({
                        //     title: "Sccess !",
                        //     // text: "Inventory has been created!",
                        //     icon: "success",
                        // }).then((value) => {
                        $scope.openWaitForReceiveModal();
                        $('#qrcode').qrcode($scope.currentOrder.orderId);
                        // });
                    } else {
                        swal({
                            title: "Oops !",
                            text: "Wrong item scanned!",
                            icon: "error",
                        })
                    }
                },
                function (error) {
                    console.log("Scanning failed: " + error);
                }
            );
        }



        function makeOrder(itemId, productId) {
            apiService.createOrder(itemId, productId, $scope.currentUser.userId).then(function (data) {
                console.log("Success");
                showSuccessAlert();
            });
        }

    })

