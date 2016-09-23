var app = angular.module('tdwaApp', ['ui.bootstrap']);
app.controller('todoController', function todoController($scope, $filter, $http) {
    $scope.todoDisabled = true;
    $scope.dueDisabled = true;
    $scope.btnText = "hmm..";
    // $scope.fullDate = "";
    $scope.dateWarning = true;
    $scope.weatherExtra = "";
    $scope.datePicked = new Date();
    var today = new Date();
    $scope.currentDay = dateFormatter(today);
    var maxForecastDay = new Date();
    maxForecastDay.setDate(today.getDate() + 15);
    $scope.maxDay = dateFormatter(maxForecastDay);
    function dateFormatter(date) {
        date.setHours(0, 0, 0, 0);
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var formattedDate = day + "/" + month + "/" + year;
        return formattedDate;
    }
    var init = function () {
        var fullListStored = localStorage.getItem("allTasksv2");
        if (fullListStored) {
            $scope.calenderTasks = JSON.parse(fullListStored);
        }
        else {
            $scope.calenderTasks = {};
            $scope.tasks = [];
        }
        ;
    };
    $scope.inputDisabling = function () {
        if ($scope.datePicked) {
            $scope.todoDisabled = false;
            $scope.dueDisabled = false;
            $scope.dateWarning = false;
        }
        else if (!$scope.datePicked) {
        }
        ;
    };
    var getDateKey = function (dt) {
        if (!dt) {
            return null;
        }
        ;
        var day = $filter('date')(dt, 'EEE');
        var date = $filter('date')(dt, 'dd');
        var month = $filter('date')(dt, 'MMM');
        var year = $filter('date')(dt, 'yyyy');
        var fullDate = $filter('date')(dt, 'fullDate');
        var dtKey = day + date + month + year;
        return dtKey;
    };
    $scope.addTask = function () {
        var fullTask = new Task($scope.todo, $scope.due, false);
        $scope.tasks.push(fullTask);
    };
    var Task = (function () {
        function Task(todo, time, check) {
            this.todo = todo;
            this.time = time;
            this.check = check;
            this.whatToDo = todo;
            this.due = time;
            this.done = check;
        }
        return Task;
    }());
    ;
    $scope.removeTask = function (task) {
        $scope.tasks.splice($scope.tasks.indexOf(task), 1);
    };
    $scope.$watch('datePicked', function (newValue, oldValue) {
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
        if (!prevDateKey && !currentDateKey) {
            console.log("The page is loaded. Date is needed to be picked.");
        }
        else if (!currentDateKey) {
            console.log("Error");
        }
        else if (prevDateKey == currentDateKey) {
            console.log("Same dates, do nothing.");
        }
        else if (prevDateKey != currentDateKey) {
            updateWeather();
            var newTasks = $scope.calenderTasks[currentDateKey];
            if (!newTasks) {
                $scope.calenderTasks[currentDateKey] = [];
            }
            ;
            $scope.tasks = $scope.calenderTasks[currentDateKey];
        }
    });
    //date difference calculating function
    function dateDiff(date1, date2) {
        var utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
        var utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
        var diffDays = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    //AJAX
    $scope.cityChange = function () {
        console.log("city change");
        updateWeather();
    };
    function updateWeather() {
        if (!$scope.city || !$scope.datePicked) {
            console.log("falsy value in either city or date");
            weatherReset();
            return;
        }
        if ($scope.datePicked < today) {
            console.log($scope.datePicked);
            console.log(today);
            console.log("date : past");
            weatherReset();
            return;
        }
        if ($scope.datePicked > maxForecastDay) {
            console.log("date : future");
            weatherReset();
            return;
        }
        weatherHandler(dateDiff(today, $scope.datePicked));
        console.log("weather is updated");
    }
    function weatherReset() {
        $scope.weatherExtra = "";
        $scope.weatherIconUrl = "";
    }
    function urlBuilder() {
        var apiKey = "&APPID=6e5c36e3f3e48f73098b186d62dd64f2";
        var base = "http://api.openweathermap.org/data/2.5/forecast/daily?q=";
        var fullUrl = base + $scope.city + apiKey + "&cnt=16";
        console.log(fullUrl);
        return fullUrl;
    }
    function weatherHandler(forecastIndex) {
        var fullUrl = urlBuilder();
        console.log("weather handler is processing");
        console.log(fullUrl);
        $http.get(fullUrl)
            .then(function successCallback(response) {
            var data = response.data;
            console.log(data);
            console.log("got the data, processing...");
            //show description and the icon of the weather according to its weather code
            if (!data) {
                return;
            }
            var temperature = data.list[forecastIndex].temp.day - 273.15;
            console.log(temperature.toFixed(2));
            var weatherIcon = data.list[forecastIndex].weather[0].icon;
            var weatherDescription = data.list[forecastIndex].weather[0].description;
            $scope.weatherIconUrl = weatherIcon + ".png";
            console.log(weatherIcon);
            console.log(weatherDescription);
            var fullWeatherInfo = temperature.toFixed(2) + "°C, " + weatherDescription;
            $scope.weatherExtra = fullWeatherInfo;
            console.log($scope.weatherExtra);
        }, function errorCallback(error) {
            console.log("Something is wrong with API data request / response. Try again.");
            console.log(error.getAllResponseHeaders());
        });
    }
    window.onbeforeunload = function () {
        if ($scope.calenderTasks && $scope.calenderTasks !== {}) {
            var stringifiedTasks;
            try {
                stringifiedTasks = JSON.stringify($scope.calenderTasks);
            }
            catch (e) {
                return;
            }
            if (stringifiedTasks) {
                localStorage.setItem("allTasksv2", stringifiedTasks);
            }
        }
    };
    init();
});
