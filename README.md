# MP3 Organizer

Automate the organization of your MP3 music collection by sorting files into artist and album folders using ID3 tags.

## Features

- 📁 Scans a specified directory (non-recursively) for `.mp3` files.
- 🏷️ Reads ID3 tags including `artist`, `album`, `trackNumber`, and `title`.
- 🗂️ Creates folders by artist and subfolders by album.
- 🔀 Moves and renames MP3 files into the appropriate folder structure.
- ✍️ Renames files with the format: `track_number. track_title.mp3`.

This tool is perfect for tidying up and structuring messy music libraries quickly and easily.

## Requirements

Node.js (v12 or higher recommended)

## Installation

```bash
npm install
```

## Usage

1. Set the `sourceDir` variable in the script to the directory containing your MP3 files.

2. Run the script:

```bash
node index.js
```