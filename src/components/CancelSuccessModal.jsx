import React, { useEffect, useState } from 'react';
import { CheckCircle2, X, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CancelSuccessModal({ pnr, type, onClose }) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const autoCloseTimer = setTimeout(() => {
      onClose();
    }, 4000);

    const intervalTime = 40;
    const step = (intervalTime / 4000) * 100;
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - step));
    }, intervalTime);

    return () => {
      clearTimeout(autoCloseTimer);
      clearInterval(progressInterval);
    };
  }, [onClose]);

  const isHotel = type && (type.toUpperCase() === 'HOTEL' || type === 'Hotel');
  
  const messageKey = isHotel ? 'hotelCancelled' : 'flightCancelled';
  let rawMessage = t(messageKey, {
    pnr,
    defaultValue: isHotel
      ? `${pnr} numaralı otel rezervasyonunuz başarıyla iptal edilmiştir.`
      : `${pnr} numaralı uçak biletiniz başarıyla iptal edilmiştir.`
  });

  if (rawMessage === messageKey) {
    rawMessage = t(`reservation.${messageKey}`, {
      pnr,
      defaultValue: isHotel
        ? `${pnr} numaralı otel rezervasyonunuz başarıyla iptal edilmiştir.`
        : `${pnr} numaralı uçak biletiniz başarıyla iptal edilmiştir.`
    });
  }

  const formattedMessage = rawMessage
    .replace('{pnr}', pnr)
    .replace('{{pnr}}', pnr);

  const renderFormattedMessage = () => {
    if (!pnr || !formattedMessage.includes(pnr)) {
      return <span>{formattedMessage}</span>;
    }
    const parts = formattedMessage.split(pnr);
    return (
      <span>
        {parts[0]}
        <strong className="font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono inline-block my-0.5">
          {pnr.startsWith('#') ? pnr : `#${pnr}`}
        </strong>
        {parts[1]}
      </span>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-slate-700/60 p-6 sm:p-8 shadow-2xl text-center transform transition-all animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Kapat"
        >
          <X size={18} />
        </button>

        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/20 dark:bg-emerald-500/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 p-1 shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-500/20 dark:ring-emerald-400/20">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-slate-900/90 backdrop-blur-sm">
            <CheckCircle2 size={42} className="text-emerald-500 dark:text-emerald-400 stroke-[2.5]" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white shadow-md ring-2 ring-white dark:ring-slate-900">
            <Sparkles size={14} />
          </div>
        </div>

        <h3 className="mb-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('cancellation_successful', 'İptal İşlemi Başarılı')}
        </h3>

        <div className="mb-6 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
          {renderFormattedMessage()}
        </div>

        <button
          onClick={onClose}
          className="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-600/40 active:scale-[0.98]"
        >
          {t('common.ok', 'Tamam')}
        </button>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-emerald-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
