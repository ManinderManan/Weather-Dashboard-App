// Easy access to elements
var searchHistoryList = $('#search-history-list');
var cityHeader = $("#searchCity");
var searchBtn = $("#searchCityButton");
var clearBtn = $("#clear-history");

var currentCity = $("#currentCity");
var currentTemp = $("#currentTemp");
var currentHumidity = $("#currentHumidity");
var currentWindSpeed = $("#currentWindSpeed");
var UVindex = $("#uvIndex");

var weatherContent = $("#weatherContent");

// OpenWeather API
//var apiKey = "a17e1499228be1f9c294ac18b234c7d7";
const apiKey = "bc7696a82d6df78862740451e4d87874";

// Easy access to data
var cityList = [];

// Find current date and display in title
var currentDate = moment().format('L');
$("#current-date").text("(" + currentDate + ")");

// Check if search history exists when page loads
initalizeHistory();
showClear();

// Hitting enter while input is focused will trigger
// value added to search history
$(document).on("submit", function(){
    event.preventDefault();

    // Grab value entered into search bar 
    var searchValue = cityHeader.val().trim();

    currentConditionsRequest(searchValue)
    searchHistory(searchValue);
    cityHeader.val(""); 
});

// Clicking the search button will trigger
// value added to search history
searchBtn.on("click", function(event){
    event.preventDefault();

    // Grab value entered into search bar 
    var searchValue = cityHeader.val().trim();

    currentConditionsRequest(searchValue)
    searchHistory(searchValue);    
    cityHeader.val(""); 
});

// Clear the sidebar of past cities searched
clearBtn.on("click", function(){
    // Empty out the  city list array
    cityList = [];
    // Update city list history in local storage
    listArray();
    
    $(this).addClass("hide");
});

// Clicking on a button in the search history sidebar
// will populate the dashboard with info on that city
searchHistoryList.on("click","li.city-btn", function(event) {
    // console.log($(this).data("value"));
    var value = $(this).data("value");
    currentConditionsRequest(value);
    searchHistory(value); 

    

});



// Request Open Weather API based on user input
function currentConditionsRequest(searchValue) {
    
    // Formulate URL for AJAX api call
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&units=imperial&appid=" + apiKey;
    

    // Make AJAX call
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response){
        console.log(response);
        currentCity.text(response.name);
        currentCity.append("<small class='text-muted' id='current-date'>");
        $("#current-date").text("(" + currentDate + ")");
        currentCity.append("<img src='https://openweathermap.org/img/w/" + response.weather[0].icon + ".png' alt='" + response.weather[0].main + "' />" )
        currentTemp.text(response.main.temp);
        currentTemp.append("&deg;F");
        currentHumidity.text(response.main.humidity + "%");
        currentWindSpeed.text(response.wind.speed + "MPH");

        
        
        var lat = response.coord.lat;
        var lon = response.coord.lon;
        

        

        var UVurl = "https://api.openweathermap.org/data/2.5/uvi?&lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;
        // AJAX Call for UV index
        $.ajax({
            url: UVurl,
            method: "GET"
        }).then(function(response){
            // console.log("UV call: ")
            // console.log(response);
            UVindex.text(response.value);
        });

        var countryCode = response.sys.country;
        var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?&units=imperial&appid=" + apiKey + "&lat=" + lat +  "&lon=" + lon;
        
        // AJAX call for 5-day forecast
        $.ajax({
            url: forecastURL,
            method: "GET"
        }).then(function(response){
            console.log(response);
            $('#five-day-forecast').empty();
            for (var i = 1; i < response.list.length; i+=8) {

                var forecastDateString = moment(response.list[i].dt_txt).format("L");
                console.log(forecastDateString);

                var forecastCol = $("<div class='col-12 col-md-6 col-lg forecast-day mb-3'>");
                var forecastCard = $("<div class='card'>");
                var forecastCardBody = $("<div class='card-body'>");
                var forecastDate = $("<h5 class='card-title'>");
                var forecastIcon = $("<img>");
                var forecastTemp = $("<p class='card-text mb-0'>");
                var forecastHumidity = $("<p class='card-text mb-0'>");


                $('#five-day-forecast').append(forecastCol);
                forecastCol.append(forecastCard);
                forecastCard.append(forecastCardBody);

                forecastCardBody.append(forecastDate);
                forecastCardBody.append(forecastIcon);
                forecastCardBody.append(forecastTemp);
                forecastCardBody.append(forecastHumidity);
                
                forecastIcon.attr("src", "https://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png");
                forecastIcon.attr("alt", response.list[i].weather[0].main)
                forecastDate.text(forecastDateString);
                forecastTemp.text(response.list[i].main.temp);
                forecastTemp.prepend("Temp: ");
                forecastTemp.append("&deg;F");
                forecastHumidity.text(response.list[i].main.humidity);
                forecastHumidity.prepend("Humidity: ");
                forecastHumidity.append("%");
                
                
                
                
                // console.log(response.list[i].dt_txt);
                // console.log(response.list[i].main.temp);
                // console.log(response.list[i].main.humidity);

            }
        });

    });

    

};

// Display and save the search history of cities
function searchHistory(searchValue) {
    // Grab value entered into search bar 
    // var searchValue = searchCityInput.val().trim();
    
    // If there are characters entered into the search bar
    if (searchValue) {
        // Place value in the array of cities
        // if it is a new entry
        if (cityList.indexOf(searchValue) === -1) {
            cityList.push(searchValue);

            // List all of the cities in user history
            listArray();
            clearBtn.removeClass("hide");
            weatherContent.removeClass("hide");
        } else {
            // Remove the existing value from
            // the array
            var removeIndex = cityList.indexOf(searchValue);
            cityList.splice(removeIndex, 1);

            // Push the value again to the array
            cityList.push(searchValue);

            // list all of the cities in user history
            // so the old entry appears at the top
            // of the search history
            listArray();
            clearBtn.removeClass("hide");
            weatherContent.removeClass("hide");
        }
    }
    // console.log(cityList);
}

// List the array into the search history sidebar
function listArray() {
    // Empty out the elements in the sidebar
    searchHistoryList.empty();
    // Repopulate the sidebar with each city
    // in the array
    cityList.forEach(function(city){
        var searchHistoryItem = $('<li class="list-group-item city-btn">');
        searchHistoryItem.attr("data-value", city);
        searchHistoryItem.text(city);
        searchHistoryList.prepend(searchHistoryItem);
    });
    // Update city list history in local storage
    localStorage.setItem("cities", JSON.stringify(cityList));
    
}



// Grab city list string from local storage
// and update the city list array
// for the search history sidebar
function initalizeHistory() {
    if (localStorage.getItem("cities")) {
        cityList = JSON.parse(localStorage.getItem("cities"));
        var lastIndex = cityList.length - 1;
        // console.log(cityList);
        listArray();
       
        if (cityList.length !== 0) {
            currentConditionsRequest(cityList[lastIndex]);
            weatherContent.removeClass("hide");
        }
    }
}

// Check to see if there are elements in
// search history sidebar in order to show clear history btn
function showClear() {
    if (searchHistoryList.text() !== "") {
        clearBtn.removeClass("hide");
    }
}