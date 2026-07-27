import api from "./api.js";

export async function getReservations() {
    const response = await api.get("/api/admin/reservations");
    return response.data;
}