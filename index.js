const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const NodeID3 = require('node-id3');

const sourceDir = '/Volumes/192.168.1.20/Music/';
const isRecursive = true; // Change to `false` to disable recursion

/**
 * Scans `dirPath` for MP3 files and moves each one into
 * `<sourceDir>/<artist>/<artist> - <year> - <album>/<track>. <title>.mp3`,
 * based on its ID3 tags. Subdirectories are processed too when
 * `isRecursive` is enabled.
 */
async function execute(dirPath) {
  try {
    const files = await fs.promises.readdir(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = await fs.promises.stat(fullPath);

      if (stat.isDirectory() && isRecursive) {
        await execute(fullPath);
      } else if (stat.isFile() && path.extname(file).toLowerCase() === '.mp3') {
        const tags = NodeID3.read(fullPath);

        // Multi-artist tags use separators like "/", "," or ";".
        // Keep only the main (first) artist.
        const artistDirName = sanitize(
            (tags.artist?.split(/[\/,;]/)[0] || 'Unknown Artist').trim());

        // ID3v2.3 stores the year in TYER (`year`), while ID3v2.4 uses
        // TDRC (`recordingTime`), which may be a full date — keep just YYYY.
        const year = (tags.year || tags.recordingTime || '').slice(0, 4);

        // When no year is available, omit it instead of printing "undefined".
        const albumDirName = artistDirName + ' - ' + (year ? year + ' - ' : '')
            + sanitize(tags.album || 'Unknown Album');

        // Track number may come as "3/12" (track/total); keep the track part.
        const track = String(tags.trackNumber || '00')
            .split('/')[0].padStart(2, '0');
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

/** Strips characters that are invalid in file and directory names. */
function sanitize(name) {
  return name.replace(/[\\/:*?"<>|]/g, '').trim();
}

execute(sourceDir);
