const express = require('express');

const { ServerConfig } = require('./config');

const apiRoutes = require('./routes');

const CRON = require('./utils/common/cron-jobs');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api', apiRoutes);

// proxy middleware
app.use('/bookingService/api', apiRoutes);

app.listen(ServerConfig.PORT, () => {
    console.log(`successfully started the server on PORT : ${ServerConfig.PORT}`);
    CRON();
})
//console.log(process.env)