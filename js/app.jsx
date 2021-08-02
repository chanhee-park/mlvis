// Layout Hierarchy:
// app -> block -> component
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedInstances: this.props.instances, // []
      focusedInstance: undefined, // this.props.instances[3]
    };
  }

  setSelectedInstances(instances) {
    this.setState({ selectedInstances: instances });
  }

  setFocusedInstance(instance) {
    this.setState({ focusedInstance: instance });
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
          augGroups={this.props.augGroups}
          augmentions={this.props.augmentions}
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
