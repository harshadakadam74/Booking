export const HOTEL_FAVORITES_KEY = "fastBookingFavorites";
export const HOTEL_FAVORITES_EVENT = "fastBookingFavoritesChanged";

export const readHotelFavoriteIds = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(HOTEL_FAVORITES_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return [...new Set(saved
      .map((item) => String(
        item && typeof item === "object" ? item._id || item.id || "" : item
      ))
      .filter(Boolean))];
  } catch (error) {
    console.error("Unable to load saved hotel favorites:", error);
    return [];
  }
};

export const writeHotelFavoriteIds = (ids) => {
  const uniqueIds = [...new Set(ids.map(String).filter(Boolean))];
  localStorage.setItem(HOTEL_FAVORITES_KEY, JSON.stringify(uniqueIds));
  window.dispatchEvent(new Event(HOTEL_FAVORITES_EVENT));
  return uniqueIds;
};
