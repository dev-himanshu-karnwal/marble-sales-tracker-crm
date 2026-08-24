import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Shield, UserRound } from 'lucide-react';
import { useAuth } from '../context/AppContext';
import { salespeople } from '../data/mockData';

export default function LoginPage() {
  const { loginAdmin, loginSalesperson } = useAuth();
  const navigate = useNavigate();
  const [pickingSales, setPickingSales] = useState(false);

  const enterAdmin = () => {
    loginAdmin();
    navigate('/admin');
  };

  const enterSales = (id: string) => {
    loginSalesperson(id);
    navigate('/sales');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-hero">
          <div>
            <div className="brand">DCT Marble</div>
            <p>
              Field sales CRM for architects, site visits, and marble leads —
              demo experience with live mock data.
            </p>
          </div>
        </div>

        <div className="login-body">
          <h2>Enter the workspace</h2>
          <p className="lead">
            Choose a role to explore the demo. No password required.
          </p>

          <div className="role-cards">
            <button type="button" className="role-card" onClick={enterAdmin}>
              <div className="title">
                <Shield size={18} color="#b08d57" />
                Admin
              </div>
              <div className="desc">
                Full visibility — dashboards, leaderboard, map, all architects &
                visits.
              </div>
            </button>

            <button
              type="button"
              className="role-card"
              onClick={() => setPickingSales((v) => !v)}
            >
              <div className="title">
                <UserRound size={18} color="#b08d57" />
                Salesperson
              </div>
              <div className="desc">
                Manage architects, check in at sites, and log visit outcomes.
              </div>
            </button>
          </div>

          {pickingSales && (
            <div className="sp-picker">
              <p className="lead" style={{ marginBottom: '0.75rem' }}>
                Select a salesperson persona:
              </p>
              <div className="sp-list">
                {salespeople.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    className="sp-option"
                    onClick={() => enterSales(sp.id)}
                  >
                    <div className="avatar">{sp.avatarInitials}</div>
                    <div className="info">
                      <div className="n">{sp.name}</div>
                      <div className="r">
                        <Building2
                          size={12}
                          style={{ display: 'inline', marginRight: 4 }}
                        />
                        {sp.region}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
