const cron = require('node-cron');

const { BookingService } = require('../../services');

function scheduleCrons() {      // every 30 mins it will check
    cron.schedule('*/30 * * * *', async () => {
        await BookingService.cancelOldBooking();
    });
}

module.exports = scheduleCrons;