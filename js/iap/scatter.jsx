class Scatter extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.draw();
  }

  componentDidUpdate() {
    this.draw();
  }

  draw() {
    // set svg
    const svg = d3.select(`#scatter-plot`);
    svg.selectAll("*").remove();

    // size
    const svgW = svg.style("width").replace("px", "");
    const svgH = svg.style("height").replace("px", "");
    const paddingT = 30;
    const paddingR = 10;
    const paddingB = 0;
    const paddingL = 30;
    const graphW = svgW - (paddingL + paddingR);
    const graphH = svgH - (paddingT + paddingB);

    const featureNames = Object.keys(this.props.features);
    const scatterSize = Math.min(graphW / featureNames.length, graphH);

    // get scale functions for each feature
    const scaleAxisX = d3
      .scaleLinear()
      .domain([0, featureNames.length])
      .range([paddingL, paddingL + graphW]);

    const scales = {};
    featureNames.forEach((feature) => {
      scales[feature] = d3
        .scaleLinear()
        .domain([
          this.props.features[feature].min,
          this.props.features[feature].max,
        ])
        .range([0, scatterSize]);
    });

    const colorCriteria = "pred";
    const scaleColor = d3
      .scaleLinear()
      .domain([
        this.props.features[colorCriteria].min,
        this.props.features[colorCriteria].max,
      ])
      .range([0, 1]);

    // draw axis lines and feature names by each feature
    featureNames.forEach((feature, f_index) => {
      // X axis
      svg
        .append("line")
        .attr("x1", scaleAxisX(f_index))
        .attr("x2", scaleAxisX(f_index + 1))
        .attr("y1", paddingT + scatterSize)
        .attr("y2", paddingT + scatterSize)
        .attr("stroke", "#AAA")
        .attr("stroke-width", 2);

      // Y axis
      svg
        .append("line")
        .attr("x1", scaleAxisX(f_index))
        .attr("x2", scaleAxisX(f_index))
        .attr("y1", paddingT + scatterSize)
        .attr("y2", paddingT)
        .attr("stroke", "#AAA")
        .attr("stroke-width", 2);

      // feature y name
      svg
        .append("text")
        .text(feature)
        .attr("x", scaleAxisX(f_index))
        .attr("y", 8)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "hanging");

      // draw x feature name
      svg
        .append("text")
        .text("real")
        .attr("x", scaleAxisX(f_index + 1))
        .attr("y", paddingT + scatterSize + 4)
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "hanging");
    });

    // draw points of each instance by each feature
    this.props.instances.forEach((instance) => {
      // get color
      const scaledForColor = scaleColor(instance[colorCriteria]);
      let color = d3.interpolateYlGnBu(scaledForColor);
      if (
        this.props.selectedInstances.length > 0 &&
        this.props.selectedInstances.indexOf(instance) < 0
      ) {
        // 인스턴스 선택이 이뤄졌을 때, 선택되지 않은 인스턴스는 무채색으로 표시 한다.
        color = "#eee";
      }

      // draw points
      featureNames.forEach((feature, f_index) => {
        // get position
        const cx = scaleAxisX(f_index) + scales["real"](instance["real"]);
        const cy = paddingT + scatterSize - scales[feature](instance[feature]);
        svg
          .append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", 2)
          .attr("fill", color)
          .attr("opacity", 0.25);
      });
    });
  }

  render() {
    return (
      <div className="component component-scatter">
        <svg id="scatter-plot" />
      </div>
    );
  }
}
