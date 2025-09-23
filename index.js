const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const NodeID3 = require('node-id3');

const sourceDir = '/Volumes/192.168.1.20/Music/Various albums';
const isRecursive = true; // Change to `false` to disable recursion

async function execute(dirPath) {
  try {
    const files = await fs.promises.readdir(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = await fs.promises.stat(fullPath);

      if (stat.isDirectory() && isRecursive) {
        // Llamada recursiva solo si `isRecursive` es `true`
        await execute(fullPath);
      } else if (stat.isFile() && path.extname(file).toLowerCase() === '.mp3') {
        const tags = NodeID3.read(fullPath);
        const artistDirName = sanitize(
            (tags.artist?.split('/')[0] || 'Unknown Artist').trim());
        const albumDirName = artistDirName + ' - ' + tags.year + ' - '
            + sanitize(tags.album || 'Unknown Album');
        const track = String(tags.trackNumber || '00').padStart(2, '0');
        const title = sanitize(tags.title || 'Unknown Title');

        const artistDir = path.join(sourceDir, artistDirName);
        const albumDir = path.join(artistDir, albumDirName);

        await fse.ensureDir(albumDir);

        const newFilename = `${track}. ${title}.mp3`;
        const newFilePath = path.join(albumDir, newFilename);

        console.log(fullPath, newFilePath)
        if (fullPath !== newFilePath) {
          await fse.move(fullPath, newFilePath, {overwrite: true});
          console.log(`✔️ ${file} → ${newFilePath}`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

function sanitize(name) {
  return name.replace(/[\\/:*?"<>|]/g, '').trim();
}

execute(sourceDir);
