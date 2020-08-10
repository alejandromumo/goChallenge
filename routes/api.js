const express = require('express');
const config = require('config');
const utils = require('../utils/utils');
const axios = require('axios');
var bodyParser = require('body-parser');

const router = express.Router();

var urlencodedParser = bodyParser.urlencoded({ extended: false })

/**
 * JSON to store the currently existing cities JSON objects. It enables O(1) access.
 * @type {[]}
 */
var currentCitiesObjects = utils.currentCities;

/**
 * List to store the currently existing cities. Structure used to provide data to client.
 * @type {[]}
 */
var citiesArray = utils.currentCitiesArray;


/**
 * GET method to access the API landing page.
 */
router.get('/', function(req, res, next) {
    req.send("API Landing Page");
});

/**
 * Cities collection endpoints
 */

/**
 * PUT method to update all the cities currently in the server-side collection.
 */
router.put('/cities', function (req, res, next) {
    if(citiesArray.length < 3)
    {
        res.status(500);
        res.statusMessage = "Not enough cities. Please add more cities before requesting weather data.";
        throw new Error();
    }
    else
    {
        try{
            // Only update cities that were not updated recently.
            const toBeUpdated = {};
            Object.keys(currentCitiesObjects).forEach(function (key) {
                const cityObject = currentCitiesObjects[key];
                if(Date.now() - cityObject.lastUpdated >= 600)
                    toBeUpdated[cityObject.name]  = cityObject;
            })
            // If there are no cities to be updated, don't do anything at all.
            if(Object.keys(toBeUpdated).length === 0)
                return;
            const url = getCitiesUrl(toBeUpdated);
            axios.get(url)
                .then((response) => {
                    response.data.list.forEach(function (responseCity) {
                        const cityObject = currentCitiesObjects[responseCity.name];
                        cityObject.temperature = responseCity.main.temp;
                        cityObject.sunrise = responseCity.sys.sunrise + responseCity.sys.timezone;
                        cityObject.sunset = responseCity.sys.sunset + responseCity.sys.timezone;
                        cityObject.lastUpdated = utils.currentDate();
                        cityObject.maxTemperature = responseCity.main.temp_max;
                        cityObject.minTemperature = responseCity.main.temp_min;
                    })
                    res.status(response.status);
                    res.statusMessage = response.statusText;
                    res.send({cities: citiesArray});
                })
                .catch((error) => {
                    res.status(error.status);
                    res.statusMessage = `An error occurred requesting the weather API. ${error}`;
                    next(error);
                })
        } catch(error){
            next(error);
        }

    }
});

/**
 * GET method to retrieve all the currently existing cities in the server-side collection.
 */
router.get('/cities', function (req, res, next) {
    try{
        res.status(200);
        res.send({cities: citiesArray});
    }catch (error) {
        res.statusMessage = "An error has occurred retrieving the cities collection.";
        next(error);
    }
});

/**
 * PUT method to sort the cities array.
 */
router.put('/cities/sort/:sortBy', urlencodedParser, function (req, res, next) {
    try{
        res.status(200);
        var sortBy = req.params.sortBy;
        citiesArray = citiesArray.sort(function (itemA, itemB) {
            const isAscending = req.query.ascending === "true";
            const result = itemA[sortBy] > itemB[sortBy];
            if(result === true )
            {
                if(isAscending)
                    return -1;
                return 1;
            }
            else if(result === false)
            {
                if(isAscending)
                    return 1;
                return -1;
            }
            else
                return 0;
        })
        res.send({cities: citiesArray});
    } catch (error) {
        res.statusMessage = "An error has occurred sorting the cities collection.";
        next(error);
    }
});



/**
 * Individual City endpoints
 */

/**
 * PUT method to update a specific city information stored in the server.
 */
router.put('/cities/city/:name', function(req, res, next) {
    const cityID = getCityID(req.params.name);
    const cityObject = currentCitiesObjects[req.params.name];
    const elapsed = (utils.currentDate() - cityObject.lastUpdated);
    // If the city does not exist, refuse the request.
    if(cityID === -1)
    {
        res.statusMessage = "City does not exist";
        res.status(500);
        throw new Error();
    }
    // If the last update for this city was recently performed (under 10 minutes), refuse the request.
    else if(elapsed < 600)
    {
        res.statusMessage = `City was already updated recently. Try again in : ${utils.durationRepresentation(600 - elapsed)}`;
        res.status(500);
        throw new Error();
    }
    else if(citiesArray.length < 3)
    {
        res.status(500);
        res.statusMessage = "Not enough cities. Please add more cities before requesting weather data.";
        throw new Error();
    }
    const url = getCityUrl(cityID);
    axios.get(url)
        .then((response) => {
            const responseObject = response.data;
            cityObject.temperature = responseObject.main.temp;
            cityObject.sunrise = responseObject.sys.sunrise;
            cityObject.sunset = responseObject.sys.sunset;
            cityObject.lastUpdated = utils.currentDate();
            cityObject.maxTemperature = responseObject.main.temp_max;
            cityObject.minTemperature = responseObject.main.temp_min;
            res.status(response.status);
            res.statusMessage = response.statusText;
            res.send({cities: citiesArray});
        })
        .catch((error) => {
            res.status(error.status);
            res.statusMessage = `An error occurred requesting the weather API. ${error}`;
            next(error);
        })

});

/**
 * DELETE method to delete a city from the current server-side collection.
 */
router.delete('/cities/city/:name', function(req, res, next) {
    // Verify if the city exists.
    if(currentCitiesObjects[req.params.name] === undefined)
    {
        res.statusMessage = "City does not exist";
        res.status(500);
        throw new Error();
    }
    try{
        delete currentCitiesObjects[req.params.name];
        citiesArray.splice(citiesArray.indexOf(req.params.name), 1);
        res.status(200);
        res.statusMessage = `City ${req.params.name} deleted successfully`;
        res.send({cities: citiesArray})
    } catch(error){
        res.statusMessage = `An error occurred deleting the city. ${error}`;
        next(error);
    }
});


/**
 * POST method to add a city to the server-side collection.
 * @type {string|string}
 */
router.post('/cities/city/:name', function (req, res, next) {
    const receivedCity = req.params.name;
    const cityID = getCityID(receivedCity);
    // If the city does not exist, add it. Otherwise, refuse the request.
    if(currentCitiesObjects[receivedCity] === undefined && cityID !== -1)
    {
        const newObject = {name: receivedCity, temperature: null, maxTemperature: null,
            minTemperature: null, lastUpdated: null, sunrise: null,
            sunset: null, id: cityID};
        currentCitiesObjects[receivedCity] = newObject;
        citiesArray.push(newObject);
        res.statusMessage = "City successfully added.";
        res.status(201);
    }
    else
    {
        res.statusMessage = "City not added, it is not a valid city.";
        res.status(500);
        throw new Error();
    }
    res.send({cities: citiesArray});
});

/**
 * GET method to retrieve a specific city information.
 */
router.get('/cities/city/:name', function (req, res, next) {
    const cityObject = currentCitiesObjects[req.params.name];
    if(cityObject === undefined)
    {
        res.statusMessage = "City does not exist";
        res.status(500);
        throw new Error();
    }
    else
    {
        res.status(200);
        res.send({city: cityObject});
    }
});

/**
 * Configuration endpoints
 */
router.put('/config/metricSystem/:name', function (req, res, next) {
    const newSystem = req.params.name.toLowerCase();
    if(newSystem !== "metric" && newSystem !== "imperial")
    {
        res.status(500);
        res.statusMessage = $`Metric system is not valid! Using current system: ${utils.unitSystem}`;
        throw new Error;
    }
    else
    {
        try{
            utils.unitSystem = newSystem;
            res.status(200);
            res.send({unitSystem: utils.unitSystem});
        }catch (error) {
            res.satus(500);
            next(error);
        }
    }
});



/**
 * Auxiliry methods
 */

/**
 * Auxiliary method to retrieve a city's url, as it will be requested to the public API.
 * See more: https://openweathermap.org/current#cities
 * @param cityID the ID from the city that is being requested.
 * @returns {string} containing the URL to call the public API.
 */
function getCityUrl(cityID){
    return `https://api.openweathermap.org/data/2.5/weather?id=${cityID}&appid=${process.env.API_KEY}&units=metric`;
}

/**
 * Auxiliary method to retrieve the URL to request the public API for a collection of cities.
 * @param citiesArray array containing cities that are being requested
 */
function getCitiesUrl(citiesArray){
    var citiesIDS = [];
    Object.keys(citiesArray).forEach(function (key) {
        citiesIDS.push(citiesArray[key].id);
    })
    return `https://api.openweathermap.org/data/2.5/group?id=${citiesIDS}&units=metric&appid=${process.env.API_KEY}`;
}

/**
 * Auxiliary function to retrieve a city's ID, given its name.
 * Existing cities are defined in the resources/city_data.json
 * @param city city name
 * @returns {number} corresponding to the city's ID or -1 if the city does not exist.
 */
function getCityID(city){
    var id = -1;
    for (var i = 0; i < utils.cityData.length; i++)
    {
        var cityObject = utils.cityData[i];
        if(cityObject.name === city)
        {
            id = cityObject.id;
            break;
        }
    }
    return id;
}

module.exports = router;
