/**
 * Function to perform autocomplete on the search bar.
 * Retrieved from: https://www.w3schools.com/howto/howto_js_autocomplete.asp
 * @param inp
 */
function autocomplete(inp) {
    const arr = JSON.parse(localStorage.getItem("cityData") || "[]");
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        if(inp.value.length < 3)
        {
            if($("#cityInputautocomplete-list").length)
                $("#cityInputautocomplete-list").css("display", "none");
            return;
        }
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        var totalMatches = 0;
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                totalMatches += 1;
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
        if(totalMatches === 0)
            a.style.display = "none";
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

/**
 *  Callback to add a city to the collection. It will create a request, type POST, to the server.
 *  If something goes wrong, it will display the error message in an alert window.
 */
function addCity(){
    const city = document.getElementById("cityInput").value;
    $.ajax({
        type: 'POST',
        url: `/api/cities/city/${city}`,
        data: {city: city},
        success: function (data) {
            if(data)
            {
                localStorage.setItem("cities", JSON.stringify(data.cities));
                location.reload();
            }
        },
        error: function (xhr, textStatus, thrownError) {
            alert(xhr.statusText);
        }
    })
}

/**
 *  Callback to update all cities weather information. It will create a request, type PUT, to the server.
 *  If something goes wrong, it will display the error message in an alert window.
 */
function updateAll(){
    $.ajax({
        type: 'PUT',
        url: '/api/cities',
        success: function (data) {
            localStorage.setItem("cities", JSON.stringify(data.cities));
            location.reload();
        },
        error: function(xhr, textStatus, thrownError){
            alert(xhr.statusText);
        }
    })
}

/**
 *  *  Callback to update a city's weather information. It will create a request, type PUT, to the server.
 *  If something goes wrong, it will display the error message in an alert window.
 * @param cityName city to be updated.
 */
function updateCity(cityName){
    $.ajax({
        type: 'PUT',
        url: `/api/cities/city/${cityName}`,
        success: function (data) {
            localStorage.setItem("cities", JSON.stringify(data.cities));
            location.reload();
        },
        error: function(xhr, textStatus, thrownError){
            alert(xhr.statusText);
        }
    });
}

/**
 *  Callback to delete a city. It will create a request, type DELETE, to the server.
 *  If something goes wrong, it will display the error message in an alert window.
 * @param cityName city to be deleted.
 */
function deleteCity(cityName){
    $.ajax({
        type: 'DELETE',
        url: `/api/cities/city/${cityName}`,
        success: function (data) {
            localStorage.setItem("cities", JSON.stringify(data.cities));
            location.reload();
        },
        error: function(xhr, textStatus, thrownError){
            alert(xhr.statusText);
        }
    });
}


/**
 * Callback to open the modal.
 * @param cityName selected city name.
 */
function openModal(cityName) {
    $.ajax({
        type: 'GET',
        url: `/api/cities/city/${cityName}`,
        success: function (data) {
            // location.reload();
            $("#myModal").css("display", "inline-block");
            $("#cityNameH1").text(data.city.name);
            $("#cityData").text(JSON.stringify(data.city, null, 4));
            },
        error: function(xhr, textStatus, thrownError){
            alert(xhr.statusText);
        }
    });
}

/**
 * Callback to close the modal.
 */
function closeModal() {
    $("#myModal").css("display", "none");
}

/**
 * Executed every time the page loads. Used to retrieve all possible cities names and to attach an event handler
 * to the auto complete search bar.
 */
$(document).ready(function () {
    if(localStorage.getItem("cityData") === null)
    {
        $.ajax({
            type: 'GET',
            url: `/api/cities/cityData`,
            success: function (data) {
                localStorage.setItem("cityData", JSON.stringify(data));
                location.reload();
            },
            error: function(xhr, textStatus, thrownError){
                alert(xhr.statusText);
            }
        });
    }
    // Listen to enter event in search bar
    $("#cityInput").keyup(
        function (e) {
            if (e.key === 'Enter' || e.code === 13) {
                $("#add-city").click();
                return false;
            }
        }
    );
})

/**
 * Executed every time the page loads. Used to retrieve the current metric system.
 */
$(document).ready(function(){
    if(localStorage.getItem("metricSystem") === null)
    {
        $("#selectUnitSystem").val("metric");
        localStorage.setItem("metricSystem", "metric");
    }
    else
        $("#selectUnitSystem").val(localStorage.getItem("metricSystem"));
    $("#selectUnitSystem").change(function(){
        var newSystem = $(this).children("option:selected").val();
        $("#selectUnitSystem").val(newSystem);
        $.ajax({
            type: 'PUT',
            url: `/api/config/metricSystem/${newSystem}`,
            success: function (data) {
                localStorage.setItem("metricSystem", newSystem.toLowerCase());
                location.reload();
            },
            error: function(xhr, textStatus, thrownError){
                alert(xhr.statusText);
            }
        });
    });
});

/**
 * Function to draw a simple bar plot using chart.js library.
 */
function drawPlot() {
    const cities = JSON.parse(localStorage.getItem("cities") || "[]");
    if(cities.length === 0)
        return;
    var chrt = document.getElementById("chartCanvas").getContext("2d");
    const temperatures = [];
    const labels = [];
    cities.forEach(function (city) {
        labels.push(city.name);
        temperatures.push(convertTemperature(city.temperature));
    });
    var data = {
        labels: labels,
        datasets: [{
            label: `Temperature (${localStorage.getItem("metricSystem") === "metric" ? "ºC" : "ºF"})`,
            backgroundColor: "rgba(220,220,220,0.8)",
            borderColor: "rgb(86,86,118)",
            hoverBackgroundColor: "rgb(51,51,71)",
            hoverBorderColor: "rgba(220,220,220,1)",
            data: temperatures
        }]
    };
    const options = {
        scales:{
            type: "linear",
            display: true,
            position: "left",
            id: "y-axis-1",
            xAxes: [{
                barThickness: 50,
                ticks: {
                    autoSkip: false,
                    maxRotation: 90,
                    minRotation: 90
                }
            }],
            yAxes:[{
                ticks:{
                    suggestedMin: 0
                }
            }]
        }
    };
    var myFirstChart = new Chart(chrt, {
        type: 'bar',
        data: data,
        options: options
    });
}

/**
 * Function to call a PUT method requesting the server to sort the cities collection.
 * @param sortBy header name.
 */
function sortBy(sortBy) {
    var ascending = localStorage.getItem("ascending");
    $.ajax({
        type: 'PUT',
        url: `/api/cities/sort/${sortBy}?ascending=${ascending}`,
        success: function (data) {
            localStorage.setItem("cities", JSON.stringify(data.cities));
            localStorage.setItem("ascending", ascending === "true" ? "false": "true");
            location.reload();
        },
        error: function(xhr, textStatus, thrownError){
            alert(xhr.statusText);
        }
    });
}

/**
 * Converts a temperature, given in ºC. If the current unit system is "metric", it returns the temperature. Otherwise,
 * it returns the Fahrenheit equivalent.
 * @param temperature
 * @returns {string|*}
 */
function convertTemperature(temperature) {
    const unitSystem = localStorage.getItem("metricSystem");

    if (!temperature)
        return "";
    if (unitSystem === "metric")
        return temperature;
    else {
        const temperatureF = (temperature * 9 / 5) +( 32);
        return temperatureF.toPrecision(3);
    }
}

