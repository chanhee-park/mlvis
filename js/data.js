const Data = {
  setInstances: async (dataName) => {
    const instances = await Data.readCsv(dataName);
    const preds = Model.predict(dataName, instances);
    const randomSamples = [];

    for (let i = 0; i < instances.length; i++) {
      instances[i].pred = preds[i];
      instances[i].diff = instances[i].pred - instances[i].real;
      instances[i].id = i;
      if (Math.random() > 0.8) {
        randomSamples.push(instances[i]);
      }
    }

    return randomSamples;
  },

  /**
   * Get Instances form csv file
   * @returns {array} array of objects
   */
  readCsv: async (dataName) => {
    return await d3.csv(`/data/${dataName}/${dataName}.csv`);
  },

  /**
   * @param {array} instances (array of objects)
   * @returns feature meta infomation
   */
  getFeatureInfo: (instances) => {
    // init
    const ret = {};
    const featureNames = Object.keys(instances[0]);
    featureNames.pop("index");
    featureNames.forEach(
      (f) =>
        (ret[f] = {
          name: f,
          min: instances[0][f],
          max: instances[0][f],
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

    // real과 pred의 min max 값을 일치시켜서 PCP에서의 시각적 통일감을 향상시킴
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

  augmenteInstances: (instances, featureInfo, dataName) => {
    const augInstances = [];

    // unpick features for augmentation
    const featureNames = Object.keys(instances[0]);
    featureNames.pop("id");
    featureNames.pop("index");
    featureNames.pop("pred");
    featureNames.pop("real");
    featureNames.pop("diff");

    // sort instances
    instances.sort((a, b) => a.real - b.real);

    for (let i = 0; i < instances.length; i++) {
      const start = Math.max(0, i - 25);
      const end = Math.min(instances.length, i + 25);
      for (let j = start; j < end; j++) {
        if (i === j) continue;
        const augInstance = { ...instances[i] };
        delete augInstance.diff;
        augInstance.original_id = instances[i].id;
        augInstance.original_pred = instances[i].pred;

        augInstance.augFeatures = new Set();
        const augFeatures = Data.pickRandKItems(featureNames, 1, 2);
        let numOfAugFeatures = 0;
        augFeatures.forEach((augFeature) => {
          if (instances[i][augFeature] !== instances[j][augFeature]) {
            augInstance[`original_${augFeature}`] = instances[i][augFeature];
            augInstance[augFeature] = instances[j][augFeature];
            augInstance.augFeatures.add(augFeature);
            numOfAugFeatures += 1;
          }
        });
        if (numOfAugFeatures > 0) {
          augInstances.push(augInstance);
        }
      }
    }

    // pred for augs
    const preds = Model.predict(dataName, augInstances);
    augInstances.forEach((aug, index)=> {
      aug.pred = preds[index];
      aug.diff = aug.pred - aug.original_pred;
      aug.id = `${aug.original_id}-aug-${index}`;
    });

    return augInstances;
  },

  groupAugs: (augs) => {
    const groups = {};
    augs.forEach((aug) => {
      let conditionId = "";
      // 어떤 그룹에 들어갈지 판별한다.
      Array.from(aug.augFeatures).sort().forEach((feature) => {
        if (aug[`original_${feature}`] < aug[feature]) {
          conditionId += `${feature}+/`;
        } else if (aug[`original_${feature}`] > aug[feature]) {
          conditionId += `${feature}-/`;
        }
      });

      // 쌓인 좋건에 의한 그룹에 집어 넣는다.
      if (groups.hasOwnProperty(conditionId)) {
        groups[conditionId].instanceIds.push(aug.id);
        groups[conditionId].instances.push(aug);
      } else {
        groups[conditionId] = {
          key: conditionId,
          instanceIds: [aug.id],
          instances: [aug],
          augFeatures: aug.augFeatures,
        };
      }
    });

    Object.values(groups).forEach((group) => {
      group.stat = Data.getStatOfGroup(augs, group.instanceIds);
      group.augFeatures.add("pred");
      group.key += group.stat.diffMean < 0 ? "pred-" : "pred+";
    });

    // return only groups which have 30 or more members
    return Object.values(groups).filter((g) => g.instanceIds.length >= 10);
  },

  getStatOfGroup: (totalInstances, groupInstanceIds) => {
    const totalInstancesObj = Data.arr2obj(totalInstances);
    const stat = { diffMean: 0, absDiffMean: 0 };
    const featureNames = [];

    groupInstanceIds.forEach((id) => {
      const instance = totalInstancesObj[id];
      Object.keys(instance).forEach((feature) => {
        featureNames.push(feature);
        const value = instance[feature] * 1;
        if (stat.hasOwnProperty(feature)) {
          stat[feature].values.push(value);
          stat[feature].sum += value;
        } else {
          stat[feature] = { mean: 0, sum: value, values: [value] };
        }
      });
      stat.diffMean += instance.diff;
      stat.absDiffMean += Math.abs(instance.diff);
    });

    featureNames.forEach((feature) => {
      if (stat[feature].values.length > 0) {
        stat[feature].mean = stat[feature].sum / stat[feature].values.length;
      }
    });
    stat.diffMean /= groupInstanceIds.length;
    stat.absDiffMean /= groupInstanceIds.length;

    return stat;
  },

  pickRandKItems: (array, minK, maxK) => {
    const randomItems = new Set();
    const k = Math.floor(Math.random() * (maxK - minK + 1) + minK);
    while (randomItems.size < k) {
      const randomItem = array[Math.floor(Math.random() * array.length)];
      randomItems.add(randomItem);
    }
    return randomItems;
  },

  arr2obj: (arr, keyName = "id") => {
    const ret = {};
    arr.forEach((item) => {
      ret[item[keyName]] = item;
    });
    return ret;
  },
};

// TODO: categorical인 경우
// 방법: 1) categorical인 other options 어트리뷰트 만든다.
//      2) aug features 추가하는 부분에 other options 중 하나 이상이 포함되어있는지 검사합ㄴ다.
//      3) 있으면 해당 피쳐를 aug features에 추가하지 않는다.
const CONSTANTS = {
  datatype: {
    age: "numeric",
    sex: "categorical",
    bmi: "numeric",
    children: "numeric",
    smoker: "categorical",
    location: "categorical",
    real: "numeric",
    pred: "numeric",
    diff: "numeric",
  },
};

Array.prototype.insert = function ( index, item ) {
  this.splice( index, 0, item );
};