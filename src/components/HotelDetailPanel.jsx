import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Heart, MapPin, Star, Calendar, Users, BedDouble,
  ChevronLeft, ChevronRight, Loader2, Info, CheckCircle2,
  Wine, Waves, Dumbbell, Gift, Baby, Car, Wifi, ShieldCheck,
  Utensils, Music, Clapperboard, Stethoscope, Dices, CreditCard,
  Bath, Building2, Trees, Sparkles, ParkingCircle, Snowflake,
  ShoppingBag, Landmark, Bike, Table2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DESCRIPTION_PREVIEW_LENGTH = 320;
const INITIAL_FACILITY_COUNT = 9;

function formatDate(value) {
  if (!value) return value;
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    weekday: "long",
    ...(isDateOnly ? {} : { hour: "2-digit", minute: "2-digit" })
  });
}

// Olanak adına göre en yakın anlamlı ikonu seçer — TourVisio yüzlerce farklı
// serbest metin olanak ismi döndürebiliyor, bu yüzden anahtar kelime eşleşmesi
// kullanılıyor; eşleşme yoksa nötr bir onay ikonuna düşülüyor.
const FACILITY_ICON_RULES = [
  [/bar|pub/i, Wine],
  [/pool|beach|sea|deniz|havuz|water/i, Waves],
  [/fitness|gym|sport/i, Dumbbell],
  [/gift|shop|market|store/i, ShoppingBag],
  [/kid|child|baby|çocuk|bebek/i, Baby],
  [/rent a car|parking|park/i, ParkingCircle],
  [/rent a bcyle|rent a bicycle|bike|bicycle/i, Bike],
  [/transfer|car/i, Car],
  [/internet|wifi/i, Wifi],
  [/security|lifeguard|guard/i, ShieldCheck],
  [/restaurant|snack|dining/i, Utensils],
  [/disco|nightclub/i, Music],
  [/cinema|museum/i, Clapperboard],
  [/doctor|nurse|clinic|health|doktuur/i, Stethoscope],
  [/casino/i, Dices],
  [/credit card|atm|bank|exchange/i, CreditCard],
  [/turkish bath|sauna|jakuz|hamam|spa|massage/i, Bath],
  [/building|apartm|villa|bungalow|city hotel/i, Building2],
  [/golf/i, Trees],
  [/table tennis|squash|tennis/i, Table2],
  [/air condition|warn pool|indoor|outdoor/i, Snowflake],
  [/tour|guide|landmark/i, Landmark],
];
function getFacilityIcon(name) {
  const rule = FACILITY_ICON_RULES.find(([pattern]) => pattern.test(name));
  return rule ? rule[1] : CheckCircle2;
}

export default function HotelDetailPanel({ hotel, bookingDetails, loadingDetail, onClose, onProceed }) {
  const { t } = useTranslation();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Otel değiştiğinde (yeni bir karta tıklanınca) galeriyi ve açıklamayı başa sar
  useEffect(() => {
    setPhotoIndex(0);
    setDescriptionExpanded(false);
    setShowAllFacilities(false);
  }, [hotel?.hotelId]);

  const photos = Array.isArray(hotel?.photos) && hotel.photos.length > 0
    ? hotel.photos
    : ((hotel?.thumbnailFull || hotel?.thumbnail) ? [hotel.thumbnailFull || hotel.thumbnail] : []);
  const hasMultiplePhotos = photos.length > 1;

  if (!hotel) return null;

  const goToPrevPhoto = (e) => {
    e?.stopPropagation();
    setPhotoIndex(i => (i - 1 + photos.length) % photos.length);
  };
  const goToNextPhoto = (e) => {
    e?.stopPropagation();
    setPhotoIndex(i => (i + 1) % photos.length);
  };

  // TourVisio açıklama metinleri bazen HTML içerebiliyor — dangerouslySetInnerHTML
  // kullanmadan güvenli şekilde düz metne indirgiyoruz.
  const plainDescription = hotel.description
    ? hotel.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : null;
  const isDescriptionLong = plainDescription && plainDescription.length > DESCRIPTION_PREVIEW_LENGTH;
  const displayedDescription = plainDescription && isDescriptionLong && !descriptionExpanded
    ? plainDescription.slice(0, DESCRIPTION_PREVIEW_LENGTH).trim() + "…"
    : plainDescription;

  const formattedPrice = hotel.price != null && !isNaN(hotel.price)
    ? new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: hotel.currency || 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(hotel.price)
    : `${hotel.price} ${hotel.currency || 'TRY'}`;

  const locationParts = [hotel.city, hotel.town, hotel.village, hotel.region].filter(Boolean);
  const uniqueLocationParts = [...new Set(locationParts)];
  const locationText = uniqueLocationParts.length > 0 ? uniqueLocationParts.join(', ') : '';

  // Sadece TourVisio'nun kendi verdiği koordinat (geolocation) kullanılır — tahmini/
  // yaklaşık bir konum üretilmez. TourVisio bu oteli için koordinat vermediyse
  // Konum kartı hiç gösterilmez.
  const hasExactCoords = Boolean(hotel.geolocation?.latitude && hotel.geolocation?.longitude);

  // Facilities: hem eski (düz string dizisi) hem yeni ({name, highlighted} objesi)
  // formatını destekler — geriye dönük uyumluluk için.
  let facilitiesList = [];
  if (Array.isArray(hotel.facilities)) {
    facilitiesList = hotel.facilities.map(f => typeof f === 'string' ? { name: f, highlighted: false } : f);
  } else if (typeof hotel.facilities === 'string') {
    facilitiesList = hotel.facilities.split(',').map(f => f.trim()).filter(Boolean).map(name => ({ name, highlighted: false }));
  }
  // Öne çıkan (highlighted) olanaklar önce gösterilir.
  const sortedFacilities = [...facilitiesList].sort((a, b) => (b.highlighted ? 1 : 0) - (a.highlighted ? 1 : 0));
  const visibleFacilities = showAllFacilities ? sortedFacilities : sortedFacilities.slice(0, INITIAL_FACILITY_COUNT);
  const remainingFacilityCount = sortedFacilities.length - INITIAL_FACILITY_COUNT;

  // Themes formatting
  let themesList = [];
  if (Array.isArray(hotel.themes)) {
    themesList = hotel.themes;
  } else if (typeof hotel.themes === 'string') {
    themesList = hotel.themes.split(',').map(f => f.trim()).filter(Boolean);
  }

  const nightCount = bookingDetails?.checkIn && bookingDetails?.checkOut
    ? Math.max(1, Math.round((new Date(bookingDetails.checkOut) - new Date(bookingDetails.checkIn)) / (1000 * 60 * 60 * 24)))
    : null;

  const countryLabel = hotel.country || "TÜRKİYE";

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 font-sans w-full relative">
      {/* Üst çubuk */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeft size={18} />
          {t("hoteldetail_back_to_chat", "Sohbete Dön")}
        </button>
        <button
          onClick={() => setIsFavorite(v => !v)}
          className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-900 transition-colors"
        >
          <Heart size={18} className={isFavorite ? "fill-rose-500 text-rose-500" : ""} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-5">
          {/* Başlık */}
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            <h1 className="text-2xl md:text-[28px] font-extrabold text-slate-900 dark:text-white leading-tight">
              {hotel.name || hotel.hotelId}
            </h1>
            {hotel.stars > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-bold">
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <Star key={i} size={11} className="fill-amber-500 text-amber-500" />
                ))}
              </span>
            )}
          </div>
          {(locationText || hotel.address) && (
            <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-5">
              <MapPin size={14} className="flex-shrink-0" />
              <span>
                {[locationText, hotel.address ? null : countryLabel].filter(Boolean).join(' · ')}
                {hotel.address ? `, ${countryLabel}` : ''}
              </span>
            </div>
          )}

          {/* Hero fotoğraf */}
          <div className="relative h-[300px] md:h-[380px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 mb-6">
            {photos.length > 0 ? (
              <img
                key={photoIndex}
                src={photos[photoIndex]}
                alt={hotel.name || "Hotel"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.classList.remove('hidden');
                  }
                }}
              />
            ) : null}
            <div className={`absolute inset-0 flex items-center justify-center ${photos.length > 0 ? 'hidden' : ''}`}>
              <span className="text-6xl">🏨</span>
            </div>

            {loadingDetail && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/70 text-white text-xs px-2.5 py-1.5 rounded-full">
                <Loader2 size={12} className="animate-spin" />
                {t("hoteldetail_loading_photos")}
              </div>
            )}

            {photos.length > 0 && (
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/60 text-white text-xs font-semibold px-2.5 py-1.5 rounded-full">
                {photoIndex + 1} / {photos.length}
              </div>
            )}

            {hasMultiplePhotos && (
              <>
                <button
                  onClick={goToPrevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 text-slate-800 dark:text-white rounded-full transition-colors shadow-md"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={goToNextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 text-slate-800 dark:text-white rounded-full transition-colors shadow-md"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Şeridi */}
          {hasMultiplePhotos && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIndex(i)}
                  className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    i === photoIndex
                      ? "border-amber-500 opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={photo} alt={`${hotel.name || "Hotel"} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* İki sütunlu içerik: sol geniş bilgi, sağ sabit fiyat/konum */}
        <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SOL SÜTUN */}
          <div className="lg:col-span-2 space-y-5">

            {/* Açıklama */}
            {plainDescription && (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2.5 flex items-center gap-2">
                  <Info size={15} className="text-blue-500" />
                  {t("hoteldetail_about")}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{displayedDescription}</p>
                {isDescriptionLong && (
                  <button
                    onClick={() => setDescriptionExpanded(v => !v)}
                    className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    {descriptionExpanded ? t("hoteldetail_show_less") : t("hoteldetail_show_more")}
                  </button>
                )}
              </div>
            )}

            {/* Olanaklar */}
            {sortedFacilities.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3.5 flex items-center gap-2">
                  <ShieldCheck size={15} className="text-blue-500" />
                  {t("hoteldetail_amenities")}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {visibleFacilities.map((facility, i) => {
                    const FacIcon = getFacilityIcon(facility.name);
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                          facility.highlighted
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <FacIcon size={15} className={facility.highlighted ? "text-white" : "text-blue-500"} />
                        <span className="truncate">{facility.name}</span>
                      </div>
                    );
                  })}
                </div>
                {remainingFacilityCount > 0 && (
                  <button
                    onClick={() => setShowAllFacilities(v => !v)}
                    className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    {showAllFacilities
                      ? t("hoteldetail_show_less")
                      : `+${remainingFacilityCount} ${t("hoteldetail_more_amenities", "olanak daha")}`}
                  </button>
                )}
              </div>
            )}

            {/* Temalar */}
            {themesList.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Sparkles size={15} className="text-blue-500" />
                  {t("hoteldetail_themes")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {themesList.map((theme, i) => (
                    <span key={i} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50 rounded-md text-xs font-semibold">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Oda Tipleri */}
            {hotel.roomName && (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <BedDouble size={15} className="text-blue-500" />
                  {t("hoteldetail_room_types", "Oda Tipleri")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-full border-2 border-blue-500 text-blue-600 dark:text-blue-400 text-xs font-bold">
                    {hotel.roomName}
                  </span>
                </div>
              </div>
            )}

            {loadingDetail && !plainDescription && sortedFacilities.length === 0 && themesList.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
                <Loader2 size={14} className="animate-spin" />
                {t("hoteldetail_loading_details")}
              </div>
            )}
          </div>

          {/* SAĞ SÜTUN — fiyat + konum, kaydırma sırasında sabit kalır */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-0 space-y-4">

              {/* Oda ve Fiyat */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <BedDouble size={15} className="text-blue-500" />
                  {t("hoteldetail_room_price_options", "Oda ve Fiyat Seçenekleri")}
                </h3>

                {bookingDetails?.checkIn && (
                  <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <Calendar size={14} className="mt-0.5 flex-shrink-0" />
                    <span>
                      {formatDate(bookingDetails.checkIn)}
                      {bookingDetails.checkOut && <> — {formatDate(bookingDetails.checkOut)}</>}
                      {nightCount && <> ({nightCount} {t("unit_night", "gece")})</>}
                    </span>
                  </div>
                )}

                <div className="rounded-xl border-2 border-blue-500 bg-blue-50/60 dark:bg-blue-500/10 p-3.5 mb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {hotel.roomName || hotel.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {(hotel.boardName || hotel.boardType || hotel.pensionType) && (
                          <span>{hotel.boardName || hotel.boardType || hotel.pensionType}</span>
                        )}
                        {nightCount && <><span>·</span><span>{nightCount} {t("unit_night", "gece")}</span></>}
                      </div>
                    </div>
                    <div className="text-base font-extrabold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {formattedPrice}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {t("hoteldetail_total_price")}
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">{formattedPrice}</span>
                </div>

                <button
                  onClick={onProceed}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-[0.98]"
                >
                  {t("hoteldetail_start_reservation")}
                </button>
              </div>

              {/* Konum */}
              {(hasExactCoords || locationText || hotel.address) && (
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <MapPin size={15} className="text-blue-500" />
                    {t("hoteldetail_location", "Konum")}
                  </h3>
                  {hasExactCoords ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-40 mb-3">
                      <iframe
                        title="hotel-location-map"
                        className="w-full h-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${hotel.geolocation.latitude},${hotel.geolocation.longitude}&z=15&output=embed`}
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 h-24 mb-3 flex items-center justify-center text-slate-400 dark:text-slate-500">
                      <MapPin size={18} className="opacity-50" />
                    </div>
                  )}
                  {(locationText || hotel.address) && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin size={13} className="mt-0.5 flex-shrink-0" />
                      <span>{[hotel.address, locationText].filter(Boolean).join(' · ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
