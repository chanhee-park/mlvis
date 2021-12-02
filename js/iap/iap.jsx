// Instance Augmentation Plot
function IAP({
  instances,
  features,
  selectedInstances,
  setSelectedInstances,
}) {
  return (
    <div className="block block__iap">
      <PCP
        instances={instances}
        features={features}
        selectedInstances={selectedInstances}
        setSelectedInstances={setSelectedInstances}
      />
      <Scatter
        instances={instances}
        features={features}
        selectedInstances={selectedInstances}
      />
    </div>
  );
}
