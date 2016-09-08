
var app = angular.module('tdwaApp',['ui.bootstrap']);
app.controller('todoController', function todoController($scope, $filter) {
  // $scope.sentenceStart = "I need to do ";
  // $scope.sentenceEnd = " until ";
  $scope.btnDisabled = true;
  $scope.todoDisabled = true;
  $scope.dueDisabled = true;
  $scope.btnText = "hmm..";
  $scope.fullDate = "";
  $scope.dateWarning = true;

  // $('.clockpicker').clockpicker();
  // var newListToCalender = true;
  // var prevDateKey = "";
  var init = function() {
    var fullListStored = localStorage.getItem("allTasksv2");
    // $scope.tasks = [];
    if(fullListStored){
      $scope.calenderTasks = JSON.parse(fullListStored);
      // $scope.tasks = calenderTasks.[$scope.dateKey];
      // findListOfDate();
    }else{
      $scope.calenderTasks = {};
      $scope.tasks = [];
    };
  }

  $scope.inputDisabling = function() {
    if($scope.datePicked){
      $scope.todoDisabled = false;
      $scope.dueDisabled = false;
      $scope.dateWarning = false;
      return "Pick the other date if you want to add another to-do list on that day."
    }else if(!$scope.datePicked){
      return "Pick the date you want to add to-do list."
    };
  };


  // var setDateKey = function(dt) {
  //   var day = $filter('date')(dt,'EEE');
  //   var date = $filter('date')(dt,'dd');
  //   var month = $filter('date')(dt,'MMM');
  //   var year = $filter('date')(dt,'yyyy');
  //   var fullDate = $filter('date')(dt,'fullDate');
  //   $scope.fullDate = fullDate;
  //   var dtKey = day + date + month + year;
  //   return dtKey;
  // };

  var getDateKey = function(dt) {
    if(!dt){
      return null;
    };
    var day = $filter('date')(dt,'EEE');
    var date = $filter('date')(dt,'dd');
    var month = $filter('date')(dt,'MMM');
    var year = $filter('date')(dt,'yyyy');
    var fullDate = $filter('date')(dt,'fullDate');
    // $scope.fullDate = fullDate;
    var dtKey = day + date + month + year;
    return dtKey;
  };

  $scope.fullSentence = function(){
    var sentenceStart = "I need to ";
    var sentenceEnd = " until ";
    if(!$scope.todo){
      $scope.btnDisabled = true;
      return "Type what you need to do !";
    }else if (!$scope.due){
      $scope.btnDisabled = true;
      return "Write a due date !";
    }else{
      $scope.btnDisabled = false;
      $scope.btnText = "Add this ! "
      return sentenceStart + $scope.todo + sentenceEnd + $scope.due;
    };
    // return $scope.sentenceStart + $scope.todo + $scope.sentenceEnd + $scope.due;
  };

  // var findListOfDate = function(){
  //   if(!$scope.calenderTasks[$scope.dateKey]){
  //     newListToCalender = true;
  //     $scope.tasks = [];
  //   }else{
  //     newListToCalender = false;
  //     $scope.tasks = $scope.calenderTasks[$scope.dateKey];
  //     console.log($scope.tasks);
  //   }
  // }
  // var listT = localStorage.getItem("storedTasks");

  // if(listT !== null){
  //   $scope.tasks = JSON.parse(listT);
  // };

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

  $scope.$watch('datePicked', function(newValue, oldValue) {
    console.log("Date is changed");
    // handle undefined newValue / oldvalue

    // get dateKey for newValue and oldValue
    // IF theyre the same, do nothing

    //IF they are different.. THen the date has changed..
    // Set var newTasks = calendar[newDateKey]
    // if (!newTasks){ calendar[newDateKey] = [] }
    // $scope.tasks = calendar[newDateKey]

    var prevDateKey = getDateKey(oldValue);
    var currentDateKey = getDateKey(newValue);
    if(!prevDateKey && !currentDateKey){
      console.log("The page is loaded. Date is needed to be picked.");
    }else if(!currentDateKey){
      console.log("Error");
    }else if(prevDateKey == currentDateKey){
      console.log("Same dates, do nothing.");
    }else if(prevDateKey != currentDateKey){
      var newTasks = $scope.calenderTasks[currentDateKey];
      if(!newTasks){ $scope.calenderTasks[currentDateKey] = [];};
      $scope.tasks = $scope.calenderTasks[currentDateKey];
      $scope.fullDate = $filter('date')(newValue,'fullDate');
    }
    // findListOfDate();
    // if(newListToCalender){
    //   $scope.calenderTasks[prevDateKey] = $scope.tasks;
    // };
  });

  window.onbeforeunload = function() {
    localStorage.setItem("allTasksv2", JSON.stringify($scope.calenderTasks));
  };

  init();
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
