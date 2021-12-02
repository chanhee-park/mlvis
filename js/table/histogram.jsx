class Histogram extends React.Component {
  componentDidMount() {
    this.drawWrapper();
  }

  componentDidUpdate(prevProps) {
    if (this.props.group && this.props.group.key !== prevProps.group.key) {
      const svg = d3.select(`#${this.props.id}`);
      svg.selectAll("*").remove();
      this.drawWrapper();
    }
  }

  drawWrapper() {
    if (this.props.group) {

      // set values
      const values = this.props.group.instances.map(
        (instance) => instance[this.props.feature.name]
      );
      let ogValues = [];
      if (this.props.group.augFeatures.has(this.props.feature.name)) {
        ogValues = this.props.group.instances.map(
          (instance) => instance[`original_${this.props.feature.name}`]
        );
      }

      // draw
      if (ogValues.length > 0) {
        this.draw(this.props.feature, ogValues, values, false);
        this.draw(this.props.feature, values, ogValues, true);
      } else {
        this.draw(this.props.feature, values, ogValues, ogValues.length > 0);
      }
    }
  }

  draw(feature, values, otherValues, onlyStroke) {
    // set a svg
    const svg = d3.select(`#${this.props.id}`);

    // size
    const svgW = svg.style("width").replace("px", "");
    const svgH = svg.style("height").replace("px", "");
    const paddingT = 50;
    const paddingR = 10;
    const paddingB = 0;
    const paddingL = 10;
    const graphW = svgW - (paddingL + paddingR);
    const graphH = svgH - (paddingT + paddingB);

    // datatype
    const isCategorical = CONSTANTS.datatype[feature.name] === "categorical";

    // split size
    const numOfSplits = isCategorical
      ? feature.uniqueValues.size
      : Math.min(feature.uniqueValues.size, 9);
    const splitSize = (feature.max - feature.min) / (numOfSplits - 1);
    const splitsSpaces = [feature.min];
    for (let i = 1; i < numOfSplits; i++) {
      splitsSpaces.push(splitsSpaces[i - 1] + splitSize);
    }

    // count values by split
    const counts = new Array(numOfSplits).fill(0);
    values.forEach((value) => {
      const splitIndex = Math.floor((value - feature.min) / splitSize);
      if (!isNaN(splitIndex)) {
        counts[splitIndex] += 1;
      }
    });

    const otherCounts = new Array(numOfSplits).fill(0);
    otherValues.forEach((value) => {
      const splitIndex = Math.floor((value - feature.min) / splitSize);
      if (!isNaN(splitIndex)) {
        otherCounts[splitIndex] += 1;
      }
    });

    const maxCounts = Math.max(Math.max(...counts), Math.max(...otherCounts));

    // set scale functions
    const scaleX = d3
      .scaleLinear()
      .domain([0, numOfSplits])
      .range([paddingL, paddingL + graphW]);

    const scaleH = d3
      .scaleLinear()
      .domain([0, maxCounts + 1])
      .range([0, graphH]);

    // draw a bar chart for the histogram
    counts.forEach((count, index) => {
      const rectH = scaleH(count);
      const x = scaleX(index);
      const y = svgH - rectH;
      const w = graphW / numOfSplits - 1;
      const h = rectH;
      if (x > 0 && y > 0 && w > 0 && h > 0) {
        // 위 if 문은 0 이하 또는 undefineded일 때 발생하는 에러를 막아준다.
        const strokeW = onlyStroke ? 1 : 0;
        let color = "#ccc";
        if (onlyStroke) {
          color = "transparent";
        } else if (isCategorical) {
          color = d3.schemePastel1[index % 10];
        } else {
          color = d3.interpolateYlGnBu(0.3 + (index / (numOfSplits - 1)) * 0.2);
        }
        svg
          .append("rect")
          .attr("x", x)
          .attr("y", y)
          .attr("width", w)
          .attr("height", h)
          .attr("fill", color)
          .attr("opacity", 0.7)
          .attr("stroke", "#000")
          .attr("stroke-width", strokeW);
      }
    });

    if (!onlyStroke) {
      // When it is not comparator, write min and max values
      svg
        .append("text")
        .text(Math.ceil(feature.min))
        .attr("x", scaleX(0))
        .attr("y", svgH)
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "baseline")
        .attr("font-size", 12)
        .attr("font-weight", 400);

      svg
        .append("text")
        .text(Math.floor(feature.max))
        .attr("x", scaleX(counts.length))
        .attr("y", svgH)
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "baseline")
        .attr("font-size", 12)
        .attr("font-weight", 400);
    } else {
      // When it is comparator, write direction of feature change
      const pointRadius = 10;
      const cx = this.props.isPosAug
        ? svgW - paddingL - pointRadius
        : paddingR + pointRadius;
      const cy = paddingT / 2;
      const color = this.props.isPosAug ? "#CADCEC" : "#FCCBC7";
      svg
        .append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", pointRadius)
        .attr("fill", color);

      const imageSize = 10;
      const imageX = cx - imageSize / 2;
      const direction = this.props.isPosAug ? "right" : "left";
      svg
        .append("svg:image")
        .attr("xlink:href", `/images/${direction}-arrow.png`)
        .attr("x", imageX)
        .attr("y", cy - imageSize / 2)
        .attr("width", imageSize)
        .attr("height", imageSize);
    }
  }

  render() {
    return <svg className="histogram__graph" id={this.props.id} />;
  }
}
