import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationLog } from '../../types';
import {
  Bell,
  MessageSquare,
  Mail,
  Send,
  CheckCircle2,
  Filter,
  Search,
  Smartphone,
  Eye,
  RefreshCw,
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { notifications, sendNotification, agencyConfig, dossiers } = useApp();

  const [channelFilter, setChannelFilter] = useState<'ALL' | 'SMS' | 'EMAIL'>('ALL');
  const [search, setSearch] = useState<string>('');
  const [selectedNotif, setSelectedNotif] = useState<NotificationLog | null>(null);

  // Quick broadcast composer
  const [targetDossierId, setTargetDossierId] = useState<string>('ALL');
  const [broadcastType, setBroadcastType] = useState<'SMS' | 'EMAIL'>('SMS');
  const [broadcastSubject, setBroadcastSubject] = useState<string>('Information importante - EVA VOYAGES');
  const [broadcastMsg, setBroadcastMsg] = useState<string>('');

  const filtered = notifications.filter((n) => {
    const q = search.toLowerCase();
    const matchesSearch =
      n.message.toLowerCase().includes(q) ||
      (n.recipientPhone && n.recipientPhone.includes(q)) ||
      (n.recipientEmail && n.recipientEmail.toLowerCase().includes(q)) ||
      (n.trackingCode && n.trackingCode.toLowerCase().includes(q));

    const matchesChannel = channelFilter === 'ALL' || n.type === channelFilter;

    return matchesSearch && matchesChannel;
  });

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;

    if (targetDossierId === 'ALL') {
      // Send to all registered pilgrims
      dossiers.forEach((d) => {
        sendNotification({
          dossierId: d.id,
          trackingCode: d.trackingCode,
          type: broadcastType,
          recipientPhone: d.personalInfo.phone,
          recipientEmail: d.personalInfo.email,
          sender: broadcastType === 'SMS' ? agencyConfig.smsSenderName : agencyConfig.email,
          subject: broadcastSubject,
          message: broadcastMsg,
          trigger: 'MANUAL',
        });
      });
      alert(`Diffusion ${broadcastType} transmise avec succès à l'ensemble des ${dossiers.length} pèlerins!`);
    } else {
      const d = dossiers.find((dos) => dos.id === targetDossierId);
      if (d) {
        sendNotification({
          dossierId: d.id,
          trackingCode: d.trackingCode,
          type: broadcastType,
          recipientPhone: d.personalInfo.phone,
          recipientEmail: d.personalInfo.email,
          sender: broadcastType === 'SMS' ? agencyConfig.smsSenderName : agencyConfig.email,
          subject: broadcastSubject,
          message: broadcastMsg,
          trigger: 'MANUAL',
        });
        alert(`Notification envoyée avec succès à ${d.personalInfo.firstName} ${d.personalInfo.lastName}!`);
      }
    }

    setBroadcastMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Centre d'Envoi & Audit des Notifications (SMS & Email)</h2>
          <p className="text-xs text-stone-500">
            Historique certifié en temps réel des alertes SMS et e-mails de confirmation envoyés automatiquement aux pèlerins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Passerelle SMS & SMTP Active</span>
          </span>
        </div>
      </div>

      {/* Grid: Broadcast Composer & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composer Form (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Send className="w-4 h-4 text-emerald-800" />
            <span>Diffuser une Notification</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Transmettez des convocations aux réunions, des alertes de vol ou des informations pratiques de voyage.
          </p>

          <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Canal de diffusion</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBroadcastType('SMS')}
                  className={`py-2 px-3 rounded-xl font-bold transition-all ${
                    broadcastType === 'SMS'
                      ? 'bg-emerald-800 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  SMS Mobile
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastType('EMAIL')}
                  className={`py-2 px-3 rounded-xl font-bold transition-all ${
                    broadcastType === 'EMAIL'
                      ? 'bg-emerald-800 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Courrier E-mail
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Destinataire(s)</label>
              <select
                value={targetDossierId}
                onChange={(e) => setTargetDossierId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
              >
                <option value="ALL">Tous les pèlerins inscrits ({dossiers.length})</option>
                {dossiers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.personalInfo.firstName} {d.personalInfo.lastName} ({d.trackingCode})
                  </option>
                ))}
              </select>
            </div>

            {broadcastType === 'EMAIL' && (
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Objet de l'e-mail</label>
                <input
                  type="text"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Texte du message</label>
              <textarea
                rows={4}
                required
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Ex: Chers pèlerins, vos visas et badges sont disponibles pour retrait à l'agence..."
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Diffuser maintenant</span>
            </button>
          </form>
        </div>

        {/* Audit Log (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Journal d'audit des messages envoyés ({filtered.length})
            </h3>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setChannelFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg ${
                  channelFilter === 'ALL' ? 'bg-white font-bold text-stone-900 shadow-sm' : 'text-stone-600'
                }`}
              >
                Tous
              </button>
              <button
                type="button"
                onClick={() => setChannelFilter('SMS')}
                className={`px-2.5 py-1 rounded-lg ${
                  channelFilter === 'SMS' ? 'bg-white font-bold text-stone-900 shadow-sm' : 'text-stone-600'
                }`}
              >
                SMS
              </button>
              <button
                type="button"
                onClick={() => setChannelFilter('EMAIL')}
                className={`px-2.5 py-1 rounded-lg ${
                  channelFilter === 'EMAIL' ? 'bg-white font-bold text-stone-900 shadow-sm' : 'text-stone-600'
                }`}
              >
                E-mails
              </button>
            </div>
          </div>

          {/* List of dispatched logs */}
          <div className="divide-y divide-stone-100 max-h-[500px] overflow-y-auto pr-1 space-y-2 text-xs">
            {filtered.map((notif) => (
              <div
                key={notif.id}
                onClick={() => setSelectedNotif(notif)}
                className="pt-2 pb-2.5 flex items-start justify-between gap-3 hover:bg-stone-50 px-2 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.type === 'SMS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {notif.type === 'SMS' ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">
                        {notif.type === 'SMS' ? 'SMS Mobile' : 'E-mail Confirmation'}
                      </span>
                      {notif.trackingCode && (
                        <span className="font-mono text-[10px] bg-stone-100 px-1.5 py-0.2 rounded text-stone-700">
                          {notif.trackingCode}
                        </span>
                      )}
                      {notif.trigger === 'WHATSAPP_INVITE' ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Lien Groupe WhatsApp
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">
                          Déclencheur: {notif.trigger}
                        </span>
                      )}
                    </div>

                    <p className="text-stone-600 line-clamp-1 mt-0.5 font-sans">
                      {notif.type === 'EMAIL' && notif.subject ? `[${notif.subject}] ` : ''}
                      {notif.message}
                    </p>

                    <span className="text-[10px] text-stone-400">
                      Destinataire: {notif.recipientPhone || notif.recipientEmail} · Émetteur: {notif.sender}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-stone-400 block whitespace-nowrap">
                    {new Date(notif.sentAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Délivré
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview modal for clicked notification */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-sm text-stone-900">
                  Aperçu Réception {selectedNotif.type}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="text-stone-400 hover:text-stone-900"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
              <div className="flex justify-between text-stone-500">
                <span>Émetteur :</span>
                <strong className="text-stone-900">{selectedNotif.sender}</strong>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Destinataire :</span>
                <strong className="text-stone-900 font-mono">
                  {selectedNotif.recipientPhone || selectedNotif.recipientEmail}
                </strong>
              </div>
              {selectedNotif.subject && (
                <div className="text-stone-500 border-t border-stone-200 pt-2">
                  <span>Objet: </span>
                  <strong className="text-stone-900">{selectedNotif.subject}</strong>
                </div>
              )}
              <div className="p-3 bg-white rounded-xl border border-stone-200 text-stone-800 whitespace-pre-line leading-relaxed font-sans mt-2">
                {selectedNotif.message}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
