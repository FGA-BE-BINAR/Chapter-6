function generateRandom() {
  const length = 15;
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString().padStart(length, "0");
}

module.exports = generateRandom;
