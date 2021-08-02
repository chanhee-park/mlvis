// Layout Hierarchy:
// app -> block -> component
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedInstances: this.props.instances, // []
      selectedAugs: this.props.augmentions,
      focusedInstance: undefined, // this.props.instances[3]
    };
  }

  setSelectedInstances(instances) {
    const newSelectedAugs = this.setSelectedAugs(instances);
    this.setState({
      selectedInstances: instances,
      selectedAugs: newSelectedAugs,
    });
  }

  setFocusedInstance(instance) {
    this.setState({ focusedInstance: instance });
  }

  getSelectedAugs(selectedInstances) {
    const idsOfSelectedInstance = selectedInstances.map((e) => e.id);
    return this.props.augmentions.filter(
      (aug) => idsOfSelectedInstance.indexOf(aug.original_id) > -1
    );
  }

  render() {
    return (
      <div className="app" id="app">
        <IAP
          instances={this.props.instances}
          features={this.props.features}
          selectedInstances={this.state.selectedInstances}
          focusedInstance={this.state.focusedInstance}
          setSelectedInstances={(v) => this.setSelectedInstances(v)}
        />
        <Table
          instances={this.state.selectedInstances}
          features={this.props.features}
          augmentions={this.state.selectedAugs}
          focusedInstance={this.state.focusedInstance}
          setSelectedInstances={(v) => this.setSelectedInstances(v)}
          setFocusedInstance={(v) => this.setFocusedInstance(v)}
        />
      </div>
    );
  }
}

function Button({ text, onClick }) {
  return (
    <div className="button" onClick={() => onClick()}>
      {text}
    </div>
  );
}
