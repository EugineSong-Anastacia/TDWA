declare var angular : any;
var app : any = angular.module('tdwaApp',['ui.bootstrap']);

app.controller('todoController', function todoController($scope, $filter, $http) {
  $scope.todoDisabled = true;
  $scope.dueDisabled = true;
  $scope.btnText = "hmm..";
  // $scope.fullDate = "";
  $scope.dateWarning = true;
  $scope.weatherExtra ="";
  $scope.datePicked = null;
  
  var today : Date = new Date();
  $scope.currentDay = dateFormatter(today);
  var maxForecastDay : Date = new Date();
  maxForecastDay.setDate(today.getDate() + 15);
  $scope.maxDay = dateFormatter(maxForecastDay);

  function dateFormatter(date : Date) : string{
    date.setHours(0,0,0,0);
    var day : any = date.getDate();
    var month : any = date.getMonth()+1;
    var year : any = date.getFullYear();
    var formattedDate : string = day + "/" + month + "/" + year;
    return formattedDate;
  }

  var init : any = function() :void {
    $scope.datePicked = new Date();
    var fullListStored : any = localStorage.getItem("allTasksv2");
    if(fullListStored){
      $scope.calenderTasks = JSON.parse(fullListStored);
    }else{
      $scope.calenderTasks = {};
    };
    setTasksFromCalender(getDateKey($scope.datePicked));
  }

  $scope.inputDisabling = function() : void {
    if($scope.datePicked){
      $scope.todoDisabled = false;
      $scope.dueDisabled = false;
      $scope.dateWarning = false;
      //return "Pick the other date if you want to add another to-do list on that day."
    }else if(!$scope.datePicked){
      //return "Pick the date you want to add to-do list."
    };
  };

  var getDateKey : any  = function(dt : any) : any {
    if(!dt){
      return null;
    };
    var day : any = $filter('date')(dt,'EEE');
    var date : any = $filter('date')(dt,'dd');
    var month : any = $filter('date')(dt,'MMM');
    var year : any = $filter('date')(dt,'yyyy');
    var fullDate : any = $filter('date')(dt,'fullDate');
    var dtKey : any = day + date + month + year;
    return dtKey;
  };

  $scope.addTask = function() : void {
    var fullTask : Task = new Task($scope.todo,$scope.due,false);
    $scope.tasks.push(fullTask);
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
  };

  $scope.removeTask = function(task : Task) : void {
    $scope.tasks.splice($scope.tasks.indexOf(task),1);
  };

  $scope.$watch('datePicked', function(newValue : any , oldValue : any) : void {
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

    var prevDateKey : any = getDateKey(oldValue);
    var currentDateKey : any  = getDateKey(newValue);
    if(!prevDateKey && !currentDateKey){
      console.log("The page is loaded. Date is needed to be picked.");
    }else if(!currentDateKey){
      console.log("Error");
    }else if(prevDateKey == currentDateKey){
      console.log("Same dates, do nothing.");

    }else if(prevDateKey != currentDateKey){
      updateWeather();
      setTasksFromCalender(currentDateKey);
    }

  });

  function setTasksFromCalender(currentDateKey : any) : void {
    var newTasks = $scope.calenderTasks[currentDateKey];
    if(!newTasks){ $scope.calenderTasks[currentDateKey] = [];};
    $scope.tasks = $scope.calenderTasks[currentDateKey];
    // console.log($scope.tasks);
  }

  //date difference calculating function
  function dateDiff(date1 : Date ,date2 : Date) : number{
    var utc1 : any= Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    var utc2 : any= Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    var diffDays : number = Math.floor((utc2 - utc1)/(1000*60*60*24));
    return diffDays;
  }

  //AJAX
 
  $scope.cityChange = function() : void {
    console.log("city change");
    updateWeather();
  }

  function updateWeather() : any {
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

    weatherHandler(dateDiff(today,$scope.datePicked)); 
    console.log("weather is updated");
  }

  function weatherReset() : void{
    $scope.weatherExtra = "";
    $scope.weatherIconUrl = "";
  }

  function urlBuilder () :string {
    var apiKey :string= "&APPID=6e5c36e3f3e48f73098b186d62dd64f2";
    var base :string= "http://api.openweathermap.org/data/2.5/forecast/daily?q=";
    var fullUrl :string = base + $scope.city + apiKey +"&cnt=16";
    console.log(fullUrl);
    return fullUrl;
  }

  function weatherHandler(forecastIndex : number):any{
    var fullUrl :string= urlBuilder();
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

        var temperature : any = data.list[forecastIndex].temp.day - 273.15;
        console.log(temperature.toFixed(2));
        var weatherIcon : any  = data.list[forecastIndex].weather[0].icon;
        var weatherDescription : any = data.list[forecastIndex].weather[0].description;
        $scope.weatherIconUrl = weatherIcon + ".png";
        console.log(weatherIcon);
        console.log(weatherDescription);
        var fullWeatherInfo: any  = temperature.toFixed(2) + "°C, " + weatherDescription;
        $scope.weatherExtra = fullWeatherInfo;
        console.log($scope.weatherExtra);

      }, function errorCallback(error : any) : void{
        console.log("Something is wrong with API data request / response. Try again.");
        console.log(error.getAllResponseHeaders());
      });
      
  }


  window.onbeforeunload = function() :any {
    if($scope.calenderTasks && $scope.calenderTasks !== {}) {
      var stringifiedTasks : any;
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

