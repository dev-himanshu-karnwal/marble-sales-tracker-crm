import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth, useData } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import LocationPicker, {
  type LatLngValue,
} from '../../components/LocationPicker';
import EmptyState from '../../components/EmptyState';
import { MARBLE_PRODUCTS, REGIONS } from '../../data/mockData';
import type { LeadStatus } from '../../data/types';

export default function AddSitePage() {
  const { id: architectId } = useParams();
  const { user } = useAuth();
  const { architects, addSite } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const arch = architects.find(
    (a) => a.id === architectId && a.salespersonId === user?.salespersonId
  );

  const [form, setForm] = useState({
    name: '',
    address: '',
    region: arch?.region ?? 'Delhi NCR',
    preferredMarble: arch?.preferredMarble ?? MARBLE_PRODUCTS[0],
    leadStatus: 'New' as LeadStatus,
  });
  const [loc, setLoc] = useState<LatLngValue | null>(
    arch?.officeLat && arch?.officeLng
      ? { lat: arch.officeLat, lng: arch.officeLng }
      : null
  );

  if (!arch) {
    return (
      <EmptyState
        title="Architect not found"
        description="You can only add referred sites for architects assigned to you."
        actionLabel="My architects"
        actionTo="/sales"
      />
    );
  }

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!loc) {
      showToast('Pick the site location on the map or use current location.');
      return;
    }
    const created = addSite({
      architectId: arch.id,
      name: form.name,
      address: form.address || form.name,
      region: form.region,
      lat: loc.lat,
      lng: loc.lng,
      leadStatus: form.leadStatus,
      preferredMarble: form.preferredMarble,
    });
    showToast(`Referred site added: ${created.name}`);
    navigate(`/sales/architects/${arch.id}`);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <Link
            to={`/sales/architects/${arch.id}`}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '0.75rem' }}
          >
            Back to {arch.name}
          </Link>
          <div className="eyebrow">Referred site</div>
          <h1>Add project site</h1>
          <p>
            {arch.name} · {arch.firm}. Only add sites they referred for marble —
            not their full project list.
          </p>
        </div>
      </div>

      <form
        className="card card-pad"
        onSubmit={onSubmit}
        style={{ maxWidth: 720 }}
      >
        <div className="form-grid">
          <div className="field full">
            <label htmlFor="name">Site / project name</label>
            <input
              id="name"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Lobby flooring – Phase 2 tower"
            />
          </div>
          <div className="field full">
            <label htmlFor="address">Site address</label>
            <input
              id="address"
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
            <label htmlFor="marble">Marble for this site</label>
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
            <label>Site location</label>
            <LocationPicker
              value={loc}
              onChange={setLoc}
              defaultCenter={
                arch.officeLat && arch.officeLng
                  ? { lat: arch.officeLat, lng: arch.officeLng }
                  : { lat: 28.4595, lng: 77.0266 }
              }
            />
          </div>
        </div>

        <div className="actions-row" style={{ marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary">
            Save referred site
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/sales/architects/${arch.id}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
