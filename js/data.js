const Data = {
  setInstances: async (dataname) => {
    const instances = await Data.readCsv(`/data/${dataname}/${dataname}.csv`);
    const preds = Model.predict(dataname, instances);
    const randomSamples = [];

    for (let i = 0; i < instances.length; i++) {
      instances[i].pred = preds[i];
      instances[i].diff = instances[i].pred - instances[i].real;
      instances[i].id = i;
      if (Math.random() > 0.9) {
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
  readCsv: async (dir) => {
    return await d3.csv(dir);
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

  augmentateInstances: (instances, featureInfo, dataname) => {
    // using random augmentation
    // 변하는 피쳐의 수: 2개 이하 모든 조합
    // 피쳐의 변화 범위: random 4개와 자기 자신
    // 총 생성 인스턴스 수: n * mC2 * 5 (n은 기존 인스턴스 수, m은 피쳐 수)

    // set aug features
    const featureNames = Object.keys(instances[0]);
    featureNames.pop("id");
    featureNames.pop("pred");
    featureNames.pop("real");
    featureNames.pop("diff");
    const augFeatureCombs = Data.combinations(featureNames, 2);

    // get aug instances
    let augs = [];
    instances.forEach((instance) => {
      const augsInstance = Data.augmentateInstance(
        instance,
        augFeatureCombs,
        featureInfo
      );
      augs = augs.concat(augsInstance);
    });

    // pred for augs
    const preds = Model.predict(dataname, augs);
    for (let i = 0; i < augs.length; i++) {
      augs[i].pred = preds[i];
      augs[i].diff = augs[i].pred - augs[i].original_pred;
      augs[i].id = `${augs[i].original_id}-aug-${i}`;
    }

    return augs;
  },

  augmentateInstance: (instance, augFeatureCombs, featureInfo) => {
    let ret = [];
    // generate and push aug isntances
    for (let i = 0; i < augFeatureCombs.length; i++) {
      const augs = Data.augmentateInstanceByFeatures(
        instance,
        augFeatureCombs[i],
        featureInfo
      );
      ret = ret.concat(augs);
    }

    return ret;
  },

  augmentateInstanceByFeatures: (instance, augFeatures, featureInfo) => {
    let ret = [];

    // init aug instance
    const aug = { ...instance };
    delete aug.real;
    delete aug.diff;
    aug.original_id = instance.id;
    aug.original_pred = instance.pred;
    aug.augFeatures = new Set();
    ret.push(aug); // original as a aug instance

    // 피쳐 값 변환
    augFeatures.forEach((augFeature) => {
      const augs = Data.augmentateInstanceByFeature(
        ret,
        augFeature,
        featureInfo
      );
      ret = ret.concat(augs);
    });

    return ret;
  },

  augmentateInstanceByFeature: (instances, augFeature, featureInfo) => {
    const ret = [];
    instances.forEach((instance) => {
      const aug = { ...instance };
      aug.augFeatures.add(augFeature);
      aug[`original_${augFeature}`] = instance[augFeature];
      aug[augFeature] = Data.getRandomItem(
        featureInfo[augFeature].uniqueValues
      );
      ret.push(aug);
    });
    return ret;
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
        } else {
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
      if (aug.augFeatures.size >= 2) {
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

  combinations: (arr, max_k) => {
    const combs = [];
    for (let k = 1; k <= max_k; k++) {
      const k_combs = Data.k_combinations(arr, k);
      for (let i = 0; i < k_combs.length; i++) {
        combs.push(k_combs[i]);
      }
    }
    return combs;
  },

  arr2obj: (arr, keyName = "id") => {
    const ret = {};
    arr.forEach((item) => {
      ret[item[keyName]] = item;
    });
    return ret;
  },

  k_combinations: (arr, k) => {
    const combs = [];

    // There is no way to take e.g. arrs of 5 elements from a arr of 4.
    if (k > arr.length || k <= 0) {
      return [];
    }

    // K-sized arr has only one K-sized subarr.
    if (k == arr.length) {
      return [arr];
    }

    // There is N 1-sized subarrs in a N-sized arr.
    if (k == 1) {
      for (let i = 0; i < arr.length; i++) {
        combs.push([arr[i]]);
      }
      return combs;
    }

    for (let i = 0; i < arr.length - k + 1; i++) {
      const head = arr.slice(i, i + 1);
      const tailcombs = Data.k_combinations(arr.slice(i + 1), k - 1);
      for (let j = 0; j < tailcombs.length; j++) {
        combs.push(head.concat(tailcombs[j]));
      }
    }
    return combs;
  },
};

const CONSTANTS = {
  datatype: {
    age: "numeric",
    sex: "categorical",
    bmi: "numeric",
    children: "numeric",
    smoker: "categorical",
    north_east: "categorical",
    north_west: "categorical",
    south_east: "categorical",
    south_west: "categorical",
  },
};
