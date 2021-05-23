class PCP extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.draw();
    // TODO: [FIXME] 다시 그릴때, 선만 다시 그리기. (선택 박스 지워짐 ㅠ)
    // size and svg 등 states로 빼기, 축, 인스턴스, 필터 각각 함수로 빼기
  }

  draw() {
    // SVG INFOMATION
    // set svg
    const svg = d3.select(`#parallel-coordinates`);
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
    const scaleColor = d3
      .scaleLinear()
      .domain([
        this.props.features[colorCriteria].min,
        this.props.features[colorCriteria].max,
      ])
      .range([0, 1]);

    // set a line function
    // curve explorer: http://bl.ocks.org/d3indepth/b6d4845973089bc1012dec1674d3aff8
    const lineBasis = d3
      .line()
      .x((p) => p.x)
      .y((p) => p.y)
      .curve(d3.curveMonotoneY); // curveLinear, curveCatmullRom (α=0.5), curveMonotoneY

    // draw line of each instance and selected instance
    this.props.instances.forEach((instance) => {
      // get points for each feature
      const path_points = featureNames.map((feature, f_index) => ({
        x: scaleX(f_index),
        y: scaleY[feature](instance[feature]),
      }));

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

      // draw a line for a instance
      svg
        .append("path")
        .attr("d", lineBasis(path_points))
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("opacity", 0.2)
        .attr("class", "instance-line");
    });

    // draw axis lines and add filter
    featureNames.forEach((feature, f_index) => {
      // column name
      svg
        .append("text")
        .text(feature)
        .attr("x", scaleX(f_index))
        .attr("y", 8)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "hanging");

      // axis line
      svg
        .append("line")
        .attr("x1", scaleX(f_index))
        .attr("x2", scaleX(f_index))
        .attr("y1", scaleY[feature](this.props.features[feature].min))
        .attr("y2", scaleY[feature](this.props.features[feature].max))
        .attr("stroke", "#AAA")
        .attr("stroke-width", 2);
    });

    // add drag filter zone
    featureNames.forEach((feature, f_index) => {
      let filterInfo = { createY: 0, startY: 0, height: 0 };
      let filterRect;
      svg
        .append("rect")
        .attr("x", scaleX(f_index) - 5)
        .attr("y", scaleY[feature](this.props.features[feature].max))
        .attr("width", 10)
        .attr("height", graphH)
        .attr("fill", "#fff")
        .attr("opacity", 0.2)
        .call(
          d3
            .drag()
            .on("start", () => {
              filterInfo.createY = d3.event.y;
              filterInfo.startY = d3.event.y;
              filterRect = svg.append("rect").attrs({
                x: scaleX(f_index) - 5,
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
                scaleBackY[feature](filterInfo.startY + filterInfo.height),
                scaleBackY[feature](filterInfo.startY)
              );

              // 다시 그리기
              this.draw();
              // TODO: remove here. 크기 작을때 삭제
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
