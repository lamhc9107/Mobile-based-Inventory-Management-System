angular.module('fyp.menuController', [])

    .controller('MenuCtrl', function ($scope, $ionicPopup, $state, $location, $localStorage, $cordovaBeacon, $rootScope, $ionicPlatform) {
        $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        $scope.testUser = { username: 'test123', password: 'test123' };

        function functionCardHide() {
            console.log($scope.currentUser.role)
            switch ($scope.currentUser.role) {
                case "Customer":
                    $("#user-manage-card").hide();
                    // $("#inventory-management-card").hide();
                    break;
                default:
            }
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

        functionCardHide();
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

        $scope.beacons = {};

        $ionicPlatform.ready(function () {

            $cordovaBeacon.requestWhenInUseAuthorization();

            $rootScope.$on("$cordovaBeacon:didRangeBeaconsInRegion", function (event, pluginResult) {
                var uniqueBeaconKey;
                for (var i = 0; i < pluginResult.beacons.length; i++) {
                    uniqueBeaconKey = pluginResult.beacons[i].uuid + ":" + pluginResult.beacons[i].major + ":" + pluginResult.beacons[i].minor;
                    $scope.beacons[uniqueBeaconKey] = pluginResult.beacons[i];
                }
                $scope.$apply();
            });

            $cordovaBeacon.startRangingBeaconsInRegion($cordovaBeacon.createBeaconRegion("estimote", "b9407f30-f5f8-466e-aff9-25556b57fe6d"));

        });



    })

