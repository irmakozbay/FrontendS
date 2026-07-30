import React from 'react';
import { X, Plane, Calendar, Clock, Briefcase, ArrowRight, ArrowDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function formatFlightDateTime(value) {
  if (!value) return value;
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(isDateOnly ? {} : { hour: "2-digit", minute: "2-digit" })
  });
}

function formatFlightTime(value) {
  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(startValue, endValue) {
  if (!startValue || !endValue) return null;
  const start = new Date(startValue);
  const end = new Date(endValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const minutesTotal = Math.round((end.getTime() - start.getTime()) / 60000);
  if (minutesTotal <= 0) return null;
  const hours = Math.floor(minutesTotal / 60);
  const minutes = minutesTotal % 60;
  return `${hours}s ${minutes}dk`;
}

function FlightSegment({ title, transfersLabel, departureCity, arrivalCity, departureTime, arrivalTime, baggage, icon: Icon }) {
  const duration = formatDuration(departureTime, arrivalTime);
  return (
    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Icon size={16} className="text-blue-500" />
          {title}
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-200 dark:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300">
          {transfersLabel}
        </span>
      </div>

      {/* Zaman çizelgesi: kalkış — süre — varış */}
      <div className="flex items-center gap-3">
        <div className="flex-1 text-center">
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {formatFlightTime(departureTime)}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {departureCity || "-"}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center px-2">
          {duration && (
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">{duration}</span>
          )}
          <div className="w-full flex items-center gap-1">
            <span className="h-px flex-1 bg-slate-300 dark:bg-slate-600" />
            <Plane size={14} className="text-blue-400 rotate-90" />
            <span className="h-px flex-1 bg-slate-300 dark:bg-slate-600" />
          </div>
        </div>

        <div className="flex-1 text-center">
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {formatFlightTime(arrivalTime)}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {arrivalCity || "-"}
          </div>
        </div>
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span>{formatFlightDateTime(departureTime)}</span>
        <span>{formatFlightDateTime(arrivalTime)}</span>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center gap-2">
        <Briefcase size={14} className="text-amber-500" />
        <span className="text-sm text-slate-600 dark:text-slate-300">
          <strong className="font-semibold">Bagaj:</strong> {baggage || "15kg"}
        </span>
      </div>
    </div>
  );
}

export default function FlightDetailPanel({ flight, bookingDetails, onClose, onProceed }) {
  const { t } = useTranslation();

  if (!flight) return null;

  const formattedPrice = flight.price != null && !isNaN(flight.price)
    ? new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: flight.currency || 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(flight.price)
    : `${flight.price} ${flight.currency || 'TRY'}`;

  // Let's create a map for airline colors
  const airlineLower = (flight.airline || "").toLowerCase();
  let bgGradient = "from-blue-600 to-sky-400";
  if (airlineLower.includes("pegasus")) bgGradient = "from-yellow-500 to-red-500";
  if (airlineLower.includes("ajet") || airlineLower.includes("anadolu")) bgGradient = "from-blue-700 to-blue-900";
  if (airlineLower.includes("turkish") || airlineLower.includes("thy") || airlineLower.includes("türk")) bgGradient = "from-red-600 to-red-800";
  if (airlineLower.includes("sunexpress")) bgGradient = "from-blue-500 to-orange-400";

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 font-sans w-full relative">
      {/* Header Banner */}
      <div className="relative h-56 shrink-0 overflow-hidden bg-white">
        {flight.airline?.toLowerCase()?.includes('ajet') ? (
          <div className="absolute inset-0 bg-white">
            <img src="/ajet.png" alt="Ajet" className="w-full h-full object-cover" />
          </div>
        ) : flight.airline?.toLowerCase()?.includes('pegasus') ? (
          <div className="absolute inset-0 bg-white">
            <img src="/pegasus.png" alt="Pegasus" className="w-full h-full object-cover opacity-90" />
          </div>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-r ${bgGradient} flex items-center justify-center`}>
            <Plane size={64} className="opacity-50 text-white" />
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="absolute bottom-5 left-6 right-6">
          {!flight.airline?.toLowerCase()?.includes('ajet') && !flight.airline?.toLowerCase()?.includes('pegasus') && (
            <div className="text-white/90 text-sm font-bold mb-1 tracking-wider uppercase">
              {flight.airline || t("flight_ticket", "Uçak Bileti")}
            </div>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg flex items-center gap-3">
            {bookingDetails?.departureCity || t("reservation_departure", "Gidiş")}
            <ArrowRight size={32} className="opacity-80" />
            {bookingDetails?.arrivalCity || t("reservation_arrival", "Varış")}
          </h2>
          {flight.transfers && (
            <div className="mt-1.5 text-white/80 text-xs font-semibold uppercase tracking-wide">
              {flight.transfers}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <FlightSegment
          title={t("reservation_departure")}
          transfersLabel={flight.transfers || t("reservation_direct", "Direkt Uçuş")}
          departureCity={bookingDetails?.departureCity}
          arrivalCity={bookingDetails?.arrivalCity}
          departureTime={flight.departureTime}
          arrivalTime={flight.arrivalTime}
          baggage={flight.baggage}
          icon={Plane}
        />

        {flight.returnDepartureTime && (
          <FlightSegment
            title={t("reservation_return_departure", "Dönüş")}
            transfersLabel={flight.returnTransfers || flight.transfers || t("reservation_direct", "Direkt Uçuş")}
            departureCity={bookingDetails?.arrivalCity}
            arrivalCity={bookingDetails?.departureCity}
            departureTime={flight.returnDepartureTime}
            arrivalTime={flight.returnArrivalTime}
            baggage={flight.returnBaggage || flight.baggage}
            icon={ArrowDown}
          />
        )}

        {(bookingDetails?.checkIn || bookingDetails?.guests) && (
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 flex flex-wrap gap-y-3 gap-x-6">
            {bookingDetails?.checkIn && (
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Calendar size={16} className="text-blue-500" />
                <span className="font-semibold">{formatFlightDateTime(bookingDetails.checkIn)}</span>
              </div>
            )}
            {bookingDetails?.guests && (
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Clock size={16} className="text-blue-500" />
                <span className="font-semibold">{bookingDetails.guests}</span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer / Action */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t("hoteldetail_total_price")}
          </span>
          <span className="text-2xl font-extrabold text-[#3B82F6] dark:text-blue-400">{formattedPrice}</span>
        </div>
        <button
          onClick={onProceed}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg shadow-md shadow-amber-500/20 transition-all active:scale-[0.98] flex-shrink-0"
        >
          {t("flightdetail_start_reservation", "Uçak Bileti Al")}
        </button>
      </div>
    </div>
  );
}
