class PCP extends React.Component {
  constructor(props) {
    super(props);
    this.state = { firstDraw: true };
  }

  componentDidMount() {
    this.setDrawingOption();
  }

  componentDidUpdate() {
    if (this.state.firstDraw) {
      this.setState({ firstDraw: false });
      this.draw();
    } else {
      this.drawInstances();
    }
  }

  setDrawingOption() {
    // svg size
    const svg = d3.select(`#parallel-coordinates`);
    const svgW = svg.style("width").replace("px", "");
    const svgH = svg.style("height").replace("px", "");
    const paddingT = 40;
    const paddingR = 10;
    const paddingB = 0;
    const paddingL = 30;
    const graphW = svgW - (paddingL + paddingR);
    const graphH = svgH - (paddingT + paddingB);

    // SCALE: set scale functions for each feature
    // SCALE X: feature name -> x position
    const featureNames = Object.keys(this.props.features);
    const colSize = graphW / featureNames.length;
    const scaleX = d3
      .scaleLinear()
      .domain([0, featureNames.length])
      .range([paddingL + colSize / 2, paddingL + graphW + colSize / 2]);

    // SCALE Y: feature value -> y position
    const scaleY = {};
    featureNames.forEach((feature) => {
      scaleY[feature] = d3
        .scaleLinear()
        .domain([
          this.props.features[feature].min,
          this.props.features[feature].max,
        ])
        .range([paddingT + graphH, paddingT]);
    });

    // SCALE BACK Y: y position -> feature value
    const scaleBackY = {};
    featureNames.forEach((feature) => {
      scaleBackY[feature] = d3
        .scaleLinear()
        .domain([paddingT + graphH, paddingT])
        .range([
          this.props.features[feature].min,
          this.props.features[feature].max,
        ]);
    });

    const colorCriteria = "pred";
    // [0, 1]로 하면 높은 밝기 값을 갖는 인스턴스가 잘 보이지 않아서 [0.25, 1]로 스케일링 함
    const scaleColor = d3
      .scaleLinear()
      .domain([
        this.props.features[colorCriteria].min,
        this.props.features[colorCriteria].max,
      ])
      .range([0.25, 1]);

    // set a line function
    // curve explorer: http://bl.ocks.org/d3indepth/b6d4845973089bc1012dec1674d3aff8
    const lineBasis = d3
      .line()
      .x((p) => p.x)
      .y((p) => p.y)
      .curve(d3.curveMonotoneY); // curveLinear, curveCatmullRom (α=0.5), curveMonotoneY

    this.setState({
      svg,
      graphW,
      graphH,
      scaleX,
      scaleY,
      scaleBackY,
      scaleColor,
      colorCriteria,
      lineBasis,
      featureNames,
    });
  }

  draw() {
    this.state.svg.selectAll("*").remove();
    this.drawInstances();
    this.drawAxes();
    this.addFilterZone();
  }

  drawInstances() {
    this.state.svg.selectAll(".instance-line").remove();

    // draw instance lines
    this.props.instances.forEach((instance) => {
      // get points for each feature
      const path_points = this.state.featureNames.map((feature, f_index) => ({
        x: this.state.scaleX(f_index),
        y: this.state.scaleY[feature](instance[feature]),
      }));

      // get styles
      const scaledForColor = this.state.scaleColor(
        instance[this.state.colorCriteria]
      );
      let color = d3.interpolateYlGnBu(scaledForColor);
      let strokeWidth = 2;
      let opacity = 0.2;

      // style for not-selected when there are any selected instance.
      if (
        this.props.selectedInstances.length > 0 &&
        this.props.selectedInstances.indexOf(instance) === -1
      ) {
        color = "#eee";
      }

      // style for focused
      if (this.props.focusedInstance === instance) {
        color = "#F95";
        strokeWidth = 5;
        opacity = 1;
      }

      // draw a instance as a line
      this.state.svg
        .append("path")
        .attr("d", this.state.lineBasis(path_points))
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", strokeWidth)
        .attr("opacity", opacity)
        .attr("class", "instance-line");
    });
  }

  drawAxes() {
    // draw axis lines and add filter
    this.state.featureNames.forEach((feature, f_index) => {
      // column name
      this.state.svg
        .append("text")
        .text(feature)
        .attr("x", this.state.scaleX(f_index))
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "hanging");

      // axis line
      this.state.svg
        .append("line")
        .attr("x1", this.state.scaleX(f_index))
        .attr("x2", this.state.scaleX(f_index))
        .attr(
          "y1",
          this.state.scaleY[feature](this.props.features[feature].min)
        )
        .attr(
          "y2",
          this.state.scaleY[feature](this.props.features[feature].max)
        )
        .attr("stroke", "#AAA")
        .attr("stroke-width", 2);
    });
  }

  addFilterZone() {
    // add drag filter zone
    this.state.featureNames.forEach((feature, f_index) => {
      let filterInfo = { createY: 0, startY: 0, height: 0 };
      let filterRect;
      this.state.svg
        .append("rect")
        .attr("x", this.state.scaleX(f_index) - 5)
        .attr("y", this.state.scaleY[feature](this.props.features[feature].max))
        .attr("width", 10)
        .attr("height", this.state.graphH)
        .attr("fill", "#fff")
        .attr("opacity", 0.2)
        .call(
          d3
            .drag()
            .on("start", () => {
              filterInfo.createY = d3.event.y;
              filterInfo.startY = d3.event.y;
              filterRect = this.state.svg.append("rect").attrs({
                x: this.state.scaleX(f_index) - 5,
                y: d3.eventY,
                width: 10,
                height: 0,
                fill: "#58F",
                opacity: 0.5,
                class: "temp_filter_rect",
              });
            })
            .on("drag", () => {
              filterInfo.startY = Math.min(filterInfo.createY, d3.event.y);
              filterInfo.height = Math.abs(filterInfo.createY - d3.event.y);
              filterRect.attrs({
                y: filterInfo.startY,
                height: filterInfo.height,
              });
              // todo: 영역 넘어갈 때 처리
              // https://github.com/chanhee-park/parallelCoordinateTitanic/blob/master/scripts/parallel_201521076.js
            })
            .on("end", () => {
              // 필터링 처리
              this.filter(
                feature,
                this.state.scaleBackY[feature](
                  filterInfo.startY + filterInfo.height
                ),
                this.state.scaleBackY[feature](filterInfo.startY)
              );

              // TODO: 크기 작을때 삭제
            })
        );
    });
  }

  filter(fName, from, to) {
    const original =
      this.props.selectedInstances.length > 0
        ? this.props.selectedInstances
        : this.props.instances;

    const filtered = original.filter((v) => v[fName] >= from && v[fName] <= to);

    this.props.setSelectedInstances(filtered);
  }

  render() {
    return (
      <div className="component component-pcp">
        <svg id="parallel-coordinates" />
      </div>
    );
  }
}
