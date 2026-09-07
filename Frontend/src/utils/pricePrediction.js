const DAY_MS = 24 * 60 * 60 * 1000;

const toDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getPricePrediction = ({
  price,
  checkInDate,
  availableRooms,
  totalRooms,
}) => {
  const basePrice = Number(price) || 0;
  const checkIn = toDate(checkInDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!basePrice || !checkIn) {
    return {
      predictedPrice: basePrice,
      percentChange: 0,
      direction: 'stable',
      message: 'Select dates to see price predictions.',
    };
  }

  const daysAhead = Math.max(0, Math.ceil((checkIn - today) / DAY_MS));
  let change = 0;

  if (daysAhead <= 3) change += 0.12;
  else if (daysAhead <= 7) change += 0.07;
  else if (daysAhead <= 21) change += 0.03;
  else if (daysAhead >= 45) change -= 0.05;

  if ([0, 5, 6].includes(checkIn.getDay())) change += 0.06;
  if ([5, 6, 11].includes(checkIn.getMonth())) change += 0.04;

  if (totalRooms && availableRooms !== undefined) {
    const availability = Number(availableRooms) / Number(totalRooms);
    if (availability <= 0.2) change += 0.12;
    else if (availability <= 0.4) change += 0.06;
    else if (availability >= 0.8) change -= 0.03;
  }

  const percentChange = Math.round(change * 100);
  const predictedPrice = Math.max(1, Math.round(basePrice * (1 + change)));

  if (percentChange > 0) {
    return {
      predictedPrice,
      percentChange,
      direction: 'increase',
      message: `Book now - price may increase by about ${percentChange}%.`,
    };
  }

  if (percentChange < 0) {
    return {
      predictedPrice,
      percentChange,
      direction: 'decrease',
      message: `Prices may drop by about ${Math.abs(percentChange)}% for these dates.`,
    };
  }

  return {
    predictedPrice,
    percentChange: 0,
    direction: 'stable',
    message: 'Prices look stable for these dates.',
  };
};
