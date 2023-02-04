import keccak256 from 'keccak256';

export async function fileKeccak256Hash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onloadend = (evt) => {
      if (evt.target && evt.target.readyState === FileReader.DONE) {
        const arrayBuffer = evt.target.result as ArrayBuffer;
        const array = new Uint8Array(arrayBuffer);

        resolve(keccak256(array.join('')).toString('hex'));
      } else {
        reject('Error while reading the file');
      }
    };
  });
}

export function arrayBufferKeccak256Hash(arrayBuffer: ArrayBuffer): string {
  const array = new Uint8Array(arrayBuffer);
  return keccak256(array.join('')).toString('hex');
}

export async function fileBuffer(file: File): Promise<Buffer> {
  return Buffer.from(await file.arrayBuffer());
}

export async function arrayBufferToBuffer(arrayBuffer: ArrayBuffer): Promise<Buffer> {
  return Buffer.from(arrayBuffer);
}

export function fileByteSize(file: File): number {
  return new TextEncoder().encode(fileBuffer(file).toString()).length;
}

// TODO Move this in another file

export function objectToBuffer(object: any): Buffer {
  return Buffer.from(JSON.stringify(object));
}

export function objectToKeccak256Hash(object: any): string {
  return keccak256(JSON.stringify(object)).toString('hex');
}
