// Table Exploring Generated Instances
class Table extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="block block__table">
        <table>
          <TableHeader
            features={this.props.features}
            instances={this.props.instances}
            setAugGroups={(v) => this.props.setAugGroups(v)}
            augGroups={this.props.augGroups}
          />
          <TableBody
            features={this.props.features}
            augmentations={this.props.augmentations}
            augGroups={this.props.augGroups}
            setHoveredGroup={this.props.setHoveredGroup}
          />
        </table>
      </div>
    );
  }
}
