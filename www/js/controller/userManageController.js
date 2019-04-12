angular.module('fyp.userManageController', [])

    .controller('UserManageCtrl', function ($scope, $ionicPopup, $state, $localStorage, $location, $ionicModal, apiService) {
        $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        // $scope.userList = [];
        // var nextUserId = 0;
        $scope.findUsername = { username: '' };
        $scope.testOrder = { orderId: '000001', itemId: '000001', productId: '000001', iName: 'testInventory', checkOutTime: '2019-01-25T13:00:00Z', status: 'Ready to be delivered', price: '30', quantity: '4' }
        $scope.createUserform = { username: '', password: '', rePassword: '', email: '', role: '' };


        $scope.$on("$ionicView.beforeEnter", function (scopes, states) {
            $scope.storageInit();
            getUserList();
        });

        function getUserList() {
            $scope.showUserList = [];
            apiService.getUserList().then(function (data) {
                $scope.userList = data;
                $scope.showUserList = data;
                console.log("User List: " + $scope.userList);
                console.log($scope.userList);
                $scope.$apply();
            });
        }

        $scope.resetFilter = function () {
            $scope.showUserList = $scope.userList;
        }

        $ionicModal.fromTemplateUrl('editUserModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (editUserModal) {
            $scope.editUserModal = editUserModal;
        });
        $scope.openEditUserModalModal = function () {
            $scope.editUserModal.show();
        };
        $scope.closeEditUserModalModal = function () {
            $scope.editUserModal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.editUserModal.remove();
        });

        $scope.findUser = function () {
            userPopupTemplate = '<div class="list">' +
                '<label class="item item-input item-stacked-label" style="border: 0">' +
                '<input type="text" ng-model="findUsername.username" placeholder="">' +
                '</label>'
            '</div>'
            var findUserPopup = $ionicPopup.show({
                template: userPopupTemplate,
                title: "Enter username",
                //subTitle: 'Subtitle',
                scope: $scope,

                buttons: [
                    { text: 'Cancel' }, {
                        text: '<b>Submit</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            console.log($scope.findUsername.username)
                            updateShowUserListByUsername($scope.findUsername.username)
                        }
                    }
                ]
            });
        }

        function updateShowUserListByUsername(_username) {
            $scope.showUserList = []
            for (var i = 0; i < $scope.userList.length; i++) {
                if (_username == $scope.userList[i].username) {
                    $scope.showUserList.push($scope.userList[i]);
                }
            }

            if ($scope.showUserList.length < 1) {
                swal({
                    title: "Oops !",
                    text: "No user found!",
                    icon: "error",
                }).then((value) => {
                    location.reload();
                });
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

        $scope.logout = function () {
            delete $localStorage.currentUser;
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
                '<input type="password" ng-model="createUserform.password" placeholder="5 characters or more">' +
                '</label>' +
                '<label class="item item-input item-stacked-label">' +
                '<span class="input-label">Re-enter password</span>' +
                '<input type="password" ng-model="createUserform.rePassword" placeholder="">' +
                '</label>' +
                '<label class="item item-input item-stacked-label">' +
                '<span class="input-label">Email</span>' +
                '<input type="email" ng-model="createUserform.email" placeholder="Email address">' +
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
            var userPopup = $ionicPopup.show({
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
                userPopupTemplate = '<div class="row"><div class="col" style="font-weight:bold">UserId </div> <div class="col">' + user.userId + '</div></div> <div class="row"><div class="col" style="font-weight:bold">Role </div><div class="col"> ' + user.role + '</div></div><div class="row"><div class="col" style="font-weight:bold">Email </div> <div class="col">' + user.email + ' </div></div><div class="row"><div class="col" style="font-weight:bold">Phone </div> <div class="col">' + user.phone + ' </div></div>'
            }
            var myPopup = $ionicPopup.show({
                template: userPopupTemplate,
                title: user.username,
                //subTitle: 'Subtitle',
                scope: $scope,

                buttons: [
                    { text: 'Cancel' }, {
                        text: '<b>Edit</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            $scope.editUserform = _.extend(user, { newPassword: '', rePassword: '' });;
                            $scope.openEditUserModalModal();
                        }
                    }
                ]
            });

            myPopup.then(function (res) {
                console.log('Tapped!', res);
            });
        };

        $scope.deleteUserAlert = function (_userId) {
            console.log(_userId)
            var deleteConfirmPopup = $ionicPopup.confirm({
                title: 'Are you sure to delete this user ?',
                buttons: [
                    { text: 'Cancel' }, {
                        text: '<b>Confirm</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            apiService.deleteUser(_userId).then(function (data) {
                                swal({
                                    title: "Success !",
                                    text: "User has successfully deleted !",
                                    icon: "success",
                                }).then((value) => {
                                    location.reload();
                                });
                            });
                        }
                    }
                ]
            });
        }

        function checkEditValid() {
            if ($scope.editUserform.newPassword != $scope.editUserform.rePassword) {
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

            if ($scope.editUserform.username.length < 5 ) {
                swal({
                    title: "Oops !",
                    text: "Username must be more than 5 characters!",
                    icon: "error",
                }).then((value) => {
                    
                });
                return false;
            }

            for (var i = 0; i < $scope.userList.length; i++) {

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


        $scope.submitUserEdit = function () {
            console.log($scope.editUserform)
            if (checkEditValid() == true) {
                apiService.updateUserAdmin($scope.editUserform.userId, $scope.editUserform).then(function (data) {
                    swal({
                        title: "Sccess !",
                        // text: "Inventory has been created!",
                        icon: "success",
                    }).then((value) => {
                        location.reload();
                    });
                });

            }

        }


    })

