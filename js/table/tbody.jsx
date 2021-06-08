class TableBody extends React.Component {
  render() {
    return (
      <tbody>
        {this.props.instances.map((v) => {
          const augmentatedByInstance =
            this.props.augmentatedInstances[Data.getInstanceID(v)];
          return (
            <TableRow
              key={`tr-out-${Data.getInstanceID(v)}`}
              instance={v}
              features={this.props.features}
              augmentatedInstances={
                augmentatedByInstance ? augmentatedByInstance : []
              }
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
          <TableFocusedCell
            instance={this.props.instance}
            augmentatedInstances={this.props.augmentatedInstances}
          />
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
  // this.props.instance
  // this.props.augmentatedInstances
  render() {
    return (
      <td className="focused">
        <div className="focused-card">
          <div className="wellcome-message">{`
              This is a focused instance and it's augmentated instances.
            `}</div>
          <div>
            {this.props.augmentatedInstances.map((v, i) => {
              return (
                <div
                  key={`${Data.getInstanceID(v)}-augmentation_${i}`}
                >{`${i+1} ${JSON.stringify(v)}`}</div>
              );
            })}
          </div>
        </div>
      </td>
    );
  }
}
