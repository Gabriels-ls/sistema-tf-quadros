import { Navigate } from 'react-router-dom';
import { obterTokenAdmin } from '../services/adminAuth';

function RotaProtegida({ children }) {
  if (!obterTokenAdmin()) return <Navigate to="/login" />;

  return children;
}

export default RotaProtegida;
