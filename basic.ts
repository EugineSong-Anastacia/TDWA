
declare var angular : any;
var app  = angular.module('tdwaApp',['ui.bootstrap']);
app.controller('todoController', function todoController($scope, $filter, $http) {
  // $scope.sentenceStart = "I need to do ";
  // $scope.sentenceEnd = " until ";
  $scope.btnDisabled = true;
  $scope.todoDisabled = true;
  $scope.dueDisabled = true;
  $scope.btnText = "hmm..";
  $scope.fullDate = "";
  $scope.dateWarning = true;
  $scope.weatherExtra ="";

  var today : any = new Date();
  var day : any = today.getDate();
  var month : any  = today.getMonth()+1;
  var year : any = today.getFullYear();
  $scope.currentDay = day + "/" + month + "/" + year;
  // $('.clockpicker').clockpicker();
  // var newListToCalender = true;
  // var prevDateKey = "";
  var init : any = function() : void{
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

  $scope.inputDisabling = function() : string {
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

  var getDateKey :any = function(dt : any) {
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

  $scope.fullSentence = function() : any{
    var sentenceStart : String = "I need to ";
    var sentenceEnd : String = " until ";
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

  $scope.addTask = function() : void {
    // var fullTask : Task = {
    //   whatToDo : $scope.todo,
    //   due : $scope.due,
    //   done : false,
    // };
    var fullTask : Task = new Task($scope.todo,$scope.due,false);
    $scope.tasks.push(fullTask);
  };

  $scope.removeTask = function(task : Task) : void {
    $scope.tasks.splice($scope.tasks.indexOf(task),1);
  };

  class Task {
      whatToDo: string;
      due: string;
      done: boolean;
      constructor(public todo, public time, public check){
          this.whatToDo = todo;
          this.due = time;
          this.done = check;
      }
  }


  $scope.$watch('datePicked', function(newValue : any, oldValue : any) : void {
    console.log("Date is changed");
    // handle undefined newValue / oldvalue

    // get dateKey for newValue and oldValue
    // IF theyre the same, do nothing

    //IF they are different.. THen the date has changed..
    // Set var newTasks = calendar[newDateKey]
    // if (!newTasks){ calendar[newDateKey] = [] }
    // $scope.tasks = calendar[newDateKey]

    var prevDateKey : any = getDateKey(oldValue);
    var currentDateKey : any = getDateKey(newValue);
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
  //AJAX

  $scope.urlBuilder = function() : void{
    var apiKey : string= "&APPID=6e5c36e3f3e48f73098b186d62dd64f2";
    var base : string= "http://api.openweathermap.org/data/2.5/forecast/daily?q=";
    var fullUrl : string = base + $scope.city + apiKey ;
    console.log(fullUrl);
    weatherHandler(fullUrl);
  }

  function weatherHandler(fullUrl : string) : void {
    console.log("weather handler is processing");
    console.log(fullUrl);
    $http.get(fullUrl)
      .then(function successCallback(response : any) : any {
        var data : any = response.data;
        console.log(data);
        console.log("got the data, processing...")
        //show description and the icon of the weather according to its weather code
        if(!data) {
          return;
        }

        var temperature : any = data.list[0].temp.day - 273.15;
        console.log(temperature.toFixed(2));
        var weatherIcon : string= data.list[0].weather[0].icon;
        var weatherDescription : string= data.list[0].weather[0].description;
        $scope.weatherIconUrl = weatherIcon + ".png";
        // var img = document.getElementById("weatherIcon");
        // img.src = weatherIconUrl;
        console.log(weatherIcon);
        console.log(weatherDescription);
        var fullWeatherInfo : string= temperature.toFixed(2) + "°C, " + weatherDescription;
        $scope.weatherExtra = fullWeatherInfo;
        console.log($scope.weatherExtra);

      }, function errorCallback(error : any) : void {
        console.log("Something is wrong with API data request / response. Try again.");
        console.log(error.getAllResponseHeaders());
      });
      
  }

  // function weatherInfoChange(desc){
  //   $scope.weatherExtra = desc;
  // }

  window.onbeforeunload = function() : void {
    localStorage.setItem("allTasksv2", JSON.stringify($scope.calenderTasks));
  };

  init();
});

//constructer for Weather
// var Weather = (function () {
//   function weatherConstructor(weatherState, weatherIcon) {
//     this.weatherState = weatherState;
//     this.weatehrIcon = weatherIcon;
//   }
//   return Weather;
// }());

// var cloudy = new Weather("cloudy", "C:\Project\TDWA\Icons\Weather\svg\cloudyIcon.jpg");
// var rain = new Weather("rain", "C:\Project\TDWA\Icons\Weather\svg\rainIcon.jpg");
// var snow = new Weatehr("snow", "C:\Project\TDWA\Icons\Weather\svg\snowIcon.jpg");
// var sunny = new Weather("sunny","C:\Project\TDWA\Icons\Weather\svg\sunIcon.jpg");
// var thunder = new Weather("thunder", "C:\Project\TDWA\Icons\Weather\svg\thunderIcon.jpg");
// app.controller('datePickerController', function ($scope, $filter) {
//   console.log($scope.datePicked);
//   setInterval(intervalDt,1000);
//   function intervalDt() {
//
//     console.log($filter('date')($scope.datePicked,'fullDate'));
//   };
//
// });
