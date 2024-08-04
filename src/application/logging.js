import winston from "winston";
import chalk from "chalk";
import path from "path";

const myCustomLevels = {
    levels: { error: 0, warn: 1, info: 2 },
    colors: { error: 'red', warn: 'yellow', info: 'blue' }
};

winston.addColors(myCustomLevels.colors);

const getLevelColor = (level) => myCustomLevels.colors[level] || 'white';

const colorizeJson = (json, color) => JSON.stringify(json, null, 2)
    .replace(/"(.*?)":\s*(.*?)(,?)(\n|$)/g, (match, p1, p2, p3, p4) => {
        const coloredKey = chalk[color](`"${p1}":`);
        let coloredValue = p2;

        if (/^".*"$/.test(p2) || /^\d+$/.test(p2) || /true|false|null/.test(p2)) {
            coloredValue = chalk[color](p2);
        }

        return `${coloredKey} ${coloredValue}${p3}${p4}`;
    });

const jsonColorizerConsole = winston.format.printf(({ level, message, ...meta }) => {
    const color = getLevelColor(level);
    const formattedJson = colorizeJson({ level, message, ...meta }, color);
    return `${chalk[color](level.toUpperCase())} ${formattedJson}`;
});

const jsonColorizerFile = winston.format.printf(({ level, message, ...meta }) => {
    const formattedJson = JSON.stringify({ level, message, ...meta }, null, 2);
    return `${level.toUpperCase()} ${formattedJson}`;
});

export const logger = winston.createLogger({
    level: "info",
    levels: myCustomLevels.levels,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: jsonColorizerConsole
        }),
        new winston.transports.File({
            filename: path.join('logs', 'app.log'),
            format: jsonColorizerFile
        })
    ]
});

// logger.info("Bla bla bla info message");
// logger.warn({ message: "Bla bla bla warning message", details: "Additional details" });
// logger.error({ message: "Bla bla bla error message", error: "Error details" });