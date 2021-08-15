// Table Exploring Agumentated Instances
class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      augGroups: Data.groupAugs(this.props.augmentations),
    };
    console.log("groups:", this.state.augGroups);
  }

  render() {
    return (
      <div className="block block__table">
        <table>
          <TableHeader
            features={this.props.features}
            instances={this.props.instances}
            setSelectedInstances={this.props.setSelectedInstances}
          />
          <TableBody
            instances={this.props.instances}
            features={this.props.features}
            augGroups={this.state.augGroups}
            augmentations={this.props.augmentations}
            focusedInstance={this.props.focusedInstance}
            setFocusedInstance={this.props.setFocusedInstance}
          />
        </table>
      </div>
    );
  }
}
