class TableHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {  sortFeature: undefined, sortOrder: 1 };
  }

  getSortedGroups(fName) {
    return this.props.augGroups.sort((a, b) => {
      const x = Number(a.stat[fName].mean);
      const y = Number(b.stat[fName].mean);
      return x < y ? this.state.sortOrder : -this.state.sortOrder;
    });
  }

  onClickFeature(fName) {
    if (fName === this.state.sortFeature) {
      this.setState({ sortOrder: -this.state.sortOrder });
    } else {
      this.setState({ sortFeature: fName, sortOrder: 1 });
    }
    const sorted = this.getSortedGroups(fName);
    this.props.setAugGroups(sorted);
  }

  render() {
    return (
      <thead>
        <tr>
          {Object.keys(this.props.features).map((fName) => (
            <th key={`th-${fName}`}>
              <div
                className="table-header__feature-name"
                onClick={() => this.onClickFeature(fName)}
              >
                {fName}
                {fName === this.state.sortFeature && (
                  <span className="icon">
                    {this.state.sortOrder === 1 && "↓"}
                    {this.state.sortOrder === -1 && "↑"}
                  </span>
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
    );
  }
}
