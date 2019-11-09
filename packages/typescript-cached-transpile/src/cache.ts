import Path from 'path';
import fs from 'fs-extra';

export class DiskCache {
    constructor(public readonly basePath: string) {}
    /**
     * Array of substring lengths, used to split the key into shorter strings.
     * Useful for filesystem caching, since fs performance is better when using
     * a nested tree of directories rather than a single directory containing
     * all cache entries. (See also: how git splits up the contents of `.git/objects`)
     * 
     * For the default: [40, 2], the cache path will be a directory with the first 40 characters,
     * a directory with the next 2, and then the filename with the remainder.
     */
    splitLengths: Array<number> = [40, 2];
    splitKey(key: string): string[] {
        const split: string[] = [];
        let start = 0;
        for(const splitPoint of this.splitLengths) {
            split.push(key.slice(start, start + splitPoint));
            start = splitPoint;
        }
        split.push(key.slice(start));
        return split;
    }
    keyToAbsPath(key: string): string {
        return Path.join(this.basePath, ...this.splitKey(key));
    }
    get(key: string): Buffer | null {
        const p = this.keyToAbsPath(key);
        return readSafe(p);
    }
    set(key: string, value: Buffer | string) {
        const _value = toBuffer(value);
        const path = this.keyToAbsPath(key);
        writeSafe(path, _value);
    }
}

/**
 * Every cache entry has these bytes at the end.
 * Thus if we read a cache entry and it doesn't end this way, we know
 * another process is mid-write and we can't safely read the entry.
 */
const ENDING = Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff ,0xff, 0xff, 0xff, 0xff]);

function readSafe(path: string) {
    try {
        const buffer = fs.readFileSync(path);
        const ending = buffer.slice(-ENDING.length);
        if(ending.compare(ENDING) !== 0) return null;
        return buffer.slice(0, -ENDING.length);
    } catch(e) {
        if(e.code === 'ENOENT') return null;
        throw e;
    }
}
function writeSafe(path: string, buffer: Buffer) {
    fs.mkdirpSync(Path.dirname(path));
    const fd = fs.openSync(path, 'w');
    fs.writeSync(fd, buffer);
    fs.writeSync(fd, ENDING);
    fs.closeSync(fd);
}

function toBuffer(b: string | Buffer) {
    if(typeof b === 'string') return Buffer.from(b, 'utf8');
    return b;
}
