import fs from 'fs';

export class PidFile {
  private _filePath = '';

  constructor(path: string) {
    this._filePath = path;
  }

  public Create(): void {
    const pid = `${process.pid}\n`;
    fs.writeFileSync(this._filePath, pid);
  }

  public Remove(): boolean {
    try {
      fs.unlinkSync(this._filePath);
      return true;
    } catch (err) {
      return false;
    }
  }
}