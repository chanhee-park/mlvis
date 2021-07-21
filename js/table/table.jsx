// Table Exploring Agumentated Instances
class Table extends React.Component {
  render() {
    return (
      <div className="block block__table">
        <table>
          <TableHeader
            features={this.props.features}
            instances={this.props.instances}
            setSelectedInstances={(v) => this.props.setSelectedInstances(v)}
          />
          <TableBody
            features={this.props.features}
            instances={this.props.instances}
            focusedInstance={this.props.focusedInstance}
            setFocusedInstance={this.props.setFocusedInstance}
          />
        </table>
      </div>
    );
  }
}
