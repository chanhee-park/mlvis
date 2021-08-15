class HistogramGraph extends React.Component {
  componentDidMount() {
    this.draw();
  }

  draw() {
    // variable for readable code
    const feature = this.props.feature;

    // set a svg
    const svg = d3.select(`#${this.props.id}`);

    // size
    const svgW = svg.style("width").replace("px", "");
    const svgH = svg.style("height").replace("px", "");
    const paddingT = 15;
    const paddingR = 15;
    const paddingB = 15;
    const paddingL = 15;
    const graphW = svgW - (paddingL + paddingR);
    const graphH = svgH - (paddingT + paddingB);

    // datatype
    const isCategorical = CONSTANTS.datatype[feature.name] === "categorical";

    // split size
    const numOfSplits = isCategorical
      ? feature.uniqueValues.size
      : Math.min(feature.uniqueValues.size, 8);
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
      const color = isCategorical
        ? d3.schemePastel1[index % 10]
        : d3.interpolateYlGnBu(0.3 + (index / (numOfSplits - 1)) * 0.2);

      svg
        .append("rect")
        .attr("x", scaleX(index))
        .attr("y", svgH - rectH)
        .attr("width", graphW / numOfSplits - 1)
        .attr("height", rectH)
        .attr("fill", color)
        .attr("opacity", 0.6);
    });

    // write min and max values
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
  }

  render() {
    return <svg className="histogram__graph" id={this.props.id} />;
  }
}
