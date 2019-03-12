angular.module('fyp.menuController', [])

    .controller('MenuCtrl', function ($scope, $ionicPopup, $state, $location, $localStorage) {
        $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        $scope.testUser = { username: 'test123', password: 'test123' };

        function functionCardHide(){
            switch ($scope.currentUser.role) {
                case "customer":
                    $("#user-manage-card").hide();
                    $("#inventory-management-card").hide();
                    break;
                default:
                    
            }

        }
        

        $scope.storageInit = function(){
            if($localStorage.currentUser == undefined){
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

    })

