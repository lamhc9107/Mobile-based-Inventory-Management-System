angular.module('fyp.orderController', [])

    .controller('OrderCtrl', function ($scope, $ionicPopup, $state, $location, $ionicModal, apiService, $localStorage, $ionicModal) {
        $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        $scope.testUser = { username: 'test123', password: 'test123' };
        // $scope.inventoryList = [];
        $scope.deleteInventoryId;
        $scope.createInventoryForm = { productId: '', iName: '', checkInTime: '', distance: '', status: '', price: '', location: '' };
        $scope.beacon = {rssi:"Not found"}
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
                        if ($scope.orderList[i].orderStatus == "Pending") {
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
                }, 3000);
            })
        }

        $scope.startScanBeaconById = function (_id) {
            return new Promise((resolve, reject) => {
                console.log("start scan")
                var scanInverval = setInterval(function () {
                    ble.startScan([], function (device) {
                        // console.log(JSON.stringify(device));
                        if(_id==device.id){
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


        $scope.startOrder = function (order) {
            console.log(JSON.stringify(order))
            $scope.orderInventory = {};
            // apiService.updateOrderStatus(order.orderId, "Processing").then(function (data) {
                // $scope.startScanBeacon().then(function (data) {
                    $scope.openStartOrderModal();
                    for (var i = 0; i < $scope.inventoryList.length; i++) {
                        if ($scope.inventoryList[i].productId == order.productId) {
                            $scope.orderInventory = $scope.inventoryList[i];
                            $scope.startScanBeaconById($scope.inventoryList[i].beacon)           
                        }
                    }
                    // $scope.$apply();
                // });
            // })
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
            });


            $scope.showOrderHistoryPopup = function () {
                $scope.historyList = [];
                for (var i = 0; i < $scope.orderList.length; i++) {

                    if ($scope.orderList[i].userId == $scope.currentUser.userId) {
                        // console.log($scope.orderList[i])
                        for (var k = 0; k < $scope.inventoryList.length; k++) {
                            if ($scope.inventoryList[k].productId == $scope.orderList[i].productId) {
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


                // orderHistoryPopupTemplate = '<div class="row inventory-item" ng-repeat="history in historyList track by $index">order# {{hisotry.orderId}}</div>'
                // var orderHistoryPopup = $ionicPopup.show({
                //     //templateUrl: 'templates/popup/inventory-popup.html',
                //     template: orderHistoryPopupTemplate,
                //     title: "Order History",
                //     //subTitle: 'Subtitle',
                //     scope: $scope,

                //     buttons: [
                //         { text: 'Cancel' }, {
                //             text: '<b>order</b>',
                //             type: 'button-positive',
                //             onTap: function (e) {
                //                 makeOrder(inventory.productId);
                //             }
                //         }
                //     ]
                // });

                // orderHistoryPopup.then(function (res) {
                //     console.log('Tapped!', res);
                // });
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
                                makeOrder(inventory.productId);
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
                        createInventoryPopup.close();
                        createInventoryForm.productId = result.text;
                        $scope.createInventory();
                    },
                    function (error) {
                        console.log("Scanning failed: " + error);
                    }
                );
            }

            $scope.checkOutOrder = function () {
                $scope.startScan()
            }


            function makeOrder(productId) {
                apiService.createOrder(productId, $scope.currentUser.userId).then(function (data) {
                    console.log("Success");
                    showSuccessAlert();
                });
            }

        })

