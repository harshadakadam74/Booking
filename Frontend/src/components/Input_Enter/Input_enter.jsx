import React from 'react'
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { BedDouble, CalendarDays, Users, MapPin } from "lucide-react";
import { placeSuggestions } from "../../Data/Places";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";


const Input_enter = () => {
  const navigate = useNavigate();

    const [location, setLocation] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [openDate, setOpenDate] = useState(false);
    const [openGuests, setOpenGuests] = useState(false);
    const [isWorkTrip, setIsWorkTrip] = useState(false);

    const [date, setDate] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);

    const [guests, setGuests] = useState({
        adults: 2,
        children: 0,
        rooms: 1,
    });

    const handleLocationChange = (e) => {
        const value = e.target.value;
        setLocation(value);

        if (value.trim().length > 0) {
            const filtered = placeSuggestions.filter(place =>
                place.name.toLowerCase().includes(value.toLowerCase()) ||
                place.city.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectPlace = (place) => {
        setLocation(place.name);
        setShowSuggestions(false);
        setSuggestions([]);

        const searchData = {
            location: place.name,
            dates: date[0],
            guests,
            workTrip: isWorkTrip,
        };

        navigate('/book-place', {
            state: searchData,
        });
    };

    const handleSearch = () => {
        const trimmedLocation = location.trim();
        if (!trimmedLocation) {
            alert("Please enter a destination to search.");
            return;
        }

        const searchData = {
            location: trimmedLocation,
            dates: date[0],
            guests,
            workTrip: isWorkTrip,
        };

        navigate('/book-place', {
            state: searchData,
        });
    };
    return (


        <div className="bg-linear-to-b from-blue-900 to-blue-700 h-80 pt-20">
            {/* HERO */}
            <main className="max-w-6xl  mx-auto px-4 sm:mb-55 sm:px-6 pt-10 sm:pt-16">
                <h1 className="text-3xl text-white sm:text-5xl lg:text-6xl font-bold mb-3">
                    Find your next stay
                </h1>

                <p className="text-lg sm:text-2xl text-gray-200 mb-8 sm:mb-10">
                    Search low prices on hotels, homes and much more...
                </p>

                {/* SEARCH BAR */}
                <div className="bg-yellow-500 p-1 rounded flex flex-col md:flex-row gap-2 text-black relative">

                    {/* LOCATION */}
                    <div className="flex items-center bg-white rounded px-4 py-3 gap-2 w-full md:flex-1 relative">
                        <BedDouble className="text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Where are you going?"
                            className="w-full outline-none"
                            value={location}
                            onChange={handleLocationChange}
                            onFocus={() => location && setShowSuggestions(true)}
                        />

                        {/* SUGGESTIONS DROPDOWN */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-80 overflow-y-auto">
                                {suggestions.map((place) => (
                                    <div
                                        key={place.id}
                                        onClick={() => handleSelectPlace(place)}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 transition-colors"
                                    >
                                        <MapPin size={16} className="text-gray-500 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800">{place.name}</p>
                                            <p className="text-xs text-gray-500">{place.city}, {place.country}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DATE */}
                    <div
                        className="flex items-center gap-2 w-full md:w-auto px-4 py-3 text-gray-600 bg-white rounded cursor-pointer justify-center"
                        onClick={() => setOpenDate(!openDate)}
                    >
                        <CalendarDays className="text-gray-500" size={20} />
                        <span>
                            {`${format(date[0].startDate, "dd/MM/yyyy")} - ${format(
                                date[0].endDate,
                                "dd/MM/yyyy"
                            )}`}
                        </span>
                    </div>

                    {openDate && (
                        <div
                            className="
                              absolute top-full mt-2 z-50
                              left-1/2 -translate-x-1/2 w-full
                              md:left-0 md:translate-x-0 md:w-auto
                             bg-white rounded-xl shadow-xl p-4
  "
                        >

                            <DateRange
                                editableDateInputs={false}
                                onChange={(item) => setDate([item.selection])}
                                moveRangeOnFirstSelection={false}
                                ranges={date}
                            />
                        </div>
                    )}

                    {/* GUESTS */}
                    <div
                        className="flex items-center gap-2 w-full md:w-auto px-4 py-3 text-gray-600 bg-white rounded cursor-pointer justify-center"
                        onClick={() => setOpenGuests(!openGuests)}
                    >
                        <Users className="text-gray-500" size={20} />
                        <span>
                            {`${guests.adults} adults · ${guests.children} children · ${guests.rooms} ${guests.rooms === 1 ? "room" : "rooms"}`}
                        </span>
                    </div>

                    {/* SEARCH BUTTON */}
                    <button
                        type="button"
                        className="bg-blue-900 text-white rounded px-6 py-3 font-semibold hover:bg-blue-800 transition-colors"
                        onClick={handleSearch}
                    >
                        Search
                    </button>

                    {/* WORK TRIP */}
                    <div className="w-full md:w-auto flex items-center gap-2 px-4 py-3 bg-white rounded justify-center">
                        <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                            <input
                                type="checkbox"
                                checked={isWorkTrip}
                                onChange={(e) => setIsWorkTrip(e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            Travelling for work
                        </label>
                    </div>

                    {openGuests && (
                        <div className="
                             absolute top-full mt-2 z-50
                             left-1/2 -translate-x-1/2 w-full
                             md:left-auto md:right-0 md:translate-x-0 md:w-72
                           bg-white text-black p-4 rounded-xl shadow-xl
                         ">
                            {["adults", "children", "rooms"].map((type) => (
                                <div
                                    key={type}
                                    className="flex justify-between items-center mb-3"
                                >
                                    <span className="capitalize">{type}</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            className="border px-2"
                                            onClick={() =>
                                                setGuests((prev) => ({
                                                    ...prev,
                                                    [type]: Math.max(0, prev[type] - 1),
                                                }))
                                            }
                                        >
                                            -
                                        </button>
                                        <span>{guests[type]}</span>
                                        <button
                                            className="border px-2"
                                            onClick={() =>
                                                setGuests((prev) => ({
                                                    ...prev,
                                                    [type]: prev[type] + 1,
                                                }))
                                            }
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Input_enter;
