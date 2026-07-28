import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Cpu,
    Database,
    HardDrive,
    Server,
    Activity,
    RefreshCw,
    Clock,
} from "lucide-react";
import api from "../../services/api.js";

export default function SystemMetrics() {
    const { t } = useTranslation();
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMetrics = (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('adminToken') || "";
        api.get("/api/admin/system-metrics", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((res) => {
                if (res.data) {
                    setMetrics(res.data);
                }
            })
            .catch((err) => {
                console.error("Error fetching system metrics:", err);
            })
            .finally(() => {
                setLoading(false);
                setRefreshing(false);
            });
    };

    useEffect(() => {
        fetchMetrics();
        // Auto refresh every 5 seconds
        const interval = setInterval(() => {
            fetchMetrics(true);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Format Bytes Helper
    const formatBytes = (bytes) => {
        if (!bytes) return "0 Bytes";
        const k = 1024;
        const dm = 2;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    // Format Uptime Helper
    const formatUptime = (seconds) => {
        if (!seconds) return "0s";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}s ${m}d ${s}sn`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                        {t("system_metrics_page.title", "Sistem Metrikleri")}
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                        {t("system_metrics_page.description", "TourVisio yapay zeka asistanı sunucu kaynak kullanımını ve veritabanı durumunu canlı izleyin.")}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => fetchMetrics()}
                    disabled={refreshing}
                    className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-orange-500 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800"
                >
                    <RefreshCw size={15} className={refreshing ? "animate-spin text-orange-500" : ""} />
                    {refreshing ? t("common.refreshing", "Güncelleniyor...") : t("common.refresh", "Yenile")}
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400">
                    <span className="inline-block animate-pulse text-sm">{t("common.loading", "Metrikler Yükleniyor...")}</span>
                </div>
            ) : metrics ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* CPU & YÜK BÖLÜMÜ */}
                    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-slate-800">
                            <div className="rounded-xl bg-orange-500/10 p-2.5 text-orange-500">
                                <Cpu size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm">
                                    İşlemci (CPU) Kullanımı
                                </h3>
                                <p className="text-[10px] text-gray-400 dark:text-slate-500">
                                    Canlı sunucu işlemci yükü ve çekirdek sayısı.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col items-center">
                            <div className="relative flex items-center justify-center h-32 w-32">
                                {/* SVG Circular Progress */}
                                <svg className="h-full w-full transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="50"
                                        className="text-gray-100 dark:text-slate-800"
                                        strokeWidth="10"
                                        stroke="currentColor"
                                        fill="transparent"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="50"
                                        stroke="#f97316"
                                        strokeWidth="10"
                                        fill="transparent"
                                        strokeDasharray="314"
                                        strokeDashoffset={314 - (314 * metrics.cpuUsagePercentage) / 100}
                                        strokeLinecap="round"
                                        className="transition-all duration-500"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-2xl font-extrabold text-gray-800 dark:text-white">%{metrics.cpuUsagePercentage}</span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">İşlemci Yükü</span>
                                </div>
                            </div>

                            <div className="mt-6 w-full space-y-3 text-xs">
                                <div className="flex justify-between items-center text-gray-700 dark:text-slate-350">
                                    <span className="text-gray-400 dark:text-slate-500">Kullanılabilir Çekirdek</span>
                                    <span className="font-bold">{metrics.availableProcessors} Çekirdek</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-700 dark:text-slate-350">
                                    <span className="text-gray-400 dark:text-slate-500">Aktif Thread Sayısı</span>
                                    <span className="font-bold">{metrics.activeThreads} Thread</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* JVM BELLEK (MEMORY) BÖLÜMÜ */}
                    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-slate-800">
                            <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-500">
                                <HardDrive size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm">
                                    JVM Bellek (RAM) Durumu
                                </h3>
                                <p className="text-[10px] text-gray-400 dark:text-slate-500">
                                    Tahsis edilen ve kullanılan yığın (heap) belleği.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-5">
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-2">
                                    <span className="text-gray-400 dark:text-slate-500">Kullanılan Bellek Oranı</span>
                                    <span className="text-violet-500 font-bold">%{metrics.memoryUsagePercentage}</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                                        style={{ width: `${metrics.memoryUsagePercentage}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 text-xs pt-2">
                                <div className="flex justify-between items-center text-gray-700 dark:text-slate-350">
                                    <span className="text-gray-400 dark:text-slate-500">Kullanılan Yığın</span>
                                    <span className="font-bold text-gray-800 dark:text-slate-200">{formatBytes(metrics.usedMemory)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-700 dark:text-slate-350">
                                    <span className="text-gray-400 dark:text-slate-500">Tahsis Edilen Toplam</span>
                                    <span className="font-bold text-gray-800 dark:text-slate-200">{formatBytes(metrics.allocatedMemory)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-700 dark:text-slate-350">
                                    <span className="text-gray-400 dark:text-slate-500">Maksimum Sınır</span>
                                    <span className="font-bold text-gray-800 dark:text-slate-200">{formatBytes(metrics.maxMemory)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* VERİTABANI BAĞLANTI HAVUZU */}
                    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-slate-800">
                            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500">
                                <Database size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm">
                                    Database Connection Pool
                                </h3>
                                <p className="text-[10px] text-gray-400 dark:text-slate-500">
                                    PostgreSQL aktif ve boşta duran havuz bağlantıları.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4 text-xs">
                            <div>
                                <div className="flex justify-between mb-2 font-semibold">
                                    <span className="text-gray-400 dark:text-slate-500">Aktif Havuz Kapasitesi</span>
                                    <span className="text-emerald-500 font-bold">{metrics.dbConnectionsActive} / {metrics.dbConnectionsMax} Havuz</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                        style={{ width: `${(metrics.dbConnectionsActive / metrics.dbConnectionsMax) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center text-gray-700 dark:text-slate-350">
                                    <span className="text-gray-400 dark:text-slate-500">Aktif SQL Bağlantısı</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{metrics.dbConnectionsActive} Bağlantı</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-700 dark:text-slate-350">
                                    <span className="text-gray-400 dark:text-slate-500">Max Havuz Havzası</span>
                                    <span className="font-bold">{metrics.dbConnectionsMax} Bağlantı</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SUNUCU BİLGİLERİ */}
                    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-slate-800">
                            <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-500">
                                <Server size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm">
                                    Sunucu ve İşletim Sistemi
                                </h3>
                                <p className="text-[10px] text-gray-400 dark:text-slate-500">
                                    Çalışan makine ve ortam detayları.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3 text-xs">
                            <div className="flex justify-between items-center text-gray-700 dark:text-slate-350">
                                <span className="text-gray-400 dark:text-slate-500">İşletim Sistemi</span>
                                <span className="font-bold text-gray-800 dark:text-slate-200">{metrics.osName}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-700 dark:text-slate-350">
                                <span className="text-gray-400 dark:text-slate-500">OS Sürümü</span>
                                <span className="font-bold text-gray-800 dark:text-slate-200">{metrics.osVersion}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-700 dark:text-slate-350">
                                <span className="text-gray-400 dark:text-slate-500 flex items-center gap-1">
                                    <Clock size={12} />
                                    Uptime (Çalışma Süresi)
                                </span>
                                <span className="font-bold text-orange-500">{formatUptime(metrics.uptimeSeconds)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-20 text-center text-gray-500">
                    {t("system_metrics_page.no_data", "Sistem metriklerine ulaşılamıyor.")}
                </div>
            )}
        </div>
    );
}
