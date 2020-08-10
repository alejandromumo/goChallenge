# goChallenge
GO Challenge - Weather API

Simple application to retrieve weather data from the public API [Open Weather Map](https://openweathermap.org).

The server-side of this application is implemented using [node.js](https://nodejs.org/), more specifically [express.js](http://expressjs.com/).
The front-end is implemented using templates, namely [nunjucks](https://mozilla.github.io/nunjucks/) and some vanilla JS, jQuery and ajax.

## Install
Install the dependencies by executing `npm install`

## Setup
This application uses environment variables to configure how the application will run. 

### Environment Variables
You must create a `.env` file and place it under the `/config` directory. A `.env_sample` is provided to demonstrate the structure of the file. 

* `API_KEY` - the private API key to be used within the application to communicate with the public API.
* `NODE_ENV`- the run environment. Either `production` or `dev`. It can also be left in blank, and the application will use the default configurations. 

**NOTE** : you must place a valid API key from the Open Weather Map. You can get one following the steps detailed in [here](https://openweathermap.org/appid#get).

### Configurations
Additionally, the application also also uses the [config](https://www.npmjs.com/package/config) library to set up the configuration parameters for different run environments. The configuration files are also under the `/config` directory. Each environment's configurations are detailed in the `/config/*.json` files (i.e. for `dev`, it will use the configurations specified in the `dev.json` file)

## Run
To run the application, simply execute `npm start` and access the application in your browser:

* For **dev**:   https://localhost:8080/
* For **production**:   https://localhost:9090/
* Otherwise: https://localhost:3030/

Note that you can configure the port by editing the desired configuration file. If you do this, you should access the application in the port that you specified.

If, by any reason, the configuration through these files fail, the default port is `9090`.

The application uses HTTPS. This requires a SSL certificate that, in turn, requires a private RSA key to sign it. For the purpose of this demonstration, both the certificate and the key are available in the server-side under the directory `/bin`.  


## Tutorial
Even though the application is simple, there are a few notes that should be specified.

*
*
*
