import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Ticket,
  Baby,
  XCircle,
  Sparkles,
  ChevronDown,
  Mail,
  Copy,
  Check,
  HelpCircle,
  Gift
} from 'lucide-react';

export default function SupportModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const quickHelpItems = [
    {
      id: 'pnr',
      icon: Ticket,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      title: t('welcome.support.quickHelp.pnr.title'),
      solution: t('welcome.support.quickHelp.pnr.solution')
    },
    {
      id: 'age',
      icon: Baby,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      title: t('welcome.support.quickHelp.age.title'),
      solution: t('welcome.support.quickHelp.age.solution')
    },
    {
      id: 'cancel',
      icon: XCircle,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      title: t('welcome.support.quickHelp.cancel.title'),
      solution: t('welcome.support.quickHelp.cancel.solution')
    },
    {
      id: 'free',
      icon: Gift,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      title: t('welcome.support.quickHelp.free.title') || t('welcome.support.quickHelp.payment.title'),
      solution: t('welcome.support.quickHelp.free.solution') || t('welcome.support.quickHelp.payment.solution')
    }
  ];

  const handleCopyEmail = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText('sannyedestek@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    window.location.href = 'mailto:sannyedestek@gmail.com';
  };

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content Box */}
      <div className="relative w-full max-w-lg bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/50 dark:border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden z-10 transition-all duration-300 transform scale-100 my-auto">
        
        {/* Top Decorative Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400" />

        {/* Modal Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('welcome.support.modalTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t('welcome.support.subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Quick Solutions */}
        <div className="p-6 space-y-3 max-h-[55vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>{t('welcome.support.quickHelpLabel') || 'Hızlı Çözümler'}</span>
          </div>

          {quickHelpItems.map((item, idx) => {
            const IconComponent = item.icon;
            const isOpen = openIndex === idx;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white dark:bg-slate-800/90 border-orange-400/60 dark:border-orange-500/50 shadow-md'
                    : 'bg-white/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-orange-300 dark:hover:border-slate-700 hover:bg-white/90 dark:hover:bg-slate-800/70'
                }`}
              >
                <button
                  onClick={() => toggleItem(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2 rounded-xl border ${item.color} flex-shrink-0`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                      {item.title}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-orange-500' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/50 mt-1 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="p-3 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 text-slate-700 dark:text-slate-200 mt-2">
                      <strong className="text-orange-600 dark:text-orange-400 font-semibold block mb-1">💡 {t('welcome.support.solutionLabel')}:</strong>
                      {item.solution}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer / Unresolved Notice */}
        <div className="p-6 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-200/60 dark:border-slate-800/80 space-y-3">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/20 text-slate-800 dark:text-slate-200 text-xs sm:text-sm flex flex-col gap-3">
            <p className="font-medium text-slate-700 dark:text-slate-300 leading-snug">
              {t('welcome.support.unresolvedNotice')}
            </p>
            
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleSendEmail}
                className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>{t('welcome.support.sendEmail')}</span>
              </button>

              <button
                onClick={handleCopyEmail}
                className={`px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title="sannyedestek@gmail.com"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t('welcome.support.emailCopied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>sannyedestek@gmail.com</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
