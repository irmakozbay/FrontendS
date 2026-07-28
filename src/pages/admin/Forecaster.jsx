import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    LineChart,
    TrendingUp,
    ShieldAlert,
    Brain,
    Percent,
    DollarSign,
    Calendar,
    Activity,
    AlertTriangle,
} from "lucide-react";
import api from "../../services/api.js";

export default function Forecaster() {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('adminToken') || "";
        api.get("/api/admin/forecasts", {
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
                console.error("Error fetching forecasting data:", err);
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

    // Helper to generate SVG path for a line chart
    const getSvgLinePath = (dataList, valueSelector, width = 500, height = 180, padding = 15) => {
        if (!dataList || dataList.length === 0) return "";
        const values = dataList.map(valueSelector);
        const maxVal = Math.max(...values, 1);
        const minVal = Math.min(...values, 0);
        const range = maxVal - minVal || 1;

        const points = dataList.map((d, index) => {
            const x = (index / (dataList.length - 1)) * (width - 2 * padding) + padding;
            const y = height - padding - ((valueSelector(d) - minVal) / range) * (height - 2 * padding);
            return `${x},${y}`;
        });
        return `M ${points.join(" L ")}`;
    };

    // Helper to generate SVG path for an area chart
    const getSvgAreaPath = (dataList, valueSelector, width = 500, height = 180, padding = 15) => {
        if (!dataList || dataList.length === 0) return { line: "", area: "" };
        const values = dataList.map(valueSelector);
        const maxVal = Math.max(...values, 1);
        const minVal = Math.min(...values, 0);
        const range = maxVal - minVal || 1;

        const points = dataList.map((d, index) => {
            const x = (index / (dataList.length - 1)) * (width - 2 * padding) + padding;
            const y = height - padding - ((valueSelector(d) - minVal) / range) * (height - 2 * padding);
            return { x, y };
        });

        const linePath = `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}`;
        const areaPath = `${linePath} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;
        return { line: linePath, area: areaPath };
    };

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-700 p-8 text-white shadow-lg">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
                            <Brain className="text-violet-200 animate-pulse" />
                            {t("forecaster_page.title", "AI Rezervasyon Tahmincisi")}
                        </h1>
                        <p className="mt-2 text-violet-100 text-sm max-w-xl">
                            {t(
                                "forecaster_page.subtitle",
                                "Yapay zeka ve makine öğrenimi modelleriyle 90 günlük ciro, hacim ve olası sistem risk analizleri."
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400">
                    <span className="inline-block animate-pulse text-sm">{t("common.loading", "Tahminler Hesaplanıyor...")}</span>
                </div>
            ) : data ? (
                <div className="space-y-6">
                    {/* Üst Kartlar: 90 Günlük Tahminler */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Tahmini Rezervasyon */}
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50 flex items-center justify-between">
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">TAHMİNİ REZERVASYON (90G)</span>
                                <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white">
                                    {data.projectedReservations90d} Kayıt
                                </h3>
                                <p className="text-xs text-gray-400">
                                    Mevcut trend artışı baz alınarak hesaplandı.
                                </p>
                            </div>
                            <div className="rounded-2xl bg-violet-500/10 p-4 text-violet-500">
                                <Calendar size={24} />
                            </div>
                        </div>

                        {/* Tahmini Ciro */}
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50 flex items-center justify-between">
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">TAHMİNİ CİRO (90G)</span>
                                <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white">
                                    {formatCurrency(data.projectedRevenue90d)}
                                </h3>
                                <p className="text-xs text-gray-400">
                                    Son 30 günlük satış ortalaması yansıtıldı.
                                </p>
                            </div>
                            <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-500">
                                <TrendingUp size={24} />
                            </div>
                        </div>

                        {/* AI Doğruluk Skoru */}
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50 flex items-center justify-between">
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">MODEL GÜVENİLİRLİK SKORU</span>
                                <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white">
                                    %{data.reservationAccuracyScore}
                                </h3>
                                <p className="text-xs text-gray-400">
                                    Rezervasyon sapma varyansı analizi.
                                </p>
                            </div>
                            <div className="rounded-2xl bg-cyan-500/10 p-4 text-cyan-500">
                                <Percent size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Orta Bölüm: 90 Günlük Ciro/Rezervasyon Eğrisi & Canlı Sistem Riskleri */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* 90 Günlük Ciro Tahmin Eğrisi */}
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50 col-span-2">
                            <div className="mb-6 flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200">
                                        90 Günlük Ciro Projeksiyonu
                                    </h3>
                                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                                        10'ar günlük periyotlar halinde tahmini biriken ciro artışı (TL).
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-semibold">
                                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                                    <span className="text-gray-500 dark:text-slate-400">Tahmini Ciro (TL)</span>
                                </div>
                            </div>

                            <div className="relative h-[200px] w-full">
                                <svg className="h-full w-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="violet-gradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>
                                    {/* Grid lines */}
                                    <line x1="15" y1="15" x2="485" y2="15" stroke="currentColor" className="text-gray-100 dark:text-slate-800" strokeDasharray="4 4" />
                                    <line x1="15" y1="90" x2="485" y2="90" stroke="currentColor" className="text-gray-100 dark:text-slate-800" strokeDasharray="4 4" />
                                    <line x1="15" y1="165" x2="485" y2="165" stroke="currentColor" className="text-gray-150 dark:text-slate-800" />

                                    {/* Area Fill */}
                                    <path
                                        d={getSvgAreaPath(data.forecastTimeline, d => d.expectedRevenue).area}
                                        fill="url(#violet-gradient)"
                                    />

                                    {/* Line Stroke - dashed to represent forecast */}
                                    <path
                                        d={getSvgLinePath(data.forecastTimeline, d => d.expectedRevenue)}
                                        fill="none"
                                        stroke="#7c3aed"
                                        strokeWidth="2.5"
                                        strokeDasharray="5 5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                            <div className="flex justify-between px-4 mt-2 text-[9px] font-bold text-gray-400 dark:text-slate-600">
                                <span>{data.forecastTimeline[0].period}</span>
                                <span>{data.forecastTimeline[4].period}</span>
                                <span>{data.forecastTimeline[8].period}</span>
                            </div>
                        </div>

                        {/* Canlı Sistem Risk ve Hata Analizi */}
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50 flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <ShieldAlert size={16} className="text-orange-500" />
                                    Aktif Sistem Riskleri
                                </h3>
                                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                                    TourVisio entegrasyonu, veritabanı ve AI kaynaklarındaki olası risk analizleri.
                                </p>
                            </div>

                            <div className="mt-4 space-y-4 flex-1">
                                {data.riskAlerts && data.riskAlerts.map((alert, idx) => {
                                    const isHigh = alert.severity === "HIGH";
                                    const isMedium = alert.severity === "MEDIUM";
                                    
                                    return (
                                        <div key={idx} className="space-y-1.5">
                                            <div className="flex justify-between items-center text-xs font-semibold">
                                                <span className="text-gray-700 dark:text-slate-350 flex items-center gap-1 truncate max-w-[170px]">
                                                    {isHigh && <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />}
                                                    {alert.title}
                                                </span>
                                                <span className={`font-bold ${
                                                    isHigh ? "text-red-500" : isMedium ? "text-orange-500" : "text-gray-400"
                                                }`}>
                                                    %{alert.probability.toFixed(0)} Risk
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        isHigh ? "bg-red-500" : isMedium ? "bg-orange-500" : "bg-gray-400"
                                                    }`}
                                                    style={{ width: `${alert.probability}%` }}
                                                />
                                            </div>
                                            <p className="text-[9px] text-gray-400 dark:text-slate-500 leading-normal">
                                                {alert.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-20 text-center text-gray-500">
                    {t("forecaster_page.no_data", "Tahmin verilerine ulaşılamıyor.")}
                </div>
            )}
        </div>
    );
}
