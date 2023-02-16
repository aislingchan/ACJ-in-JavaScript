// import { createLogger, format, transports } from "winston";

const winston = require('winston');
const {printf} = winston.format;

const rankFormat = printf(({results}) => {
    return `${results}`;
});

const resultsLogger = winston.createLogger({
    level: "info",
    format: rankFormat,
    transports: [
        new winston.transports.File({filename: 'results.txt'})
    ]
});

module.exports = {
    resultsLogger
}