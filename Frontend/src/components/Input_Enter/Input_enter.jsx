import React from 'react'
import { useState } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { BedDouble, CalendarDays, Users } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";


const Input_enter = () => {

    const [location, setLocation] = useState("");
    const [openDate, setOpenDate] = useState(false);
    const [openGuests, setOpenGuests] = useState(false);

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
    return (


        <div className="bg-gradient-to-b from-blue-900  to-blue-700 h-80 pt-20">
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
                    <div className="flex items-center bg-white rounded px-4 py-3 gap-2 w-full md:flex-1">
                        <BedDouble className="text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Where are you going?"
                            className="w-full outline-none"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
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
                            {`${guests.adults} adults · ${guests.children} children · ${guests.rooms} room`}
                        </span>
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

                    {/* SEARCH BUTTON */}
                    <button className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 text-lg sm:text-2xl rounded font-semibold">
                        Search
                    </button>
                </div>

                {/* WORK CHECKBOX */}
                <div className="mt-4 flex items-center gap-2">
                    <input class="accent-yellow-500 size-5" type="checkbox" />
                    <span className="text-sm text-gray-500">
                        I'm travelling for work
                    </span>
                </div>
            </main>
            
        </div>
        
    );
};

export default Input_enter;
