export class QuickXorHash {
    data: bigint[]
    shiftSoFar: number
    lengthSoFar: number
    widthInBits: number

    constructor() {
        this.shiftSoFar = 0;
        this.lengthSoFar = 0;
        this.widthInBits = 160;
        this.data = Array.from({ length: (this.widthInBits - 1) / 64 + 1 }, () => 0n);
    }

    update(array: Buffer, ibStart: number, cbSize: number): void {
        const shift = 11;
        const bitsInLastCell = 32;

        let vectorOffset = this.shiftSoFar % 64;
        let vectorArrayIndex = Math.floor(this.shiftSoFar / 64);
        const iterations = Math.min(cbSize, this.widthInBits);

        for (let i = 0; i < iterations; i++) {
            const isLastCell = vectorArrayIndex === this.data.length - 1;
            const bitsInVectorCell = isLastCell ? bitsInLastCell : 64;

            if (vectorOffset <= bitsInVectorCell - 8) {
                for (let j = ibStart + i; j < cbSize + ibStart; j += this.widthInBits) {
                    this.data[vectorArrayIndex] ^= BigInt(array[j]) << BigInt(vectorOffset);
                }
            } else {
                const index1 = vectorArrayIndex;
                const index2 = isLastCell ? 0 : (vectorArrayIndex + 1);
                const low = bitsInVectorCell - vectorOffset;

                let xoredByte = 0;
                for (let j = ibStart + i; j < cbSize + ibStart; j += this.widthInBits) {
                    xoredByte ^= array[j];
                }
                this.data[index1] ^= BigInt(xoredByte) << BigInt(vectorOffset);
                this.data[index2] ^= BigInt(xoredByte) >> BigInt(low);
            }

            vectorOffset += shift;

            while (vectorOffset >= bitsInVectorCell) {
                vectorArrayIndex = isLastCell ? 0 : vectorArrayIndex + 1;
                vectorOffset -= bitsInVectorCell;
            }
        }

        this.shiftSoFar = (this.shiftSoFar + shift * (cbSize % this.widthInBits)) % this.widthInBits;
        this.lengthSoFar += cbSize;
    }

    digest(encoding?: BufferEncoding): string {
        let lengthBytes = Buffer.alloc(8);
        lengthBytes = writeBigUInt64LE(lengthBytes, BigInt(this.lengthSoFar));

        const rgb = Buffer.alloc((this.widthInBits - 1) / 8 + 1);

        for (let i = 0; i < this.data.length - 1; i++) {
            let dataBuffer = Buffer.alloc(8);
            dataBuffer = writeBigUInt64LE(dataBuffer, BigInt(this.data[i]));
            dataBuffer.copy(rgb, i * 8);
        }

        let lastDataBuffer = Buffer.alloc(8);
        lastDataBuffer = writeBigUInt64LE(lastDataBuffer, BigInt(this.data[this.data.length - 1]));
        lastDataBuffer.copy(rgb, (this.data.length - 1) * 8, 0, rgb.length - (this.data.length - 1) * 8);

        for (let i = 0; i < lengthBytes.length; i++) {
            rgb[(this.widthInBits / 8) - lengthBytes.length + i] ^= lengthBytes[i];
        }

        return rgb.toString(encoding);
    }
}

export function writeBigUInt64LE(buffer: Buffer, value: bigint): Buffer {

    // Convert the BigInt value into two 32-bit unsigned integers
    const low = Number(value & BigInt(0xFFFFFFFF));
    const high = Number((value >> BigInt(32)) & BigInt(0xFFFFFFFF));

    // Write the 32-bit integers into the buffer as little-endian
    buffer.writeUInt32LE(low, 0);
    buffer.writeUInt32LE(high, 4);

    return buffer;
}
