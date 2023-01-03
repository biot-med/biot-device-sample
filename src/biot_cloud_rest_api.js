const axios = require('axios');

const Resources = {
  createSession: {
    uri: 'device/v1/devices/{deviceId}/usage-sessions/usage-type/{usageType}',
    method: 'POST',
    requireAuth: true,
  },
  updateSession: {
    uri: 'device/v1/devices/{deviceId}/usage-sessions/{usageSessionId}',
    method: 'PATCH',
    requireAuth: true,
  },
};

/**
|--------------------------------------------------
| The server service - expose interface to the API.
| Every method returns a promise.
|--------------------------------------------------
*/
class RestAPIService {
	constructor(bioTbaseUrl, accessToken) {
		this._axiosClient = axios.create({
			baseURL: bioTbaseUrl,
			timeout: 5000,
		  });
		
		  this.accessToken = accessToken;
		this._axiosClient.interceptors.request.use(this._requestInterceptor, null);
	}

    createSession(deviceId, usageType, sessionData) {
		return this._sendRequest({
			resource: this.replaceTokens(Resources.createSession, [{name: 'deviceId', value: deviceId}, {name: 'usageType', value: usageType}]),
			data: sessionData
		});
	}

	updateSession(deviceId, usageSessionId, sessionData) {
		return this._sendRequest({
			resource: this.replaceTokens(Resources.updateSession, [{name: 'deviceId', value: deviceId}, {name: 'usageSessionId', value: usageSessionId}]),
			data: sessionData
		});
	}

	replaceTokens(resource, tokens) {
		tokens.forEach(token => {
			resource.uri = resource.uri.replace('{' + token.name + '}', token.value);
		});
		return resource;
	}

	async _sendRequest({ resource, data, params, additionalPath }){
		try {
			const response = await this._axiosClient(
				this._createRequestObject({
					resource,
					data,
					params,
					additionalPath,
				}),
			);
			return response;
		} catch (error) {
			console.error(error);
		}
	}

	_createRequestObject({ resource, data, params, additionalPath, additionalOptions }) {
		let actualUri = resource.uri;
	
		if (additionalPath !== undefined) {
		  actualUri = resource.uri + '/' + additionalPath;
		}
	
		return {
		  withCredentials: true,
		  ...resource,
		  requireAuth: resource.requireAuth || false,
		  headers: resource.headers || {},
		  data,
		  params,
		  url: actualUri,
		  ...additionalOptions,
		};
	  }

	  _requestInterceptor = async request => {
		if (!request.headers.Authorization && request.requireAuth) {
		  const token = 'Bearer ' + this.accessToken;
	
		  return {
			...request,
			headers: { ...request.headers, Authorization: token },
		  };
		}
	
		return request;
	  };
};

module.exports = RestAPIService;
