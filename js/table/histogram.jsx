class HistogramGraph extends React.Component {
  componentDidMount() {
    this.draw(this.props.feature);
    if (this.props.comparator !== undefined) {
      this.draw(this.props.comparator, true);
    }
  }

  // TODO: 화살표 그리기, 텍스트 쓰기 등 함수 분리
  draw(feature, onlyStroke = false) {
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
      // TODO: 화살표 모양 다듬기
      const arrowStrokeWdith = 10;
      svg
        .append("line")
        .attr("x1", 30)
        .attr("x2", svgW - 30)
        .attr("y1", paddingT / 2)
        .attr("y2", paddingT / 2)
        .attr("stroke", this.props.isPosAug ? "#CADCEC" : "#FCCBC7")
        .attr("stroke-width", arrowStrokeWdith);
      if (this.props.isPosAug) {
        svg
          .append("line")
          .attr("x1", svgW - 30)
          .attr("x2", svgW - 50)
          .attr("y1", paddingT / 2 - 3)
          .attr("y2", paddingT / 2 + 10)
          .attr("stroke", "#CADCEC")
          .attr("stroke-width", arrowStrokeWdith);
        svg
          .append("line")
          .attr("x1", svgW - 30)
          .attr("x2", svgW - 50)
          .attr("y1", paddingT / 2 + 3)
          .attr("y2", paddingT / 2 - 10)
          .attr("stroke", "#CADCEC")
          .attr("stroke-width", arrowStrokeWdith);
      } else {
        svg
        .append("line")
        .attr("x1", 30)
        .attr("x2", 50)
        .attr("y1", paddingT / 2 - 3)
        .attr("y2", paddingT / 2 + 10)
        .attr("stroke", "#FCCBC7")
        .attr("stroke-width", arrowStrokeWdith);
      svg
        .append("line")
        .attr("x1", 30)
        .attr("x2", 50)
        .attr("y1", paddingT / 2 + 3)
        .attr("y2", paddingT / 2 - 10)
        .attr("stroke", "#FCCBC7")
        .attr("stroke-width", arrowStrokeWdith);
       
      }
    }
  }

  render() {
    return <svg className="histogram__graph" id={this.props.id} />;
  }
}
