import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
    CalendarCheck,
    Users,
    MessageSquare,
    ArrowUpRight,
} from "lucide-react";
import api from "../../services/api.js";

export default function Dashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalReservations: 0,
        totalUsers: 0,
        totalChatMessages: 0,
        recentReservations: []
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
                        recentReservations: Array.isArray(res.data.recentReservations) ? res.data.recentReservations : []
                    });
                }
            })
            .catch(err => {
                console.error("Dashboard stats error:", err);
                setStats({
                    totalReservations: 0,
                    totalUsers: 0,
                    totalChatMessages: 0,
                    recentReservations: []
                });
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const cards = [
        {
            key: "total_reservations",
            defaultLabel: "Total Reservations",
            value: stats.totalReservations,
            badge: "+12%",
            badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            gradient: "from-orange-500 to-pink-500",
            icon: CalendarCheck,
        },
        {
            key: "total_users",
            defaultLabel: "Total Users",
            value: stats.totalUsers,
            badge: "+8%",
            badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            gradient: "from-violet-500 to-indigo-500",
            icon: Users,
        },
        {
            key: "chat_messages",
            defaultLabel: "Chat Messages",
            value: stats.totalChatMessages,
            badge: "+18%",
            badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            gradient: "from-cyan-500 to-blue-500",
            icon: MessageSquare,
        },
    ];

    return (
        <div className="space-y-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-pink-500 p-8 text-white shadow-lg">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
                <h1 className="text-3xl font-extrabold tracking-tight">
                    {t("dashboard_title", "Kontrol Paneli")}
                </h1>
                <p className="mt-2 text-orange-50 text-sm max-w-xl">
                    {t(
                        "dashboard_subtitle",
                        "Sistem performansını ve son işlemleri buradan takip edebilirsiniz."
                    )}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.key}
                            className="group relative overflow-hidden rounded-2xl border border-gray-150 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/60"
                        >
                            {/* Card Background Glow */}
                            <div className={`absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-gradient-to-br ${card.gradient} opacity-5 blur-2xl transition-all duration-300 group-hover:scale-125`} />
                            
                            <div className="mb-4 flex items-center justify-between">
                                <div className={`inline-flex rounded-xl p-3 text-white bg-gradient-to-br ${card.gradient} shadow-md`}>
                                    <Icon size={24} />
                                </div>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${card.badgeColor}`}>
                                    {card.badge}
                                </span>
                            </div>

                            <p className="text-sm font-medium text-gray-400 dark:text-slate-400">
                                {t(card.key, card.defaultLabel)}
                            </p>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                                {loading ? (
                                    <span className="h-8 w-16 inline-block animate-pulse rounded bg-gray-200 dark:bg-slate-850" />
                                ) : (
                                    card.value
                                )}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-slate-800">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
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
                        className="relative z-10 flex cursor-pointer items-center gap-1 rounded-xl bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-500 transition-all hover:bg-orange-100/50 hover:text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 dark:hover:bg-orange-950/40"
                    >
                        {t("view_all", "Tümünü Görüntüle")}
                        <ArrowUpRight size={16} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold uppercase tracking-wider text-gray-400 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                                <th className="px-6 py-4">{t("table_col_reservation", "REZERVASYON")}</th>
                                <th className="px-6 py-4">{t("table_col_client", "MÜŞTERİ")}</th>
                                <th className="px-6 py-4">{t("table_col_tour", "TUR")}</th>
                                <th className="px-6 py-4">{t("table_col_date", "TARİH")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700 dark:divide-slate-800 dark:text-slate-300">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                                        <span className="inline-block animate-pulse">{t("common.loading", "Yükleniyor...")}</span>
                                    </td>
                                </tr>
                            ) : (
                                stats.recentReservations && stats.recentReservations.length > 0 ? (
                                    stats.recentReservations.map((res) => (
                                        <tr
                                            key={res.id}
                                            className="transition-colors hover:bg-gray-50/40 dark:hover:bg-slate-800/20"
                                        >
                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                {res.reservationNumber || res.id}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-600 dark:text-slate-300">
                                                {res.clientName || res.userFullName || res.customer || "Misafir Kullanıcı"}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                                                <span className="rounded-lg bg-orange-50/70 px-2.5 py-1 text-xs font-medium text-orange-600 dark:bg-orange-950/20 dark:text-orange-400">
                                                    {res.tourName || res.tour || "-"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                                                {res.date}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-gray-500 dark:text-slate-400">
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