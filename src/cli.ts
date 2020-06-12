import http from 'http';
import commander from 'commander';
import { Logger } from './helpers/logger';
import Signals = NodeJS.Signals;
import { LogLevelEnum } from './enums/logLevelEnum';
import { PidFile } from './helpers/pidFile';
import { EdisioServerOptions } from './models/edisioServerOptions';
import { EdisioServer } from './edisioServer';

export function Cli(): void {
  const log = Logger.instance;
  let shuttingDown = false;

  let device = 'auto';
  let socketport = 55759;
  let urlCallback = '';
  let apiKey = '';
  let pidFile = '/tmp/edisio-node.pid';

  commander
    .option('-d, --device <devicePath>', 'The USB device', (d) => device = d)
    .option('-s, --socketport <port>', '', (sp) => socketport = parseInt(sp))
    .option('-l, --loglevel <level>', '', (ll) => {
      if (ll === 'error') {
        log.LogLevel = LogLevelEnum.Error;
      }
      if (ll === 'warn') {
        log.LogLevel = LogLevelEnum.Warning;
      }
      if (ll === 'info') {
        log.LogLevel = LogLevelEnum.Info;
      }
      if (ll === 'debug') {
        log.LogLevel = LogLevelEnum.Debug;
      }
      if (ll === 'none') {
        log.LogLevel = LogLevelEnum.None;
      }
    })
    .option('-u, --urlcallback <url>', '', (cb) => urlCallback = cb)
    .option('-a, --apikey <key>', '', (ak) => apiKey = ak)
    .option('-p, --pidfile <pidFilePath>', '', (pf) => pidFile = pf)
    .parse(process.argv);

  const pid = new PidFile(pidFile);
  pid.Create();

  log.Info(`Param: device - ${device}, socketport - ${socketport}, loglevel - ${log.LogLevel}, callback - ${urlCallback}, apikey - ${apiKey}, pidfile - ${pidFile}`);

  const options = new EdisioServerOptions();
  options.Device = device;
  options.Socketport = socketport;
  options.UrlCallback = urlCallback;
  options.ApiKey = apiKey;

  const edisio = new EdisioServer(options);

  const signalHandler = (signal: Signals, signalNum: number): void => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;

    log.Info(`Got ${signal}, shutting down...`);

    edisio.TearDown();

    pid.Remove();

    setTimeout(() => process.exit(128 + signalNum), 5000);
  };

  process.on('SIGINT', signalHandler.bind(undefined, 'SIGINT', 2));
  process.on('SIGTERM', signalHandler.bind(undefined, 'SIGTERM', 15));

  const errorHandler = (error: Error): void => {
    if (error.stack) {
      log.Error(error.stack);
    }

    if (!shuttingDown) {
      process.kill(process.pid, 'SIGTERM');
    }
  };

  process.on('uncaughtException', errorHandler);

  edisio.Start().catch(errorHandler);
}

Cli();
