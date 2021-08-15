const Model = {
  predict: function (data_name, instances) {
    if (data_name === "insurance") {
      return this.predcitInsurance(instances);
    }
  },

  predcitInsurance: function (instances) {
    const ret = [];
    instances.forEach((e) => {
      let pred = -13637.38; // intercept
      pred += 263.92 * e.age;
      pred += -411.51 * e.sex;
      pred += 410.97 * e.bmi;
      pred += 493.54 * e.children;
      pred += 24581.1 * e.smoker;
      pred += e.location === 0 ? 974.07 : 0; // north_east
      pred += e.location === 1 ? 646.11 : 0; // north_west
      pred += e.location === 2 ? -33.22 : 0; // south_east
      pred += e.location === 3 ? 0 : 0; // south_east
      ret.push(pred);
    });
    return ret;
  },
};
