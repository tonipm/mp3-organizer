const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const NodeID3 = require('node-id3');

const sourceDir = '/Users/tonipm/Downloads/Telegram Desktop';

async function execute(dirPath) {
  try {
    const files = await fs.promises.readdir(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);

      if (path.extname(file).toLowerCase() !== '.mp3') {
        continue;
      }
      const stat = await fs.promises.stat(fullPath);
      if (!stat.isFile()) {
        continue;
      }

      const tags = NodeID3.read(fullPath);
      const artistDirName = sanitize(tags.artist || 'Unknown Artist');
      const albumDirName = artistDirName + ' - ' + tags.year + ' - ' + sanitize(
          tags.album || 'Unknown Album');
      const track = String(tags.trackNumber || '00').padStart(2, '0');
      const title = sanitize(tags.title || 'Unknown Title');

      const artistDir = path.join(dirPath, artistDirName);
      const albumDir = path.join(artistDir, albumDirName);

      await fse.ensureDir(albumDir);

      const newFilename = `${track}. ${title}.mp3`;
      const newFilePath = path.join(albumDir, newFilename);

      await fse.move(fullPath, newFilePath, {overwrite: true});

      console.log(`✔️ ${file} → ${newFilePath}`);
    }

    console.log('🎉 Organization completed.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

function sanitize(name) {
  return name.replace(/[\\/:*?"<>|]/g, '').trim();
}

execute(sourceDir);
