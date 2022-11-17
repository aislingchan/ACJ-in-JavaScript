import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf } = format;

const rankFormat = printf(({round, ranks, timestamp}) => {
    return `[${timestamp}] Rounds completed: ${round}. Ranking: ${ranks}`;
});

export const rankingLogger = createLogger({
    level: "info",
    format: combine(
        timestamp({format: "HH:mm:ss"}),
        rankFormat
    ),
    transports: [
        new transports.File({filename: 'ranking.log'})
    ]
});

