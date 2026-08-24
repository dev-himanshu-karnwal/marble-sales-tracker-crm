import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useData } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { MARBLE_PRODUCTS, REGIONS } from '../../data/mockData';
import type { LeadStatus } from '../../data/types';

export default function AddArchitectPage() {
  const { user } = useAuth();
  const { addArchitect } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    firm: '',
    phone: '',
    email: '',
    address: '',
    siteName: '',
    region: 'Delhi NCR',
    lat: '28.4595',
    lng: '77.0266',
    preferredMarble: 'Italian Statuario',
    leadStatus: 'New' as LeadStatus,
  });

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user?.salespersonId) return;
    const created = addArchitect({
      name: form.name,
      firm: form.firm,
      phone: form.phone,
      email: form.email,
      address: form.address,
      siteName: form.siteName,
      region: form.region,
      lat: parseFloat(form.lat) || 28.4595,
      lng: parseFloat(form.lng) || 77.0266,
      salespersonId: user.salespersonId,
      leadStatus: form.leadStatus,
      preferredMarble: form.preferredMarble,
    });
    showToast(`${created.name} registered — ready for site check-in.`);
    navigate(`/sales/architects/${created.id}`);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Field sales</div>
          <h1>Add New Architect</h1>
          <p>
            Register an architect or studio and link them to a project site.
            Site coordinates are pre-filled and editable.
          </p>
        </div>
      </div>

      <form className="card card-pad" onSubmit={onSubmit} style={{ maxWidth: 720 }}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="name">Architect name</label>
            <input
              id="name"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Kabir Malhotra"
            />
          </div>
          <div className="field">
            <label htmlFor="firm">Firm / studio</label>
            <input
              id="firm"
              required
              value={form.firm}
              onChange={(e) => set('firm', e.target.value)}
              placeholder="e.g. Studio Arcline"
            />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              required
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+91 …"
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>
          <div className="field full">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              required
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
            />
          </div>
          <div className="field full">
            <label htmlFor="site">Site / project name</label>
            <input
              id="site"
              required
              value={form.siteName}
              onChange={(e) => set('siteName', e.target.value)}
              placeholder="e.g. Residential Villa – Sector 45, Gurugram"
            />
          </div>
          <div className="field">
            <label htmlFor="region">Region</label>
            <select
              id="region"
              value={form.region}
              onChange={(e) => set('region', e.target.value)}
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="marble">Preferred marble</label>
            <select
              id="marble"
              value={form.preferredMarble}
              onChange={(e) => set('preferredMarble', e.target.value)}
            >
              {MARBLE_PRODUCTS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="lat">Site latitude</label>
            <input
              id="lat"
              value={form.lat}
              onChange={(e) => set('lat', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="lng">Site longitude</label>
            <input
              id="lng"
              value={form.lng}
              onChange={(e) => set('lng', e.target.value)}
            />
          </div>
        </div>

        <div className="actions-row" style={{ marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary">
            Save architect
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/sales')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
