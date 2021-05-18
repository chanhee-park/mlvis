class HistogramFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      from: this.props.feature.min,
      to: this.props.feature.max,
    };
  }

  render() {
    return (
      <div className="component component__histogram">
        <div className="histogram__header">
          <span className="histogram__title">{this.props.feature.name}</span>
          <Button text={"remove"} onClick={this.props.onRemove} />
        </div>
        <HistogramGraph
          id={`iap-histogram-${this.props.feature.name}`}
          feature={this.props.feature}
        />
        <RangeSelection
          fName={this.props.feature.name}
          from={this.state.from}
          to={this.state.to}
          updateRangeValue={(type, value) => {
            this.setState({ [type]: value });
          }}
        />
        <div className="histogram__range-description">
          {`From ${Math.round(this.state.from)} 
          to ${Math.round(this.state.to)}`}
        </div>
      </div>
    );
  }
}

// 아이디어: HistogramGraph 재사용성 높여서 테이블에도 띄우기
class HistogramGraph extends React.Component {
  componentDidMount() {
    this.draw();
  }

  draw() {
    // variable name shortification
    const feature = this.props.feature;

    // set a svg
    const svg = d3.select(`#${this.props.id}`);

    // size
    const svgW = svg.style("width").replace("px", "");
    const svgH = svg.style("height").replace("px", "");
    const paddingT = 5;
    const paddingR = 10;
    const paddingB = 10;
    const paddingL = 10;
    const graphW = svgW - (paddingL + paddingR);
    const graphH = svgH - (paddingT + paddingB);

    // split size
    const numOfSplits = Math.min(feature.uniqueValues.size, 16);
    const splitSize = (feature.max - feature.min) / (numOfSplits - 1);
    const splitsSpaces = [feature.min];
    for (let i = 1; i < numOfSplits; i++) {
      splitsSpaces.push(splitsSpaces[i - 1] + splitSize);
    }

    // count values by split
    const counts = new Array(numOfSplits).fill(0);
    feature.values.forEach((value) => {
      const splitIndex = Math.floor((value - feature.min) / splitSize);
      counts[splitIndex] += 1;
    });

    // set scale functions
    const scaleX = d3
      .scaleLinear()
      .domain([0, numOfSplits])
      .range([paddingL, paddingL + graphW]);

    const scaleH = d3
      .scaleLinear()
      .domain([0, Math.max(...counts)])
      .range([0, graphH]);

    // draw a bar chart for the histogram
    counts.forEach((count, index) => {
      const rectH = scaleH(count);
      svg
        .append("rect")
        .attr("x", scaleX(index))
        .attr("y", svgH - rectH)
        .attr("width", graphW / (numOfSplits * 1.05))
        .attr("height", rectH)
        .attr("fill", "#CCC"); // Light Blue: CBD6E8
    });
  }

  render() {
    return <svg className="histogram__graph" id={this.props.id} />;
  }
}

class RangeSelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mouseDown: false,
      activeCursorId: "none",
      min: this.props.from,
      max: this.props.to,
      from: this.props.from,
      to: this.props.to,
    };
  }

  takeCursor = (e) => {
    this.setState({ mouseDown: true });
    this.setState({ activeCursorId: e.target.id });
    this.setState({ activeCursorName: e.target.name });
  };

  releaseCursor = (e) => {
    this.setState({ mouseDown: false });
  };

  moveCursor = (e) => {
    if (!this.state.mouseDown) return;

    // move cursor
    const rect = e.target.parentElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const cursor = document.getElementById(this.state.activeCursorId);
    cursor.setAttribute("style", `left: ${x - 10}`);

    // set from and to value
    let percentage = x / rect.width;
    if (percentage < 0) percentage = 0;
    if (percentage > 1) percentage = 1;
    this.updateCursorValue(e.target.getAttribute("type"), percentage);
  };

  updateCursorValue(type, percentage) {
    const diffMinMax = this.state.max - this.state.min;
    const value = percentage * diffMinMax + this.state.min;
    this.props.updateRangeValue(type, value);
  }

  render() {
    return (
      <div className="range-selection" onMouseMove={this.moveCursor}>
        <div className="range-selection__bar" />
        <div
          className="range-selection__chip chip__from"
          id={`${this.props.fName}-from`}
          type="from"
          onMouseDown={this.takeCursor}
          onMouseLeave={this.releaseCursor}
          onMouseUp={this.releaseCursor}
        />
        <div
          className="range-selection__chip chip__to"
          id={`${this.props.fName}-to`}
          type="to"
          onMouseDown={this.takeCursor}
          onMouseLeave={this.releaseCursor}
          onMouseUp={this.releaseCursor}
        />
      </div>
    );
  }
}
