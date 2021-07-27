window.onload = async () => {
  const dataname = "insurance";
  const instances = await Data.setInstances(dataname);
  const features = Data.getFeatureInfo(instances);
  const augmented = Data.augmentateAllInstances(instances, features, dataname);

  console.log("Onload");
  console.log("Data setting ...");
  console.log("features:", features);
  console.log("instances:", instances);
  console.log("augmented:", augmented);
  console.log("Data setted.");

  ReactDOM.render(
    <App instances={instances} features={features} />,
    document.getElementById("root")
  );
};

