// Layout Hierarchy:
// app -> zone (-> zone) -> block -> (component group ->) component
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedInstances: this.props.instances };
  }

  setSelectedInstances(instances) {
    this.setState({ selectedInstances: instances });
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
              selectedInstances={this.state.selectedInstances}
              setSelectedInstances={(v) => {
                this.setSelectedInstances(v);
              }}
              features={this.props.features}
            />
          </div>
          <div className="zone zone--right-bottom">
            <Table
              instances={this.state.selectedInstances}
              features={this.props.features}
              setSelectedInstances={(v) => {
                this.setSelectedInstances(v);
              }}
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
