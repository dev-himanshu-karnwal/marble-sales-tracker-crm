import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useData } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import LocationPicker, {
  type LatLngValue,
} from '../../components/LocationPicker';
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
    region: 'Delhi NCR',
    preferredMarble: 'Italian Statuario',
    siteName: '',
    siteAddress: '',
    siteRegion: 'Delhi NCR',
    siteMarble: 'Italian Statuario',
    siteLead: 'New' as LeadStatus,
  });
  const [officeLoc, setOfficeLoc] = useState<LatLngValue | null>(null);
  const [siteLoc, setSiteLoc] = useState<LatLngValue | null>(null);

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user?.salespersonId) return;
    if (!siteLoc) {
      showToast('Pick a location for the referred project site on the map.');
      return;
    }

    const { architect } = addArchitect(
      {
        name: form.name,
        firm: form.firm,
        phone: form.phone,
        email: form.email,
        address: form.address,
        region: form.region,
        officeLat: officeLoc?.lat,
        officeLng: officeLoc?.lng,
        salespersonId: user.salespersonId,
        preferredMarble: form.preferredMarble,
      },
      {
        name: form.siteName,
        address: form.siteAddress || form.siteName,
        region: form.siteRegion,
        lat: siteLoc.lat,
        lng: siteLoc.lng,
        leadStatus: form.siteLead,
        preferredMarble: form.siteMarble,
      }
    );
    showToast(
      `${architect.name} added with 1 referred site — open profile to add more.`
    );
    navigate(`/sales/architects/${architect.id}`);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Field sales</div>
          <h1>Add Architect</h1>
          <p>
            Register the architect or studio, then add the first project site
            they referred for marble — not every site they work on.
          </p>
        </div>
      </div>

      <form
        className="card card-pad"
        onSubmit={onSubmit}
        style={{ maxWidth: 760 }}
      >
        <h3 className="form-section-title">Architect / studio</h3>
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
            <label htmlFor="address">Studio / office address</label>
            <input
              id="address"
              required
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
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
          <div className="field full">
            <label>Studio location (optional)</label>
            <LocationPicker
              value={officeLoc}
              onChange={setOfficeLoc}
              defaultCenter={{ lat: 28.46, lng: 77.03 }}
            />
          </div>
        </div>

        <h3 className="form-section-title" style={{ marginTop: '1.75rem' }}>
          First referred project site
        </h3>
        <p className="form-section-lead">
          Only sites where the architect wants Kamla marble — check-ins happen
          here (or at the studio).
        </p>
        <div className="form-grid">
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
          <div className="field full">
            <label htmlFor="siteAddress">Site address</label>
            <input
              id="siteAddress"
              value={form.siteAddress}
              onChange={(e) => set('siteAddress', e.target.value)}
              placeholder="Street / area"
            />
          </div>
          <div className="field">
            <label htmlFor="siteRegion">Site region</label>
            <select
              id="siteRegion"
              value={form.siteRegion}
              onChange={(e) => set('siteRegion', e.target.value)}
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="siteMarble">Marble for this site</label>
            <select
              id="siteMarble"
              value={form.siteMarble}
              onChange={(e) => set('siteMarble', e.target.value)}
            >
              {MARBLE_PRODUCTS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="field full">
            <label>Site location</label>
            <LocationPicker
              value={siteLoc}
              onChange={setSiteLoc}
              defaultCenter={{ lat: 28.4595, lng: 77.0266 }}
            />
          </div>
        </div>

        <div className="actions-row" style={{ marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary">
            Save architect & site
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
