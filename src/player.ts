const cp = require('child_process');
const path = require('path');
const player = require('play-sound')();

const _isWindows = process.platform === 'win32';
const _playerWindowsPath = path.join(__dirname, '..', 'audio', 'play.exe');

export default {
    play(filePath: string) : Promise<void> {
        return new Promise ((resolve, reject) => {
            if (_isWindows) {
                cp.execFile(_playerWindowsPath, [filePath]);
                resolve();
            } else {
                player.play(filePath, (err: any) => {
                if (err) {
                    console.error("Error playing sound:", filePath, " - Description:", err);
                    return reject(err);
                }
                    resolve();
                });
            }
        });
    }
};
