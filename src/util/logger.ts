export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogFields = {
  message: string;
  error?: unknown;
};

type LogWriter = (header: string, details?: object) => void;

export interface ILogger {
  debug(fields: LogFields): void;
  info(fields: LogFields): void;
  warn(fields: LogFields): void;
  error(fields: LogFields): void;
}

export class Logger implements ILogger {
  private readonly levelWriters: Record<LogLevel, LogWriter> = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };

  private write(level: LogLevel, fields: LogFields): void {
    const { message, error } = fields;
    const header = `[${level.toUpperCase()}] ${message}`;

    const details: Record<string, unknown> = {};
    if (error) details.error = error;

    if (Object.keys(details).length === 0) {
      this.levelWriters[level](header);
      return;
    }

    this.levelWriters[level](header, details);
  }

  debug(fields: LogFields): void {
    this.write("debug", fields);
  }

  info(fields: LogFields): void {
    this.write("info", fields);
  }

  warn(fields: LogFields): void {
    this.write("warn", fields);
  }

  error(fields: LogFields): void {
    this.write("error", fields);
  }
}

export const logger = new Logger();
