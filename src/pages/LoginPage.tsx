import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Building2, Shield, UserRound } from 'lucide-react';
import { useAuth, useData } from '../context/AppContext';
import heroImg from '../assets/hero.png';

export default function LoginPage() {
  const { user, loginAdmin, loginSalesperson } = useAuth();
  const { salespeople } = useData();
  const navigate = useNavigate();
  const [pickingSales, setPickingSales] = useState(false);

  useEffect(() => {
    if (!user) return;
    navigate(user.role === 'admin' ? '/admin' : '/sales', { replace: true });
  }, [user, navigate]);

  if (user) {
    return (
      <Navigate to={user.role === 'admin' ? '/admin' : '/sales'} replace />
    );
  }

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
        <div
          className="login-hero"
          style={{ backgroundImage: `linear-gradient(160deg, rgba(42, 38, 34, 0.88), rgba(42, 38, 34, 0.55)), url(${heroImg})` }}
        >
          <div>
            <div className="brand">DCT Marble</div>
            <p>
              Field sales CRM for architects, site visits, and marble leads —
              sample workspace with representative field data.
            </p>
          </div>
        </div>

        <div className="login-body">
          <h2>Enter the workspace</h2>
          <p className="lead">
            Explore as Admin or Field Sales to walk through the product.
          </p>

          <div className="role-cards">
            <button type="button" className="role-card" onClick={enterAdmin}>
              <div className="title">
                <Shield size={18} color="#b08d57" />
                Explore as Admin
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
                Explore as Field Sales
              </div>
              <div className="desc">
                Manage architects, check in at sites, and log visit outcomes.
              </div>
            </button>
          </div>

          {pickingSales && (
            <div className="sp-picker">
              <p className="lead" style={{ marginBottom: '0.75rem' }}>
                Select a salesperson:
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
