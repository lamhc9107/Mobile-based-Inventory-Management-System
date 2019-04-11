angular.module('fyp.messageController', [])

    .controller('MessageCtrl', function ($scope, $ionicPopup, $state, $location, $ionicModal, apiService, $localStorage) {
        $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        $scope.testUser = { userId: '000001', username: 'test123', password: 'test123', role: 'Manager' };
        $scope.testUser2 = { userId: '000002', username: 'test1234', password: 'test1234', role: 'Customer', email: 'test@test.com', phone: '12345678' };
        $scope.messageList = [];
        $scope.messageListForCus = [];
        $scope.messageListForOther = [];
        $scope.orderListForCus = [];
        $scope.testOrder = { orderId: '000001', itemId: '000001', productId: '000001', iName: 'testInventory', checkOutTime: '2019-01-25T13:00:00Z', status: 'Ready to be delivered', price: '30', quantity: '4' }
        $scope.newMessageObj = { message: '', orderId: '' }
        $scope.currentChatList = [];
        $scope.currentChat = {};
        $scope.$on("$ionicView.beforeEnter", function (scopes, states) {
            $scope.storageInit();
            getMessageList();
            getOrderList();
            getUserList();
        });

        function getLatestMessageWithinChat(_messageId){
            var temp = [];
            var tempStack =0;
            var highestStack={};
            for(var i = 0; i< $scope.messageList.length ; i++){
                if($scope.messageList[i].messageId == _messageId){
                    temp.push($scope.messageList[i])
                }
            }

            for(var i = 0; i< temp.length ; i++){
                if(temp.stack > tempStack){
                    highestStack = temp[i];
                    tempStack = temp[i].stack
                }
            }
            console.log(highestStack)
            return highestStack

        }

        function getMessageList() {
            apiService.getMessageList().then(function (data) {
                $scope.messageListForOther = [];
                $scope.messageListForCus = [];
                $scope.showMessageList = [];
                $scope.messageList = data;
                console.log("Message List: " + $scope.messageList);
                console.log($scope.messageList);
                for (var i = 0; i < $scope.messageList.length; i++) {
                    $scope.messageList[i].messageTime = moment($scope.messageList[i].messageTime).format('MMMM Do YYYY, h:mm:ss a')
                    if ($scope.currentUser.userId == $scope.messageList[i].userId && $scope.messageList[i].stack == 0 && $scope.currentUser.role == "Customer") {
                        console.log("??")
                        $scope.messageListForCus.push($scope.messageList[i]);
                        $scope.showMessageList = $scope.messageListForCus;
                    } else if ($scope.messageList[i].stack == 0 && $scope.currentUser.role != "Customer") {
                        $scope.messageListForOther.push($scope.messageList[i]);
                        $scope.showMessageList = $scope.messageListForOther;
                    }
                }
                console.log($scope.showMessageList);
                $scope.$apply();
            });
        }

        function getUserList() {
            apiService.getUserList().then(function (data) {
                $scope.userList = data;
                console.log("User List: " + $scope.userList);
                console.log($scope.userList);
                $scope.$apply();
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

        $scope.getUserById = function (_userId) {
            for (var i = 0; i < $scope.userList.length; i++) {
                if (_userId == $scope.userList[i].userId) {
                    return $scope.userList[i];
                }
            }
        }

        $scope.showMessagePopup = function (message) {
            $scope.currentChat = message;
            $scope.currentChatList = [];
            $scope.currentChatList.push(message);
            for (var i = 0; i < $scope.messageList.length; i++) {
                if($scope.messageList[i].refId==message.messageId){
                    $scope.currentChatList.push($scope.messageList[i]);
                }
            }
            console.log($scope.currentChatList)
            console.log(_.max($scope.currentChatList, function(stooge){ return stooge.stack})); 
            $scope.openMessageDetailModal();
        }

        $scope.replyMessage = function(){

            console.log($scope.currentChat)
            apiService.replyMessage($scope.newMessageObj.message, _.max($scope.currentChatList, function(stooge){ return stooge.stack; }).stack +1,$scope.currentUser.userId,$scope.currentChat.messageId, "").then(function (data) {

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

        $ionicModal.fromTemplateUrl('messageDetailModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (messageDetailModal) {
            $scope.messageDetailModal = messageDetailModal;
        });
        $scope.openMessageDetailModal = function () {
            $scope.messageDetailModal.show();
        };
        $scope.closeMessageDetailModal = function () {
            $scope.messageDetailModal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.messageDetailModal.remove();
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

