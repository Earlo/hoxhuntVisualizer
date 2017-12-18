const processData = (data, columns) => {
  return data.values.map((entry) => {
    const e = {};
    columns.forEach((c, idx) => {
      e[c] = entry[idx];
    });
    return e;
  });
};

module.exports = processData;
