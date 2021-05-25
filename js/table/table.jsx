// Table Exploring Agumentated Instances
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

class TableBody extends React.Component {
  render() {
    return (
      <tbody>
        {this.props.instances.map((v) => {
          return (
            <TableRow
              key={`tr-out-${Data.getInstanceID(v)}`}
              instance={v}
              features={this.props.features}
              isFocused={v === this.props.focusedInstance}
              setFocusedInstance={this.props.setFocusedInstance}
            />
          );
        })}
      </tbody>
    );
  }
}

class TableRow extends React.Component {
  render() {
    const instanceID = Data.getInstanceID(this.props.instance);
    return (
      <tr
        key={`tr-in-${instanceID}`}
        onClick={() => this.props.setFocusedInstance(this.props.instance)}
      >
        {Object.entries(this.props.instance).map((ent) => {
          const fName = ent[0];
          const value = ent[1];
          const min = this.props.features[fName].min;
          const max = this.props.features[fName].max;
          const portion = (value - min) / (max - min);
          return (
            <td key={`td-${instanceID}-${fName}`}>
              <TableBarChart
                value={value}
                portion={portion}
                isFocused={this.props.isFocused}
              />
            </td>
          );
        })}
        {this.props.isFocused && (
          <TableFocusedCell instance={this.props.instance} />
        )}
      </tr>
    );
  }
}

class TableBarChart extends React.Component {
  render() {
    return (
      <svg>
        <rect
          x="0"
          y="0"
          width={`${this.props.portion * 100}%`}
          height="100%"
          fill={this.props.isFocused ? "#F95" : "#CCC"}
        />
        <text
          x="95%"
          y="50%"
          fill="#777"
          textAnchor="end"
          alignmentBaseline="central"
        >
          {Math.round(this.props.value)}
        </text>
      </svg>
    );
  }
}

class TableFocusedCell extends React.Component {
  render() {
    // console.log(this.props.instance);
    return (
      <td className="focused">
        <div className="focused-card">
          <div className="wellcome-message">{`
            This is a focused instance.
            It is a just example image.
          `}</div>
          <div className="example-image">
            <img src="./data/focused_vis_example.png" width="50%" />
          </div>
        </div>
      </td>
    );
  }
}
