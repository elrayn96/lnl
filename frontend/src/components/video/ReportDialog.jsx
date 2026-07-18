import { useState } from 'react'
export default function ReportDialog({ onClose, onSubmit }) {
  const [reason, setReason] = useState('Comportamento impróprio')
  return <div className="modal-backdrop"><div className="modal glass-card" role="dialog" aria-modal="true"><h2>Denunciar esta pessoa?</h2><p>A ligação termina e a denúncia é enviada para análise.</p><label>Motivo<select value={reason} onChange={(e) => setReason(e.target.value)}><option>Comportamento impróprio</option><option>Assédio ou ameaça</option><option>Conteúdo sexual</option><option>Spam</option></select></label><div className="button-row"><button className="button button--soft" onClick={onClose}>Cancelar</button><button className="button button--danger" onClick={() => onSubmit(reason)}>Denunciar</button></div></div></div>
}
