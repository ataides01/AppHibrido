import { CarteiraVacinacao } from '@/components/vaccination/carteira-vacinacao';
import { VacinasAdminPanel } from '@/components/vaccination/vacinas-admin-panel';
import { useAuth } from '@/context/auth-context';

export default function VacinasScreen() {
  const { isAdmin } = useAuth();
  if (isAdmin) {
    return <VacinasAdminPanel />;
  }
  return <CarteiraVacinacao />;
}
