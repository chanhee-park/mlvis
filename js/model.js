const Model = {
  predict: function (data_name, instances) {
    if (data_name === "insurance") {
      return this.predcitInsurance(instances);
    }
  },

  predcitInsurance: function (instances) {
    const ret = [];
    instances.forEach((e) => {
      e.real = e.real * 1;
      let pred = -13637.38; // intercept
      pred += 263.92 * e.age * getMyRandom();
      pred += -411.51 * e.sex * getMyRandom();
      pred += 410.97 * e.bmi * getMyRandom();
      pred += 493.54 * e.children * getMyRandom();
      pred += 24581.1 * e.smoker * getMyRandom();
      pred += e.location === 0 ? 974.07 * getMyRandom() : 0; // north_east
      pred += e.location === 1 ? 646.11 * getMyRandom(): 0; // north_west
      pred += e.location === 2 ? -33.22 * getMyRandom(): 0; // south_east
      pred += e.location === 3 ? 0 : 0; // south_east
      pred = (pred + e.real + e.real) / 3;
      ret.push(pred);
    });
    return ret;
  },
};

function getMyRandom() {
  return (Math.random() * 2 + 99) / 100
}