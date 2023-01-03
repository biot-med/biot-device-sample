require('dotenv').config();
const Simulator = require('./src/simulator');

const simulator = new Simulator(process.env);

//choose one of the below simulations (by uncommenting the relevant line)

//create a session with session summary
// simulator.sendSessionWithSummary();

//open a session, send hr measurement every 3 seconds for 10 seconds
simulator.sendSessionWithMeasurements(10, 3);
