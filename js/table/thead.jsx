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
  
      this.state = { histogramFeature: hf, sortFeatrue: undefined, sortOrder: 1 };
    }
  
    getSortedInstances() {
      return this.props.instances.sort((a, b) => {
        const x = Number(a[this.state.sortFeatrue]);
        const y = Number(b[this.state.sortFeatrue]);
        return x < y ? this.state.sortOrder : -this.state.sortOrder;
      });
    }
  
    onClickFeature(fName) {
      if (fName === this.state.sortFeatrue) {
        this.setState({ sortOrder: -this.state.sortOrder });
      } else {
        this.setState({ sortFeatrue: fName, sortOrder: 1 });
      }
  
      const sorted = this.getSortedInstances();
      this.props.setSelectedInstances(sorted);
    }
  
    render() {
      return (
        <thead>
          <tr>
            {Object.keys(this.props.features).map((fName) => (
              <th key={`th-${fName}`}>
                <HistogramGraph
                  id={`table-histogram-${fName}`}
                  feature={this.state.histogramFeature[fName]}
                />
                <div
                  className="table-header__feature-name"
                  onClick={() => this.onClickFeature(fName)}
                >
                  {fName}
                  {fName === this.state.sortFeatrue && (
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
