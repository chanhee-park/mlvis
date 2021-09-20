class TableHeader extends React.Component {
  constructor(props) {
    super(props);

    const hf = {};
    Object.keys(this.props.features).forEach((fName) => {
      hf[fName] = {
        name: fName,
        min: Infinity,
        max: -Infinity,
        values: [],
        uniqueValues: new Set(),
      };
    });
    this.props.instances.forEach((instance) => {
      Object.keys(this.props.features).forEach((fName) => {
        const value = instance[fName];
        hf[fName].min = Math.min(hf[fName].min, value);
        hf[fName].max = Math.max(hf[fName].max, value);
        hf[fName].values.push(value);
        hf[fName].uniqueValues.add(value);
      });
    });

    this.state = { histogramFeature: hf, sortFeature: undefined, sortOrder: 1 };
  }

  getSortedGroups() {
    if (!this.state.sortFeature || !this.state.sortOrder) return this.props.augGroups;
    return this.props.augGroups.sort((a, b) => {
      const x = Number(a.stat[this.state.sortFeature].mean);
      const y = Number(b.stat[this.state.sortFeature].mean);
      return x < y ? this.state.sortOrder : -this.state.sortOrder;
    });
  }

  onClickFeature(fName) {
    if (fName === this.state.sortFeature) {
      this.setState({ sortOrder: -this.state.sortOrder });
    } else {
      this.setState({ sortFeature: fName, sortOrder: 1 });
    }
    const sorted = this.getSortedGroups();
    this.props.setSortedGroup(sorted);
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
                  <span className="material-icons">
                    {this.state.sortOrder === 1 && "arrow_drop_up"}
                    {this.state.sortOrder === -1 && "arrow_drop_down"}
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
