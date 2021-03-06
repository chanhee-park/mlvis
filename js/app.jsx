// Layout Hierarchy:
// app -> block -> component
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedInstances: this.props.instances, // []
      selectedAugs: this.props.augmentations,
      focusedInstance: undefined, // this.props.instances[3]
      augGroups: Data.groupAugs(this.props.augmentations),
      hoveredGroup: undefined,
      selectedGroup: Data.groupAugs(this.props.augmentations)[0],
    };
  }

  setSelectedInstances(instances) {
    const newSelectedAugs = this.getSelectedAugs(instances);
    const newGroups = Data.groupAugs(newSelectedAugs)
    this.setState({
      selectedInstances: instances,
      selectedAugs: newSelectedAugs,
      augGroups: newGroups,
    });
  }

  getSelectedAugs(selectedInstances) {
    const idsOfSelectedInstance = selectedInstances.map((e) => e.id);
    return this.props.augmentations.filter(
      (aug) => idsOfSelectedInstance.indexOf(aug.original_id) > -1
    );
  }

  setAugGroups(groups) {
    this.setState({augGroups: groups});
  }

  setHoveredGroup(group) {
    this.setState({ hoveredGroup: group})
  }

  setSelectedGroup(group) {
    this.setState({ selectedGroup: group})
  }

  render() {
    const tableFeatures = this.props.features;
    return (
      <div className="app" id="app">
        <IAP
          instances={this.props.instances}
          features={this.props.features}
          selectedInstances={this.state.selectedInstances}
          setSelectedInstances={(v) => this.setSelectedInstances(v)}
        />
        <Table
          instances={this.state.selectedInstances}
          features={this.props.features}
          augmentations={this.state.selectedAugs}
          augGroups={this.state.augGroups}
          setAugGroups={(v) => this.setAugGroups(v)}
          setHoveredGroup={(g) => this.setHoveredGroup(g)}
          setSelectedGroup={(g) => this.setSelectedGroup(g)}
        />
        <TableTooltip group={this.state.hoveredGroup} />
        <DetailView group={this.state.selectedGroup}/>
      </div>
    );
  }
}

