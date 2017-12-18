// Balant copying of hexgrid lib, shame on me.
// TODO make a pull request
const RANGE6 = [0, 60, 120, 180, 240, 300];
const SQRT3 = Math.sqrt(3);

const range = n => Array.from(Array(n).keys());
const product = (p, q) => {
  const l = [];
  range(p).forEach((i) => {
    range(q).forEach((j) => {
      l.push([i, j]);
    });
  });
  return l;
};

export const hexCorners = (x, y, size) => {
  const diff = 30;
  return RANGE6.map((baseDeg) => {
    const rad = Math.PI / 180 * (baseDeg + diff);
    return [x + size * Math.cos(rad), y + size * Math.sin(rad)];
  });
};

export const flatGridPoint = (oX, oY, size, gridX, gridY) => {
  const height = size * 2;
  const width = size * SQRT3;
  const diffXFromY = gridY * width / 2;
  const gridPointX = (gridX-(gridY+(gridY%2))/2.0 ) * width + diffXFromY;
  const gridPointY = gridY * height * 0.75;

  const x = gridPointX + oX;
  const y = gridPointY + oY;
  return {
    props: {
      type: "pointy-topped",
      x,
      y,
      size,
    },
    gridX,
    gridY,
    corners: hexCorners(x, y, size),
  };
}

export const flatGridPoints = (type, oX, oY, size, gridWidth, gridHeight) =>
  product(gridHeight, gridWidth).map(([gridY, gridX]) =>
    flatGridPoint(oX, oY, size, gridX, gridY));