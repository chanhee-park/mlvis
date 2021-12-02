setTimeout(async () => {
  console.log("Data setting ...");

  const dataname = "insurance";
  const instances = await Data.setInstances(dataname);
  const features = Data.getFeatureInfo(instances);
  const augmentations = Data.augmenteInstances(instances, features, dataname);

  console.log("features:", { features, first: Object.values(features)[0] });
  console.log("instances:", { instances, first: instances[0] });
  console.log("augmentations:", { augmentations, first: augmentations[0] });

  ReactDOM.render(
    <App
      instances={instances}
      features={features}
      augmentations={augmentations}
    />,
    document.getElementById("root")
  );
}, 500)