angular.module('fyp.userProfileController', [])

    .controller('UserProfileCtrl', function ($scope, $ionicPopup, $state, $localStorage, $location, $ionicModal, apiService) {
        $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        $scope.userList = [];
        $scope.findUserId = { id: '' };
        $scope.testOrder = { orderId: '000001', itemId: '000001', productId: '000001', iName: 'testInventory', checkOutTime: '2019-01-25T13:00:00Z', status: 'Ready to be delivered', price: '30', quantity: '4' }
        $scope.createUserform = { username: '', password: '', rePassword: '', email: '', role: '' };
        $scope.editUserform = { username: '', oldPassword: '', newPassword: '', reNewRpassword: '', email: '' };

        $scope.$on("$ionicView.beforeEnter", function (scopes, states) {
            $scope.storageInit();
            getUserList();
        });

        function getUserList() {
            apiService.getUserList().then(function (data) {
                $scope.userList = data;
                console.log("User List: " + $scope.userList);
                console.log($scope.userList);
            });
        }

        $scope.findUser = function () {
            userPopupTemplate = '<div class="list">' +
                '<label class="item item-input item-stacked-label" style="border: 0">' +
                '<input type="text" ng-model="findUserId.id" placeholder="">' +
                '</label>'
            '</div>'
            var findUserPopup = $ionicPopup.show({
                template: userPopupTemplate,
                title: "Enter User Id",
                //subTitle: 'Subtitle',
                scope: $scope,

                buttons: [
                    { text: 'Cancel' }, {
                        text: '<b>Submit</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            console.log($scope.findUserId.id)
                            apiService.getUserById($scope.findUserId.id).then(function (data) {
                                console.log(data);
                                var findUserInfo = data[0];
                                console.log(findUserInfo);
                                $scope.showUserPopup(findUserInfo);
                            });
                        }
                    }
                ]
            });
        }
        $scope.storageInit = function () {
            if ($localStorage.currentUser == undefined) {
                $state.go('tab.login');
            }
            $scope.$storage = $localStorage;
            $scope.currentUser = $scope.$storage.currentUser;
            console.log($scope.currentUser);
            $scope.editUserform.username = $scope.currentUser.username;
            $scope.editUserform.email = $scope.currentUser.email;
        }

        $scope.logout = function () {
            delete $localStorage.currentUser;
            $state.go('tab.login');
        }

        $scope.resetEditUserForm = function () {
            $scope.editUserform = { username: '', oldPassword: '', newPassword: '', reNewRpassword: '', email: '' };
            $scope.editUserform.username = $scope.currentUser.username;
            $scope.editUserform.email = $scope.currentUser.email;
        }

        function checkEditValid() {
            if ($scope.editUserform.newPassword != $scope.editUserform.reNewRpassword) {
                swal({
                    title: "Oops !",
                    text: "Two passwords are not matched !",
                    icon: "error",
                }).then((value) => {

                });
                return false;
            }

            if ($scope.editUserform.newPassword.length < 5 && $scope.editUserform.newPassword.length > 0) {
                swal({
                    title: "Oops !",
                    text: "Password must be more than 5 characters!",
                    icon: "error",
                }).then((value) => {

                });
                return false;
            }

            if ($scope.editUserform.username.length < 5) {
                swal({
                    title: "Oops !",
                    text: "Username must be more than 5 characters!",
                    icon: "error",
                }).then((value) => {

                });
                return false;
            }

            for (var i = 0; i < $scope.userList.length; i++) {
                if ($scope.editUserform.username == $scope.userList[i].username && $scope.editUserform.password != $scope.userList[i].password ) {
                    console.log($scope.userList[i].password)
                    swal({
                        title: "Oops !",
                        text: "Password is not correct !",
                        icon: "error",
                    }).then((value) => {

                    });
                    return false;
                }

                if ($scope.editUserform.username == $scope.userList[i].username && $scope.editUserform.userId != $scope.userList[i].userId) {
                    swal({
                        title: "Oops !",
                        text: "Username has already been used !",
                        icon: "error",
                    }).then((value) => {

                    });
                    return false;
                }
                if ($scope.editUserform.email == $scope.userList[i].email && $scope.editUserform.userId != $scope.userList[i].userId) {
                    swal({
                        title: "Oops !",
                        text: "Email has already been used !",
                        icon: "error",
                    }).then((value) => {

                    });
                    return false;
                }
                if ($scope.editUserform.phone == $scope.userList[i].phone && $scope.editUserform.userId != $scope.userList[i].userId) {
                    swal({
                        title: "Oops !",
                        text: "Phone number has already been used !",
                        icon: "error",
                    }).then((value) => {

                    });
                    return false;
                }
            }

            return true;

        }


        $scope.submitEditUserForm = function () {
            // if (checkEditValid() == true) {
                apiService.updateUser($scope.currentUser.userId, $scope.editUserform).then(function (data) {
                    swal({
                        title: "Success !",
                        // text: "Autom!",
                        icon: "success",
                    }).then((value) => {
                        $scope.logout()
                    });
                });
            // }    

        }

        $scope.logout = function () {
            $state.go('tab.login');
        }

        $scope.back = function () {
            $state.go('tab.menu');
        }

        $scope.createUser = function () {
            userPopupTemplate = '<div class="list">' +
                '<label class="item item-input item-stacked-label">' +
                '<span class="input-label">Username</span>' +
                '<input type="text" ng-model="createUserform.username" placeholder="5 characters or more">' +
                '</label>' +
                '<label class="item item-input item-stacked-label">' +
                '<span class="input-label">Password</span>' +
                '<input type="text" ng-model="createUserform.password" placeholder="5 characters or more">' +
                '</label>' +
                '<label class="item item-input item-stacked-label">' +
                '<span class="input-label">Re-enter password</span>' +
                '<input type="text" ng-model="createUserform.rePassword" placeholder="">' +
                '</label>' +
                '<label class="item item-input item-stacked-label">' +
                '<span class="input-label">Email</span>' +
                '<input type="text" ng-model="createUserform.email" placeholder="Email address">' +
                '</label>' +
                '<label class="item item-input item-stacked-label">' +
                '<span class="input-label">Phone</span>' +
                '<input type="text" ng-model="createUserform.phone" placeholder="Phone number">' +
                '</label>' +
                '<label class="item item-input item-select">' +
                '<div class="input-label">' +
                'Role' +
                '</div>' +
                '<select ng-model="createUserform.role">' +
                '<option ng-value="Admin">Admin</option>' +
                '<option ng-value="Employee">Employee</option>' +
                '<option ng-value="Customer">Customer</option>' +
                '</select>' +
                '</label>' +
                '</div>'
            var myPopup = $ionicPopup.show({
                template: userPopupTemplate,
                title: "Create new user",
                //subTitle: 'Subtitle',
                scope: $scope,

                buttons: [
                    { text: 'Cancel' }, {
                        text: '<b>Submit</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            console.log($scope.createUserform);
                            apiService.createNewUser($scope.createUserform, nextUserId).then(function (data) {
                                console.log("Success");
                                location.reload();
                            });
                        }
                    }
                ]
            });
        }

        $scope.showUserPopup = function (user) {
            console.log(user);
            $scope.data = {}
            if (user.role == "Customer") {
                userPopupTemplate = '<div class="row"><div class="col" style="font-weight:bold">UserId </div> <div class="col">' + user.userId + '</div></div> <div class="row"><div class="col" style="font-weight:bold">Role</div><div class="col"> ' + user.role + '</div></div><div class="row"><div class="col" style="font-weight:bold">Email </div> <div class="col">' + user.email + ' </div></div><div class="row"><div class="col" style="font-weight:bold">Phone </div> <div class="col">' + user.phone + ' </div></div>'
            } else {
                userPopupTemplate = '<div class="row"><div class="col" style="font-weight:bold">UserId </div> <div class="col">' + user.userId + '</div></div> <div class="row"><div class="col" style="font-weight:bold">Role</div><div class="col"> ' + user.role + '</div></div><div class="row"><div class="col" style="font-weight:bold">Email </div> <div class="col">' + user.email + ' </div></div><div class="row"><div class="col" style="font-weight:bold">Phone </div> <div class="col">' + user.phone + ' </div></div>'
            }
            var myPopup = $ionicPopup.show({
                template: userPopupTemplate,
                title: user.username,
                //subTitle: 'Subtitle',
                scope: $scope,

                buttons: [
                    { text: 'Cancel' }, {
                        text: '<b>Delete</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            var deleteConfirmPopup = $ionicPopup.confirm({
                                title: 'Are you sure to delete user ' + user.username + ' ?',
                                buttons: [
                                    { text: 'Cancel' }, {
                                        text: '<b>Confirm</b>',
                                        type: 'button-positive',
                                        onTap: function (e) {
                                            apiService.deleteUser(user.userId).then(function (data) {
                                                var deleteSuccessopup = $ionicPopup.confirm({
                                                    title: 'Success !',
                                                });
                                            });
                                        }
                                    }
                                ]
                            });
                        }
                    }
                ]
            });

            myPopup.then(function (res) {
                console.log('Tapped!', res);
            });
        };

    })

