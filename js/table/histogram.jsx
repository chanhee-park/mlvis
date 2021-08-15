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
    const paddingT = 10;
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
