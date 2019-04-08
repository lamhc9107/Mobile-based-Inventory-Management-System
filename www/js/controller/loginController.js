angular.module('fyp.loginController', ['ngStorage'])

    .controller('LoginCtrl', function ($scope, $ionicPopup, $state, $location, $http, apiService, $localStorage, $cordovaBeacon, $ionicModal) {

        $scope.userList = [];

        // firebase.initializeApp(config);
        // $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        $scope.testUser = { username: 'test123', password: 'test123' };
        $scope.createUserform = {username:'',password:'',rePassword:'',email:'',role:'Customer'};

        $scope.userLogin = function (username, password) {
            console.log("User login request");
            console.log("Username: " + $scope.formUser.username + ", Password: " + $scope.formUser.password)
            checkUserLogin();
        }
        //   firebase.database().ref('users/' + '1234').set({
        //     username: 'test',
        //     email: 'test'
        //   });


        //   var userId = firebase.auth().currentUser.uid;
        //   return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
        //     var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
        //     console.log(username);
        //   });

        function checkUserLogin() {
            apiService.getUserList().then(function (data) {
                $scope.userList = data;
                console.log("User List: " + $scope.userList);
                console.log($scope.userList);

                if ($scope.formUser.username.length < 5) {
                    console.log("Invaild Login !")
                    loginInvaildDesc = "Username should be at least 5 character ! Please try again !"
                    $scope.loginInvaildAlert();
                    return;
                }

                if ($scope.formUser.password.length < 5) {
                    loginInvaildDesc = "Password should be at least 5 character ! Please try again !"
                    $scope.loginInvaildAlert();
                    return;
                }

                for (var i = 0; i < $scope.userList.length; i++) {
                    if ($scope.userList[i].username == $scope.formUser.username) {
                        if ($scope.userList[i].password == $scope.formUser.password) {
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

            });


        }

        $ionicModal.fromTemplateUrl('customerRegisterModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (customerRegisterModal) {
            $scope.customerRegisterModal = customerRegisterModal;
        });
        $scope.openCustomerRegisterModal = function () {
            $scope.customerRegisterModal.show();
        };
        $scope.closeCustomerRegisterModal = function () {
            $scope.customerRegisterModal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.customerRegisterModal.remove();
        });

        $scope.customerRegister= function(){
            $scope.openCustomerRegisterModal();

        }
        $scope.submitCustomerRegister = function(){
            console.log($scope.createUserform);
            if ($scope.createUserform.password != $scope.createUserform.rePassword) {
                invaildDesc = "Passwords are not matched ! Please enter again !"
                var loginInvaildPopup = $ionicPopup.confirm({
                    title: 'Invaild password !',
                    template: invaildDesc
                });
                return;
            }
            apiService.createNewUser($scope.createUserform).then(function (data) {
                swal({
                    title: "Sccess !",
                    // text: "Inventory has been created!",
                    icon: "success",
                }).then((value) => {
                    location.reload();
                });
            });
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

