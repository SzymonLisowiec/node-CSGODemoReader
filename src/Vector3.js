class Vector3 {
  constructor (x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  add (vector3) {
    return new this(this.x + vector3.x, this.y + vector3.y, this.z + vector3.z);
  }

  subtract (vector3) {
    return new this(this.x - vector3.x, this.y - vector3.y, this.z - vector3.z);
  }

  multiply (multiplier) {
    return new this(this.x * multiplier, this.y * multiplier, this.z * multiplier);
  }

  scale (vector3) {
    return new this(this.x * vector3.x, this.y * vector3.y, this.z * vector3.z);
  }

  length () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  lengthSquared () {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  normalize () {
    const length = this.length();
    this.x /= l;
    this.y /= l;
    this.z /= l;
    return this;
  }

  dot (vector3) {
    return this.x * vector3.x + this.y * vector3.y + this.z * vector3.z;
  }

  cross (vector3) {
    return new this(
      this.y * vector3.z - vector3.y * this.z,
      vector3.x * this.z - this.x * vector3.z,
      this.x * vector3.y - vector3.x * this.y,
    );
  }
  
  clone () {
    return new this(this.x, this.y, this.z);
  }

  distance (vector3) {
    const dx = vector3.x - this.x;
    const dy = vector3.y - this.y;
    const dz = vector3.z - this.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

module.exports = Vector3;
