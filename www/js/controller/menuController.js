angular.module('fyp.menuController', [])

    .controller('MenuCtrl', function ($scope, $ionicPopup, $state, $location, $localStorage, apiService) {
        $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        $scope.testUser = { username: 'test123', password: 'test123' };
        $scope.$on("$ionicView.beforeEnter", function (scopes, states) {
            $scope.storageInit();
            getOrderList();
        });
        $scope.$on("$ionicView.enter", function (scopes, states) {
            functionCardHide();
        });

        function functionCardHide() {
            console.log($scope.currentUser.role)
            switch ($scope.currentUser.role) {
                case "Customer":
                    $("#user-manage-card").hide();
                    $("#inventory-management-card").hide();
                    break;

                default:
                    $("#user-manage-card").show();
                    $("#inventory-management-card").show();
                    break;
            }
        }

        function getOrderList() {
            apiService.getOrderList().then(function (data) {
                $scope.pendingCount = 0;
                $scope.orderList = data;
                console.log("Order List: ");
                console.log($scope.orderList);

                for (var i = 0; i < $scope.orderList.length; i++) {
                    if ($scope.orderList[i].orderStatus == "Pending") {
                        $scope.pendingCount = $scope.pendingCount + 1
                    }
                }
                console.log($scope.pendingCount)
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
            // $scope.$apply();
        }

        $scope.logout = function () {
            delete $localStorage.currentUser;
            $state.go('tab.login');
        }

        $scope.functionCardClick = function (functionCard) {
            console.log(functionCard.target.id + " clicked !")
            switch (functionCard.target.id) {
                case "inventory-management-card":
                    $state.go('tab.inventoryManage');
                    break;
                case "order-card":
                    $state.go('tab.order');
                    break;
                case "user-manage-card":
                    $state.go('tab.userManage');
                    break;
                case "message-card":
                    $state.go('tab.message');
                    break;
                case "user-profile-card":
                    $state.go('tab.userProfile');
                    break;
                case "order-card-inside":
                    $state.go('tab.order');
                    break;
                default:
                    console.log("Wrong function card id !")
            }
        }

        $scope.goRegisterPage = function () {
            console.log("Go register page")
            $state.go('tab.register');
        }

        $scope.loginInvaildAlert = function () {
            var loginInvaildPopup = $ionicPopup.confirm({
                title: 'Invaild login !',
                template: loginInvaildDesc
            });
        };

        $scope.refresh = function () {
            location.reload();
        }

        





        // $cordovaBluetoothLE.initialize({request:true}).then(null,
        //     function(obj) {
        //       alert("errors")
        //       //Handle errors
        //     },
        //     function(obj) {
        //       //Handle successes
        //       alert("successes")
        //     }
        //   );
        //   $cordovaBluetoothLE.startScan({services:[]}).then(null,
        //     function(obj) {
        //       //Handle errors
        //       console.log(obj.message);
        //     },
        //     function(obj) {
        //       if (obj.status == "scanResult")
        //       {
        //         //Device found
        //       }
        //       else if (obj.status == "scanStarted")
        //       {
        //         //Scan started
        //       }
        //     }
        //   );

        // $scope.beacons = [];

        // $ionicPlatform.ready(function() {

        //     $cordovaBeacon.requestWhenInUseAuthorization();

        //     $rootScope.$on("$cordovaBeacon:didRangeBeaconsInRegion", function(event, pluginResult) {
        //         var uniqueBeaconKey;
        //         for(var i = 0; i < pluginResult.beacons.length; i++) {
        //             uniqueBeaconKey = pluginResult.beacons[i].uuid + ":" + pluginResult.beacons[i].major + ":" + pluginResult.beacons[i].minor;
        //             $scope.beacons[uniqueBeaconKey] = pluginResult.beacons[i];
        //         }
        //         $scope.$apply();
        //     });

        //     $cordovaBeacon.startRangingBeaconsInRegion($cordovaBeacon.createBeaconRegion("estimote", "b9407f30-f5f8-466e-aff9-25556b57fe6d"));

        // });

    })

