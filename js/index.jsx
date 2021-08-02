window.onload = async () => {
  console.log("Onload");
  console.log("Data setting ...");

  const dataname = "insurance";
  const instances = await Data.setInstances(dataname);
  const features = Data.getFeatureInfo(instances);
  const augmentions = Data.augmentateInstances(instances, features, dataname);

  console.log("features:", features);
  console.log("instances:", instances);
  console.log("instance:", instances[0]);
  console.log("augmentions:", augmentions);
  console.log("augmention:", augmentions[0]);
  console.log("Data fully setted.");

  ReactDOM.render(
    <App instances={instances} features={features} augmentions={augmentions} />,
    document.getElementById("root")
  );
};
