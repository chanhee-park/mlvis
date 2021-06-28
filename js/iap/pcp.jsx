class PCP extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstDraw: true,
      augFeatures: new Set(["holiday", "weather"]),
    };
  }

  componentDidMount() {
    this.setDrawingOption();
    this.augmentateInstances();
  }

  componentDidUpdate() {
    if (this.state.firstDraw) {
      this.setState({ firstDraw: false });
      this.drawAll();
    } else {
      this.drawColumnNames();
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

  drawAll() {
    this.state.svg.selectAll("*").remove();
    this.drawAxes();
    this.drawColumnNames();
    this.drawInstances();
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

  drawColumnNames() {
    this.state.svg.selectAll(".column_name").remove();

    this.state.featureNames.forEach((feature, f_index) => {
      // check box for augmentation option
      let checkBox = this.state.augFeatures.has(feature) ? "■" : "□";
      if (feature == "real" || feature == "pred" || feature == "diff") {
        checkBox = "";
      }

      this.state.svg
        .append("text")
        .text(`${feature} ${checkBox}`)
        .attr("x", this.state.scaleX(f_index))
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "hanging")
        .attr("class", "column_name cursor-pointer")
        .on("click", () => {
          if (feature == "real" || feature == "pred" || feature == "diff") {
            return;
          }
          let newAugFeatures = this.state.augFeatures;
          if (newAugFeatures.has(feature)) {
            newAugFeatures.delete(feature);
          } else {
            newAugFeatures.add(feature);
          }
          this.setState({ augFeatures: newAugFeatures });
          this.augmentateInstances();
        });
    });
  }

  drawAxes() {
    this.state.svg.selectAll(".axis_line").remove();

    // draw axis lines and add filter
    this.state.featureNames.forEach((feature, f_index) => {
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
        .attr("stroke-width", 2)
        .attr("class", "axis_lien");
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
              // TODO: 영역 넘어갈 때 처리
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
              this.augmentateInstances();
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

  augmentateInstances() {
    const augmentedAll = {};
    this.props.selectedInstances.forEach((v) => {
      const augmentedByInstance = this.getAugmentationByInstance(v);
      augmentedAll[Data.getInstanceID(v)] = augmentedByInstance;
    });
    this.props.setAugmentatedInstances(augmentedAll);
  }

  getAugmentationByInstance(instance) {
    // get number of Augmentation
    let total = 1;
    this.state.augFeatures.forEach((f) => {
      total *= this.props.features[f].uniqueValues.size;
    });

    // init
    const augmentedByInstance = [];
    for (let i = 0; i < total; i++) {
      const dup = { ...instance };
      dup.original = Data.getInstanceID(instance);
      dup.originalPred = dup.pred;
      dup.pred = dup.pred;
      // dup.pred = Model.predict(dup);
      delete dup.real;
      delete dup.diff;
      augmentedByInstance.push(dup);
    }

    // set values
    this.state.augFeatures.forEach((f) => {
      for (let i = 0; i < total; i++) {
        const uniqs = this.props.features[f].uniqueValues;
        augmentedByInstance[i][f] = uniqs[i % uniqs.size];
      }
    });

    return augmentedByInstance;
  }

  render() {
    return (
      <div className="component component-pcp">
        <svg id="parallel-coordinates" />
      </div>
    );
  }
}
