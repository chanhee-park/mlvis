// Instance Augmentation Plot
function IAP({ instances, selectedInstances, setSelectedInstances, features }) {
  return (
    <div className="block block__iap">
      <div className="component-group iap__component-group--left">
        <PCP
          instances={instances}
          selectedInstances={selectedInstances}
          setSelectedInstances={setSelectedInstances}
          features={features}
        />
        <Scatter
          instances={instances}
          selectedInstances={selectedInstances}
          features={features}
        />
      </div>
      <div className="component-group iap__component-group--right">
        <Options />
        <Augmentator features={features} />
      </div>
    </div>
  );
}

function Options() {
  return <div className="component component__option"> </div>;
}

class Augmentator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFeatures: Object.keys(this.props.features),
    };
  }

  popFeature(featureName) {
    const copy = this.state.selectedFeatures;
    const idx = copy.indexOf(featureName);
    if (idx > -1) copy.splice(idx, 1);
    this.setState({ selectedFeatures: copy });
  }

  pushFeature(featureName) {
    const copy = this.state.selectedFeatures;
    copy.push(featureName);
    this.setState({ selectedFeatures: copy });
  }

  render() {
    return (
      <div className="component component__agumentator">
        <div className="agumentator__histograms">
          {/* <div className="histogram-add-button__wrapper">
            <Button text={"add"} onClick={() => {}} />
          </div> */}
          {this.state.selectedFeatures.map((fName) => (
            <div key={`histogram-${fName}`}>
              <HistogramFilter
                feature={this.props.features[fName]}
                onRemove={() => this.popFeature(fName)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
}
