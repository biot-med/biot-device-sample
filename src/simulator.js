const fs = require('fs');
const { exit } = require('process');

const MQTT = require('./biot_cloud_mqtt_api');
const BioTSessionManager = require('./biot_session_manager');

class Simulator
{
	constructor(env) {
		this.params = this._parseArgs(env);
	}

	//create a session with summary field.
	async sendSessionWithSummary() {
		console.log('Init connection to AWS IOT');
		const mqtt = new MQTT(this.params);
		await mqtt.connect();
		const authData = await mqtt.getBiotJWT(); //get jwt token with device certificate, in order to be able to communicate with BioT cloud over REST API

		const sessionManager = new BioTSessionManager(this.params.biotBaseUrl, authData.data.accessJwt.token);
		
		try {
			await sessionManager.createSession(this.params.deviceId, this.params.usageType, {
				"_startTime": new Date(new Date().getTime() - 5000).toISOString(),
				"_endTime": new Date(new Date().getTime() - 3000).toISOString(),
				"_state": "DONE",
				"_summary": {
				  "_stopReason": "Manual Stop",
				  "_stopReasonCode": "COMPLETION",
				  "avg_hr": 65
				},
				"_patient": {
				  "id": this.params.patientId
				}
			  }
			);
			
		} catch (error) {
			console.log(error);
		}

		process.on('exit', async function (){
			console.log('Disconnecting');
			await mqtt.disconnect();
			console.log('Goodbye!');
		});
		exit(0);
	}

	//send session with measurements
	async sendSessionWithMeasurements(periodInSeconds, frequencyInSec) {
		console.log('Init connection to AWS IOT');
		const mqtt = new MQTT(this.params);
		await mqtt.connect();
		const authData = await mqtt.getBiotJWT(); //get jwt token with device certificate, in order to be able to communicate with BioT cloud over REST API

		const sessionManager = new BioTSessionManager(this.params.biotBaseUrl, authData.data.accessJwt.token);
	
		try {
			const sessionResponse = await sessionManager.createSession(this.params.deviceId, this.params.usageType, {
				"_startTime": new Date(new Date().getTime() - 5000).toISOString(),
				"_state": "ACTIVE",
				"_patient": {
				  "id": this.params.patientId
				}
			  }
			);
			const sessionContext = sessionResponse.data._sessionContext;
			const usageSessionId = sessionResponse.data._id;
			
			await this._sendMeasurements(mqtt, sessionContext, periodInSeconds, frequencyInSec);
			
			await sessionManager.updateSession(this.params.deviceId, usageSessionId, {
				"_endTime": new Date(new Date().getTime() - 3000).toISOString(),
				"_state": "DONE",
				"_summary": {
				  "_stopReason": "Manual Stop",
				  "_stopReasonCode": "COMPLETION",
				  "avg_hr": 66
				}
			  }
			);
		} catch (error) {
			console.log(error);
		}

		process.on('exit', async function (){
			console.log('Disconnecting');
			await mqtt.disconnect();
			console.log('Goodbye!');
		});
		exit(0);
	}

	async _sendMeasurements(mqtt, sessionContext, periodInSeconds, frequencyInSec){
		return new Promise(async (resolve, reject) => {
			await this._sendRandomMeasurement(mqtt, sessionContext); //send for the first time
			var startTime = Date.now();
			var that = this;
			var timer = setInterval(async function () {
				var timeDiffInSec = (Date.now() - startTime)/1000;
				if (timeDiffInSec > periodInSeconds){
					clearInterval(timer);
					resolve();
					return;
				}

				await that._sendRandomMeasurement(mqtt, sessionContext);
			}, frequencyInSec*1000);
		});
	}

	async _sendRandomMeasurement(mqtt, sessionContext){
		//generate random value in a range (50 - 100)
		const randomHR = Math.floor(Math.random() * (100 - 50) + 50);

		console.log(`sending measurement: hr = ${randomHR}`);
		await mqtt.sendMeasurement(sessionContext, {
			"heart_rate": randomHR
		});
	}


	_parseArgs(env) {
		let params = {};
		if(Object.keys(env).length !== 0) {
			params.mqtt = {
				cert: env.CERT_PATH,
				key: env.PRIVATE_KEY_PATH,
				ca_file: env.AWS_CERT_AUTH_PATH,
				client_id: env.CLIENT_ID,
				endpoint: env.MQTT_ENDPOINT
			}
			params.deviceId = env.DEVICE_ID;
			params.toDevTokenTopic = env.TOKEN_TO_DEVICE_TOPIC;
			params.fromDevTokenTopic = env.TOKEN_FROM_DEVICE_TOPIC;
			params.biotBaseUrl = env.BIOT_BASE_URL;
			params.usageType = env.USAGE_TYPE;
			params.patientId = env.PATIENT_ID;
		}
		let errors = [];
		if (errors.length > 0) {
			errors.forEach(e => {
				console.log(e);
			});
			exit(1);
		}
		return params;
	}
}

module.exports = Simulator;