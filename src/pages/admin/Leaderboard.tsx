import { Link } from 'react-router-dom';
import { useData } from '../../context/AppContext';
import { badgeClass, getAllLeaderboard } from '../../data/helpers';

export default function LeaderboardPage() {
  const { architects, visits, salespeople } = useData();
  const board = getAllLeaderboard(architects, visits, salespeople);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Admin</div>
          <h1>Salesperson Leaderboard</h1>
          <p>
            Ranked by leads generated and conversion rate. Open a row to review
            that person’s visits or architects.
          </p>
        </div>
      </div>

      <div className="leaderboard-list">
        {board.map((row, idx) => (
          <div
            key={row.salesperson.id}
            className={`leader-card ${idx === 0 ? 'rank-1' : ''}`}
          >
            <div className="rank-num">{idx + 1}</div>
            <div className="leader-meta">
              <h3>
                {row.salesperson.name}
                <span className={`badge ${badgeClass(row.badge)}`}>
                  {row.badge}
                </span>
              </h3>
              <div className="region">{row.salesperson.region}</div>
              <div className="leader-links">
                <Link
                  to={`/admin/visits?salesperson=${row.salesperson.id}`}
                  className="text-link"
                >
                  View visits
                </Link>
                <span aria-hidden>·</span>
                <Link
                  to={`/admin/architects?salesperson=${row.salesperson.id}`}
                  className="text-link"
                >
                  View architects
                </Link>
              </div>
            </div>
            <div className="leader-stats">
              <div className="s">
                <div className="v">{row.architectsRegistered}</div>
                <div className="l">Architects</div>
              </div>
              <div className="s">
                <div className="v">{row.visitsThisMonth}</div>
                <div className="l">Visits / mo</div>
              </div>
              <div className="s">
                <div className="v">{row.leadsGenerated}</div>
                <div className="l">Leads</div>
              </div>
              <div className="s">
                <div className="v">{row.conversionRate}%</div>
                <div className="l">Conversion</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
