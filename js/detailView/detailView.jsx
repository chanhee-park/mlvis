class DetailView extends React.Component {
  hiddenDetailView() {
    document.getElementById("detail-view").style.visibility = "hidden";
  }

  render() {
    return (
        <div className="detail-view" id="detail-view">
          <div className="detail-view__header">
            <div className="detail-view__title">Group Detail</div>
          </div>
          <div className="detail-view__content">Group Detail</div>
          <div className="detail-view__footer">
            <div className="flex_pad"/>
            <div className="detail-view__hide_button" onClick={this.hiddenDetailView}>CLOSE</div>
            <div className="flex_pad"/>
          </div>
        </div>
    )
  }
}
