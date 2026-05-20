import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

let destination: pino.DestinationStream | undefined;

if (isDev) {
  destination = pino.transport({
    target: require.resolve("pino-pretty"),
    options: {
      colorize: true,
      translateTime: "SYS:HH:MM:ss",
      ignore: "pid,hostname",
    },
  });
}

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
  },
  destination,
);
