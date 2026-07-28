import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
    CalendarCheck,
    Users,
    MessageSquare,
    ArrowUpRight,
    TrendingUp,
    TrendingDown,
    Activity,
    CreditCard,
} from "lucide-react";
import api from "../../services/api.js";

export default function Dashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalReservations: 0,
        totalUsers: 0,
        totalChatMessages: 0,
        recentReservations: [],
        newUsers30d: 0,
        newUsersGrowth: 0,
        reservations30d: 0,
        reservationsGrowth: 0,
        reservationVolume30d: 0.0,
        reservationVolumeGrowth: 0.0,
        apiQuota30d: 0,
        apiQuotaGrowth: 0,
        dailyTrend: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('adminToken') || "";
        api.get('/api/admin/dashboard/stats', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (res.data) {
                    setStats({
                        totalReservations: res.data.totalReservations ?? 0,
                        totalUsers: res.data.totalUsers ?? 0,
                        totalChatMessages: res.data.totalChatMessages ?? 0,
                        recentReservations: Array.isArray(res.data.recentReservations) ? res.data.recentReservations : [],
                        newUsers30d: res.data.newUsers30d ?? 0,
                        newUsersGrowth: res.data.newUsersGrowth ?? 0.0,
                        reservations30d: res.data.reservations30d ?? 0,
                        reservationsGrowth: res.data.reservationsGrowth ?? 0.0,
                        reservationVolume30d: res.data.reservationVolume30d ?? 0.0,
                        reservationVolumeGrowth: res.data.reservationVolumeGrowth ?? 0.0,
                        apiQuota30d: res.data.apiQuota30d ?? 0,
                        apiQuotaGrowth: res.data.apiQuotaGrowth ?? 0.0,
                        dailyTrend: Array.isArray(res.data.dailyTrend) ? res.data.dailyTrend : []
                    });
                }
            })
            .catch(err => {
                console.error("Dashboard stats error:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Format Currency Helper
    const formatCurrency = (val) => {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(val);
    };

    // Format numbers like 11.2k
    const formatQuota = (val) => {
        if (val >= 1000) {
            return (val / 1000).toFixed(1) + "k";
        }
        return val.toString();
    };

    // Calculate Cumulative Data for Area Chart
    let runningVolumeSum = 0;
    const cumulativeTrend = (stats.dailyTrend || []).map((point) => {
        runningVolumeSum += point.reservationVolume || 0;
        return {
            ...point,
            cumulativeVolume: runningVolumeSum
        };
    });

    // Helper to generate SVG path for a line chart
    const getSvgLinePath = (data, valueSelector, width = 500, height = 180, padding = 15) => {
        if (!data || data.length === 0) return "";
        const values = data.map(valueSelector);
        const maxVal = Math.max(...values, 1);
        const minVal = Math.min(...values, 0);
        const range = maxVal - minVal || 1;

        const points = data.map((d, index) => {
            const x = (index / (data.length - 1)) * (width - 2 * padding) + padding;
            const y = height - padding - ((valueSelector(d) - minVal) / range) * (height - 2 * padding);
            return `${x},${y}`;
        });
        return `M ${points.join(" L ")}`;
    };

    // Helper to generate SVG path for an area chart
    const getSvgAreaPath = (data, valueSelector, width = 500, height = 180, padding = 15) => {
        if (!data || data.length === 0) return { line: "", area: "" };
        const values = data.map(valueSelector);
        const maxVal = Math.max(...values, 1);
        const minVal = Math.min(...values, 0);
        const range = maxVal - minVal || 1;

        const points = data.map((d, index) => {
            const x = (index / (data.length - 1)) * (width - 2 * padding) + padding;
            const y = height - padding - ((valueSelector(d) - minVal) / range) * (height - 2 * padding);
            return { x, y };
        });

        const linePath = `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}`;
        const areaPath = `${linePath} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;
        return { line: linePath, area: areaPath };
    };

    const statsCards = [
        {
            key: "new_users_30d",
            label: t("dashboard.new_users_30d", "YENİ KULLANICI (30G)"),
            value: stats.newUsers30d,
            growth: stats.newUsersGrowth,
            gradient: "from-orange-500 to-pink-500",
            icon: Users,
            formatter: (v) => v.toString()
        },
        {
            key: "reservations_30d",
            label: t("dashboard.reservations_30d", "REZERVASYON (30G)"),
            value: stats.reservations30d,
            growth: stats.reservationsGrowth,
            gradient: "from-violet-500 to-indigo-500",
            icon: CalendarCheck,
            formatter: (v) => v.toString()
        },
        {
            key: "volume_30d",
            label: t("dashboard.volume_30d", "REZ. HACMİ (30G)"),
            value: stats.reservationVolume30d,
            growth: stats.reservationVolumeGrowth,
            gradient: "from-emerald-500 to-teal-500",
            icon: CreditCard,
            formatter: (v) => formatCurrency(v)
        },
        {
            key: "quota_30d",
            label: t("dashboard.quota_30d", "AI KOTASI (30G)"),
            value: stats.apiQuota30d,
            growth: stats.apiQuotaGrowth,
            gradient: "from-cyan-500 to-blue-500",
            icon: MessageSquare,
            formatter: (v) => formatQuota(v)
        }
    ];

    // Helper to format dates on the chart X-axis
    const getAxisLabels = (data) => {
        if (!data || data.length < 2) return [];
        const first = data[0].date;
        const middle = data[Math.floor(data.length / 2)].date;
        const last = data[data.length - 1].date;

        const formatDateStr = (str) => {
            if (!str) return "";
            const parts = str.split("-");
            if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
            return str;
        };

        return [formatDateStr(first), formatDateStr(middle), formatDateStr(last)];
    };

    const axisLabels = getAxisLabels(stats.dailyTrend);

    return (
        <div className="space-y-8">
            {/* Üst Header Bilgi Kartı */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-pink-500 p-8 text-white shadow-lg">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            {t("dashboard_title", "Yönetim Paneli")}
                        </h1>
                        <p className="mt-2 text-orange-50 text-sm max-w-xl">
                            {t(
                                "dashboard_subtitle",
                                "Sistem istatistiklerini, kullanıcıları ve genel rezervasyonları yönetin."
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5 self-start md:self-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs font-semibold">
                        <Activity size={15} className="animate-pulse text-emerald-400" />
                        <span>Canlı Sistem Takibi Aktif</span>
                    </div>
                </div>
            </div>

            {/* 4'lü İstatistik Kartları Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {statsCards.map((card) => {
                    const Icon = card.icon;
                    const isPositive = card.growth >= 0;
                    return (
                        <div
                            key={card.key}
                            className="group relative overflow-hidden rounded-2xl border border-gray-150 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/60"
                        >
                            <div className={`absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-gradient-to-br ${card.gradient} opacity-5 blur-2xl transition-all duration-300 group-hover:scale-125`} />
                            
                            <div className="mb-4 flex items-center justify-between">
                                <div className={`inline-flex rounded-xl p-3 text-white bg-gradient-to-br ${card.gradient} shadow-md`}>
                                    <Icon size={20} />
                                </div>
                                <span className={`flex items-center gap-0.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                                    isPositive
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        : "bg-red-500/10 text-red-650 dark:text-red-400"
                                }`}>
                                    {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                    {isPositive ? "+" : ""}{card.growth.toFixed(1)}%
                                </span>
                            </div>

                            <p className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                                {card.label}
                            </p>
                            <p className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white truncate">
                                {loading ? (
                                    <span className="h-8 w-24 inline-block animate-pulse rounded bg-gray-200 dark:bg-slate-850" />
                                ) : (
                                    card.formatter(card.value)
                                )}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* İki Grafik Grid Bölümü */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* 1. Grafik: Kayıt & Rezervasyon Trendi */}
                <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50">
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200">
                                Kayıt & Rezervasyon Trendi
                            </h3>
                            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                                Son 30 günün kullanıcı kaydı ve yapılan rezervasyon dağılımı.
                            </p>
                        </div>
                        <div className="flex gap-4 text-xs font-semibold">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                                <span className="text-gray-500 dark:text-slate-400">Yeni Kayıt</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-gray-500 dark:text-slate-400">Rezervasyon</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-[200px] w-full">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs animate-pulse">Grafik yükleniyor...</div>
                        ) : stats.dailyTrend.length > 0 ? (
                            <svg className="h-full w-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                                {/* Grid lines */}
                                <line x1="15" y1="15" x2="485" y2="15" stroke="currentColor" className="text-gray-100 dark:text-slate-800" strokeDasharray="4 4" />
                                <line x1="15" y1="90" x2="485" y2="90" stroke="currentColor" className="text-gray-100 dark:text-slate-800" strokeDasharray="4 4" />
                                <line x1="15" y1="165" x2="485" y2="165" stroke="currentColor" className="text-gray-150 dark:text-slate-800" />

                                {/* Cyan path for user signups */}
                                <path
                                    d={getSvgLinePath(stats.dailyTrend, d => d.newUserCount)}
                                    fill="none"
                                    stroke="#06b6d4"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />

                                {/* Emerald path for bookings */}
                                <path
                                    d={getSvgLinePath(stats.dailyTrend, d => d.reservationCount)}
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">Yeterli veri bulunmuyor.</div>
                        )}
                    </div>
                    {/* X-axis labels */}
                    {stats.dailyTrend.length > 0 && (
                        <div className="flex justify-between px-4 mt-2 text-[10px] font-bold text-gray-400 dark:text-slate-650">
                            <span>{axisLabels[0]}</span>
                            <span>{axisLabels[1]}</span>
                            <span>{axisLabels[2]}</span>
                        </div>
                    )}
                </div>

                {/* 2. Grafik: Kümülatif Rezervasyon Hacmi */}
                <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50">
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200">
                                Kümülatif Rezervasyon Hacmi
                            </h3>
                            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                                Son 30 günün toplam biriken rezervasyon hacmi (TL).
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-gray-500 dark:text-slate-400">Toplam Hacim (TL)</span>
                        </div>
                    </div>

                    <div className="relative h-[200px] w-full">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs animate-pulse">Grafik yükleniyor...</div>
                        ) : cumulativeTrend.length > 0 ? (
                            <svg className="h-full w-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>
                                {/* Grid lines */}
                                <line x1="15" y1="15" x2="485" y2="15" stroke="currentColor" className="text-gray-100 dark:text-slate-800" strokeDasharray="4 4" />
                                <line x1="15" y1="90" x2="485" y2="90" stroke="currentColor" className="text-gray-100 dark:text-slate-800" strokeDasharray="4 4" />
                                <line x1="15" y1="165" x2="485" y2="165" stroke="currentColor" className="text-gray-150 dark:text-slate-800" />

                                {/* Area Fill */}
                                <path
                                    d={getSvgAreaPath(cumulativeTrend, d => d.cumulativeVolume).area}
                                    fill="url(#area-gradient)"
                                />

                                {/* Line Stroke */}
                                <path
                                    d={getSvgAreaPath(cumulativeTrend, d => d.cumulativeVolume).line}
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">Yeterli veri bulunmuyor.</div>
                        )}
                    </div>
                    {/* X-axis labels */}
                    {cumulativeTrend.length > 0 && (
                        <div className="flex justify-between px-4 mt-2 text-[10px] font-bold text-gray-400 dark:text-slate-650">
                            <span>{axisLabels[0]}</span>
                            <span>{axisLabels[1]}</span>
                            <span>{axisLabels[2]}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Son Rezervasyonlar Tablosu */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-slate-800">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            {t("recent_reservations_title", "Son Rezervasyonlar")}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-400">
                            {t(
                                "recent_reservations_subtitle",
                                "Sisteme eklenen son rezervasyon kayıtları."
                            )}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/admin/reservations")}
                        className="relative z-10 flex cursor-pointer items-center gap-1 rounded-xl bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-500 transition-all hover:bg-orange-100/50 hover:text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 dark:hover:bg-orange-950/40"
                    >
                        {t("view_all", "Tümünü Görüntüle")}
                        <ArrowUpRight size={14} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-500">
                                <th className="px-6 py-4">{t("table_col_reservation", "REZERVASYON")}</th>
                                <th className="px-6 py-4">{t("table_col_client", "MÜŞTERİ")}</th>
                                <th className="px-6 py-4">{t("table_col_tour", "HİZMET/TUR")}</th>
                                <th className="px-6 py-4">{t("table_col_date", "TARİH")}</th>
                                <th className="px-6 py-4 text-right">{t("table_col_amount", "TUTAR")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700 dark:divide-slate-800/60 dark:text-slate-350">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                                        <span className="inline-block animate-pulse text-xs">{t("common.loading", "Yükleniyor...")}</span>
                                    </td>
                                </tr>
                            ) : (
                                stats.recentReservations && stats.recentReservations.length > 0 ? (
                                    stats.recentReservations.map((res) => (
                                        <tr
                                            key={res.id}
                                            className="transition-colors hover:bg-gray-50/40 dark:hover:bg-slate-800/10"
                                        >
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                {res.reservationNumber || res.id}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">
                                                {res.clientName || res.userFullName || res.customer || "Misafir Kullanıcı"}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                                                <span className="rounded-lg bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-650 dark:text-orange-400">
                                                    {res.tourName || res.tour || "-"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-semibold text-gray-400 dark:text-slate-500">
                                                {res.date}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-emerald-400">
                                                {res.total}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-slate-400">
                                            {t("no_reservations", "Henüz rezervasyon bulunmuyor.")}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}