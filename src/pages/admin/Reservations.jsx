import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Search,
    Eye,
    CalendarCheck,
    LoaderCircle,
    AlertCircle,
    X,
} from "lucide-react";

import { getReservations } from "../../services/adminReservationService.js";

export default function Reservations() {
    const { t, i18n } = useTranslation();

    const [reservations, setReservations] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("ALL"); // "ALL", "HOTEL", "FLIGHT"
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedReservation, setSelectedReservation] = useState(null);

    useEffect(() => {
        async function loadReservations() {
            try {
                setLoading(true);
                setError("");

                const data = await getReservations();

                setReservations(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Rezervasyonlar alınamadı:", err);

                setError(t("reservations.load_error"));
            } finally {
                setLoading(false);
            }
        }

        loadReservations();
    }, [t]);

    const filteredReservations = reservations.filter((reservation) => {
        const searchValue = searchTerm.trim().toLocaleLowerCase('tr-TR');
        const typeMatch = activeTab === "ALL" || (reservation.type || "").toUpperCase() === activeTab;

        if (!typeMatch) return false;

        return (
            (reservation.reservationNumber || "")
                .toLocaleLowerCase('tr-TR')
                .includes(searchValue) ||
            (reservation.itemName || "")
                .toLocaleLowerCase('tr-TR')
                .includes(searchValue) ||
            (reservation.destination || "")
                .toLocaleLowerCase('tr-TR')
                .includes(searchValue) ||
            (reservation.type || "")
                .toLocaleLowerCase('tr-TR')
                .includes(searchValue)
        );
    });

    function getLocale() {
        const localeMap = {
            tr: "tr-TR",
            en: "en-US",
            de: "de-DE",
            ru: "ru-RU",
        };

        const currentLanguage = i18n.resolvedLanguage || i18n.language || "en";

        return localeMap[currentLanguage] || "en-US";
    }

    function formatDate(date) {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(`${date}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return new Intl.DateTimeFormat(getLocale()).format(parsedDate);
    }

    function formatPrice(price, currency) {
        if (price === null || price === undefined) {
            return "-";
        }

        try {
            return new Intl.NumberFormat(getLocale(), {
                style: "currency",
                currency: currency || "TRY",
            }).format(price);
        } catch {
            return `${price} ${currency || ""}`.trim();
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400">
                    <LoaderCircle
                        size={24}
                        className="animate-spin text-orange-500"
                    />

                    <span>{t("reservations.loading")}</span>
                </div>
            </div>
        );
    }

    const allCount = reservations.length;
    const hotelCount = reservations.filter((r) => (r.type || "").toUpperCase() === "HOTEL").length;
    const flightCount = reservations.filter((r) => (r.type || "").toUpperCase() === "FLIGHT").length;

    return (
        <div className="space-y-6">
            {/* Sayfa başlığı */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t("reservations.title", "Rezervasyonlar")}
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                        {t("reservations.description", "Sistemdeki tüm otel ve uçuş rezervasyonlarını görüntüleyin.")}
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-600 dark:bg-orange-950/20 dark:text-orange-400">
                    <CalendarCheck size={18} />

                    <span>
                        {t("reservations.reservation_count", {
                            count: filteredReservations.length,
                            defaultValue: `Toplam: ${filteredReservations.length} Kayıt`
                        })}
                    </span>
                </div>
            </div>

            {/* Hata mesajı */}
            {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                    <AlertCircle size={18} />

                    {error}
                </div>
            )}

            {/* Rezervasyon tablosu */}
            <div className="overflow-hidden rounded-2xl border border-gray-250 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                {/* Arama alanı ve Sekmeler */}
                <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full max-w-md">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                        />

                        <input
                            type="text"
                            placeholder={t(
                                "reservations.search_placeholder",
                                "PNR, ürün adı veya destinasyon ara..."
                            )}
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-orange-950"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-gray-50 p-1.5 dark:bg-slate-950/80">
                        <button
                            type="button"
                            onClick={() => setActiveTab("ALL")}
                            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                                activeTab === "ALL"
                                    ? "bg-white text-orange-500 shadow-sm dark:bg-slate-800 dark:text-orange-400"
                                    : "text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                        >
                            {t("reservations.tabs.all", "Tümü")}
                            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                activeTab === "ALL" ? "bg-orange-50 text-orange-500 dark:bg-orange-950/40 dark:text-orange-400" : "bg-gray-200/60 text-gray-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}>
                                {allCount}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("HOTEL")}
                            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                                activeTab === "HOTEL"
                                    ? "bg-white text-orange-500 shadow-sm dark:bg-slate-800 dark:text-orange-400"
                                    : "text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                        >
                            {t("reservations.tabs.hotel", "Otel")}
                            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                activeTab === "HOTEL" ? "bg-orange-50 text-orange-500 dark:bg-orange-950/40 dark:text-orange-400" : "bg-gray-200/60 text-gray-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}>
                                {hotelCount}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("FLIGHT")}
                            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                                activeTab === "FLIGHT"
                                    ? "bg-white text-orange-500 shadow-sm dark:bg-slate-800 dark:text-orange-400"
                                    : "text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                        >
                            {t("reservations.tabs.flight", "Uçuş")}
                            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                activeTab === "FLIGHT" ? "bg-orange-50 text-orange-500 dark:bg-orange-950/40 dark:text-orange-400" : "bg-gray-200/60 text-gray-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}>
                                {flightCount}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-left">
                        <thead className="border-b border-gray-150 bg-gray-50/50 text-xs font-bold uppercase tracking-wider text-gray-400 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                            <tr>
                                <th className="px-6 py-4">
                                    {t(
                                        "reservations.table.reservation_number"
                                    )}
                                </th>

                                <th className="px-6 py-4">
                                    {t("reservations.table.type")}
                                </th>

                                <th className="px-6 py-4">
                                    {t("reservations.table.product")}
                                </th>

                                <th className="px-6 py-4">
                                    {t("reservations.table.destination")}
                                </th>

                                <th className="px-6 py-4">
                                    {t("reservations.table.start_date")}
                                </th>

                                <th className="px-6 py-4">
                                    {t("reservations.table.end_date")}
                                </th>

                                <th className="px-6 py-4">
                                    {t("reservations.table.passenger")}
                                </th>

                                <th className="px-6 py-4">
                                    {t("reservations.table.total")}
                                </th>

                                <th className="px-6 py-4">
                                    {t("reservations.table.action")}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredReservations.map((reservation) => (
                                <tr
                                    key={reservation.id}
                                    className="border-t border-gray-100 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/40"
                                >
                                    <td className="px-6 py-4 font-semibold text-gray-800 dark:text-slate-200">
                                        {reservation.reservationNumber || "-"}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            (reservation.type || "").toUpperCase() === "HOTEL"
                                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                        }`}>
                                            {(reservation.type || "-").toUpperCase()}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-slate-200">
                                        {reservation.itemName || "-"}
                                    </td>

                                    <td className="px-6 py-4">
                                        {reservation.destination || "-"}
                                    </td>

                                    <td className="px-6 py-4">
                                        {formatDate(reservation.startDate)}
                                    </td>

                                    <td className="px-6 py-4">
                                        {formatDate(reservation.endDate)}
                                    </td>

                                    <td className="px-6 py-4">
                                        {Array.isArray(
                                            reservation.passengers
                                        )
                                            ? reservation.passengers.length
                                            : 0}
                                    </td>

                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                        {formatPrice(
                                            reservation.totalPrice,
                                            reservation.currency
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedReservation(reservation)}
                                            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                                            aria-label={t(
                                                "reservations.view_details"
                                            )}
                                            title={t(
                                                "reservations.view_details"
                                            )}
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!error && filteredReservations.length === 0 && (
                    <div className="p-10 text-center text-sm text-gray-500 dark:text-slate-400">
                        {t("reservations.not_found")}
                    </div>
                )}
            </div>

            {/* Rezervasyon Detay Modalı */}
            {selectedReservation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="relative w-full max-w-2xl rounded-2xl border border-gray-150 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-slide-up max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-150 pb-4 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-gray-955 dark:text-white flex items-center gap-2">
                                    <span className="text-orange-500">#{selectedReservation.reservationNumber}</span>
                                    Rezervasyon Detayları
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                    TourVisio rezervasyon verileri ve yolcu listesi.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedReservation(null)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Detay Kartları */}
                        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                            <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-950/40">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Hizmet Tipi</span>
                                <p className="mt-1 font-bold text-gray-800 dark:text-slate-200 uppercase">
                                    {selectedReservation.type}
                                </p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-950/40 col-span-1 sm:col-span-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Ürün Adı</span>
                                <p className="mt-1 font-bold text-gray-800 dark:text-slate-200 truncate" title={selectedReservation.itemName}>
                                    {selectedReservation.itemName}
                                </p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-950/40">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Destinasyon</span>
                                <p className="mt-1 font-bold text-gray-800 dark:text-slate-200">
                                    {selectedReservation.destination}
                                </p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-950/40">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Toplam Tutar</span>
                                <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatPrice(selectedReservation.totalPrice, selectedReservation.currency)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-950/40">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Kişi Sayısı</span>
                                <p className="mt-1 font-bold text-gray-800 dark:text-slate-200">
                                    {Array.isArray(selectedReservation.passengers) ? selectedReservation.passengers.length : 0} Yolcu
                                </p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-950/40">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Giriş / Kalkış</span>
                                <p className="mt-1 font-semibold text-gray-800 dark:text-slate-200">
                                    {formatDate(selectedReservation.startDate)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-950/40">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Çıkış / İniş</span>
                                <p className="mt-1 font-semibold text-gray-800 dark:text-slate-200">
                                    {formatDate(selectedReservation.endDate)}
                                </p>
                            </div>
                        </div>

                        {/* Yolcu Bilgileri Bölümü */}
                        <div className="mt-6">
                            <h4 className="text-xs font-bold text-gray-955 dark:text-white uppercase tracking-wider mb-3">
                                Yolcu Bilgileri ({Array.isArray(selectedReservation.passengers) ? selectedReservation.passengers.length : 0})
                            </h4>
                            
                            <div className="space-y-3">
                                {Array.isArray(selectedReservation.passengers) && selectedReservation.passengers.length > 0 ? (
                                    selectedReservation.passengers.map((passenger, idx) => (
                                        <div key={idx} className="rounded-xl border border-gray-150 p-4 dark:border-slate-800 dark:bg-slate-950/20 text-xs">
                                            <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2 dark:border-slate-800">
                                                <span className="font-bold text-gray-800 dark:text-white">
                                                    {idx + 1}. {passenger.firstName} {passenger.lastName}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-1.5 py-0.5 text-[9px] font-bold text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 uppercase">
                                                    {passenger.gender === "MALE" ? "Erkek" : passenger.gender === "FEMALE" ? "Kadın" : passenger.gender}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                <div>
                                                    <span className="text-[9px] text-gray-400 dark:text-slate-500 uppercase">Kimlik / Pasaport</span>
                                                    <p className="font-semibold text-gray-700 dark:text-slate-300">{passenger.identityNumber || "-"}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-gray-400 dark:text-slate-500 uppercase">Doğum Tarihi</span>
                                                    <p className="font-semibold text-gray-700 dark:text-slate-300">{formatDate(passenger.birthDate)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-gray-400 dark:text-slate-500 uppercase">Uyruk</span>
                                                    <p className="font-semibold text-gray-700 dark:text-slate-300">{passenger.nationality || "-"}</p>
                                                </div>
                                                {passenger.email && (
                                                    <div className="col-span-2">
                                                        <span className="text-[9px] text-gray-400 dark:text-slate-500 uppercase">E-posta</span>
                                                        <p className="font-semibold text-gray-700 dark:text-slate-300">{passenger.email}</p>
                                                    </div>
                                                )}
                                                {passenger.phoneNumber && (
                                                    <div>
                                                        <span className="text-[9px] text-gray-400 dark:text-slate-500 uppercase">Telefon</span>
                                                        <p className="font-semibold text-gray-700 dark:text-slate-300">{passenger.phoneNumber}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-center py-4">Bu rezervasyona ait kayıtlı yolcu bulunmamaktadır.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}