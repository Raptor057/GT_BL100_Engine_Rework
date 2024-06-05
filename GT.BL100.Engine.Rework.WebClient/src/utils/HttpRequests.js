const handleRejectedResponse = async (error) => {
    console.error(error);
    let message = error.message || `${error.status}: ${error.statusText}`;

    const processJson = (json) => {
        console.debug("JSON error from API", json);
        if (json.hasOwnProperty('errors')) {
            let message = json.title;
            for (let index in json.errors) {
                message += `\n- ${json.errors[index]}`;
            }
            return message;
        }
        return json.message;
    };

    const processText = (text) => {
        console.debug("Text error from API", text);
        return text;
    };

    if (typeof error.json === "function") {
        let isJSON = error.headers.get('content-type').includes('application/json');
        message = await (isJSON ? error.json().then(processJson) : error.text().then(processText)).catch(async genericError => {
            console.debug("Generic error from API", genericError);
            return `${error.status}: ${error.statusText}`;
        });
    }
    return Promise.reject(message);
};

const getOptions = (method, data = null) => {
    const headers = { "Access-Control-Expose-Headers": "Content-Length", "Content-Type": "application/json" };
    const options = ({ method: method, headers: headers, mode: 'cors' });
    return data == null ? options : { ...options, body: JSON.stringify(data) }
}

const HttpRequest = (function () {
    const httpRequest = async (method, url, data = null) => {
        console.debug(method, url);
        return fetch(url, getOptions(method, data))
            .then(response => {
                console.debug(response);
                if (!response.ok) {
                    return Promise.reject(response);
                }
                return response.json();
            })
            .then ((json) => json.data)
            .catch (handleRejectedResponse);
    };
    return {
        get: async (url) => httpRequest('GET', url),
        put: async (url, data) => httpRequest('PUT', url, data),
        post: async (url, data) => httpRequest('POST', url, data),
        delete: async (url, data) => httpRequest('DELETE', url, data),
    };
})();

export const MaterialLoadingApi = (function (apiUrl) {
    //apiUrl = 'http://localhost:5183';
    return {
        getLine: (lineCode) =>
            HttpRequest.get(`${apiUrl}/api/lines/${lineCode}`)
    };
})("http://mxsrvapps.gt.local/gtt/services/materialloading");

export const Bl100EngineRework = (function (apiUrl){
  apiUrl = 'http://localhost:5149';
  return{
    InsertMotorData:(scannerInput,bearing_Position,arrow_Position,hipot_IR,cw_Speed,amperage_CW,ccw_Speed,amperage_CCW,ptc_Resistance) =>
        HttpRequest.post(`${apiUrl}/api/lines/bl100enginerework`,{ScannerInput: scannerInput,Bearing_Position: bearing_Position,Arrow_Position: arrow_Position,Hipot_IR: hipot_IR,Cw_Speed: cw_Speed,Amperage_CW: amperage_CW,Ccw_Speed: ccw_Speed,Amperage_CCW: amperage_CCW,Ptc_Resistance: ptc_Resistance})
  };  
})("http://mxsrvapps.gt.local/gtt/services/bl100enginerework");