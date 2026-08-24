import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useData } from '../../context/AppContext';
import {
  countLeads,
  getLeadsByMarble,
  getVisitsPerSalesperson,
  getVisitsTrend,
  isThisMonth,
} from '../../data/helpers';

const PIE_COLORS = [
  '#b08d57',
  '#2a2622',
  '#3d6b4f',
  '#3d5a73',
  '#8b3a3a',
  '#9a6b2f',
  '#8a8278',
];

export default function AdminDashboard() {
  const { architects, visits, salespeople } = useData();
  const visitsThisMonth = visits.filter((v) => isThisMonth(v.date)).length;
  const totalLeads = countLeads(visits);
  const barData = getVisitsPerSalesperson(visits, salespeople);
  const trendData = getVisitsTrend(visits, 30);
  const pieData = getLeadsByMarble(visits);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Admin</div>
          <h1>Dashboard</h1>
          <p>
            Overview of field activity across DCT Marble sales territories for
            August 2026.
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Total Architects</div>
          <div className="value">{architects.length}</div>
          <div className="hint">Registered across all regions</div>
        </div>
        <div className="stat-card">
          <div className="label">Visits this month</div>
          <div className="value">{visitsThisMonth}</div>
          <div className="hint">Field check-ins logged</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Leads</div>
          <div className="value">{totalLeads}</div>
          <div className="hint">Outcome: Lead Generated</div>
        </div>
        <div className="stat-card">
          <div className="label">Active Salespeople</div>
          <div className="value">{salespeople.length}</div>
          <div className="hint">Delhi NCR · Jaipur · Mumbai +</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card chart-card">
          <h3>Visits per salesperson</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4ddd3" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8a8278' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#8a8278' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e4ddd3',
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="visits" fill="#b08d57" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <h3>Leads by marble type</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e4ddd3',
                    fontSize: 13,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) =>
                    value.length > 16 ? `${value.slice(0, 14)}…` : value
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card chart-card">
        <h3>Visits trend — last 30 days</h3>
        <div className="chart-wrap" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4ddd3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#8a8278' }}
                interval={4}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#8a8278' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #e4ddd3',
                  fontSize: 13,
                }}
              />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="#2a2622"
                strokeWidth={2.5}
                dot={{ fill: '#b08d57', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
