import fs from 'fs-extra';
import crypto from 'crypto';

export function computeSha1(...data: Buffer[]) {
  var sha1Hash = crypto.createHash('sha1');
  for(const d of data) {
    sha1Hash.update(d);
  }
  return sha1Hash.digest('hex');
}
