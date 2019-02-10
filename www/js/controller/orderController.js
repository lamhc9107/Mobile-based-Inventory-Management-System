angular.module('fyp.orderController', [])

    .controller('OrderCtrl', function ($scope, $ionicPopup, $state, $location, $ionicModal) {
        $scope.userInfo = { username: '', password: '' };
        $scope.formUser = { username: '', password: '' };
        $scope.testUser = { username: 'test123', password: 'test123' };
        $scope.orderList = [];
        $scope.testOrder = { orderId: '000001', itemId: '000001', productId: '000001', iName: 'testInventory', checkOutTime: '2019-01-25T13:00:00Z', status: 'Ready to be delivered', price: '30', quantity: '4' }
        $scope.userLogin = function (username, password) {
            console.log("User login request");
            checkUserLogin();
            console.log("Username: " + $scope.formUser.username + ", Password: " + $scope.formUser.password)
        }
        $scope.orderList.push($scope.testOrder);

        console.log($scope.orderList)

        $scope.logout = function () {
            $state.go('tab.login');
        }

        $scope.back = function () {
            $state.go('tab.menu');
        }

        $scope.showOrderPopup = function (order) {
            $scope.data = {}
            orderPopupTemplate = '<div class="row"><div class="col" style="font-weight:bold">ItemId </div> <div class="col">' + order.itemId + '</div></div> <div class="row"><div class="col" style="font-weight:bold">Quantity</div><div class="col"> ' + order.quantity + '</div></div><div class="row"><div class="col" style="font-weight:bold">total price </div> <div class="col">$' + order.price*order.quantity + '</div></div> <div class="row"><div class="col" style="font-weight:bold"> Order time </div> <div class="col"> ' + moment(order.checkOutTime).format('MMMM Do YYYY, h:mm:ss a') + '</div></div><div class="row"><div class="col" style="font-weight:bold">Status </div> <div class="col">' + order.status + ' </div></div>'
            var myPopup = $ionicPopup.show({
                template: orderPopupTemplate,
                title: "Order #" + order.orderId,
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

