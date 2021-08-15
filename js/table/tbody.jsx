class TableBody extends React.Component {
  render() {
    return (
      <tbody>
        {Object.entries(this.props.augGroups).map((ent) => {
          const key = ent[0];
          const group = ent[1];
          const augsObj = Data.arr2obj(this.props.augmentations);
          return (
            <TableRow
              key={`tr-out-${key}`}
              features={this.props.features}
              group={group}
              groupKey={key}
              augsObj={augsObj}
              // TODO: Focused Group
              // isFocused={instance === this.props.focusedInstance}
              // setFocusedInstance={this.props.setFocusedInstance}
            />
          );
        })}
      </tbody>
    );
  }
}

class TableRow extends React.Component {
  render() {
    return (
      <tr
        key={`tr-in-${this.props.groupKey}`}
        onClick={() => {
          console.log("On click - a table row");
        }}
      >
        {Object.values(this.props.features).map((feature) => {
          const key = `${this.props.groupKey}-${feature.name}`;
          return (
            <td key={`td-${key}`}>
              <TableCell
                group={this.props.group}
                augsObj={this.props.augsObj}
                fname={feature.name}
                visId={key}
              />
            </td>
          );
        })}
        {/* {this.props.isFocused && (
          <TableFocusedCell instance={this.props.instance} />
        )} */}
      </tr>
    );
  }
}

class TableCell extends React.Component {
  render() {
    const isNumeric = CONSTANTS.datatype[this.props.fname] == "numeric";
    const isAuged = false;

    const augsFeatureInfo = {
      name: this.props.fname,
      min: Infinity,
      max: -Infinity,
      values: [],
      uniqueValues: new Set(),
    };
    // TODO: auged feature인 경우 original도 보여준다.
    // const originalFeatureInfo = {
    //   name: this.props.fname,
    //   min: Infinity,
    //   max: -Infinity,
    //   values: [],
    //   uniqueValues: new Set(),
    // };

    this.props.group.instanceIds.forEach((id) => {
      const aug = this.props.augsObj[id];
      const val = aug[this.props.fname];
      augsFeatureInfo.min = Math.min(augsFeatureInfo.min, val);
      augsFeatureInfo.max = Math.max(augsFeatureInfo.max, val);
      augsFeatureInfo.values.push(val);
      augsFeatureInfo.uniqueValues.add(val);
      // if (isAuged) {
      //   originalFeatureInfo.min = Math.min(augsFeatureInfo.min, val);
      //   originalFeatureInfo.max = Math.max(augsFeatureInfo.max, val);
      //   originalFeatureInfo.values.push(val);
      //   originalFeatureInfo.uniqueValues.push(val);
      // }
    });
    return (
      <span>
        hey
        {/* {isNumeric && <TableBoxPlot />}
        {!isNumeric && (
          <TableHistogram
            feautreInfo={augsFeatureInfo}
            visId={this.props.visId}
          />
        )} */}
      </span>
    );
  }
}

class TableBoxPlot extends React.Component {
  render() {
    return <span>BOX PLOT</span>;
  }
}

class TableHistogram extends React.Component {
  render() {
    return (
      <HistogramGraph feautre={this.props.feautreInfo} id={this.props.visId} />
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
              These are augmentated instances of the focused instance.
            `}</div>
          <div></div>
        </div>
      </td>
    );
  }
}
