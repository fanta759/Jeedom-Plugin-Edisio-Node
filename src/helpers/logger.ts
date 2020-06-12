/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import util from 'util';
import chalk from 'chalk';
import { LogLevelEnum } from '../enums/logLevelEnum';

/**
 * Logger class
 */
export class Logger {
  public static readonly instance = new Logger();

  public LogLevel: LogLevelEnum;
  private _timestampEnabled: boolean;

  private constructor() {
    this.LogLevel = LogLevelEnum.Info;
    this._timestampEnabled = true;
    chalk.level = 1;
  }

  /**
   * Set il the timestamp is append to logging message
   * @param enabled Activate or not
   */
  public SetTimestampEnabled(enabled = true): void {
    this._timestampEnabled = enabled;
  }

  public Info(message: string, ...parameters: any[]): void {
    if (this.LogLevel >= LogLevelEnum.Info) {
      this.Log(LogLevelEnum.Info, message, ...parameters);
    }
  }

  public Warn(message: string, ...parameters: any[]): void {
    if (this.LogLevel >= LogLevelEnum.Warning) {
      this.Log(LogLevelEnum.Warning, message, ...parameters);
    }
  }

  public Error(message: string, ...parameters: any[]): void {
    if (this.LogLevel >= LogLevelEnum.Error) {
      this.Log(LogLevelEnum.Error, message, ...parameters);
    }
  }

  public Debug(message: string, ...parameters: any[]): void {
    if (this.LogLevel >= LogLevelEnum.Debug) {
      this.Log(LogLevelEnum.Debug, message, ...parameters);
    }
  }

  public Log(level: LogLevelEnum, message: string, ...parameters: any[]): void {
    message = util.format(message, ...parameters);

    let loggingFunction = console.log;
    switch (level) {
      case LogLevelEnum.Warning:
        message = `WARN - ${chalk.yellow(message)}`;
        loggingFunction = console.error;
        break;
      case LogLevelEnum.Error:
        message = `ERROR - ${chalk.red(message)}`;
        loggingFunction = console.error;
        break;
      case LogLevelEnum.Debug:
        message = `DEBUG - ${chalk.gray(message)}`;
        break;
      case LogLevelEnum.Info:
        message = `INFO - ${message}`;
        break;
    }

    if (this._timestampEnabled) {
      const date = new Date();
      message = `[${date.toLocaleString()}] - ${message}`;
    }

    loggingFunction(message);
  }
}