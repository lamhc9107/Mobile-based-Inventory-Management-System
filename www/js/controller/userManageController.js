angular.module('fyp.userManageController', [])

    .controller('UserManageCtrl', function ($scope, $ionicPopup, $state, $localStorage, $location, $ionicModal, apiService) {
        $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        // $scope.userList = [];
        // var nextUserId = 0;
        $scope.findUserId  ={id:''};
        $scope.testOrder = { orderId: '000001', itemId: '000001', productId: '000001', iName: 'testInventory', checkOutTime: '2019-01-25T13:00:00Z', status: 'Ready to be delivered', price: '30', quantity: '4' }
        $scope.createUserform = {username:'',password:'',rePassword:'',email:'',role:''};
        getUserList();
        function getUserList() {
            apiService.getUserList().then(function (data) {
                $scope.userList = data;
                console.log("User List: " + $scope.userList);
                console.log($scope.userList);
                // for(var i = 0; i< $scope.userList.length;i++){
                //     if($scope.userList[i].userId > nextUserId){
                //         nextUserId = $scope.userList[i].userId
                //     }
                // }
                // nextUserId = Number(nextUserId) +1;
                // console.log(nextUserId);
            });
        }

        $scope.findUser = function(){
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
        }

        $scope.storageInit();
        $scope.logout = function () {
            delete $localStorage.currentUser;
            $state.go('tab.login');
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
                '<label class="item item-input item-select">'+
                '<div class="input-label">'+
                'Role'+
                '</div>'+
                '<select ng-model="createUserform.role">'+
                '<option ng-value="admin">Admin</option>'+
                '<option ng-value="employee">Employee</option>'+
                '<option ng-value="customer">Customer</option>'+
                '</select>'+
                '</label>'+
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
                            if ($scope.createUserform.password != $scope.createUserform.rePassword) {
                                invaildDesc = "Passwords are not matched ! Please enter again !"
                                var loginInvaildPopup = $ionicPopup.confirm({
                                    title: 'Invaild password !',
                                    template: invaildDesc
                                });
                                return;
                            }
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
                                title: 'Are you sure to delete user '+user.username+' ?',
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

