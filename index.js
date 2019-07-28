var Service, Characteristic;
const sensor = require('node-dht-sensor');

module.exports = (homebridge) => {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory('homebridge-sensor-dht', 'dht-sensor', DhtSensor);
};

function DhtSensor(log, config) {
    this.currentTemperature = 0;
    this.currentHumidity = 0;
    this.log = log;
    this.gpio = config.gpio | 4;
    this.dhtType = config.dhtType | 11;
    this.temperatureName = config.temperature_name | 'Temperature';
    this.humidityName = config.humidity_name | 'Humidity';
}

DhtSensor.prototype = {
  getDhtTemperature: function(callback) {
    sensor.read(this.dhtType, this.gpio, function(err, temperature, humidity) {
        if (err) {
           console.log(err);
           return callback(err);
        }
        this.humidityService
          .getCharacteristic(Characteristic.CurrentRelativeHumidity).updateValue(humidity);

        return callback(null, temperature);
    }.bind(this));
  },
  getServices: function() {
    let informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, "dht11")
      .setCharacteristic(Characteristic.Model, "dht11")
      .setCharacteristic(Characteristic.SerialNumber, "123-456-789");

    temperatureService = new Service.TemperatureSensor(this.temperatureName);

    temperatureService
      .getCharacteristic(Characteristic.CurrentTemperature)
      .on('get', this.getDhtTemperature.bind(this));

    let humidityService = new Service.HumiditySensor(this.humidityName);

    this.informationService = informationService;
    this.temperatureService = temperatureService;
    this.humidityService = humidityService

    return [this.informationService, this.temperatureService, this.humidityService];
  }
};
