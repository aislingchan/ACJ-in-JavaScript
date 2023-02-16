// import { createLogger, format, transports } from "winston";

const winston = require('winston');
const { combine, timestamp, printf } = winston.format;

const rankFormat = printf(({round, ranks, timestamp}) => {
    return `[${timestamp}] Rounds completed: ${round}. Ranking: ${ranks}`;
});

const rankingLogger = winston.createLogger({
    level: "info",
    format: combine(
        timestamp({format: "HH:mm:ss"}),
        rankFormat
    ),
    transports: [
        new winston.transports.File({filename: 'ranking.log'})
    ]
});

module.exports = {
    rankingLogger
}