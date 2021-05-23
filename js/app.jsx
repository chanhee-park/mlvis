// Layout Hierarchy:
// app -> zone (-> zone) -> block -> (component group ->) component
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedInstances: this.props.instances,
      focusedInstance: undefined,
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
        <div className="zone zone--left">
          <FIP importances={this.props.importances} />
        </div>
        <div className="zone zone--right">
          <div className="zone zone--right-top">
            <IAP
              instances={this.props.instances}
              features={this.props.features}
              selectedInstances={this.state.selectedInstances}
              focusedInstance={this.state.focusedInstance}
              setSelectedInstances={(v) => this.setSelectedInstances(v)}
            />
          </div>
          <div className="zone zone--right-bottom">
            <Table
              instances={this.state.selectedInstances}
              features={this.props.features}
              focusedInstance={this.props.focusedInstance}
              setSelectedInstances={(v) => this.setSelectedInstances(v)}
              setFocusedInstance={(v) => this.setFocusedInstance(v)}
            />
          </div>
        </div>
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
