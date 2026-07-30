import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Bed,
  MapPin,
  Hotel,
  Plane,
  Moon,
  PanelRightClose,
  Plus,
  Minus,
  Baby,
  Star,
  Heart,
  SlidersHorizontal,
} from "lucide-react";

function formatDate(value, language = "tr") {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const localeMap = {
    tr: "tr-TR",
    en: "en-US",
    de: "de-DE",
    ru: "ru-RU",
  };

  const normalizedLanguage = language?.split("-")[0] || "tr";

  return date.toLocaleDateString(
    localeMap[normalizedLanguage] || "tr-TR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function calculateNightCount(checkIn, checkOut) {
  if (!checkIn || !checkOut) return null;

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return null;
  }

  const difference = endDate.getTime() - startDate.getTime();
  const nightCount = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  return nightCount > 0 ? nightCount : null;
}

function formatPriceValue(price, currency) {
  const num = Number(price);
  if (Number.isNaN(num)) return price;
  return `${Math.round(num).toLocaleString("tr-TR")} ${currency || "TRY"}`;
}

function DetailRow({
  icon: Icon,
  label,
  value,
  placeholder,
}) {
  const hasValue =
    value !== undefined &&
    value !== null &&
    String(value).trim() !== "";

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF8A00] dark:bg-orange-500/10 dark:text-orange-400">
        <Icon size={18} strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {label}
        </p>

        <p
          className={`mt-0.5 truncate text-[13px] font-semibold ${hasValue
            ? "text-slate-900 dark:text-slate-100"
            : "italic text-slate-400 dark:text-slate-500"
            }`}
        >
          {hasValue ? value : placeholder}
        </p>
      </div>
    </div>
  );
}


function GuestSelector({
  adultCount,
  setAdultCount,
  childCount,
  setChildCount,
  childAges,
  setChildAges,
  infantCount = 0,
  t,
}) {
  const increaseAdults = () => {
    setAdultCount((value) => Math.min(value + 1, 10));
  };

  const decreaseAdults = () => {
    setAdultCount((value) => Math.max(value - 1, 1));
  };

  const increaseChildren = () => {
    setChildCount((value) => {
      const nextValue = Math.min(value + 1, 6);

      if (nextValue > value) {
        setChildAges((ages) => [...ages, ""]);
      }

      return nextValue;
    });
  };

  const decreaseChildren = () => {
    setChildCount((value) => {
      const nextValue = Math.max(value - 1, 0);

      if (nextValue < value) {
        setChildAges((ages) => ages.slice(0, nextValue));
      }

      return nextValue;
    });
  };

  const updateChildAge = (index, age) => {
    setChildAges((ages) =>
      ages.map((currentAge, currentIndex) =>
        currentIndex === index ? age : currentAge
      )
    );
  };

  const CounterButton = ({ onClick, disabled, children, label }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-orange-200 bg-white text-[#FF8A00] transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-orange-500/30 dark:bg-slate-800 dark:text-orange-400 dark:hover:bg-orange-500/10"
    >
      {children}
    </button>
  );

  return (
    <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF8A00] dark:bg-orange-500/10 dark:text-orange-400">
          <Users size={18} strokeWidth={2} />
        </div>

        <div>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {t("rightSidebar.guests", {
              defaultValue: "Misafirler",
            })}
          </p>
          <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
            {adultCount}{" "}
            {t("rightSidebar.units.adult", {
              defaultValue: "Yetişkin",
            })}
            {childCount > 0
              ? `, ${childCount} ${t("rightSidebar.units.child", {
                defaultValue: "Çocuk",
              })}`
              : ""}
            {infantCount > 0
              ? `, ${infantCount} ${t("rightSidebar.units.infant", {
                defaultValue: "Bebek",
              })}`
              : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t("rightSidebar.units.adult", {
              defaultValue: "Yetişkin",
            })}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {t("rightSidebar.adultDescription", {
              defaultValue: "18 yaş ve üzeri",
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CounterButton
            onClick={decreaseAdults}
            disabled={adultCount <= 1}
            label="Yetişkin sayısını azalt"
          >
            <Minus size={15} />
          </CounterButton>

          <span className="w-5 text-center text-sm font-bold text-slate-900 dark:text-white">
            {adultCount}
          </span>

          <CounterButton
            onClick={increaseAdults}
            disabled={adultCount >= 10}
            label="Yetişkin sayısını artır"
          >
            <Plus size={15} />
          </CounterButton>
        </div>
      </div>

      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t("rightSidebar.units.child", {
              defaultValue: "Çocuk",
            })}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {t("rightSidebar.childDescription", {
              defaultValue: "0-17 yaş",
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CounterButton
            onClick={decreaseChildren}
            disabled={childCount <= 0}
            label="Çocuk sayısını azalt"
          >
            <Minus size={15} />
          </CounterButton>

          <span className="w-5 text-center text-sm font-bold text-slate-900 dark:text-white">
            {childCount}
          </span>

          <CounterButton
            onClick={increaseChildren}
            disabled={childCount >= 6}
            label="Çocuk sayısını artır"
          >
            <Plus size={15} />
          </CounterButton>
        </div>
      </div>

      {childCount > 0 && (
        <div className="mt-1 border-t border-slate-200 pt-3 dark:border-slate-700">
          <div className="mb-3 flex items-center gap-2">
            <Baby
              size={16}
              className="text-[#FF8A00] dark:text-orange-400"
            />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {t("rightSidebar.childAges", {
                defaultValue: "Çocuk yaşları",
              })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: childCount }).map((_, index) => (
              <label key={index} className="block">
                <span className="mb-1 block text-[10px] font-medium text-slate-400 dark:text-slate-500">
                  {t("rightSidebar.childNumber", {
                    defaultValue: "Çocuk",
                  })}{" "}
                  {index + 1}
                </span>

                <select
                  value={childAges[index] ?? ""}
                  onChange={(event) =>
                    updateChildAge(index, event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none transition focus:border-[#FF8A00] focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-orange-500 dark:focus:ring-orange-500/10"
                >
                  <option value="">
                    {t("rightSidebar.selectAge", {
                      defaultValue: "Yaş seç",
                    })}
                  </option>

                  {Array.from({ length: 18 }).map((_, age) => (
                    <option key={age} value={age}>
                      {age}{" "}
                      {t("rightSidebar.units.age", {
                        defaultValue: "yaş",
                      })}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stepper({ currentStep, setCurrentStep, t }) {
  const steps = [
    {
      id: 1,
      label: t("rightSidebar.steps.search", {
        defaultValue: "Ara",
      }),
    },
    {
      id: 2,
      label: t("rightSidebar.steps.select", {
        defaultValue: "Seç",
      }),
    },
    {
      id: 3,
      label: t("rightSidebar.steps.review", {
        defaultValue: "İncele",
      }),
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-start">
        {steps.map((step, index) => {
          const active = currentStep >= step.id;

          return (
            <div
              key={step.id}
              className={`flex items-start ${index < steps.length - 1 ? "flex-1" : ""
                }`}
            >
              <button
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className="flex flex-col items-center"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all ${active
                    ? "bg-[#FF8A00] text-white shadow-[0_0_0_4px_rgba(255,138,0,0.14)] dark:bg-orange-500"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                    }`}
                >
                  {step.id}
                </div>

                <span
                  className={`mt-2 text-[11px] font-semibold ${currentStep === step.id
                    ? "text-[#FF8A00] dark:text-orange-400"
                    : "text-slate-400 dark:text-slate-500"
                    }`}
                >
                  {step.label}
                </span>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={`mx-2 mt-[19px] h-[2px] flex-1 transition-colors ${currentStep > step.id
                    ? "bg-[#FF8A00] dark:bg-orange-500"
                    : "bg-slate-200 dark:bg-slate-700"
                    }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RightSidebar({
  isRightSidebarOpen,
  setIsRightSidebarOpen,
  searchType,
  bookingDetails = {},
  selectedHotel,
  selectedFlight,
  sessionId,
  searchResults = [],
  onSelectHotel,
  onSelectFlight,
}) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [resultSort, setResultSort] = useState("price_asc");
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());

  // Yeni bir sonuç listesi geldiğinde ("Sizin için bulundu"), kullanıcıyı
  // otomatik olarak seçim adımına götürür — PusulAI referansındaki gibi
  // sonuçlar geldiği an sağ panelde görünür, elle "İleri" tıklamak gerekmez.
  useEffect(() => {
    if (searchResults.length > 0) {
      setCurrentStep(2);
    }
  }, [searchResults]);

  const toggleFavorite = (id) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const [adultCount, setAdultCount] = useState(
    Number(bookingDetails.adultCount) || 1
  );
  const [childCount, setChildCount] = useState(
    Number(bookingDetails.childCount) || 0
  );
  const [childAges, setChildAges] = useState(
    Array.isArray(bookingDetails.childAges)
      ? bookingDetails.childAges.map(String)
      : []
  );
  const [infantCount, setInfantCount] = useState(
    Number(bookingDetails.infantCount) || 0
  );

  const isHotel = searchType !== "flight";

  const language = i18n.language?.split("-")[0] || "tr";

  useEffect(() => {
    const nextAdultCount = Number(bookingDetails.adultCount) || 1;
    const nextChildCount = Number(bookingDetails.childCount) || 0;
    const nextInfantCount = Number(bookingDetails.infantCount) || 0;
    const nextChildAges = Array.isArray(bookingDetails.childAges)
      ? bookingDetails.childAges.map(String)
      : Array(nextChildCount).fill("");

    setAdultCount(nextAdultCount);
    setChildCount(nextChildCount);
    setInfantCount(nextInfantCount);
    setChildAges(nextChildAges.slice(0, nextChildCount));
  }, [
    bookingDetails.adultCount,
    bookingDetails.childCount,
    bookingDetails.infantCount,
    bookingDetails.childAges,
  ]);

  const nightCount = useMemo(
    () =>
      calculateNightCount(
        bookingDetails.checkIn,
        bookingDetails.checkOut
      ),
    [bookingDetails.checkIn, bookingDetails.checkOut]
  );

  if (!isRightSidebarOpen) return null;

  const hotelName =
    selectedHotel?.name ||
    selectedHotel?.hotelName ||
    bookingDetails.hotelName ||
    "";

  const airlineName =
    selectedFlight?.airline ||
    selectedFlight?.airlineName ||
    bookingDetails.airline ||
    "";

  const destination =
    bookingDetails.city ||
    selectedHotel?.city ||
    selectedHotel?.town ||
    "";

  const roomCount =
    bookingDetails.roomCount ||
    bookingDetails.rooms ||
    1;

  const guestText = isHotel
    ? `${adultCount} ${t("rightSidebar.units.adult", {
      defaultValue: "Yetişkin",
    })}${childCount > 0
      ? `, ${childCount} ${t("rightSidebar.units.child", {
        defaultValue: "Çocuk",
      })}`
      : ""
    }${infantCount > 0
      ? `, ${infantCount} ${t("rightSidebar.units.infant", {
        defaultValue: "Bebek",
      })}`
      : ""
    }`
    : bookingDetails.guests ||
    `${bookingDetails.passengerCount || 1} ${t(
      "rightSidebar.units.passenger",
      {
        defaultValue: "yolcu",
      }
    )}`;

  const selectedItem = isHotel
    ? selectedHotel
    : selectedFlight;

  const updatedBookingDetails = {
    ...bookingDetails,
    adultCount,
    childCount,
    infantCount,
    childAges: childAges.map((age) =>
      age === "" ? "" : Number(age)
    ),
    guests: guestText,
  };

  const handlePrevious = () => {
    // Sol ok yalnızca rezervasyon adımları arasında geri gider.
    // İlk adımdayken paneli kapatmaz.
    if (currentStep > 1) {
      setCurrentStep((previousStep) => previousStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((previousStep) => previousStep + 1);
      return;
    }

    navigate("/reservation", {
      state: {
        selectedItem,
        selectedHotel,
        selectedFlight,
        bookingDetails: updatedBookingDetails,
        sessionId,
        searchType: isHotel ? "hotel" : "flight",
      },
    });
  };

  const renderHotelSearchStep = () => (
    <div>
      <h2 className="mb-2 text-sm font-bold text-slate-900 dark:text-slate-100">
        {t("rightSidebar.searchCriteria", {
          defaultValue: "Arama Kriterleri",
        })}
      </h2>

      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {t("rightSidebar.hotelReservation", {
          defaultValue: "Otel rezervasyonu",
        })}
      </p>

      <DetailRow
        icon={Hotel}
        label={t("rightSidebar.searchedHotel", {
          defaultValue: "Aranan otel",
        })}
        value={hotelName}
        placeholder={t("rightSidebar.hotelNotSelected", {
          defaultValue: "Henüz otel seçilmedi",
        })}
      />

      <DetailRow
        icon={MapPin}
        label={t("rightSidebar.destination", {
          defaultValue: "Destinasyon",
        })}
        value={destination}
        placeholder={t(
          "rightSidebar.destinationMissing",
          {
            defaultValue: "Destinasyon belirtilmedi",
          }
        )}
      />

      <DetailRow
        icon={Calendar}
        label={t("rightSidebar.stayDates", {
          defaultValue: "Konaklama tarihleri",
        })}
        value={
          bookingDetails.checkIn &&
            bookingDetails.checkOut
            ? `${formatDate(
              bookingDetails.checkIn,
              language
            )} / ${formatDate(
              bookingDetails.checkOut,
              language
            )}`
            : ""
        }
        placeholder={t("rightSidebar.datesMissing", {
          defaultValue: "Tarihler belirtilmedi",
        })}
      />

      <DetailRow
        icon={Moon}
        label={t("rightSidebar.nightCount", {
          defaultValue: "Gece sayısı",
        })}
        value={
          nightCount
            ? `${nightCount} ${t(
              "rightSidebar.units.night",
              {
                defaultValue: "gece",
              }
            )}`
            : ""
        }
        placeholder={t(
          "rightSidebar.nightCountMissing",
          {
            defaultValue: "Gece sayısı hesaplanmadı",
          }
        )}
      />

      <GuestSelector
        adultCount={adultCount}
        setAdultCount={setAdultCount}
        childCount={childCount}
        setChildCount={setChildCount}
        childAges={childAges}
        setChildAges={setChildAges}
        infantCount={infantCount}
        t={t}
      />

      <DetailRow
        icon={Bed}
        label={t("rightSidebar.roomCount", {
          defaultValue: "Oda sayısı",
        })}
        value={`${roomCount} ${t(
          "rightSidebar.units.room",
          {
            defaultValue: "oda",
          }
        )}`}
      />
    </div>
  );

  const renderFlightSearchStep = () => (
    <div>
      <h2 className="mb-2 text-sm font-bold text-slate-900 dark:text-slate-100">
        {t("rightSidebar.searchCriteria", {
          defaultValue: "Arama Kriterleri",
        })}
      </h2>

      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {t("rightSidebar.flightReservation", {
          defaultValue: "Uçuş rezervasyonu",
        })}
      </p>

      <DetailRow
        icon={Plane}
        label={t("rightSidebar.airline", {
          defaultValue: "Havayolu",
        })}
        value={airlineName}
        placeholder={t("rightSidebar.flightNotSelected", {
          defaultValue: "Henüz uçuş seçilmedi",
        })}
      />

      <DetailRow
        icon={MapPin}
        label={t("rightSidebar.departure", {
          defaultValue: "Kalkış noktası",
        })}
        value={bookingDetails.departureCity}
        placeholder={t(
          "rightSidebar.departureMissing",
          {
            defaultValue: "Kalkış noktası belirtilmedi",
          }
        )}
      />

      <DetailRow
        icon={MapPin}
        label={t("rightSidebar.arrival", {
          defaultValue: "Varış noktası",
        })}
        value={bookingDetails.arrivalCity}
        placeholder={t("rightSidebar.arrivalMissing", {
          defaultValue: "Varış noktası belirtilmedi",
        })}
      />

      <DetailRow
        icon={Calendar}
        label={t("rightSidebar.departureDate", {
          defaultValue: "Gidiş tarihi",
        })}
        value={formatDate(
          bookingDetails.checkIn,
          language
        )}
        placeholder={t(
          "rightSidebar.departureDateMissing",
          {
            defaultValue: "Gidiş tarihi belirtilmedi",
          }
        )}
      />

      {bookingDetails.returnDate && (
        <DetailRow
          icon={Calendar}
          label={t("rightSidebar.returnDate", {
            defaultValue: "Dönüş tarihi",
          })}
          value={formatDate(
            bookingDetails.returnDate,
            language
          )}
        />
      )}

      <DetailRow
        icon={Users}
        label={t("rightSidebar.passengers", {
          defaultValue: "Yolcular",
        })}
        value={guestText}
      />
    </div>
  );

  const nightCountForResults = calculateNightCount(bookingDetails.checkIn, bookingDetails.checkOut);

  const sortedSearchResults = [...searchResults].sort((a, b) => {
    if (resultSort === "price_desc") return (b.price || 0) - (a.price || 0);
    if (resultSort === "stars_desc") return (b.stars || 0) - (a.stars || 0);
    return (a.price || 0) - (b.price || 0);
  });

  const HotelResultCard = ({ result, idx }) => {
    const id = result.hotelId || result.offerId || idx;
    const isFav = favoriteIds.has(id);
    const isSelected = selectedHotel && (selectedHotel.name === result.name || selectedHotel.hotelId === result.hotelId);
    const locationParts = [result.city, result.town, result.village, result.region].filter(Boolean);
    const locationText = [...new Set(locationParts)].join(', ');

    return (
      <div
        className={`rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden transition-all ${isSelected ? "border-[#FF8A00] ring-2 ring-[#FF8A00]/20" : "border-slate-200 dark:border-slate-800"
          }`}
      >
        <div className="relative h-32 bg-slate-100 dark:bg-slate-800">
          {result.thumbnail ? (
            <img src={result.thumbnail} alt={result.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">🏨</div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(id); }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/80 shadow-sm"
          >
            <Heart size={14} className={isFav ? "fill-rose-500 text-rose-500" : "text-slate-400"} />
          </button>
          {result.available !== false && (
            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wide">
              {t("rightSidebar.available", { defaultValue: "Müsait" })}
            </span>
          )}
        </div>

        <div className="p-3.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate mb-1">{result.name}</h3>

          <div className="flex items-center gap-2 mb-1.5">
            {result.stars > 0 && (
              <span className="flex items-center gap-0.5">
                {Array.from({ length: result.stars }).map((_, i) => (
                  <Star key={i} size={11} className="fill-amber-500 text-amber-500" />
                ))}
              </span>
            )}
            {locationText && (
              <span className="flex items-center gap-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                <MapPin size={11} />
                {locationText}
              </span>
            )}
          </div>

          {(result.boardType || result.pensionType) && (
            <span className="inline-block px-2 py-0.5 mb-2 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase">
              {result.boardType || result.pensionType}
            </span>
          )}

          <div className="flex items-end justify-between mt-1">
            <div>
              <div className="text-base font-extrabold text-[#FF8A00] dark:text-orange-400">
                {formatPriceValue(result.price, result.currency)}
              </div>
              {nightCountForResults && (
                <div className="text-[10px] text-slate-400 dark:text-slate-500">
                  {nightCountForResults} {t("unit_night", { defaultValue: "gece" })} {t("rightSidebar.total", { defaultValue: "toplamı" })}
                </div>
              )}
            </div>
            <button
              onClick={() => onSelectHotel && onSelectHotel(result)}
              className="px-3.5 py-1.5 rounded-lg bg-[#FF8A00] hover:bg-[#E87900] text-white text-xs font-bold transition-colors"
            >
              {t("rightSidebar.viewDetails", { defaultValue: "İncele" })}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const FlightResultCard = ({ result, idx }) => {
    const id = result.offerId || idx;
    const isFav = favoriteIds.has(id);
    const isSelected = selectedFlight && selectedFlight.offerId === result.offerId;

    return (
      <div
        className={`rounded-2xl border bg-white dark:bg-slate-900 p-3.5 transition-all ${isSelected ? "border-[#FF8A00] ring-2 ring-[#FF8A00]/20" : "border-slate-200 dark:border-slate-800"
          }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white">{result.airline}</span>
          <button onClick={() => toggleFavorite(id)} className="p-1">
            <Heart size={14} className={isFav ? "fill-rose-500 text-rose-500" : "text-slate-400"} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
          <Plane size={12} />
          {result.transfers || t("reservation_direct", { defaultValue: "Direkt Uçuş" })}
        </div>
        <div className="flex items-end justify-between">
          <div className="text-base font-extrabold text-[#FF8A00] dark:text-orange-400">
            {formatPriceValue(result.price, result.currency)}
          </div>
          <button
            onClick={() => onSelectFlight && onSelectFlight(result)}
            className="px-3.5 py-1.5 rounded-lg bg-[#FF8A00] hover:bg-[#E87900] text-white text-xs font-bold transition-colors"
          >
            {t("rightSidebar.viewDetails", { defaultValue: "İncele" })}
          </button>
        </div>
      </div>
    );
  };

  const renderSelectionStep = () => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          {t("rightSidebar.foundForYou", { defaultValue: "Sizin için bulundu" })}
        </h2>
        {searchResults.length > 0 && (
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            {searchResults.length} {isHotel ? t("rightSidebar.hotelCount", { defaultValue: "otel" }) : t("rightSidebar.flightCount", { defaultValue: "uçuş" })}
          </span>
        )}
      </div>

      {searchResults.length > 0 ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={13} className="text-slate-400 flex-shrink-0" />
            <select
              value={resultSort}
              onChange={(e) => setResultSort(e.target.value)}
              className="flex-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              <option value="price_asc">{t("sort_price_asc", { defaultValue: "Fiyat: Ucuzdan Pahalıya" })}</option>
              <option value="price_desc">{t("sort_price_desc", { defaultValue: "Fiyat: Pahalıdan Ucuza" })}</option>
              {isHotel && <option value="stars_desc">{t("sort_stars_desc", { defaultValue: "Yıldız: Yüksekten Düşüğe" })}</option>}
            </select>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 -mr-1">
            {sortedSearchResults.map((result, idx) =>
              isHotel
                ? <HotelResultCard key={result.hotelId || idx} result={result} idx={idx} />
                : <FlightResultCard key={result.offerId || idx} result={result} idx={idx} />
            )}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4 dark:border-orange-500/20 dark:bg-orange-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#FF8A00] shadow-sm dark:bg-slate-800 dark:text-orange-400">
              {isHotel ? <Hotel size={22} /> : <Plane size={22} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {isHotel
                  ? t("rightSidebar.selectedHotel", { defaultValue: "Seçilen otel" })
                  : t("rightSidebar.selectedAirline", { defaultValue: "Seçilen havayolu" })}
              </p>
              <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                {isHotel
                  ? hotelName || t("rightSidebar.selectHotelFromChat", { defaultValue: "Sohbet alanından bir otel seç" })
                  : airlineName || t("rightSidebar.selectFlightFromChat", { defaultValue: "Sohbet alanından bir uçuş seç" })}
              </p>
            </div>
          </div>
          {bookingDetails.price && (
            <div className="mt-4 flex items-center justify-between border-t border-orange-100 pt-3 dark:border-orange-500/20">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t("rightSidebar.totalAmount", { defaultValue: "Toplam tutar" })}
              </span>
              <span className="text-base font-extrabold text-[#FF8A00] dark:text-orange-400">
                {bookingDetails.price}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <div>
      <h2 className="mb-2 text-sm font-bold text-slate-900 dark:text-slate-100">
        {t("rightSidebar.reservationSummary", {
          defaultValue: "Rezervasyon Özeti",
        })}
      </h2>

      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {t("rightSidebar.checkInformation", {
          defaultValue: "Bilgilerini kontrol et",
        })}
      </p>

      {isHotel ? (
        <>
          <DetailRow
            icon={Hotel}
            label={t("rightSidebar.selectedHotel", {
              defaultValue: "Seçilen otel",
            })}
            value={hotelName}
            placeholder={t(
              "rightSidebar.hotelNotSelected",
              {
                defaultValue: "Otel seçilmedi",
              }
            )}
          />

          <DetailRow
            icon={MapPin}
            label={t("rightSidebar.destination", {
              defaultValue: "Destinasyon",
            })}
            value={destination}
          />

          <DetailRow
            icon={Calendar}
            label={t("rightSidebar.stayDates", {
              defaultValue: "Konaklama tarihleri",
            })}
            value={
              bookingDetails.checkIn &&
                bookingDetails.checkOut
                ? `${formatDate(
                  bookingDetails.checkIn,
                  language
                )} / ${formatDate(
                  bookingDetails.checkOut,
                  language
                )}`
                : ""
            }
            placeholder={t(
              "rightSidebar.informationPending",
              {
                defaultValue: "Bilgi bekleniyor",
              }
            )}
          />

          <DetailRow
            icon={Users}
            label={t("rightSidebar.guests", {
              defaultValue: "Misafirler",
            })}
            value={guestText}
          />

          {childCount > 0 && (
            <DetailRow
              icon={Baby}
              label={t("rightSidebar.childAges", {
                defaultValue: "Çocuk yaşları",
              })}
              value={childAges
                .map((age, index) =>
                  age === ""
                    ? `${index + 1}. ${t("rightSidebar.ageMissing", {
                      defaultValue: "yaş seçilmedi",
                    })}`
                    : `${age} ${t("rightSidebar.units.age", {
                      defaultValue: "yaş",
                    })}`
                )
                .join(", ")}
            />
          )}

          <DetailRow
            icon={Bed}
            label={t("rightSidebar.roomCount", {
              defaultValue: "Oda sayısı",
            })}
            value={`${roomCount} ${t(
              "rightSidebar.units.room",
              {
                defaultValue: "oda",
              }
            )}`}
          />
        </>
      ) : (
        <>
          <DetailRow
            icon={Plane}
            label={t("rightSidebar.airline", {
              defaultValue: "Havayolu",
            })}
            value={airlineName}
            placeholder={t(
              "rightSidebar.flightNotSelected",
              {
                defaultValue: "Uçuş seçilmedi",
              }
            )}
          />

          <DetailRow
            icon={MapPin}
            label={t("rightSidebar.route", {
              defaultValue: "Rota",
            })}
            value={
              bookingDetails.departureCity &&
                bookingDetails.arrivalCity
                ? `${bookingDetails.departureCity} → ${bookingDetails.arrivalCity}`
                : ""
            }
            placeholder={t(
              "rightSidebar.routeMissing",
              {
                defaultValue: "Rota belirtilmedi",
              }
            )}
          />

          <DetailRow
            icon={Calendar}
            label={t("rightSidebar.departureDate", {
              defaultValue: "Gidiş tarihi",
            })}
            value={formatDate(
              bookingDetails.checkIn,
              language
            )}
          />

          {bookingDetails.returnDate && (
            <DetailRow
              icon={Calendar}
              label={t("rightSidebar.returnDate", {
                defaultValue: "Dönüş tarihi",
              })}
              value={formatDate(
                bookingDetails.returnDate,
                language
              )}
            />
          )}

          <DetailRow
            icon={Users}
            label={t("rightSidebar.passengers", {
              defaultValue: "Yolcular",
            })}
            value={guestText}
          />
        </>
      )}

      {bookingDetails.price && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-orange-50 px-4 py-3 dark:bg-orange-500/10">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {t("rightSidebar.totalAmount", {
              defaultValue: "Toplam tutar",
            })}
          </span>

          <span className="text-lg font-extrabold text-[#FF8A00] dark:text-orange-400">
            {bookingDetails.price}
          </span>
        </div>
      )}
    </div>
  );

  const buttonText =
    currentStep === 1
      ? isHotel
        ? t("rightSidebar.buttons.searchHotel", {
          defaultValue: "Otel Ara",
        })
        : t("rightSidebar.buttons.searchFlight", {
          defaultValue: "Uçuş Ara",
        })
      : currentStep === 2
        ? t("rightSidebar.buttons.continue", {
          defaultValue: "Devam Et",
        })
        : t("rightSidebar.buttons.makeReservation", {
          defaultValue: "Rezervasyon Yap",
        });

  return (
    <aside className="relative z-30 hidden h-full w-[420px] min-w-[420px] max-w-[420px] flex-none overflow-hidden border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white dark:bg-slate-900">
        {/* Üst bölüm sabit kalır; panel kaydırıldığında kaybolmaz. */}
        <div className="flex-shrink-0 border-b border-slate-100 bg-white px-6 pb-4 pt-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#FF8A00] transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-35 dark:text-orange-400 dark:hover:bg-orange-500/10"
              title={t("rightSidebar.previous", {
                defaultValue: "Önceki",
              })}
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              onClick={() => setIsRightSidebarOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title={t("rightSidebar.closePanel", {
                defaultValue: "Paneli kapat",
              })}
            >
              <PanelRightClose size={17} />
            </button>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              {t("rightSidebar.title", {
                defaultValue: "Rezervasyon Özeti",
              })}
            </h1>

            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#FF8A00] dark:bg-orange-500/10 dark:text-orange-400">
              {currentStep}/3
            </span>
          </div>

          <div className="mb-5 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-[#FF8A00] transition-all duration-300 dark:bg-orange-500"
              style={{
                width: `${(currentStep / 3) * 100}%`,
              }}
            />
          </div>

          <Stepper
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            t={t}
          />
        </div>

        {/* Sadece adım içeriği kaydırılır. */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {currentStep === 1 &&
            (isHotel
              ? renderHotelSearchStep()
              : renderFlightSearchStep())}

          {currentStep === 2 &&
            renderSelectionStep()}

          {currentStep === 3 &&
            renderReviewStep()}
        </div>

        <div className="flex-shrink-0 border-t border-slate-100 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8A00] px-4 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(255,138,0,0.28)] transition hover:bg-[#E87900] active:scale-[0.99] dark:bg-orange-500 dark:hover:bg-orange-600"
          >
            {buttonText}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}