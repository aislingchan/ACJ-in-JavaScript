import { createLogger, format, transports } from "winston";

const {printf} = format;

const rankFormat = printf(({results}) => {
    return `${results}`;
});

export const resultsLogger = createLogger({
    level: "info",
    format: rankFormat,
    transports: [
        new transports.File({filename: 'results.txt'})
    ]
});

