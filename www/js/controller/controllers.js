angular.module('fyp.controllers', [])

.controller('DashCtrl', function($scope) {})


.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
});
