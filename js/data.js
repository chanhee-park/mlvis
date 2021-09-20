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
   * @param {string} dir file dir
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

  augmentateInstances: (instances, featureInfo, dataName) => {
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
      const start = Math.max(0, i - 10);
      const end = Math.min(instances.length, i + 10);
      for (let j = start; j < end; j++) {
        const augInstance = { ...instances[i] };
            delete augInstance.diff;
            augInstance.original_id = instances[i].id;
            augInstance.original_pred = instances[i].pred;

        let numOfAugFeatures = 0;
        augInstance.augFeatures = Data.pickRandKItems(featureNames, 1, 3);

        augInstance.augFeatures.forEach((augFeature) => {
          if (instances[i][augFeature] !== instances[j][augFeature]) {
            augInstance[`original_${augFeature}`] = instances[i][augFeature];
            augInstance[augFeature] = instances[j][augFeature];
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
    for (let i = 0; i < augInstances.length; i++) {
      augInstances[i].pred = preds[i];
      augInstances[i].diff =
        augInstances[i].pred - augInstances[i].original_pred;
      augInstances[i].id = `${augInstances[i].original_id}-aug-${i}`;
    }

    return augInstances;
  },

  groupAugs: (augs) => {
    const groups = {};
    augs.forEach((aug) => {
      let stackedConditionId = "";
      // 어떤 그룹에 들어갈지 판별한다.
      aug.augFeatures.forEach((feature) => {
        let conditionId = "";
        if (aug[`original_${feature}`] < aug[feature]) {
          conditionId = `${feature}+`;
          stackedConditionId += `${feature}+/`;
        } else if (aug[`original_${feature}`] > aug[feature]) {
          conditionId = `${feature}-`;
          stackedConditionId += `${feature}-/`;
        }

        // 그룹에 집어 넣는다. (변경 피쳐 1개 마다 각각 그룹에 넣는다.)
        if (groups.hasOwnProperty(conditionId)) {
          groups[conditionId].instanceIds.push(aug.id);
        } else {
          groups[conditionId] = {
            key: conditionId,
            instanceIds: [aug.id],
            augFeatures: [feature],
          };
        }
      });

      // 2개 이상 피처가 바뀐 경우, 쌓인 좋건에 의한 그룹에 집어 넣는다.
      if (aug.augFeatures.length >= 2) {
        stackedConditionId = stackedConditionId.slice(0, -1);
        if (groups.hasOwnProperty(stackedConditionId)) {
          groups[stackedConditionId].instanceIds.push(aug.id);
        } else {
          groups[stackedConditionId] = {
            key: stackedConditionId,
            instanceIds: [aug.id],
            augFeatures: aug.augFeatures,
          };
        }
      }
    });

    Object.values(groups).forEach((group) => {
      group.stat = Data.getStatOfGroup(augs, group.instanceIds);
      group.augFeatures.push("pred");
      group.key += +(group.stat.diffMean > 0) ? "pred-" : "pred+";
    });

    return groups;
  },

  getStatOfGroup: (totalInstances, groupInstanceIds) => {
    const totalInstancesObj = Data.arr2obj(totalInstances);
    const stat = { diffMean: 0, absDiffMean: 0 };

    groupInstanceIds.forEach((id) => {
      const instance = totalInstancesObj[id];
      Object.keys(instance).forEach((feature) => {
        if (feature != "augFeatures" && feature != "id") {
          if (stat.hasOwnProperty(feature)) {
            stat[feature].push(instance[feature]);
          } else {
            stat[feature] = [instance[feature]];
          }
        }
      });
      stat.diffMean += instance.diff;
      stat.absDiffMean += Math.abs(instance.diff);
    });
    stat.diffMean /= groupInstanceIds.length;
    stat.absDiffMean /= groupInstanceIds.length;

    return stat;
  },

  getRandomItem: (set) => {
    let items = Array.from(set);
    return items[Math.floor(Math.random() * items.length)];
  },

  pickRandKItems: (array, minK, maxK) => {
    const randomItems = [];
    const k = Math.floor(Math.random() * (maxK - minK + 1) + minK);
    while (randomItems.length < k) {
      const randomItem = array[Math.floor(Math.random() * array.length)];
      if (randomItems.indexOf(randomItem)) {
        randomItems.push(randomItem);
      }
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
