angular.module('fyp.messageController', [])

    .controller('MessageCtrl', function ($scope, $ionicPopup, $state, $location, $ionicModal, apiService, $localStorage) {
        $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        $scope.testUser = { userId: '000001', username: 'test123', password: 'test123', role: 'Manager' };
        $scope.testUser2 = { userId: '000002', username: 'test1234', password: 'test1234', role: 'Customer', email: 'test@test.com', phone: '12345678' };
        $scope.messageList = [];
        $scope.messageListForCus = [];
        $scope.orderListForCus = [];
        $scope.testOrder = { orderId: '000001', itemId: '000001', productId: '000001', iName: 'testInventory', checkOutTime: '2019-01-25T13:00:00Z', status: 'Ready to be delivered', price: '30', quantity: '4' }
        $scope.newMessageObj = { message: '', orderId:''}
        $scope.$on("$ionicView.beforeEnter", function (scopes, states) {
            $scope.storageInit();
            getMessageList();
            getOrderList();
        });

        function getMessageList() {
            apiService.getMessageList().then(function (data) {
                $scope.messageList = data;
                console.log("Message List: " + $scope.messageList);
                console.log($scope.messageList);
                for (var i = 0; i < $scope.messageList.length; i++) {
                    $scope.messageList[i].messageTime = moment($scope.messageList[i].orderTime).format('MMMM Do YYYY, h:mm:ss a')
                    if ($scope.currentUser.userId == $scope.messageList[i].userId) {
                        $scope.messageListForCus.push($scope.messageList[i]);
                    }
                }
            });
        }

        function getOrderList() {
            apiService.getOrderList().then(function (data) {
                $scope.orderList = data;
                $scope.orderListForCus = [];
                console.log("Order List: ");
                console.log($scope.orderList);
                for (var i = 0; i < $scope.orderList.length; i++) {
                    $scope.orderList[i].orderTime = moment($scope.orderList[i].orderTime).format('MMMM Do YYYY, h:mm:ss a')
                    if ($scope.currentUser.userId == $scope.orderList[i].userId) {
                        $scope.orderListForCus.push($scope.orderList[i]);
                    }
                }
                console.log($scope.orderListForCus)
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
        }

        $scope.logout = function () {
            delete $localStorage.currentUser;
            $state.go('tab.login');
        }

        $scope.back = function () {
            $state.go('tab.menu');
        }

        $scope.newMessage = function () {
            $scope.openNewMessageModal();
        }

        $scope.sendMessage = function () {
            console.log($scope.newMessageObj);
            apiService.createMessage($scope.newMessageObj.message, $scope.newMessageObj.orderId, $scope.currentUser.userId).then(function (data) {
            });
        }

        $ionicModal.fromTemplateUrl('newMessageModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (newMessageModal) {
            $scope.newMessageModal = newMessageModal;
        });
        $scope.openNewMessageModal = function () {
            $scope.newMessageModal.show();
        };
        $scope.closeNewMessageModal = function () {
            $scope.newMessageModal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.newMessageModal.remove();
        });

        $scope.showUserPopup = function (user) {
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

                            if (!$scope.data.model) {
                                //don't allow the user to close unless he enters model...
                                e.preventDefault();
                            } else {
                                return $scope.data.model;
                            }
                        }
                    }
                ]
            });

            myPopup.then(function (res) {
                console.log('Tapped!', res);
            });
        };

    })

