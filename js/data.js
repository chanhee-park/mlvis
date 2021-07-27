const Data = {
    setInstances: async (dataname) => {
      const instances = await Data.readCsv(`/data/${dataname}/${dataname}.csv`);
      const preds = Model.predict(dataname, instances);
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
  
    augmentateAllInstances: (instances, featureInfo, dataname) => {
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
      const augFeatureCombs = Data.combinations(featureNames, 1);
  
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
        augs[i].diff = augs[i].pred + augs[i].originalPred;
        augs[i].id = `${augs.originalId}-${i}`;
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
      aug.originalId = aug.id;
      aug.originalPred = aug.pred;
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
        for (let i = 0; i < 4; i++) {
          const aug = { ...instance };
          aug.augFeatures.add(augFeature);
          aug[augFeature] = Data.getRandomItem(
            featureInfo[augFeature].uniqueValues
          );
          ret.push(aug);
        }
      });
      return ret;
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