// Feature Importance Plot
function FIP({ importances }) {
  // totalFeatures 변수로 처리
  const totalFeatures = [
    `season`,
    `holiday`,
    `weather`,
    `temp`,
    `atemp`,
    `humidity`,
    `windspeed`,
  ];
  importances.sort((a, b) => (a.value < b.value ? 1 : -1));

  return (
    <div className="block block__fip">
      <div className="fip__header fip__row">
        {totalFeatures.map((feature) => {
          return (
            <div className="fip__item" key={`headerItem-${feature}`}>
              {feature}
            </div>
          );
        })}
        <div className="fip__item" key={`headerItem-value`}>
          value
        </div>
      </div>

      <div className="fip__content">
        {importances.map((e, i) => {
          return (
            <div key={`importanceItem-${i}`}>
              <ImportanceItem
                totalFeatures={totalFeatures}
                features={e.features}
                value={e.value}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ImportanceItem({ totalFeatures, features, value }) {
  return (
    <div className="importance-item fip__row">
      {totalFeatures.map((feature, i) => {
        if (features.has(feature)) {
          return (
            <div key={i} className="fip__item fip__item__has">
              <span className="material-icons">fiber_manual_record</span>
            </div>
          );
        } else {
          return <div key={i} className="fip__item fip__item__has-not"></div>;
        }
      })}
      <div className="fip__item fip__item__value">
        <div className={`barchart barchart-${Math.round(value * 10)}`}>
          {value}
        </div>
      </div>
    </div>
  );
}
