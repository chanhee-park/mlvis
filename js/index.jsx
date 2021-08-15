window.onload = async () => {
  console.log("Onload");
  console.log("Data setting ...");

  const dataname = "insurance";
  const instances = await Data.setInstances(dataname);
  const features = Data.getFeatureInfo(instances);
  const augmentations = Data.augmentateInstances(instances, features, dataname);

  console.log("features:", features);
  console.log("instances:", instances);
  console.log("instance:", instances[0]);
  console.log("augmentations:", augmentations);
  console.log("augmentation:", augmentations[0]);
  console.log("Data is fully loaded.");

  ReactDOM.render(
    <App instances={instances} features={features} augmentations={augmentations} />,
    document.getElementById("root")
  );
};
