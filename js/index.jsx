window.onload = async () => {
  const instances = await Data.getInstances(CONSTANTS.data_src);
  const features = Data.getFeatureInfo(instances);
  const importances = Data.getFeatureImportances(CONSTANTS.importances_scr);
  ReactDOM.render(
    <App instances={instances} features={features} importances={importances} />,
    document.getElementById("root")
  );
};

const CONSTANTS = {
  data_src: "/data/results.min2.csv",
  importances_src: "/data/lr_result-total.txt",
};

const Data = {
  /**
   * Get Instances form csv file
   * @param {string} dir file dir
   * @returns {array} array of objects
   */
  getInstances: async (dir) => {
    const total = await d3.csv(dir);
    const filtered = [];
    total.forEach((e) => {
      if (Math.random() > 0.9) filtered.push(e);
    });
    return filtered;
  },

  getInstanceID: (e) => {
    return `${e.days}-${e.hour}-${e.real}-${Math.round(e.pred)}`;
  },

  /**
   *
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

    // compensate min and max value of diff between real and predict
    const absDiffMax = Math.max(-ret["diff"].min, ret["diff"].max);
    ret["diff"].min = -absDiffMax;
    ret["diff"].max = absDiffMax;

    return ret;
  },

  // TODO: 파일로 저장하고 불러와서 읽히기
  // TODO: Feature Importances 재계산
  getFeatureImportances: (dir) => {
    const ret = [];
    let txt = `season                                                          -8.137e+02  4.721e+02  -1.723  0.08484 . 
    holiday                                                          4.069e+03  1.190e+04   0.342  0.73239   
    workingday                                                      -1.318e+03  1.065e+03  -1.237  0.21610   
    weather                                                         -3.132e+02  6.718e+02  -0.466  0.64107   
    temp                                                            -2.338e+02  1.699e+02  -1.376  0.16888   
    atemp                                                            8.128e+01  1.224e+02   0.664  0.50651   
    humidity                                                        -7.440e+00  1.431e+01  -0.520  0.60324   
    windspeed                                                       -2.120e+00  5.290e+01  -0.040  0.96803   
    season:holiday                                                  -1.810e+03  7.322e+03  -0.247  0.80475   
    season:workingday                                                7.929e+02  5.517e+02   1.437  0.15066   
    holiday:workingday                                                      NA         NA      NA       NA   
    season:weather                                                   2.057e+02  3.901e+02   0.527  0.59798   
    holiday:weather                                                 -2.101e+03  1.098e+04  -0.191  0.84833   
    workingday:weather                                               5.736e+02  7.991e+02   0.718  0.47287   
    season:temp                                                      1.662e+02  7.113e+01   2.336  0.01951 * 
    holiday:temp                                                    -7.706e+02  2.152e+03  -0.358  0.72030   
    workingday:temp                                                  3.304e+02  1.903e+02   1.736  0.08263 . 
    weather:temp                                                     1.682e+02  1.231e+02   1.367  0.17167   
    season:atemp                                                    -4.073e+01  5.808e+01  -0.701  0.48318   
    holiday:atemp                                                    3.989e+02  1.208e+03   0.330  0.74126   
    workingday:atemp                                                -1.068e+02  1.428e+02  -0.748  0.45433   
    weather:atemp                                                   -9.842e+01  8.831e+01  -1.114  0.26510   
    temp:atemp                                                       4.346e+00  2.851e+00   1.524  0.12746   
    season:humidity                                                  7.822e+00  6.999e+00   1.118  0.26377   
    holiday:humidity                                                -7.658e+01  1.787e+02  -0.429  0.66827   
    workingday:humidity                                              1.852e+01  1.691e+01   1.095  0.27352   
    weather:humidity                                                 2.507e+00  9.331e+00   0.269  0.78816   
    temp:humidity                                                    2.199e+00  2.455e+00   0.896  0.37040   
    atemp:humidity                                                  -1.048e+00  1.906e+00  -0.550  0.58241   
    season:windspeed                                                 7.527e+00  2.922e+01   0.258  0.79673   
    holiday:windspeed                                               -1.120e+02  7.699e+02  -0.146  0.88431   
    workingday:windspeed                                            -7.756e+00  6.403e+01  -0.121  0.90358   
    weather:windspeed                                                9.510e-02  3.702e+01   0.003  0.99795   
    temp:windspeed                                                   1.167e+01  8.773e+00   1.330  0.18364   
    atemp:windspeed                                                 -9.504e+00  5.517e+00  -1.723  0.08496 . 
    humidity:windspeed                                              -4.587e-01  9.552e-01  -0.480  0.63106   
    season:holiday:workingday                                               NA         NA      NA       NA   
    season:holiday:weather                                           1.532e+03  7.079e+03   0.216  0.82863   
    season:workingday:weather                                       -2.689e+02  4.460e+02  -0.603  0.54660   
    holiday:workingday:weather                                              NA         NA      NA       NA   
    season:holiday:temp                                              4.216e+02  8.373e+02   0.504  0.61462   
    season:workingday:temp                                          -2.084e+02  7.850e+01  -2.654  0.00796 **
    holiday:workingday:temp                                                 NA         NA      NA       NA   
    season:weather:temp                                             -1.331e+02  5.634e+01  -2.361  0.01822 * 
    holiday:weather:temp                                             8.570e+02  2.012e+03   0.426  0.67021   
    workingday:weather:temp                                         -2.541e+02  1.363e+02  -1.865  0.06222 . 
    season:holiday:atemp                                            -2.174e+02  4.631e+02  -0.469  0.63883   
    season:workingday:atemp                                          7.287e+01  6.495e+01   1.122  0.26195   
    holiday:workingday:atemp                                                NA         NA      NA       NA   
    season:weather:atemp                                             7.585e+01  4.636e+01   1.636  0.10185   
    holiday:weather:atemp                                           -6.417e+02  1.050e+03  -0.611  0.54117   
    workingday:weather:atemp                                         1.217e+02  1.029e+02   1.182  0.23705   
    season:temp:atemp                                               -2.819e+00  1.105e+00  -2.550  0.01078 * 
    holiday:temp:atemp                                               8.630e+00  4.135e+01   0.209  0.83469   
    workingday:temp:atemp                                           -5.473e+00  3.256e+00  -1.681  0.09281 . 
    weather:temp:atemp                                              -1.559e+00  2.182e+00  -0.715  0.47490   
    season:holiday:humidity                                          2.515e+01  1.044e+02   0.241  0.80962   
    season:workingday:humidity                                      -1.106e+01  8.151e+00  -1.356  0.17497   
    holiday:workingday:humidity                                             NA         NA      NA       NA   
    season:weather:humidity                                         -2.153e+00  5.269e+00  -0.409  0.68277   
    holiday:weather:humidity                                         3.712e+01  1.597e+02   0.232  0.81623   
    workingday:weather:humidity                                     -1.057e+01  1.112e+01  -0.951  0.34156   
    season:temp:humidity                                            -1.593e+00  9.900e-01  -1.609  0.10766   
    holiday:temp:humidity                                            2.369e+01  4.244e+01   0.558  0.57673   
    workingday:temp:humidity                                        -2.720e+00  2.824e+00  -0.963  0.33550   
    weather:temp:humidity                                           -1.530e+00  1.595e+00  -0.959  0.33767   
    season:atemp:humidity                                            4.105e-01  8.491e-01   0.483  0.62879   
    holiday:atemp:humidity                                          -1.458e+01  2.404e+01  -0.606  0.54430   
    workingday:atemp:humidity                                        4.217e-01  2.257e+00   0.187  0.85179   
    weather:atemp:humidity                                           9.892e-01  1.171e+00   0.845  0.39825   
    temp:atemp:humidity                                             -3.622e-02  4.556e-02  -0.795  0.42659   
    season:holiday:windspeed                                        -1.716e+01  5.260e+02  -0.033  0.97398   
    season:workingday:windspeed                                     -1.053e+01  3.404e+01  -0.309  0.75696   
    holiday:workingday:windspeed                                            NA         NA      NA       NA   
    season:weather:windspeed                                        -2.413e+00  2.285e+01  -0.106  0.91592   
    holiday:weather:windspeed                                        1.998e+01  7.258e+02   0.028  0.97804   
    workingday:weather:windspeed                                     1.648e+01  4.616e+01   0.357  0.72114   
    season:temp:windspeed                                           -7.471e+00  3.774e+00  -1.980  0.04774 * 
    holiday:temp:windspeed                                           4.733e+01  1.019e+02   0.464  0.64236   
    workingday:temp:windspeed                                       -1.243e+01  1.002e+01  -1.240  0.21483   
    weather:temp:windspeed                                          -8.908e+00  6.926e+00  -1.286  0.19838   
    season:atemp:windspeed                                           4.966e+00  2.828e+00   1.756  0.07909 . 
    holiday:atemp:windspeed                                         -3.699e+01  6.525e+01  -0.567  0.57082   
    workingday:atemp:windspeed                                       1.079e+01  6.475e+00   1.666  0.09565 . 
    weather:atemp:windspeed                                          7.220e+00  4.184e+00   1.726  0.08439 . 
    temp:atemp:windspeed                                            -3.494e-02  1.595e-01  -0.219  0.82664   
    season:humidity:windspeed                                        1.488e-01  4.796e-01   0.310  0.75628   
    holiday:humidity:windspeed                                       2.887e+00  1.133e+01   0.255  0.79884   
    workingday:humidity:windspeed                                    2.644e-01  1.136e+00   0.233  0.81588   
    weather:humidity:windspeed                                       1.425e-01  5.542e-01   0.257  0.79704   
    temp:humidity:windspeed                                         -8.745e-02  1.321e-01  -0.662  0.50784   
    atemp:humidity:windspeed                                         1.283e-01  8.933e-02   1.436  0.15099   
    season:holiday:workingday:weather                                       NA         NA      NA       NA   
    season:holiday:workingday:temp                                          NA         NA      NA       NA   
    season:holiday:weather:temp                                     -4.511e+02  7.919e+02  -0.570  0.56889   
    season:workingday:weather:temp                                   1.808e+02  6.082e+01   2.973  0.00296 **
    holiday:workingday:weather:temp                                         NA         NA      NA       NA   
    season:holiday:workingday:atemp                                         NA         NA      NA       NA   
    season:holiday:weather:atemp                                     2.623e+02  4.099e+02   0.640  0.52222   
    season:workingday:weather:atemp                                 -9.928e+01  5.072e+01  -1.957  0.05032 . 
    holiday:workingday:weather:atemp                                        NA         NA      NA       NA   
    season:holiday:temp:atemp                                       -4.496e+00  1.704e+01  -0.264  0.79188   
    season:workingday:temp:atemp                                     3.037e+00  1.275e+00   2.382  0.01726 * 
    holiday:workingday:temp:atemp                                           NA         NA      NA       NA   
    season:weather:temp:atemp                                        1.188e+00  8.764e-01   1.355  0.17545   
    holiday:weather:temp:atemp                                      -4.718e+00  3.916e+01  -0.120  0.90410   
    workingday:weather:temp:atemp                                    2.983e+00  2.466e+00   1.209  0.22656   
    season:holiday:workingday:humidity                                      NA         NA      NA       NA   
    season:holiday:weather:humidity                                 -1.934e+01  9.951e+01  -0.194  0.84593   
    season:workingday:weather:humidity                               5.383e+00  6.038e+00   0.892  0.37260   
    holiday:workingday:weather:humidity                                     NA         NA      NA       NA   
    season:holiday:temp:humidity                                    -9.582e+00  1.540e+01  -0.622  0.53390   
    season:workingday:temp:humidity                                  1.960e+00  1.117e+00   1.754  0.07938 . 
    holiday:workingday:temp:humidity                                        NA         NA      NA       NA   
    season:weather:temp:humidity                                     1.295e+00  7.134e-01   1.815  0.06956 . 
    holiday:weather:temp:humidity                                   -2.557e+01  3.970e+01  -0.644  0.51943   
    workingday:weather:temp:humidity                                 2.255e+00  1.801e+00   1.252  0.21074   
    season:holiday:atemp:humidity                                    5.961e+00  8.423e+00   0.708  0.47911   
    season:workingday:atemp:humidity                                -4.301e-01  9.639e-01  -0.446  0.65546   
    holiday:workingday:atemp:humidity                                       NA         NA      NA       NA   
    season:weather:atemp:humidity                                   -7.309e-01  6.009e-01  -1.216  0.22390   
    holiday:weather:atemp:humidity                                   1.920e+01  2.118e+01   0.906  0.36472   
    workingday:weather:atemp:humidity                               -6.454e-01  1.396e+00  -0.462  0.64382   
    season:temp:atemp:humidity                                       2.624e-02  1.723e-02   1.523  0.12784   
    holiday:temp:atemp:humidity                                     -1.837e-01  6.680e-01  -0.275  0.78332   
    workingday:temp:atemp:humidity                                   5.316e-02  5.256e-02   1.012  0.31179   
    weather:temp:atemp:humidity                                      1.298e-02  3.217e-02   0.403  0.68669   
    season:holiday:workingday:windspeed                                     NA         NA      NA       NA   
    season:holiday:weather:windspeed                                 2.779e+01  5.160e+02   0.054  0.95705   
    season:workingday:weather:windspeed                             -2.895e+00  2.616e+01  -0.111  0.91189   
    holiday:workingday:weather:windspeed                                    NA         NA      NA       NA   
    season:holiday:temp:windspeed                                   -8.622e+00  4.496e+01  -0.192  0.84791   
    season:workingday:temp:windspeed                                 8.752e+00  4.176e+00   2.096  0.03614 * 
    holiday:workingday:temp:windspeed                                       NA         NA      NA       NA   
    season:weather:temp:windspeed                                    6.953e+00  3.094e+00   2.247  0.02465 * 
    holiday:weather:temp:windspeed                                  -4.327e+01  9.555e+01  -0.453  0.65063   
    workingday:weather:temp:windspeed                                9.326e+00  7.655e+00   1.218  0.22316   
    season:holiday:atemp:windspeed                                   1.004e+01  3.117e+01   0.322  0.74753   
    season:workingday:atemp:windspeed                               -5.481e+00  3.152e+00  -1.739  0.08206 . 
    holiday:workingday:atemp:windspeed                                      NA         NA      NA       NA   
    season:weather:atemp:windspeed                                  -4.936e+00  2.264e+00  -2.180  0.02927 * 
    holiday:weather:atemp:windspeed                                  3.957e+01  6.023e+01   0.657  0.51124   
    workingday:weather:atemp:windspeed                              -8.252e+00  4.876e+00  -1.692  0.09058 . 
    season:temp:atemp:windspeed                                      4.765e-02  6.451e-02   0.739  0.46015   
    holiday:temp:atemp:windspeed                                    -1.298e-01  2.583e+00  -0.050  0.95993   
    workingday:temp:atemp:windspeed                                  1.106e-02  1.870e-01   0.059  0.95284   
    weather:temp:atemp:windspeed                                     2.472e-02  1.185e-01   0.209  0.83468   
    season:holiday:humidity:windspeed                                8.423e-02  7.407e+00   0.011  0.99093   
    season:workingday:humidity:windspeed                             1.395e-01  5.527e-01   0.252  0.80078   
    holiday:workingday:humidity:windspeed                                   NA         NA      NA       NA   
    season:weather:humidity:windspeed                               -2.666e-02  3.297e-01  -0.081  0.93556   
    holiday:weather:humidity:windspeed                              -6.238e-01  1.023e+01  -0.061  0.95140   
    workingday:weather:humidity:windspeed                           -1.038e-01  6.874e-01  -0.151  0.87995   
    season:temp:humidity:windspeed                                   5.584e-02  5.526e-02   1.010  0.31231   
    holiday:temp:humidity:windspeed                                 -1.410e+00  2.068e+00  -0.682  0.49534   
    workingday:temp:humidity:windspeed                               9.838e-02  1.576e-01   0.624  0.53257   
    weather:temp:humidity:windspeed                                  8.993e-02  8.760e-02   1.027  0.30465   
    season:atemp:humidity:windspeed                                 -5.867e-02  4.430e-02  -1.324  0.18542   
    holiday:atemp:humidity:windspeed                                 1.082e+00  1.208e+00   0.895  0.37057   
    workingday:atemp:humidity:windspeed                             -1.408e-01  1.063e-01  -1.325  0.18519   
    weather:atemp:humidity:windspeed                                -9.432e-02  5.528e-02  -1.706  0.08802 . 
    temp:atemp:humidity:windspeed                                   -9.788e-04  2.827e-03  -0.346  0.72920   
    season:holiday:workingday:weather:temp                                  NA         NA      NA       NA   
    season:holiday:workingday:weather:atemp                                 NA         NA      NA       NA   
    season:holiday:workingday:temp:atemp                                    NA         NA      NA       NA   
    season:holiday:weather:temp:atemp                                4.063e+00  1.632e+01   0.249  0.80342   
    season:workingday:weather:temp:atemp                            -1.755e+00  9.962e-01  -1.761  0.07821 . 
    holiday:workingday:weather:temp:atemp                                   NA         NA      NA       NA   
    season:holiday:workingday:weather:humidity                              NA         NA      NA       NA   
    season:holiday:workingday:temp:humidity                                 NA         NA      NA       NA   
    season:holiday:weather:temp:humidity                             1.028e+01  1.454e+01   0.707  0.47964   
    season:workingday:weather:temp:humidity                         -1.813e+00  7.811e-01  -2.321  0.02031 * 
    holiday:workingday:weather:temp:humidity                                NA         NA      NA       NA   
    season:holiday:workingday:atemp:humidity                                NA         NA      NA       NA   
    season:holiday:weather:atemp:humidity                           -6.918e+00  7.430e+00  -0.931  0.35179   
    season:workingday:weather:atemp:humidity                         7.774e-01  6.653e-01   1.169  0.24262   
    holiday:workingday:weather:atemp:humidity                               NA         NA      NA       NA   
    season:holiday:temp:atemp:humidity                               7.488e-02  2.625e-01   0.285  0.77546   
    season:workingday:temp:atemp:humidity                           -3.294e-02  1.996e-02  -1.650  0.09898 . 
    holiday:workingday:temp:atemp:humidity                                  NA         NA      NA       NA   
    season:weather:temp:atemp:humidity                              -1.168e-02  1.262e-02  -0.926  0.35440   
    holiday:weather:temp:atemp:humidity                              1.190e-01  6.262e-01   0.190  0.84928   
    workingday:weather:temp:atemp:humidity                          -3.628e-02  3.637e-02  -0.998  0.31853   
    season:holiday:workingday:weather:windspeed                             NA         NA      NA       NA   
    season:holiday:workingday:temp:windspeed                                NA         NA      NA       NA   
    season:holiday:weather:temp:windspeed                            1.058e+01  4.327e+01   0.245  0.80678   
    season:workingday:weather:temp:windspeed                        -7.827e+00  3.327e+00  -2.352  0.01867 * 
    holiday:workingday:weather:temp:windspeed                               NA         NA      NA       NA   
    season:holiday:workingday:atemp:windspeed                               NA         NA      NA       NA   
    season:holiday:weather:atemp:windspeed                          -1.174e+01  2.980e+01  -0.394  0.69362   
    season:workingday:weather:atemp:windspeed                        5.699e+00  2.470e+00   2.307  0.02105 * 
    holiday:workingday:weather:atemp:windspeed                              NA         NA      NA       NA   
    season:holiday:temp:atemp:windspeed                             -5.082e-02  1.112e+00  -0.046  0.96353   
    season:workingday:temp:atemp:windspeed                          -6.592e-02  7.531e-02  -0.875  0.38141   
    holiday:workingday:temp:atemp:windspeed                                 NA         NA      NA       NA   
    season:weather:temp:atemp:windspeed                             -3.676e-02  4.929e-02  -0.746  0.45576   
    holiday:weather:temp:atemp:windspeed                             1.242e-02  2.502e+00   0.005  0.99604   
    workingday:weather:temp:atemp:windspeed                         -1.750e-02  1.377e-01  -0.127  0.89889   
    season:holiday:workingday:humidity:windspeed                            NA         NA      NA       NA`;
    let lines = txt.split("\n");
    lines.forEach((line) => {
      const retItem = {};
      const items = line.split(" ");
      let cnt = 0;
      items.forEach((item) => {
        if (item.length > 0) {
          if (cnt === 0) {
            retItem["features"] = new Set(item.split(":"));
          }
          if (cnt === 4) {
            retItem["value"] = 1 - Number(item);
          }
          cnt += 1;
        }
      });
      if (!isNaN(retItem.value)) {
        ret.push(retItem);
      }
    });
    return ret;
  },
};
