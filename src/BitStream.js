const kCW = require(__dirname + '/../enums/kCW');

class BitStream {

    constructor (buffer) {

        this.buffer = buffer;
        this.index = 0;
        this.bufferedBits = null;
        this.bitsAvailable = 0;

    }

    tell () {
        return this.index;
    }

    tellBits () {
        return ((this.index - 1) << 3) + (8 - this.bitsAvailable);
    }

    skip (bytes) {
        this.index += bytes;
        if (this.bitsAvailable !== 0) {
            this.bufferedBits = this.takeByteAt(this.index - 1);
        }
        return this;
    }

    seek (dest) {
        this.index = dest;
        this.clearBufferedBits();
        return this;
    }

    seekBits (dest) {
        this.index = dest >> 3;
        this.clearBufferedBits();
        this.bits(dest % 8);
    }

    string (len, nongreedy) {
        let str = '';
        for (let i = 0; i < len; i++) {
            let char = this.byte();
            if (char == 0) {
                if (!nongreedy) {
                    this.skip(len - i - 1);
                }
                break;
            }
            str += String.fromCharCode(char);
        }
        return str;
    }

    vString () {
        let length = this.varInt32();
        if (length == 0) {
            return '';
        }
        return this.string(length, true);
    }

    vChunk () {
        let size = this.varInt32();
        let buffer = new Buffer(size);
        for (let i = 0; i < size; i++) {
            buffer.writeUInt8(this.byte(), i);
        }
        return new BitStream(buffer);
    }

    int16 () {
        return this.flatten(2);
    }

    int32 () {
        return this.flatten(4);
    }
    
    flatten (bytes) {
        if (typeof bytes === 'number' && isFinite(bytes)) {
            bytes = this.bytes(bytes);
        }
        let ret = 0;
        for (let i = 0; i < bytes.length; i++) {
            ret |= bytes[i] << (i << 3);
        }
        return ret;
    }

    float () {
        let b = this.bytes(4),
            sign = 1 - (2 * (b[3] >> 7)),
            exponent = (((b[3] << 1) & 0xff) | (b[2] >> 7)) - 127,
            mantissa = ((b[2] & 0x7f) << 16) | (b[1] << 8) | b[0];

        if (exponent === 128) {
            if (mantissa !== 0) {
                return NaN;
            } else {
                return sign * Infinity;
            }
        }

        if (exponent === -127) {
            return sign * mantissa * this.pow2(-126 - 23);
        }

        return sign * (1 + mantissa * this.pow2(-23)) * this.pow2(exponent);
    }

    varInt32 () {
        return this.varInt(4);
    }

    varInt32Bool () {
        return !(!this.varInt32());
    }

    varInt (maxLen) {
        let b = 0;
        let count = 0;
        let result = 0;
        do {
            if (count + 1 == maxLen) {
                return result;
            }
            b = this.byte();
            result |= (b & 0x7F) << (7 * count);
            ++count;
        } while (b & 0x80);
        return result;
    }

    uBitVar () {
        var ret = this.bits(6);
        switch (ret & (16 | 32)) {
            case 16:
                ret = (ret & 15) | (this.bits(4) << 4);
                break;
            case 32:
                ret = (ret & 15) | (this.bits(8) << 4);
                break;
            case 48:
                ret = (ret & 15) | (this.bits(32 - 4) << 4);
                break;
        }
        return ret;
    }

    bitCoord () {
        var value = 0;
        var intval = this.bits(1);
        var fractval = this.bits(1);
        if (intval || fractval) {
            var signbit = this.bits(1);
            if (intval) {
                intval = this.bits(14) + 1;
            }
            if (fractval) {
                fractval = this.bits(5);
            }
            value = intval + (fractval * (1 / (1 << 5)));
            if (signbit) {
                value = -value;
            }
        }
        return value;
    }

    bitNormal () {

        var signbit = this.bits(1);
        var fractval = this.bits(11);

        var value = fractval * (1 / ((1 << 11) - 1));

        if (signbit) {
            value = -value;
        }

        return value;
    }

    bitCellCoord (bits, coordType) {
        var bIntegral = coordType == kCW.Integral;
        var bLowPrecision = coordType == kCW.LowPrecision;
        var value = 0;
        if (bIntegral) {
            return this.bits(bits);
        }
        var intval = this.bits(bits);
        var fractval = this.bits(bLowPrecision ? 3 : 5);
        return value = intval + (fractval * (1 / (1 << (bLowPrecision ? 3 : 5))));
    }

    pow2 (n) {
        return (n >= 0 && n < 31) ? (1 << n) : (this.pow2[n] || (this.pow2[n] = Math.pow(2, n)));
    }

    takeByteAt (index) {
        return this.buffer[index];
    }
    
    takeByte () {
        return this.takeByteAt(this.index++);
    }

    bool () {
        return !(!this.byte());
    }

    byte () {
        return this.bits(8);
    }

    bytes (bytes) {
        let result = [];
        for (let i = 0; i < bytes; i++) {
            result.push(this.byte());
        }
        return result;
    }

    bits (bits) {
        if (bits == 8 && this.bitsAvailable == 0) {
            return this.takeByte();
        }
        let ret = 0;
        for (let i = 0; i < bits; i++) {
            if (this.bitsAvailable == 0) {
                this.bufferedBits = this.takeByte();
                this.bitsAvailable = 8;
            }
            ret |= ((this.bufferedBits >> (8 - this.bitsAvailable--)) & 1) << i;
        }
        return ret;
    }

    clearBufferedBits () {
        this.bufferedBits = null;
        this.bitsAvailable = 0;
        return this;
    }

}

module.exports = BitStream;