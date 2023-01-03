
# README #

This project is a sample code of a device that communicates with BioT cloud.  
**Disclaimer**: this is only a sample code. It's not intented to be used in production system, because it doesn't have a full error handling.

## How to Run
It's required to have Node.js installed.

Uncommend the relevant line index.js to decide what you would like to simulate.

Run from cmd line: node index.js

Note: please review configuration section before running the project

## Configuration
### System Configuration
The BioT device sample is simulating a device that connects to the cloud. Therefore, it needs to have a device configured on the cloud.  
Usually the system already comes with a default device (device1).  
1. Add device - [how to](https://docs.biot-med.com/docs/adding-a-new-device#step-2---add-device-page)  
2.  Generate certificate:

-   Download certificate manually from the website -  [how to](https://docs.biot-med.com/docs/generate-and-download-a-permanent-device-security-certificate)
   -   Change (only) files extensions as follows:
       -   …caCertificate.txt --> …caCertificate.pem
       -   …certificate.txt --> …certificate.pem.crt
       -   …privateKey.txt --> …privateKey.pem.key
   -   Copy the certificate files to “certs” folder (under your name/env)
   -   Update .env file accordingly

### .env Configuration
All configuration required is on .env file.

-   MQTT_ENDPOINT - copy from BioT Console --> Technical Information
-   BIOT_BASE_URL - get from BioT support or copy from developer tools while BioT portal is opened  
-   DEVICE_ID - can be taken from “Unique id” in device details page
-   CLIENT_ID - get it from “…connectionDetails.txt” file that is part of the zip downloaded after creating a certificate
-   CERT_PATH, PRIVATE_KEY_PATH, AWS_CERT_AUTH_PATH - paths to the certificates you created previously
-   PATIENT_ID - copy from developer tools while BioT portal opens patient expand page
-   USAGE_TYPE - copy from BioT console --> device template uage type
-   TOKEN_FROM_DEVICE_TOPIC, TOKEN_TO_DEVICE_TOPIC - doesn’t need to change

## Examples Implemented
The sThe sample code simulates the following flows:

-   Direct device communication (with certificate)
    -   Create a session with a summary
    -   Open a session, send measurements every X seconds for Y amount of time and close the session with a summary
