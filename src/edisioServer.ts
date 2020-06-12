import Serialport from 'serialport';
import { EdisioServerOptions } from './models/edisioServerOptions';
import { Logger } from './helpers/logger';
import SerialPort from 'serialport';

export class EdisioServer {
  private readonly _log = Logger.instance;
  private _options: EdisioServerOptions;
  private _port!: Serialport;
  private _parser!: SerialPort.parsers.Delimiter;

  constructor(options: EdisioServerOptions) {
    this._options = options;
  }

  public async Start(): Promise<void> {
    await this.CheckSerialPort();
    if (this._options.Device === 'auto') {
      return;
    }

    this._port = new SerialPort(this._options.Device);
    this._parser = this._port.pipe(new SerialPort.parsers.Delimiter({ delimiter: '\r\n', includeDelimiter: true }));

    this._parser.on('data', this.ComputeMessage.bind(this));
  }

  private async CheckSerialPort(): Promise<void> {
    const coms = await Serialport.list();

    if (this._options.Device !== 'auto') {
      return;
    }

    this._log.Info('device auto search');

    let edisiocom = coms.filter((com) => com.vendorId === '067b' && com.productId === '2303');
    if (edisiocom.length !== 0) {
      this._options.Device = edisiocom[0].path;
      this._log.Info(`Find device : ${this._options.Device}`);
      return;
    }

    edisiocom = coms.filter((com) => com.vendorId === '0403' && com.productId === '6001' && com.manufacturer === 'edisio');
    if (edisiocom.length !== 0) {
      this._options.Device = edisiocom[0].path;
      this._log.Info(`Find device : ${this._options.Device}`);
      return;
    }

    this._log.Error('No device found');
  }

  private ComputeMessage(message: Buffer): void {
    if (message[0] === 0x6C) {
      this._log.Info('First is 6C');
    }
    this._log.Info(`First is ${message}`);
    // eslint-disable-next-line no-console
    console.log(message);
  }

  public TearDown(): void {
    this._log.Info('Tear down');
    this._port.close();
    this._log.Info('Port closed');
    return;

  }

}