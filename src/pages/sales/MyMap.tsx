import { Navigate } from 'react-router-dom';
import TerritoryMap from '../../components/TerritoryMap';
import { useAuth } from '../../context/AppContext';

export default function MyMapPage() {
  const { user } = useAuth();
  if (!user?.salespersonId) return <Navigate to="/" replace />;
  return <TerritoryMap mode="salesperson" salespersonId={user.salespersonId} />;
}
