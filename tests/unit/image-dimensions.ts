import { readFileSync } from "node:fs";

/**
 * Minimal intrinsic-size reader for the two formats this repo commits.
 *
 * Deliberately not a dependency: every off-the-shelf option carries parsers for
 * formats we do not use, and the obvious one ships unfixed high-severity
 * advisories. An unknown format throws rather than returning a guess, so this
 * cannot quietly stop checking anything.
 */
export function imageSize(path: string): { width: number; height: number } {
  const buf = readFileSync(path);

  // PNG: 8-byte signature, then a 4-byte length, "IHDR", width, height.
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // JPEG: walk the marker chain to the frame header, which carries the size.
  if (buf.length > 4 && buf.readUInt16BE(0) === 0xffd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) throw new Error(`Bad JPEG marker at ${offset} in ${path}`);
      const marker = buf[offset + 1]!;
      const length = buf.readUInt16BE(offset + 2);

      // SOF0-SOF15, excluding the non-frame markers DHT (c4), JPG (c8), DAC (cc).
      const isFrame =
        marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isFrame) {
        return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
      }
      offset += 2 + length;
    }
    throw new Error(`No JPEG frame header found in ${path}`);
  }

  throw new Error(`Unsupported image format: ${path}`);
}
