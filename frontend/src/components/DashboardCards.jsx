export default function DashboardCards({ cards }) {
  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div key={card.label} className={`stat-card ${card.tone}`}>
          <div className="sc-icon">{card.icon}</div>
          <div className="sc-value">{card.value}</div>
          <div className="sc-label">{card.label}</div>
          <div className="sc-trend">{card.trend}</div>
        </div>
      ))}
    </div>
  );
}
