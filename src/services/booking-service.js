const axios = require('axios');
const { StatusCodes } = require('http-status-codes');

const { BookingRepository } = require('../repositories');
const { ServerConfig } = require('../config');
const db = require('../models');
const AppError = require('../utils/errors/app-error');
const {Enums} = require('../utils/common');
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

const bookingRepository = new BookingRepository();

async function createBooking(data) {
    const transaction = await db.sequelize.transaction();
    try {
        //console.log("data in service: ", data);
        const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
        const flightData = flight.data.data;
        //console.log("flightData in service: ", flightData);
        if(data.noOfSeats > flightData.totalSeats) {
            throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
        }
        const totalBillingAmount = data.noOfSeats * flightData.price;
        const bookingPayload = {...data, totalCost: totalBillingAmount};
        //console.log("booking Payload : ", bookingPayload);
        const booking = await bookingRepository.createBooking(bookingPayload, transaction);

        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`, {
            seats: data.noOfSeats
        });
        await transaction.commit();
        return booking;
    } catch (error) {
       // console.log(error)
        await transaction.rollback();
        throw error;
    }
}

async function makePayment(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(data.bookingId, transaction);
        if(bookingDetails.totalCost != data.totalCost) {
            throw new AppError('The payment amount does not match', StatusCodes.BAD_REQUEST);
        }
        if(bookingDetails.userId != data.userId) {
            throw new AppError('The user corresponding to the booking does not match', StatusCodes.BAD_REQUEST);
        }
        // we assume here that the payment is successful
         const response = await bookingRepository.update(data.bookingId, {status: BOOKED}, transaction);
         await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

module.exports = {
    createBooking,
    makePayment
}