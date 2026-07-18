import { History } from 'lucide-react'
import StateView from '../components/common/StateView'
export default function ActivityPage() { return <div className="page"><StateView title="Ainda sem actividade" message="As salas e conversas recentes aparecerão aqui quando houver dados disponíveis." action={<History aria-hidden="true" />} /></div> }
