window.onload = async () => {
  console.log("Onload");
  console.log("Data setting ...");

  const dataname = "insurance";
  const instances = await Data.setInstances(dataname);
  const features = Data.getFeatureInfo(instances);
  const augmentions = Data.augmentateInstances(instances, features, dataname);
  const augGroups = Data.groupAugs(augmentions);

  console.log("features:", features);
  console.log("instances:", instances);
  console.log("augmentions:", augmentions);
  console.log("goups:", augGroups);
  console.log("Data fully setted.");

  ReactDOM.render(
    <App
      instances={instances}
      features={features}
      augGroups={augGroups}
      augmentions={augmentions}
    />,
    document.getElementById("root")
  );
};
