// Instance Augmentation Plot
function IAP({
  instances,
  features,
  selectedInstances,
  focusedInstance,
  setSelectedInstances,
  setAugmentatedInstances,
}) {
  return (
    <div className="block block__iap">
      <PCP
        instances={instances}
        features={features}
        selectedInstances={selectedInstances}
        focusedInstance={focusedInstance}
        setSelectedInstances={setSelectedInstances}
        setAugmentatedInstances={setAugmentatedInstances}
      />
      <Scatter
        instances={instances}
        features={features}
        selectedInstances={selectedInstances}
        focusedInstance={focusedInstance}
      />
    </div>
  );
}
