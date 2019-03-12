angular.module('fyp.loginController', ['ngStorage'])

    .controller('LoginCtrl', function ($scope, $ionicPopup, $state, $location, $http, apiService, $localStorage) {

        $scope.userList = [];

        // firebase.initializeApp(config);
        // $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        $scope.testUser = { username: 'test123', password: 'test123' };

        $scope.userLogin = function (username, password) {
            console.log("User login request");
            console.log("Username: " + $scope.formUser.username + ", Password: " + $scope.formUser.password)
            checkUserLogin();
        }

        function checkUserLogin() {
            apiService.getUserList().then(function (data) {
                $scope.userList = data.data.recordset;
                console.log("User List: " + $scope.userList);
                console.log($scope.userList);
            });
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

            for(var i=0; i <$scope.userList.length; i++){
                if($scope.userList[i].username == $scope.formUser.username){
                    if($scope.userList[i].password == $scope.formUser.password){
                        $localStorage.currentUser = $scope.userList[i];
                        console.log("Login success, current user: ");
                        console.log($localStorage.currentUser);
                        $scope.goMenuPage();
                        return;
                    } 
                }
            }
            loginInvaildDesc = "Invalid username or password  ! Please try again !"
            $scope.loginInvaildAlert();

        }

        $scope.goMenuPage = function () {
            console.log("Go menu page")
            $state.go('tab.menu');
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

