window.onload = async () => {
  const instances = await Data.readCsv("/data/insurance/insurance.csv");
  const preds = Model.predict("insurance", instances);
  for (let i = 0; i < instances.length; i++) {
    instances[i].pred = preds[i];
    instances[i].diff = instances[i].real - instances[i].pred;
    instances[i].id = i;
  }

  const features = Data.getFeatureInfo(instances);

  ReactDOM.render(
    <App instances={instances} features={features} />,
    document.getElementById("root")
  );
};

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
      pred += -411.51 * e.sex; // 411
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

const CONSTANTS = {
  data_src: "/data/bike/results.min2.csv",
  importances_src: "/data/bike/lr_result-total.txt",
};

const Data = {
  /**
   * Get Instances form csv file
   * @param {string} dir file dir
   * @returns {array} array of objects
   */
  readCsv: async (dir) => {
    return await d3.csv(dir);
  },

  getInstanceID: (e) => {
    return e.id;
  },

  /**
   * @param {array} instances (array of objects)
   * @returns feature meta infomation
   */
  getFeatureInfo: (instances) => {
    // init
    const ret = {};
    const featureNames = Object.keys(instances[0]);
    featureNames.forEach(
      (f) =>
        (ret[f] = {
          name: f,
          min: +Infinity,
          max: -Infinity,
          values: [],
          uniqueValues: new Set(),
        })
    );

    // get min and max values
    instances.forEach((e) => {
      featureNames.forEach((f) => {
        ret[f].values.push(e[f]);
        ret[f].uniqueValues.add(e[f]);
        ret[f].min = Math.min(e[f], ret[f].min);
        ret[f].max = Math.max(e[f], ret[f].max);
      });
    });

    // real과 pred의 min max 값을 일치시켜서 시각적 통일감을 향상시킴
    ret["real"].min = Math.min(ret["real"].min, ret["pred"].min);
    ret["pred"].min = ret["real"].min;
    ret["real"].max = Math.max(ret["real"].max, ret["pred"].max);
    ret["pred"].max = ret["real"].max;

    // compensate min and max value of diff between real and predict
    const absDiffMax = Math.max(-ret["diff"].min, ret["diff"].max);
    ret["diff"].min = -absDiffMax;
    ret["diff"].max = absDiffMax;

    return ret;
  },
};
