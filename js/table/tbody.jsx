//TODO: 인스턴스가 아니라 그룹이 정렬되도록 테이블 헤더 클릭 인터랙션 수정
class TableBody extends React.Component {
  render() {
    return (
      <tbody>
        {this.props.augGroups.map((group, rowIndex) => {
          const augsObj = Data.arr2obj(this.props.augmentations);
          return (
            <TableRow
              key={`tr-out-${rowIndex}`}
              features={this.props.features}
              group={group}
              rowIndex={rowIndex}
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
        key={`tr-in-${this.props.rowIndex}`}
        onClick={() => {
          console.log("On click - a table row");
        }}
      >
        {Object.values(this.props.features).map((feature, colIndex) => {
          const fname = feature.name;
          const key = `tr-${this.props.rowIndex}-tc-${colIndex}`;
          const augFeatures = this.props.group.augFeatures;
          const groupKey = this.props.group.key;
          const isAuged = augFeatures.has(fname);

          let isPosAug = false;
          if (
            isAuged &&
            groupKey.split(fname)[1] &&
            groupKey.split(fname)[1][0] === "+"
          ) {
            isPosAug = true;
          }

          return (
            <td key={key}>
              <TableCell
                key = {`cell-${key}`}
                group={this.props.group}
                augsObj={this.props.augsObj}
                features={this.props.features}
                fname={fname}
                isAgued={isAuged}
                isPosAug={isPosAug}
                visId={`vis-${key}`}
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
  constructor(props) {
    super(props);
    this.state = { featureInfo : {
        name: this.props.fname,
        min: this.props.features[this.props.fname].min,
        max: this.props.features[this.props.fname].max,
        uniqueValues: this.props.features[this.props.fname].uniqueValues,
      } };
  }

  render() {
    return (
      <span>
        <HistogramGraph
          id={this.props.visId}
          group={this.props.group}
          feature={this.state.featureInfo}
          isPosAug={this.props.isPosAug}
        />
      </span>
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
