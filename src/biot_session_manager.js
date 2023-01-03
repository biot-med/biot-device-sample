const RestAPIService = require('./biot_cloud_rest_api');
const { exit } = require('process');

const MQTT = require('./biot_cloud_mqtt_api');

class BioTSessionManager
{
	constructor(bioTbaseUrl, accessToken) {
		this.restAPIService = new RestAPIService(bioTbaseUrl, accessToken);
	}

	async createSession(deviceId, usageType, sessionData) {
		return await this.restAPIService.createSession(deviceId, usageType, sessionData);
	}

	async updateSession(deviceId, usageSessionId, sessionData) {
		return await this.restAPIService.updateSession(deviceId, usageSessionId, sessionData);
	}
}

module.exports = BioTSessionManager;