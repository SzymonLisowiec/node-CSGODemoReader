const kCW = require(__dirname + '/../../enums/kCW');
const SPROP = require(__dirname + '/../../enums/SPROP');

class Entity {

    constructor(demo) {
        this.demo = demo;
        this.data = {};
        this.serialNumber = null;
        this.classInfo = null;
        this.latestPositionPath = 'csnonlocaldata';
    }

    getData() {
        return this.data;
    }

    readFieldIndex(stream, lastIndex, newWay) {

        if (newWay && stream.bits(1)) {
            return lastIndex + 1;
        }

        let ret = 0;
        if (newWay && stream.bits(1)) {
            ret = stream.bits(3);
        } else {
            ret = stream.bits(7);
            switch (ret & (32 | 64)) {
                case 32:
                    ret = (ret & ~96) | (stream.bits(2) << 5);
                    break;
                case 64:
                    ret = (ret & ~96) | (stream.bits(4) << 5);
                    break;
                case 96:
                    ret = (ret & ~96) | (stream.bits(7) << 5);
                    break;
            }
        }
        if (ret == 0xFFF) {
            return -1;
        }
        return lastIndex + 1 + ret;
    }

    readFromStream(stream) {
        const fieldIndices = [];
        const newWay = stream.bits(1);
        let index = -1;
        do {
            index = this.readFieldIndex(stream, index, newWay);
            if (index != -1) {
                fieldIndices.push(index);
            }
        } while (index != -1);
        let paths = [];
        for (let i = 0; i < fieldIndices.length; i++) {
            paths = paths.concat(this.decodeProperty(stream, fieldIndices[i]));
        }
        return paths;
    }

    getValue(path) {
        const objPart = this.getObj(this.data, path);
        return objPart.obj[objPart.property];
    }

    setValue(path, value) {
        const objPart = this.getObj(this.data, path);
        if (objPart.property == 'm_vecOrigin') {
            this.latestPositionPath = path.includes('nonlocal') ?
                'csnonlocaldata' : 'cslocaldata';
        }
        objPart.obj[objPart.property] = value;
    }

    getObj(data, path) {
        const parts = path.split('.');
        const prop = parts[parts.length - 1];
        for (let i = 0; i < parts.length - 1; i++) {
            if (parts[i] != 'baseclass') {
                if (data[parts[i]] == null) {
                    data[parts[i]] = {};
                }
                data = data[parts[i]];
            }
        }
        return {
            obj: data,
            property: prop
        };
    }

    decodeProperty(stream, fieldIndex, _property) {

        const flattenedProp = _property || this.classInfo.flattenedProps[fieldIndex];
        if (flattenedProp == null) {
            return null;
        }
        const prop = flattenedProp.prop;
        let paths = [];
        paths.push(flattenedProp.path);
        if (prop) {
            var result = null;
            switch (prop.type) {
                case 0:
                    this.setValue(flattenedProp.path, this.decodeInt(stream, prop));
                    break;
                case 1:
                    this.setValue(flattenedProp.path, this.decodeFloat(stream, prop));
                    break;
                case 2:
                    this.setValue(flattenedProp.path, this.decodeVector(stream, prop));
                    break;
                case 3:
                    this.setValue(flattenedProp.path, this.decodeVectorXY(stream, prop));
                    break;
                case 4:
                    this.setValue(flattenedProp.path, this.decodeString(stream, prop));
                    break;
                case 5:
                    var result = [];
                    let maxElements = prop.numElements;
                    let numBits = 1;
                    while ((maxElements >>= 1) != 0) {
                        numBits++;
                    }
                    const numElements = stream.bits(numBits);
                    for (let i = 0; i < numElements; i++) {
                        const tmp = {
                            'prop': flattenedProp.elm,
                            'path': `${flattenedProp.path}.${i}`,
                            'elm': null
                        };
                        paths = paths.concat(this.decodeProperty(stream, fieldIndex, tmp));
                    }
                    break;
                default:
                    console.log(`sendProp.type = ${sendProp.type}`);
                    exit;
                    break;
            }
            return paths;
        }
    }

    decodeInt(stream, prop) {
        if (prop.flags & (1 << 19)) {
            if (prop.flags & (1 << 0)) {
                return stream.varInt32();
            } else {
                return stream.signedVarInt32();
            }
        } else {
            if (prop.flags & (1 << 0)) {
                return stream.bits(prop.numBits);
            } else {
                return stream.bits(prop.numBits); // hmm
            }
        }
    }

    decodeFloat(stream, prop) {

        const flags = prop.flags;

        if (flags & SPROP.COORD) {
            return stream.bitCoord();
        } else if (flags & SPROP.COORD_MP) {
            return stream.bitCoordMP(kCW.None);
        } else if (flags & SPROP.COORD_MP_LOWPRECISION) {
            return stream.bitCoordMP(kCW.LowPrecision);
        } else if (flags & SPROP.COORD_MP_INTEGRAL) {
            return stream.bitCoordMP(kCW.Integral);
        } else if (flags & SPROP.NOSCALE) {
            return stream.float();
        } else if (flags & SPROP.NORMAL) {
            return stream.bitNormal();
        } else if (flags & SPROP.CELL_COORD) {
            return stream.bitCellCoord(prop.numBits, kCW.None);
        } else if (flags & SPROP.CELL_COORD_LOWPRECISION) {
            return stream.bitCellCoord(prop.numBits, kCW.LowPrecision);
        } else if (flags & SPROP.CELL_COORD_INTEGRAL) {
            return stream.bitCellCoord(prop.numBits, kCW.Integral);
        }

        const dwInterp = stream.bits(prop.numBits);
        let fVal = 0;
        fVal = dwInterp / ((1 << prop.numBits) - 1);
        fVal = prop.lowValue + (prop.highValue - prop.lowValue) * fVal;
        return fVal;
    }

    decodeVector(stream, prop) {
        const v = {
            x: this.decodeFloat(stream, prop),
            y: this.decodeFloat(stream, prop)
        };
        if ((prop.flags & (1 << 5)) == 0) {
            v.z = this.decodeFloat(stream, prop);
        } else {
            const v0v0v1v1 = v.x * v.x + v.y * v.y;
            if (v0v0v1v1 < 1) {
                v.z = Math.sqrt(1 - v0v0v1v1);
            } else {
                v.z = 0;
            }
            if (stream.bits(1)) {
                v.z *= -1;
            }
        }
        return v;
    }

    decodeVectorXY(stream, prop) {
        const vector = {
            x: this.decodeFloat(stream, prop),
            y: this.decodeFloat(stream, prop)
        };
        return vector;
    }

    decodeString(stream, prop) {
        let len = stream.bits(9);
        if (len == 0) {
            return '';
        }
        const maxBuffer = (1 << 9);
        if (len >= maxBuffer) {
            len = maxBuffer - 1;
        }
        return stream.string(len);
    }
}

module.exports = Entity;