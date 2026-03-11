import './TopExpenses.css';

const TopExpenses = ({ data }) => {
  const categoryNames = {
    food: "Food & Groceries",
    transport: "Transportation",
    entertainment: "Entertainment",
    subscriptions: "Subscriptions",
  };
  return (
    <div className="top-expenses-container">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Top Expense Categories</h2>

      <div className="expense-header">
        <div>#</div>
        <div>Name</div>
        <div>Popularity</div>
        <div style={{ textAlign: 'right' }}>Sales</div>
      </div>

      {data.map((item) => (
        <div key={item.key} className="expense-row">
          <div className="rank">{item.rank.toString().padStart(2, '0')}</div>
          <div className="category-name">  {categoryNames[item.key] || item.key}
          </div>

          <div className="progress-bar-bg">
            <div
              className={`progress-fill fill-${item.key}`}
              style={{ width: `${item.percent}%` }}
            ></div>
          </div>

          <div className="percent-badge">
            {item.percent}%
          </div>
        </div>
      ))}
    </div>
  );
};
export default TopExpenses;
