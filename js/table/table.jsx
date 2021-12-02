// Table Exploring Generated Instances
class Table extends React.Component {
  render() {
    return (
      <div className="block block__table">
        <table>
          <TableHeader
            features={this.props.features}
            instances={this.props.instances}
            setAugGroups={this.props.setAugGroups}
            augGroups={this.props.augGroups}
          />
          <TableBody
            features={this.props.features}
            augmentations={this.props.augmentations}
            augGroups={this.props.augGroups}
            setHoveredGroup={this.props.setHoveredGroup}
            setSelectedGroup={this.props.setSelectedGroup}
          />
        </table>
      </div>
    );
  }
}

class TableTooltip extends React.Component {
  render() {
    const changed = this.props.group ? this.props.group.key : "None"
    return (
      <span className="table__tooltip" id="table__tooltip">Group Info: {changed}</span>
    );
  }
}