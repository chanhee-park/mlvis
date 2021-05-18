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
            setSelectedInstances={(v) => {
              this.props.setSelectedInstances(v);
            }}
          />
          <TableBody
            features={this.props.features}
            instances={this.props.instances}
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
        {this.props.instances.map((v) => (
          <TableRow
            features={this.props.features}
            instances={this.props.instances}
            key={`tr-out-${Data.getInstanceID(v)}`}
            instance={v}
          />
        ))}
      </tbody>
    );
  }
}

class TableRow extends React.Component {
  render() {
    const instanceID = Data.getInstanceID(this.props.instance);
    return (
      <tr key={`tr-in-${instanceID}`}>
        {Object.entries(this.props.instance).map((ent, index) => {
          const fName = ent[0];
          const value = ent[1];
          const min = this.props.features[fName].min;
          const max = this.props.features[fName].max;
          const portion = (value - min) / (max - min);
          return (
            <td key={`td-${instanceID}-${fName}`}>
              <TableBarChart
                id={`tv-${instanceID}-${fName}`}
                value={value}
                portion={portion}
              />
            </td>
          );
        })}
      </tr>
    );
  }
}

class TableBarChart extends React.Component {
  componentDidMount() {
    this.draw();
  }

  draw() {
    // set svg
    const svg = d3.select(`#${this.props.id}`);
    svg.selectAll("*").remove();

    // size
    const graphW = svg.style("width").replace("px", "");
    const graphH = svg.style("height").replace("px", "");

    // draw bar chart
    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", graphW * this.props.portion)
      .attr("height", graphH)
      .attr("fill", "#CCC");

    // showing a value as a text
    svg
      .append("text")
      .text(Math.round(this.props.value))
      .attrs({
        x: graphW - 5,
        y: graphH / 2,
        fill: "#777",
        "text-anchor": "end",
        "alignment-baseline": "central",
      });
  }

  render() {
    return <svg id={this.props.id} />;
  }
}
