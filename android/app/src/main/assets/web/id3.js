/**
 * Winamp Web Player - Audio Metadata & ID3 Parser
 * Parses ID3v1, ID3v2, and audio file metadata (bitrate, sample rate, channels, duration)
 */

class AudioMetadataParser {
  // Extract audio metadata from a Blob or File
  static async parse(file) {
    const meta = {
      title: '',
      artist: '',
      album: '',
      duration: 0,
      bitrate: 128,
      sampleRate: 44100,
      channels: 2,
    };

    // Clean filename fallback
    let cleanName = file.name.replace(/\.[^/.]+$/, "");
    if (cleanName.includes(" - ")) {
      const parts = cleanName.split(" - ");
      meta.artist = parts[0].trim();
      meta.title = parts.slice(1).join(" - ").trim();
    } else {
      meta.title = cleanName;
      meta.artist = "Unknown Artist";
    }

    try {
      const buffer = await file.arrayBuffer();
      
      // Parse ID3v2 if MP3
      if (buffer.byteLength > 10) {
        const view = new DataView(buffer);
        // Check "ID3"
        if (view.getUint8(0) === 0x49 && view.getUint8(1) === 0x44 && view.getUint8(2) === 0x33) {
          this.parseID3v2(view, meta);
        }
      }

      // Check ID3v1 if still missing title/artist
      if ((!meta.title || meta.title === cleanName) && buffer.byteLength > 128) {
        this.parseID3v1(buffer, meta);
      }

      // Read WAV header if WAV
      if (buffer.byteLength > 44) {
        this.parseWavHeader(buffer, meta);
      }
    } catch (e) {
      console.warn("Error reading ID3 tags:", e);
    }

    // Determine actual playback duration
    try {
      meta.duration = await this.getAudioDuration(file);
    } catch (e) {
      meta.duration = 0;
    }

    return meta;
  }

  // Parse ID3v1 at the end of file (128 bytes)
  static parseID3v1(buffer, meta) {
    try {
      const offset = buffer.byteLength - 128;
      const view = new Uint8Array(buffer, offset, 128);
      const tagStr = String.fromCharCode(view[0], view[1], view[2]);
      if (tagStr === 'TAG') {
        const decoder = new TextDecoder('iso-8859-1');
        const title = decoder.decode(view.subarray(3, 33)).replace(/\0/g, '').trim();
        const artist = decoder.decode(view.subarray(33, 63)).replace(/\0/g, '').trim();
        const album = decoder.decode(view.subarray(63, 93)).replace(/\0/g, '').trim();
        
        if (title) meta.title = title;
        if (artist) meta.artist = artist;
        if (album) meta.album = album;
      }
    } catch (err) {}
  }

  // Parse ID3v2 frames
  static parseID3v2(view, meta) {
    try {
      const majorVersion = view.getUint8(3);
      if (majorVersion !== 3 && majorVersion !== 4) return;

      let tagSize = (
        ((view.getUint8(6) & 0x7f) << 21) |
        ((view.getUint8(7) & 0x7f) << 14) |
        ((view.getUint8(8) & 0x7f) << 7) |
        (view.getUint8(9) & 0x7f)
      );

      let offset = 10;
      const maxOffset = Math.min(view.byteLength, 10 + tagSize);

      while (offset < maxOffset - 10) {
        let frameId = '';
        for (let i = 0; i < 4; i++) {
          frameId += String.fromCharCode(view.getUint8(offset + i));
        }

        if (frameId.charCodeAt(0) === 0) break; // Padding reached

        let frameSize;
        if (majorVersion === 4) {
          frameSize = (
            ((view.getUint8(offset + 4) & 0x7f) << 21) |
            ((view.getUint8(offset + 5) & 0x7f) << 14) |
            ((view.getUint8(offset + 6) & 0x7f) << 7) |
            (view.getUint8(offset + 7) & 0x7f)
          );
        } else {
          frameSize = view.getUint32(offset + 4);
        }

        if (frameSize <= 0 || offset + 10 + frameSize > maxOffset) break;

        const encoding = view.getUint8(offset + 10);
        const dataBytes = new Uint8Array(view.buffer, view.byteOffset + offset + 11, frameSize - 1);
        let text = '';

        if (encoding === 0) {
          text = new TextDecoder('iso-8859-1').decode(dataBytes);
        } else if (encoding === 1 || encoding === 2) {
          text = new TextDecoder('utf-16').decode(dataBytes);
        } else if (encoding === 3) {
          text = new TextDecoder('utf-8').decode(dataBytes);
        }
        text = text.replace(/\0/g, '').trim();

        if (frameId === 'TIT2' && text) meta.title = text;
        if (frameId === 'TPE1' && text) meta.artist = text;
        if (frameId === 'TALB' && text) meta.album = text;

        offset += 10 + frameSize;
      }
    } catch (err) {}
  }

  // Parse WAV header
  static parseWavHeader(buffer, meta) {
    try {
      const view = new DataView(buffer);
      // Check 'RIFF' and 'WAVE'
      const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
      const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
      if (riff === 'RIFF' && wave === 'WAVE') {
        meta.channels = view.getUint16(22, true);
        meta.sampleRate = view.getUint32(24, true);
        const byteRate = view.getUint32(28, true);
        meta.bitrate = Math.round((byteRate * 8) / 1000);
      }
    } catch (err) {}
  }

  // Get duration using a temporary ObjectURL
  static getAudioDuration(file) {
    return new Promise((resolve) => {
      const tempAudio = document.createElement('audio');
      const objectUrl = URL.createObjectURL(file);
      tempAudio.src = objectUrl;

      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
        tempAudio.remove();
      };

      tempAudio.onloadedmetadata = () => {
        const dur = isFinite(tempAudio.duration) ? tempAudio.duration : 0;
        cleanup();
        resolve(dur);
      };

      tempAudio.onerror = () => {
        cleanup();
        resolve(0);
      };

      // Timeout after 3 seconds
      setTimeout(() => {
        cleanup();
        resolve(0);
      }, 3000);
    });
  }

  // Format seconds to M:SS or MM:SS
  static formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}

window.AudioMetadataParser = AudioMetadataParser;
