const cityData = require('../resources/city.list.json');

/**
 * Defines the unit system to use in the application
 * @type {string}
 */
var unitSystem = "metric";

function getCurrentDate(){
    return Date.now() / 1000;
}

function millisecondsToString(dateInSeconds, type){
    if(dateInSeconds === null)
        return "";
    const dateInMs = dateInSeconds * 1000;
    if (type === "long")
        return new Date(dateInMs).toLocaleDateString("en-GB", { dateStyle: 'short', timeStyle: 'short',
            weekday: 'short', year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit',
            second: '2-digit', hour12: false});
    else if(type === "medium")
        return new Date(dateInMs).toLocaleTimeString("en-GB", {timeStyle: 'medium', hour: '2-digit',
            minute: '2-digit', second: '2-digit', hour12: false});
    else
    {
        return new Date(dateInMs).toLocaleTimeString("en-GB", {timeStyle: 'short', hour: '2-digit',
            minute: '2-digit', second: '2-digit', hour12: false});
    }
}

/**
 * Return a string representing a duration, given in milliseconds. Representation is in the format MM:SS
 * @param durationInMs duration in milliseconds
 * @returns {string} string representation of the duration in the format MM:SS
 */
function durationRepresentation(durationInMs) {
    return Math.floor(durationInMs/(60))%60 + ":" + Math.floor(durationInMs)%60;
}

/**
 * Computes the string corresponding to the currently used metric system.
 * @param temperature temperature to be converted to string.
 * @param unitSystem
 * @returns {string}
 */
function temperatureToString(temperature, unitSystem){
    if (!temperature)
        return "";
    if(unitSystem === "metric")
        return `${temperature} ºC`;
    else
    {
        const temperatureFahrenheit = (temperature * 9/5) + 32;
        return `${temperatureFahrenheit.toPrecision(3)} ºF`;
    }
}



exports.currentDate = getCurrentDate;
exports.millisecondsToString = millisecondsToString;
exports.temperatureToString = temperatureToString;
exports.durationRepresentation = durationRepresentation;
exports.unitSystem = unitSystem;
exports.cityData = cityData;
exports.currentCities = {};
exports.currentCitiesArray = [];

