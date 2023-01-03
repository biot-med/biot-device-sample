const { mqtt, iot} = require('aws-iot-device-sdk-v2');
const fs = require('fs');
const TextDecoder = require('util').TextDecoder;

function sleep(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms)
	});
}


class MQTT {
	constructor(params) {
		this.params = params;
	}

	async connect() {
		this.connection = this._build_connection();
		this.connection.on('error', (e) => {
			console.log(e);
		});
		this.connection.on('interrupt', (error) => {
			console.log(`Connection interrupted: error=${error}`);
		});

		this.connection.on('disconnect', () => {
			console.log('Disconnected');
		});

		this.connection.on('error', (error) => {
			console.log(error);
		});
		await this.connection.connect();
		console.log("MQTT Connected");
		return this.connection;
	}

	async getBiotJWT() {
		return new Promise(async (resolve, reject) => {
			try {
				const on_publish = async (topic, payload) => {
					const decoder = new TextDecoder('utf8');
					const json = decoder.decode(payload);
					// console.log(json);
					const message = JSON.parse(json);
					resolve(message);
					// await this._unsubscribe('/token');
				}
				
				await this._subscribe('/token',on_publish);
				await this._publish('/token', {});
			}
			catch (error) {
				console.log(error);
				reject(error);
			}
			finally{
				await this._unsubscribe('/token'); 
			}
		});
	}

	async sendMeasurement(sessionContext, dataObj) {
		try {
			const request = {
				"metadata":{
				   "timestamp":Date.now(),
				   "context": sessionContext
				}
			};
			request.data = dataObj;
			await this._publish('/measurement', request);
		}
		catch (error) {
			console.log(error);
			throw error;
		}
	}

	async _publish(topic, data){
		await this.connection.publish(this.params.mqtt.client_id + '/from-device' + topic, data, mqtt.QoS.AtLeastOnce);
	}

	async _subscribe(topic, callback){
		await this.connection.subscribe(this.params.mqtt.client_id + '/to-device' + topic, mqtt.QoS.AtLeastOnce, callback);
	}

	async _unsubscribe(topic){
		await this.connection.unsubscribe(this.params.mqtt.client_id + '/to-device');
	}
	async disconnect() {
		await this.connection.disconnect();
	}

	_build_connection() {
		const mqttParams = this.params.mqtt;
		const cert = fs.readFileSync(process.cwd() + mqttParams.cert);
		const key = fs.readFileSync(process.cwd() + mqttParams.key);
		let config_builder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder(cert.toString(), key.toString());

		if (mqttParams.ca_file !== null) {
			const ca = fs.readFileSync(process.cwd() + mqttParams.ca_file);
			config_builder.with_certificate_authority(ca.toString());
		}
		config_builder.with_clean_session(false);
		config_builder.with_client_id(mqttParams.client_id);
		config_builder.with_endpoint(mqttParams.endpoint);
		const config = config_builder.build();
		this.client = new mqtt.MqttClient();
		return this.client.new_connection(config);
	}
}

module.exports = MQTT;