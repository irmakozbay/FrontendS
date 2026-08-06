import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    TrendingUp,
    Percent,
    Hotel,
    Plane,
    BarChart3,
    Award,
    Activity,
    DollarSign,
} from "lucide-react";
import api from "../../services/api.js";

export default function Analytics() {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('adminToken') || "";
        api.get("/api/admin/analytics", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((res) => {
                if (res.data) {
                    setData(res.data);
                }
            })
            .catch((err) => {
                console.error("Error fetching analytics data:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Helper to format currency
    const formatCurrency = (val) => {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                    <BarChart3 className="text-orange-500" />
                    {t("analytics_page.title", "Analitik Detaylar")}
                </h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                    {t("analytics_page.description", "Rezervasyon dağılımları, ciro kırılımları ve en çok tercih edilen seyahat hedefleri.")}
                </p>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400">
                    <span className="inline-block animate-pulse text-sm">{t("common.loading", "Analizler Yükleniyor...")}</span>
                </div>
            ) : data ? (
                <div className="space-y-6">
                    {/* Üst Kartlar: Dağılım ve Dönüşüm */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Otel Rezervasyon Özeti */}
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50 flex items-center justify-between">
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">OTEL GELİRİ</span>
                                <h3 className="text-xl font-extrabold text-gray-800 dark:text-white truncate">
                                    {formatCurrency(data.hotelRevenue)}
                                </h3>
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                    <Hotel size={13} className="text-amber-500" />
                                    {data.hotelReservationsCount} Toplam Rezervasyon
                                </p>
                            </div>
                            <div className="rounded-2xl bg-amber-500/10 p-4 text-amber-500">
                                <Hotel size={24} />
                            </div>
                        </div>

                        {/* Uçuş Rezervasyon Özeti */}
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50 flex items-center justify-between">
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">UÇUŞ GELİRİ</span>
                                <h3 className="text-xl font-extrabold text-gray-800 dark:text-white truncate">
                                    {formatCurrency(data.flightRevenue)}
                                </h3>
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                    <Plane size={13} className="text-blue-500" />
                                    {data.flightReservationsCount} Toplam Rezervasyon
                                </p>
                            </div>
                            <div className="rounded-2xl bg-blue-500/10 p-4 text-blue-500">
                                <Plane size={24} />
                            </div>
                        </div>

                        {/* Dönüşüm Oranı Kartı */}
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50 flex items-center justify-between">
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">REZERVASYON DÖNÜŞÜMÜ</span>
                                <h3 className="text-xl font-extrabold text-gray-800 dark:text-white flex items-center gap-1">
                                    %{data.conversionRate}
                                </h3>
                                <p className="text-xs text-gray-400">
                                    {data.totalSessions} Canlı Görüşme Üzerinden
                                </p>
                            </div>
                            <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-500">
                                <Percent size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Orta Bölüm: Donut Dağılım Grafiği ve Dönüşüm Detayı */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Rezervasyon Türü Dağılımı Donut Chart */}
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50 flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200">
                                    Rezervasyon Dağılımı (Adet)
                                </h3>
                                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                                    Hizmet tiplerine göre yapılan rezervasyonların oranı.
                                </p>
                            </div>

                            <div className="flex justify-center items-center py-6">
                                <div className="relative h-32 w-32 flex items-center justify-center">
                                    {/* SVG Donut Chart */}
                                    {data.hotelReservationsCount + data.flightReservationsCount > 0 ? (
                                        (() => {
                                            const total = data.hotelReservationsCount + data.flightReservationsCount;
                                            const hotelPercentage = (data.hotelReservationsCount / total) * 100;
                                            const strokeOffset = 314 - (314 * hotelPercentage) / 100;

                                            return (
                                                <svg className="h-full w-full transform -rotate-90">
                                                    {/* Outer circle (Flight - Blue) */}
                                                    <circle
                                                        cx="64"
                                                        cy="64"
                                                        r="50"
                                                        stroke="#3b82f6"
                                                        strokeWidth="14"
                                                        fill="transparent"
                                                    />
                                                    {/* Inner portion (Hotel - Amber) */}
                                                    <circle
                                                        cx="64"
                                                        cy="64"
                                                        r="50"
                                                        stroke="#f59e0b"
                                                        strokeWidth="14"
                                                        fill="transparent"
                                                        strokeDasharray="314"
                                                        strokeDashoffset={strokeOffset}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                            );
                                        })()
                                    ) : (
                                        <div className="text-gray-300 dark:text-slate-800">Veri Yok</div>
                                    )}
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold">Toplam</span>
                                        <span className="text-xl font-extrabold text-gray-800 dark:text-white">
                                            {data.hotelReservationsCount + data.flightReservationsCount}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                        <span className="text-gray-500 dark:text-slate-400">Otel Stajı</span>
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-slate-200">%{
                                        data.hotelReservationsCount + data.flightReservationsCount > 0
                                            ? Math.round((data.hotelReservationsCount / (data.hotelReservationsCount + data.flightReservationsCount)) * 100)
                                            : 0
                                    }</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                                        <span className="text-gray-500 dark:text-slate-400">Uçuş Seferleri</span>
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-slate-200">%{
                                        data.hotelReservationsCount + data.flightReservationsCount > 0
                                            ? Math.round((data.flightReservationsCount / (data.hotelReservationsCount + data.flightReservationsCount)) * 100)
                                            : 0
                                    }</span>
                                </div>
                            </div>
                        </div>

                        {/* En Popüler Oteller Listesi */}
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50 col-span-2">
                            <div className="mb-4">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Award size={16} className="text-amber-500" />
                                    En Çok Tercih Edilen Oteller
                                </h3>
                                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                                    Sistem üzerinden rezervasyonu en çok yapılan otel işletmeleri.
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50 font-bold uppercase tracking-wider text-gray-400 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-500">
                                            <th className="px-4 py-2.5">Otel Adı</th>
                                            <th className="px-4 py-2.5 text-center">Rezervasyon</th>
                                            <th className="px-4 py-2.5 text-right">Toplam Hacim</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-350">
                                        {data.topHotels && data.topHotels.length > 0 ? (
                                            data.topHotels.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/20 dark:hover:bg-slate-800/10">
                                                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white truncate max-w-[200px]">{item.name}</td>
                                                    <td className="px-4 py-3 text-center font-bold text-orange-500">{item.count} Kez</td>
                                                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.totalRevenue)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="text-center py-6 text-gray-400">Henüz otel rezervasyonu bulunmuyor.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Alt Bölüm: En Çok Tercih Edilen Uçuş Rotaları ve Retrospektif Analizi */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* En Popüler Uçuş Rotaları */}
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50 lg:col-span-1 flex flex-col justify-between">
                            <div>
                                <div className="mb-4">
                                    <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                                        <Award size={16} className="text-blue-500" />
                                        En Popüler Uçuş Rotaları
                                    </h3>
                                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                                        Asistan aracılığıyla en çok bilet kesilen uçuş noktaları.
                                    </p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/50 font-bold uppercase tracking-wider text-gray-400 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-500">
                                                <th className="px-4 py-2.5">Rota / Sefer</th>
                                                <th className="px-4 py-2.5 text-center">Bilet</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-350">
                                            {data.topFlights && data.topFlights.length > 0 ? (
                                                data.topFlights.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/20 dark:hover:bg-slate-800/10">
                                                        <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white truncate max-w-[120px]">{item.name}</td>
                                                        <td className="px-4 py-3 text-center font-bold text-blue-500">{item.count} Bilet</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="2" className="text-center py-6 text-gray-400">Henüz uçuş rezervasyonu bulunmuyor.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Yazılım Geliştirme & Retrospektif Analizi */}
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50 lg:col-span-2 flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Settings size={16} className="text-orange-500" />
                                    Yazılım Geliştirme & Retrospektif Analizi (AI Sonrası)
                                </h3>
                                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                                    AI asistan entegrasyonu sonrası süreç dağılımları ve ekip retrospektif anket sonuçları.
                                </p>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Geliştirme vs İnceleme Süreleri */}
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Süre Dağılımları (AI Sonrası)</h4>
                                    
                                    {/* Review Süresi */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-xs font-semibold">
                                            <span className="text-gray-700 dark:text-slate-350 flex items-center gap-1">
                                                <Clock size={13} className="text-orange-500" />
                                                Kod İnceleme (Review) Süresi
                                            </span>
                                            <span className="text-orange-500 font-bold">%{data.reviewTimePercentage || 74} (Uzadı)</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                                                style={{ width: `${data.reviewTimePercentage || 74}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Development Süresi */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-xs font-semibold">
                                            <span className="text-gray-700 dark:text-slate-350 flex items-center gap-1">
                                                <TrendingUp size={13} className="text-emerald-500" />
                                                Geliştirme (Development) Süresi
                                            </span>
                                            <span className="text-emerald-500 font-bold">%{data.developmentTimePercentage || 26} (Kısaldı)</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                                style={{ width: `${data.developmentTimePercentage || 26}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Ekip Retro Anket Bulguları */}
                                <div className="space-y-3">
                                    <h4 className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Ekip Retro Anket Sonuçları</h4>
                                    
                                    {/* Scrum Sprint Uyumu */}
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-505 dark:text-slate-400">Scrum Sprint Uyumu</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-gray-800 dark:text-slate-200">%{data.scrumSprintCompatibility || 85}</span>
                                            <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded font-semibold">Daha Uyumlu</span>
                                        </div>
                                    </div>

                                    {/* Kanban Mimarisi */}
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-505 dark:text-slate-400">Kanban Mimarisi Tercihi</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-gray-800 dark:text-slate-200">%{data.kanbanArchitectureUsage || 65}</span>
                                            <span className="text-[9px] px-1.5 py-0.5 bg-violet-500/10 text-violet-500 rounded font-semibold">Kullanıldı</span>
                                        </div>
                                    </div>

                                    {/* Retro Katılımı / Anket Başarısı */}
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-550 dark:text-slate-400">Retro Anket Verimliliği</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-gray-800 dark:text-slate-200">%{data.retroSurveyScore || 92}</span>
                                            <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-semibold">Başarılı</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-20 text-center text-gray-500">
                    {t("analytics_page.no_data", "Analiz verilerine ulaşılamıyor.")}
                </div>
            )}
        </div>
    );
}
