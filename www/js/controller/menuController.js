angular.module('fyp.menuController', [])

    .controller('MenuCtrl', function ($scope, $ionicPopup, $state, $location) {
        $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        $scope.testUser = { username: 'test123', password: 'test123'};
        $scope.userLogin = function (username, password) {
            console.log("User login request");
            checkUserLogin();
            console.log("Username: " + $scope.formUser.username + ", Password: " + $scope.formUser.password)
        }

        function checkUserLogin() {
            if ($scope.formUser.username.length < 5) {
                console.log("Invaild Login !")
                loginInvaildDesc = "Username should be at least 5 character ! Please try again !"
                $scope.loginInvaildAlert();
                return;
            }

            if ($scope.formUser.password.length < 5) {
                loginInvaildDesc = "Password should be at least 6 character ! Please try again !"
                $scope.loginInvaildAlert();
                return;
            }
        }

        $scope.functinoCardClick = function(functionCard){
            console.log(functionCard.target.id+ " clicked !")
            switch(functionCard.target.id) {
                case "inventory-management-card":
                  $state.go('tab.inventoryManage');
                  break;
                case "user-management-card":
                  $state.go('tab.userManage');
                  break;
                default:
                  console.log("Wrong function card id !")
              }
        }

        $scope.goRegisterPage = function (){
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

