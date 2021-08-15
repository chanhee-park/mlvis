window.onload = async () => {
  console.log("Onload");
  console.log("Data setting ...");

  const dataname = "insurance";
  const instances = await Data.setInstances(dataname);
  const features = Data.getFeatureInfo(instances);
  const augmentations = Data.augmentateInstances(instances, features, dataname);

  console.log("features:", { features, first: Object.values(features)[0] });
  console.log("instances:", { instances, first: instances[0] });
  console.log("augmentations:", { augmentations, first: augmentations[0] });
  console.log("Data is fully loaded.");

  ReactDOM.render(
    <App
      instances={instances}
      features={features}
      augmentations={augmentations}
    />,
    document.getElementById("root")
  );
};
