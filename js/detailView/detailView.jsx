class DetailView extends React.Component {
  hiddenDetailView() {
    document.getElementById("detail-view").style.visibility = "hidden";
  }

  render() {
    console.log(this.props.group)
    return (
      <div className="detail-view" id="detail-view">
        <div className="detail-view__header">
          <div className="detail-view__title">Group Detail</div>
          <div className="detail-view__description">
            Changed Variables: {this.props.group.key} <br/>
            Total Instances: {this.props.group.instances.length}
          </div>
        </div>
        <div className="detail-view__content">
          <DetailTable group={this.props.group} />
        </div>
        <div className="detail-view__footer">
          <div className="flex_pad" />
          <div
            className="detail-view__hide_button"
            onClick={this.hiddenDetailView}
          >
            CLOSE
          </div>
          <div className="flex_pad" />
        </div>
      </div>
    );
  }
}

class DetailTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let features = Object.keys(this.props.group.instances[0]).filter(e => (
      e !== 'id'
      && e !== 'augFeatures'
      && ! e.includes('original')
    ));

    return (
      <div className="block block__table detail-view__table">
        <table>
          <DetailTableHeader
            features={features}
            group={this.props.group}
          />
          <DetailTableBody
            features={features}
            instances={this.props.group.instances}
          />
        </table>
      </div>
    );
  }
}

class DetailTableHeader extends React.Component {
  render() {
    return (
      <thead>
        <tr>
          {this.props.features.map((fName) => (
            <th key={`de-th-${fName}`}>
              <div className="table-header__feature-name">{fName}</div>
            </th>
          ))}
        </tr>
      </thead>
    );
  }
}

class DetailTableBody extends React.Component {
  render() {
    return (
      <tbody className="detail-view__table-body">
      {this.props.instances.map((instance, rowIndex) =>  (
        <tr key={`de-tr-in-${rowIndex}`}>
          {this.props.features.map((feature, colIndex)=> {
            let value = instance[feature];
            if (!isNaN(value)) {
              value = (value * 1).toFixed(3)
            }
            const originalKey = 'original_'+feature;
            const hasOriginal = Object.keys(instance).indexOf(originalKey)
            let originalValue = undefined;
            if(hasOriginal) {
              originalValue = instance[originalKey]
              if (!isNaN(originalValue)) {
                originalValue = (originalValue * 1).toFixed(3)
              }
            }
            const optionalText = originalValue ? ` (original value: ${originalValue})` : ""
            return <td key={`de-td-${rowIndex}-${colIndex}`}>{value} <span className="small_text">{optionalText}</span></td>
          })}
        </tr>
      ))}
      </tbody>
    );
  }
}
