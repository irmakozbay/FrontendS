import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Search,
    MessageSquare,
    Bot,
    User,
    Clock,
    MapPin,
    Calendar,
    Users as UsersIcon,
    DollarSign,
    Sliders,
    Plane,
    Hotel,
} from "lucide-react";
import api from "../../services/api.js";

export default function ChatLogs() {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [criteria, setCriteria] = useState(null);
    const [loadingCriteria, setLoadingCriteria] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('adminToken') || "";
        api.get('/api/admin/chat-logs', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (res.data) {
                    setChats(res.data);
                    if (res.data.length > 0) {
                        setSelectedChatId(res.data[0].id);
                    }
                }
            })
            .catch(err => {
                console.error("Error fetching chat logs:", err);
            });
    }, []);

    // Selected Chat'in criteria verisini çekme
    useEffect(() => {
        if (!selectedChatId) {
            setCriteria(null);
            return;
        }
        setLoadingCriteria(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('adminToken') || "";
        api.get(`/api/chat/sessions/${selectedChatId}/criteria`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (res.data) {
                    setCriteria(res.data);
                } else {
                    setCriteria(null);
                }
            })
            .catch(err => {
                console.error("Error fetching chat session criteria:", err);
                setCriteria(null);
            })
            .finally(() => {
                setLoadingCriteria(false);
            });
    }, [selectedChatId]);

    const filteredChats = chats.filter((chat) =>
        (chat.user || "").toLocaleLowerCase().includes(searchTerm.trim().toLocaleLowerCase())
    );

    const selectedChat =
        chats.find((chat) => chat.id === selectedChatId) || chats[0];

    // Format Date Helper
    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t("chat_logs_page.title", "Sohbet Kayıtları")}
                </h1>

                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                    {t("chat_logs_page.description", "Kullanıcıların yapay zeka asistanı ile gerçekleştirdiği görüşmeleri ve topladığı arama kriterlerini izleyin.")}
                </p>
            </div>

            <div className="grid min-h-[620px] overflow-hidden rounded-2xl border border-gray-250 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[320px_1fr_300px]">
                {/* 1. KOLON: Sohbet Listesi */}
                <div className="border-r border-gray-150 dark:border-slate-800 flex flex-col h-full">
                    <div className="border-b border-gray-100 p-4 dark:border-slate-800">
                        <div className="relative">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                            />

                            <input
                                type="text"
                                placeholder={t("chat_logs_page.search_placeholder", "Müşteri adı ara...")}
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-905 outline-none placeholder:text-gray-400 focus:border-orange-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50/50 dark:divide-slate-800/40">
                        {filteredChats.map((chat) => (
                            <button
                                key={chat.id}
                                type="button"
                                onClick={() => setSelectedChatId(chat.id)}
                                className={`w-full p-4 text-left transition-all ${selectedChat && selectedChat.id === chat.id
                                        ? "bg-orange-50/70 dark:bg-orange-950/20 border-l-4 border-orange-500"
                                        : "hover:bg-gray-50/40 dark:hover:bg-slate-800/20"
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 text-white font-semibold text-sm shadow-sm">
                                        {(chat.user || "U").charAt(0).toUpperCase()}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-center">
                                            <h2 className="font-bold text-gray-805 dark:text-slate-200 truncate">
                                                {chat.user}
                                            </h2>
                                        </div>

                                        <p className="mt-1 truncate text-xs text-gray-400 dark:text-slate-400">
                                            {chat.question}
                                        </p>

                                        <p className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-gray-400 dark:text-slate-500">
                                            <Clock size={11} />
                                            {chat.date}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. KOLON: Mesajlaşma Penceresi */}
                {selectedChat ? (
                    <div className="flex flex-col h-full bg-gray-50/30 dark:bg-slate-950/20">
                        <div className="border-b border-gray-100 px-6 py-4 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-gray-905 dark:text-white">
                                    {selectedChat.user}
                                </h2>

                                <p className="text-[11px] font-semibold text-gray-400 dark:text-slate-500">
                                    {selectedChat.email || "E-posta belirtilmemiş"}
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                {selectedChat.date}
                            </span>
                        </div>

                        {/* Telegram/Slack tarzı modern sohbet baloncukları */}
                        <div className="flex-1 space-y-4 p-6 overflow-y-auto max-h-[500px]">
                            {selectedChat.messages && selectedChat.messages.length > 0 ? (
                                selectedChat.messages.map((message, index) => {
                                    const isUser = message.sender === "user";
                                    return (
                                        <div
                                            key={message.id || index}
                                            className={`flex items-end gap-2.5 ${isUser ? "justify-start" : "justify-end"}`}
                                        >
                                            {isUser && (
                                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                                                    <User size={15} />
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-6 shadow-sm ${
                                                    isUser
                                                        ? "rounded-bl-sm border border-gray-100 bg-white text-gray-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                                        : "rounded-br-sm bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium"
                                                }`}
                                            >
                                                {message.text}
                                            </div>
                                            {!isUser && (
                                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 shadow-sm dark:bg-orange-950/40 dark:text-orange-400">
                                                    <Bot size={15} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-gray-400 py-10">
                                    {t("chat_logs_page.no_messages", "Henüz mesaj bulunmuyor.")}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 border-t border-gray-100 px-6 py-4 text-xs font-semibold text-gray-450 dark:border-slate-800 dark:text-slate-500 bg-white dark:bg-slate-900/40">
                            <MessageSquare size={14} />
                            {t("chat_logs_page.view_only", "Bu pencere yalnızca sohbet izleme içindir.")}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
                        <MessageSquare size={48} className="text-gray-300 dark:text-slate-700 mb-3" />
                        <p>{t("chat_logs_page.no_chats", "Henüz sohbet geçmişi bulunmuyor.")}</p>
                    </div>
                )}

                {/* 3. KOLON: Toplanan Kriterler Özeti */}
                <div className="border-l border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/20 p-5 flex flex-col h-full overflow-y-auto">
                    <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-slate-850">
                        <Sliders size={18} className="text-orange-500" />
                        <h3 className="font-bold text-gray-805 dark:text-white text-sm">
                            {t("chat_logs_page.criteria_title", "Toplanan Kriterler")}
                        </h3>
                    </div>

                    {loadingCriteria ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 py-20 text-xs">
                            <span className="animate-pulse">{t("common.loading", "Yükleniyor...")}</span>
                        </div>
                    ) : criteria && (criteria.locationOrHotelName || criteria.departureLocation || criteria.arrivalLocation) ? (
                        <div className="mt-4 space-y-5 text-xs">
                            {/* Otel Rezervasyon Kriterleri */}
                            {criteria.locationOrHotelName && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-1.5 font-bold text-orange-600 dark:text-orange-400 border-b border-orange-500/10 pb-1">
                                        <Hotel size={13} />
                                        <span>{t("chat_logs_page.hotel_criteria", "Otel Kriterleri")}</span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">{t("criteria.location", "Lokasyon / Otel")}</span>
                                            <span className="font-semibold text-gray-800 dark:text-slate-200">{criteria.locationOrHotelName}</span>
                                        </div>

                                        {(criteria.checkInDate || criteria.checkOutDate) && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">{t("criteria.checkin", "Giriş")}</span>
                                                    <span className="font-semibold text-gray-800 dark:text-slate-200">{formatDate(criteria.checkInDate) || "-"}</span>
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">{t("criteria.checkout", "Çıkış")}</span>
                                                    <span className="font-semibold text-gray-800 dark:text-slate-200">{formatDate(criteria.checkOutDate) || "-"}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-2">
                                            {criteria.adultCount !== undefined && (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">{t("criteria.adults", "Yetişkin")}</span>
                                                    <span className="font-semibold text-gray-800 dark:text-slate-200">{criteria.adultCount} Kişi</span>
                                                </div>
                                            )}
                                            {criteria.roomCount !== undefined && (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">{t("criteria.rooms", "Oda")}</span>
                                                    <span className="font-semibold text-gray-800 dark:text-slate-200">{criteria.roomCount} Oda</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Uçuş Rezervasyon Kriterleri */}
                            {(criteria.departureLocation || criteria.arrivalLocation) && (
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 border-b border-blue-500/10 pb-1">
                                        <Plane size={13} />
                                        <span>{t("chat_logs_page.flight_criteria", "Uçuş Kriterleri")}</span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">{t("criteria.departure", "Kalkış")}</span>
                                                <span className="font-semibold text-gray-800 dark:text-slate-200 truncate">{criteria.departureLocation || "-"}</span>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">{t("criteria.arrival", "Varış")}</span>
                                                <span className="font-semibold text-gray-800 dark:text-slate-200 truncate">{criteria.arrivalLocation || "-"}</span>
                                            </div>
                                        </div>

                                        {(criteria.departureDate || criteria.returnDate) && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">{t("criteria.dep_date", "Gidiş")}</span>
                                                    <span className="font-semibold text-gray-800 dark:text-slate-200">{formatDate(criteria.departureDate) || "-"}</span>
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">{t("criteria.ret_date", "Dönüş")}</span>
                                                    <span className="font-semibold text-gray-800 dark:text-slate-200">{formatDate(criteria.returnDate) || "-"}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-2">
                                            {criteria.passengerCount !== undefined && (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">{t("criteria.passengers", "Yolcu")}</span>
                                                    <span className="font-semibold text-gray-800 dark:text-slate-200">{criteria.passengerCount} Yolcu</span>
                                                </div>
                                            )}
                                            {criteria.tripType && (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">{t("criteria.triptype", "Tür")}</span>
                                                    <span className="font-semibold text-gray-800 dark:text-slate-200 uppercase truncate">
                                                        {criteria.tripType === "ROUND_TRIP" ? t("criteria.roundtrip", "Gidiş-Dönüş") : t("criteria.oneway", "Tek Yön")}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Ek Filtre Kriterleri */}
                            {(criteria.minStars || criteria.maxPrice || criteria.minPrice) && (
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-1.5 font-bold text-emerald-650 dark:text-emerald-400 border-b border-emerald-500/10 pb-1">
                                        <Sliders size={13} />
                                        <span>{t("chat_logs_page.additional_filters", "Diğer Filtreler")}</span>
                                    </div>

                                    <div className="space-y-2">
                                        {criteria.minStars && (
                                            <div className="flex justify-between items-center text-gray-700 dark:text-slate-300">
                                                <span className="text-gray-400 dark:text-slate-500">{t("criteria.stars", "Yıldız Sayısı")}</span>
                                                <span className="font-semibold">{criteria.minStars}★ ve üzeri</span>
                                            </div>
                                        )}
                                        {(criteria.minPrice || criteria.maxPrice) && (
                                            <div className="flex justify-between items-center text-gray-700 dark:text-slate-300">
                                                <span className="text-gray-400 dark:text-slate-500">{t("criteria.budget", "Bütçe Aralığı")}</span>
                                                <span className="font-semibold">
                                                    {criteria.minPrice || 0} - {criteria.maxPrice || "∞"} {criteria.currency || "EUR"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-20 text-center">
                            <Clock size={28} className="text-gray-250 dark:text-slate-800 mb-2" />
                            <p className="text-[11px] leading-relaxed">
                                {t("chat_logs_page.no_criteria", "Bu sohbet oturumu için henüz kriter toplanmamış.")}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}