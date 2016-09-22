
var app = angular.module('tdwaApp',['ui.bootstrap']);

app.controller('todoController', function todoController($scope, $filter, $http) {
  // $scope.sentenceStart = "I need to do ";
  // $scope.sentenceEnd = " until ";
  $scope.todoDisabled = true;
  $scope.dueDisabled = true;
  $scope.btnText = "hmm..";
  $scope.fullDate = "";
  $scope.dateWarning = true;
  $scope.weatherExtra ="";
  
  var today = new Date();
  // today.setHours(0,0,0,0);
  // var day = today.getDate();
  // var month = today.getMonth()+1;
  // var year = today.getFullYear();
  $scope.currentDay = dateFormatter(today);
  var maxForecastDay = new Date();
  maxForecastDay.setDate(today.getDate() + 15);
  $scope.maxDay = dateFormatter(maxForecastDay);

  function dateFormatter(date){
    date.setHours(0,0,0,0);
    var day = date.getDate();
    var month = date.getMonth()+1;
    var year = date.getFullYear();
    var formattedDate = day + "/" + month + "/" + year;
    return formattedDate;
  }
  // $('.clockpicker').clockpicker();
  // var newListToCalender = true;
  // var prevDateKey = "";
  var init = function() {
    var fullListStored = localStorage.getItem("allTasksv2");
    
    // $scope.fullDate = $filter('date')(today,'fullDate');
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
      //return "Pick the other date if you want to add another to-do list on that day."
    }else if(!$scope.datePicked){
      //return "Pick the date you want to add to-do list."
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
    console.log($scope.datePicked);
    console.log(today);

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
      updateWeather();

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

  //date difference calculating function
  function dateDiff(date1,date2){
    var utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    var utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    var diffDays = Math.floor((utc2 - utc1)/(1000*60*60*24));
    return diffDays;
  }

  //AJAX

  // $scope.urlBuilder = function(){
  //   var apiKey = "&APPID=6e5c36e3f3e48f73098b186d62dd64f2";
  //   var base = "http://api.openweathermap.org/data/2.5/forecast/daily?q=";
  //   var fullUrl = base + $scope.city + apiKey +"&cnt=16";
  //   console.log(fullUrl);
  //   weatherHandler(fullUrl,0);
  // }
 
  $scope.cityChange = function() {
    console.log("city change");
    updateWeather();
  }

  function updateWeather() {
    if(!$scope.city || !$scope.datePicked){
      console.log("falsy value in either city or date");
      weatherReset();
      return;
    }

    if($scope.datePicked < today) {
      console.log($scope.datePicked);
      console.log(today);
      console.log("date : past")
      weatherReset();
      return;
    }

    if($scope.datePicked > maxForecastDay){
      console.log("date : future");
      weatherReset();
      return;
    }

    // console.log("weather available date");
    // console.log(dateDiff(today,$scope.datePicked));
    weatherHandler(dateDiff(today,$scope.datePicked)); 
    // if($scope.datePicked < today){
    //   console.log("upgrade to premium to see the historical weather");
    // }
    // if($scope.datePicked > maxForecastDay){
    //   console.log("only god knows....");
    console.log("weather is updated");
  }

  function weatherReset() {
    $scope.weatherExtra = "";
    $scope.weatherIconUrl = "";
  }

  function urlBuilder () {
    var apiKey = "&APPID=6e5c36e3f3e48f73098b186d62dd64f2";
    var base = "http://api.openweathermap.org/data/2.5/forecast/daily?q=";
    var fullUrl = base + $scope.city + apiKey +"&cnt=16";
    console.log(fullUrl);
    //weatherHandler(fullUrl,0);
    return fullUrl;
  }

  function weatherHandler(forecastIndex){
    var fullUrl = urlBuilder();
    console.log("weather handler is processing");
    console.log(fullUrl);
    $http.get(fullUrl)
      .then(function successCallback(response) {
        var data = response.data;
        console.log(data);
        console.log("got the data, processing...")
        //show description and the icon of the weather according to its weather code
        if(!data) {
          return;
        }

        var temperature = data.list[forecastIndex].temp.day - 273.15;
        console.log(temperature.toFixed(2));
        var weatherIcon = data.list[forecastIndex].weather[0].icon;
        var weatherDescription = data.list[forecastIndex].weather[0].description;
        $scope.weatherIconUrl = weatherIcon + ".png";
        // var img = document.getElementById("weatherIcon");
        // img.src = weatherIconUrl;
        console.log(weatherIcon);
        console.log(weatherDescription);
        var fullWeatherInfo = temperature.toFixed(2) + "°C, " + weatherDescription;
        $scope.weatherExtra = fullWeatherInfo;
        console.log($scope.weatherExtra);

      }, function errorCallback(error){
        console.log("Something is wrong with API data request / response. Try again.");
        console.log(error.getAllResponseHeaders());
      });
      
  }

  // function weatherInfoChange(desc){
  //   $scope.weatherExtra = desc;
  // }

  window.onbeforeunload = function() {
    if($scope.calenderTasks && $scope.calenderTasks !== {}) {
      var stringifiedTasks;
      try {
        stringifiedTasks = JSON.stringify($scope.calenderTasks);
      } catch(e) {
        return;
      }
      if(stringifiedTasks) {
        localStorage.setItem("allTasksv2", stringifiedTasks);
      }
    }
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
