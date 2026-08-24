import { Printer, Share2 } from 'lucide-react';
import type { Architect, Site, Visit } from '../data/types';
import { formatDate, formatDateTime, outcomeClass } from '../data/helpers';

interface VisitSummaryCardProps {
  visit: Visit;
  architect?: Architect;
  site?: Site;
  salespersonName?: string;
  onDismiss?: () => void;
}

export default function VisitSummaryCard({
  visit,
  architect,
  site,
  salespersonName,
  onDismiss,
}: VisitSummaryCardProps) {
  const place =
    visit.checkInType === 'office'
      ? architect
        ? `${architect.firm} (office)`
        : 'Architect office'
      : site?.name ?? 'Project site';

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const text = [
      `Jindal Marble — Visit summary`,
      architect ? `${architect.name} · ${place}` : place,
      `Type: ${visit.checkInType === 'office' ? 'Office' : 'Site'}`,
      `Outcome: ${visit.outcome}`,
      visit.marbleDiscussed ? `Marble: ${visit.marbleDiscussed}` : '',
      `When: ${formatDateTime(visit.date)}`,
      visit.nextFollowUp ? `Follow-up: ${formatDate(visit.nextFollowUp)}` : '',
      visit.notes,
    ]
      .filter(Boolean)
      .join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Visit summary', text });
        return;
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="visit-summary-card card card-pad">
      <div className="visit-summary-head">
        <div>
          <div className="eyebrow">Visit summary</div>
          <h2>{architect?.name ?? 'Architect'}</h2>
          <p>
            {place}
            {salespersonName ? ` · ${salespersonName}` : ''}
          </p>
        </div>
        <div className="visit-summary-actions no-print">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleShare}
          >
            <Share2 size={14} />
            Share
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handlePrint}
          >
            <Printer size={14} />
            Print
          </button>
          {onDismiss && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onDismiss}
            >
              Dismiss
            </button>
          )}
        </div>
      </div>

      <div className="visit-summary-grid">
        <div>
          <span className="k">Date</span>
          <span className="v">{formatDateTime(visit.date)}</span>
        </div>
        <div>
          <span className="k">Type</span>
          <span
            className={`badge ${
              visit.checkInType === 'office' ? 'badge-muted' : 'badge-info'
            }`}
          >
            {visit.checkInType === 'office' ? 'Office' : 'Site'}
          </span>
        </div>
        <div>
          <span className="k">Outcome</span>
          <span className={`badge ${outcomeClass(visit.outcome)}`}>
            {visit.outcome}
          </span>
        </div>
        <div>
          <span className="k">Marble</span>
          <span className="v">{visit.marbleDiscussed ?? '—'}</span>
        </div>
        <div>
          <span className="k">Follow-up</span>
          <span className="v">
            {visit.nextFollowUp ? formatDate(visit.nextFollowUp) : '—'}
          </span>
        </div>
      </div>

      <div className="visit-summary-notes">
        <span className="k">Notes</span>
        <p>{visit.notes}</p>
      </div>
    </div>
  );
}
