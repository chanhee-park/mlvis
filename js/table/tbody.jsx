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
              setHoveredGroup={this.props.setHoveredGroup}
              setSelectedGroup={this.props.setSelectedGroup}
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
          this.props.setSelectedGroup(this.props.group)
          document.getElementById("detail-view").style.visibility = "visible";
        }}
        onMouseOver={(e)=> {
          this.props.setHoveredGroup(this.props.group)
          const tooltipSpan = document.getElementById("table__tooltip")
          const x = e.clientX;
          const y = e.clientY;
          tooltipSpan.style.visibility = "visible";
          tooltipSpan.style.top = (y + 30) + 'px';
          tooltipSpan.style.left = (x + 30) + 'px';
        }}
        onMouseLeave={()=>{
          document.getElementById("table__tooltip").style.visibility = "hidden";
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
        <Histogram
          id={this.props.visId}
          group={this.props.group}
          feature={this.state.featureInfo}
          isPosAug={this.props.isPosAug}
        />
      </span>
    );
  }
}

