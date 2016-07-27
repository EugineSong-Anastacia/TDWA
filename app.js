
var app = angular.module('tdwaApp',['ui.bootstrap']);
app.controller('todoController', function todoController($scope, $filter) {
  $scope.sentenceStart = "I need to do ";
  $scope.sentenceEnd = " until ";
  $scope.btnDisabled = true;
  $scope.btnText = "hmm..";
  // $scope.todo = "something";
  // $scope.due = "until the end of my day";
  $scope.fullSentence = function(){
    if(!$scope.todo){
      $scope.btnDisabled = true;
      return "Type what you need to do !";
    }else if (!$scope.due){
      $scope.btnDisabled = true;
      return "Write a due date !";
    }else{
      $scope.btnDisabled = false;
      $scope.btnText = "Add this ! "
      return $scope.sentenceStart + $scope.todo + $scope.sentenceEnd + $scope.due;
    };
    // return $scope.sentenceStart + $scope.todo + $scope.sentenceEnd + $scope.due;
  };

  $scope.tasks = [];
  var listT = localStorage.getItem("storedTasks");

  if(listT !== null){
    $scope.tasks = JSON.parse(listT);
  };

  $scope.addTask = function() {
    var fullTask = {
      whatToDo : $scope.todo,
      due : $scope.due,
      done : false,
    };
    $scope.tasks.push(fullTask);
  };

  $scope.removeTask = function(task) {
    $scope.tasks.splice($scope.tasks.indexOf(task),1);
  };

  window.onbeforeunload = function() {
    localStorage.setItem("storedTasks", JSON.stringify($scope.tasks));
  }

});

// app.controller('datePickerController', function ($scope, $filter) {
//   console.log($scope.datePicked);
//   setInterval(intervalDt,1000);
//   function intervalDt() {
//
//     console.log($filter('date')($scope.datePicked,'fullDate'));
//   };
//
// });
