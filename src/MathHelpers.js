module.exports = {
  toRadians: (num) => {
    return num * (Math.PI / 180);
  },

  makeAnglePositive: (angle) => {
    return (angle % 360 + 360) % 360;
  },
};
