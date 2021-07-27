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
      pred += 974.07 * e.north_east;
      pred += 646.11 * e.north_west;
      pred += -33.22 * e.south_east;
      pred += 0 * e.south_west;
      ret.push(pred);
    });
    return ret;
  },
};
