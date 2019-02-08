angular.module('fyp.registerController', [])

    .controller('RegisterCtrl', function ($scope, $ionicPopup, $state) {
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

        $scope.loginInvaildAlert = function () {
            var loginInvaildPopup = $ionicPopup.confirm({
                title: 'Invaild login !',
                template: loginInvaildDesc
            });
        };

    })

