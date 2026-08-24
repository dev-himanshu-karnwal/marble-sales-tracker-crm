import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth, useData } from '../../context/AppContext';
import { MARBLE_PRODUCTS, VISIT_OUTCOMES } from '../../data/mockData';
import type { VisitOutcome } from '../../data/types';

function nowLocalInput(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function VisitLogPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { architects, addVisit } = useData();
  const navigate = useNavigate();
  const arch = architects.find(
    (a) => a.id === id && a.salespersonId === user?.salespersonId
  );

  const [date, setDate] = useState(nowLocalInput());
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState<VisitOutcome>('Interested');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [marble, setMarble] = useState(arch?.preferredMarble ?? MARBLE_PRODUCTS[0]);

  if (!arch || !user?.salespersonId) {
    return (
      <div className="empty-state">
        <p>Architect not found.</p>
        <Link to="/sales" className="btn btn-secondary">
          Back
        </Link>
      </div>
    );
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    addVisit({
      architectId: arch.id,
      salespersonId: user.salespersonId!,
      date: new Date(date).toISOString(),
      outcome,
      notes,
      nextFollowUp: nextFollowUp || undefined,
      marbleDiscussed: marble,
    });
    navigate('/sales/history');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Visit log</div>
          <h1>Log visit — {arch.name}</h1>
          <p>
            {arch.siteName}. Date/time is auto-filled; adjust if needed.
          </p>
        </div>
      </div>

      <form
        className="card card-pad"
        onSubmit={onSubmit}
        style={{ maxWidth: 640 }}
      >
        <div className="form-grid">
          <div className="field full">
            <label htmlFor="datetime">Date & time</label>
            <input
              id="datetime"
              type="datetime-local"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="outcome">Outcome</label>
            <select
              id="outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as VisitOutcome)}
            >
              {VISIT_OUTCOMES.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="marble">Marble discussed</label>
            <select
              id="marble"
              value={marble}
              onChange={(e) => setMarble(e.target.value)}
            >
              {MARBLE_PRODUCTS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="field full">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Discussed Makrana White for lobby flooring; client requested honed finish sample."
            />
          </div>
          <div className="field full">
            <label htmlFor="followup">Next follow-up date</label>
            <input
              id="followup"
              type="date"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
            />
          </div>
        </div>

        <div className="actions-row" style={{ marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary">
            Save visit
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
