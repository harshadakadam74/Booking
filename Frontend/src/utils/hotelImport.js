const columnIndex = (reference) => {
  const letters = reference.match(/^[A-Z]+/i)?.[0]?.toUpperCase() || '';
  return [...letters].reduce((value, letter) => value * 26 + letter.charCodeAt(0) - 64, 0) - 1;
};

const readZipEntry = async (archive, entryName) => {
  const view = new DataView(archive);
  const minimum = Math.max(0, view.byteLength - 0xffff - 22);
  let endOffset = -1;
  for (let offset = view.byteLength - 22; offset >= minimum; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      endOffset = offset;
      break;
    }
  }
  if (endOffset < 0) throw new Error('This Excel workbook is invalid or unsupported.');

  const entryCount = view.getUint16(endOffset + 10, true);
  let cursor = view.getUint32(endOffset + 16, true);
  const decoder = new TextDecoder();
  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(cursor, true) !== 0x02014b50) break;
    const method = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const uncompressedSize = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const name = decoder.decode(new Uint8Array(archive, cursor + 46, nameLength));
    if (name === entryName) {
      if (uncompressedSize > 10 * 1024 * 1024) {
        throw new Error('An Excel worksheet or shared string table exceeds the 10 MB import limit.');
      }
      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = archive.slice(dataOffset, dataOffset + compressedSize);
      if (method === 0) return decoder.decode(compressed);
      if (method !== 8 || typeof DecompressionStream === 'undefined') {
        throw new Error('This browser cannot read compressed Excel workbooks. Save the sheet as CSV and retry.');
      }
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return decoder.decode(await new Response(stream).arrayBuffer());
    }
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  throw new Error(`The Excel workbook is missing ${entryName}.`);
};

const parseXml = (source) => {
  const document = new DOMParser().parseFromString(source, 'application/xml');
  if (document.querySelector('parsererror')) throw new Error('The Excel workbook contains invalid XML.');
  return document;
};

const parseXlsx = async (file) => {
  const archive = await file.arrayBuffer();
  const workbook = parseXml(await readZipEntry(archive, 'xl/workbook.xml'));
  const relationships = parseXml(await readZipEntry(archive, 'xl/_rels/workbook.xml.rels'));
  const firstSheet = workbook.getElementsByTagName('sheet')[0];
  if (!firstSheet) throw new Error('The Excel workbook has no worksheets.');
  const relationId = firstSheet.getAttribute('r:id');
  const relation = [...relationships.getElementsByTagName('Relationship')]
    .find((item) => item.getAttribute('Id') === relationId);
  if (!relation) throw new Error('Unable to locate the first Excel worksheet.');
  const target = relation.getAttribute('Target') || '';
  const sheetPath = target.startsWith('/')
    ? target.slice(1)
    : target.startsWith('xl/')
      ? target
      : `xl/${target}`;
  const worksheet = parseXml(await readZipEntry(archive, sheetPath));
  let sharedStrings = [];
  try {
    const strings = parseXml(await readZipEntry(archive, 'xl/sharedStrings.xml'));
    sharedStrings = [...strings.getElementsByTagName('si')].map((item) => item.textContent || '');
  } catch (error) {
    if (!String(error.message).includes('missing xl/sharedStrings.xml')) throw error;
  }

  return [...worksheet.getElementsByTagName('row')].map((row) => {
    const values = [];
    for (const cell of row.getElementsByTagName('c')) {
      const index = columnIndex(cell.getAttribute('r') || '');
      const type = cell.getAttribute('t');
      const value = cell.getElementsByTagName('v')[0]?.textContent || '';
      values[index] = type === 's' ? sharedStrings[Number(value)] || '' :
        type === 'inlineStr' ? cell.getElementsByTagName('is')[0]?.textContent || '' : value;
    }
    return values;
  }).filter((row) => row.some((value) => String(value || '').trim()));
};

const parseCsv = (source) => {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  const text = source.replace(/^\uFEFF/, '');
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"' && value === '') {
      quoted = true;
    } else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n' || char === '\r') {
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = '';
      if (char === '\r' && text[index + 1] === '\n') index += 1;
    } else {
      value += char;
    }
  }
  if (quoted) throw new Error('The CSV file contains an unclosed quoted field.');
  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
};

const mapRows = (rows) => {
  if (rows.length < 2) throw new Error('The file must include a header row and at least one hotel.');
  const headers = rows[0].map((header) => String(header || '').trim());
  if (!headers.some(Boolean)) throw new Error('The file header row is empty.');
  return rows.slice(1).map((cells) => Object.fromEntries(
    headers.map((header, index) => [header, String(cells[index] ?? '').trim()])
      .filter(([header]) => Boolean(header))
  ));
};

const headerAliases = {
  hotelname: 'name',
  hotel: 'name',
  name: 'name',
  city: 'city',
  state: 'state',
  country: 'country',
  location: 'location',
  type: 'type',
  propertytype: 'propertyType',
  category: 'category',
  description: 'description',
  image: 'image',
  postalcode: 'postalCode',
  contactphone: 'contactPhone',
  contactemail: 'contactEmail',
  currency: 'currency',
  maxguestsperroom: 'maxGuestsPerRoom',
  pin: 'postalCode',
  pincode: 'postalCode',
  address: 'address',
  streetaddress: 'streetAddress',
  citylocation: 'city',
  pricepernight: 'price',
  pricenight: 'price',
  price: 'price',
  totalrooms: 'totalRooms',
  availablerooms: 'availableRooms',
  images: 'images',
  imageurls: 'images',
  amenities: 'amenities',
  facilities: 'facilities',
  roomtypes: 'roomTypes',
  checkin: 'checkInTime',
  checkout: 'checkOutTime',
  checkintime: 'checkInTime',
  checkouttime: 'checkOutTime',
  rating: 'rating',
  ratingcount: 'ratingCount',
  ratingsource: 'ratingSource',
  starrating: 'starRating',
  policies: 'policies',
  active: 'active',
  approval: 'approvalStatus',
  approvalstatus: 'approvalStatus',
  status: 'active',
};

const normalizeRecord = (source) => {
  const raw = {};
  Object.entries(source).forEach(([key, value]) => {
    const field = headerAliases[key.toLowerCase().replace(/[^a-z]/g, '')] ||
      key.trim().replace(/\s+([a-z])/g, (_, letter) => letter.toUpperCase()).replace(/[^a-zA-Z]/g, '');
    raw[field] = String(value ?? '').trim();
  });
  const splitList = (value) => value ? value.split('|').map((item) => item.trim()).filter(Boolean) : [];
  const activeValue = raw.active?.toLowerCase();
  const record = {
    ...raw,
    name: raw.name || '',
    city: raw.city || '',
    address: raw.address || raw.streetAddress || '',
    streetAddress: raw.streetAddress || raw.address || '',
    country: raw.country || 'India',
    state: raw.state || '',
    location: raw.location || [raw.city, raw.state, raw.country || 'India'].filter(Boolean).join(', '),
    currency: raw.currency || 'INR',
    type: raw.type || 'Hotel',
    category: raw.category || raw.propertyType || raw.type || 'Hotel',
    price: raw.price === '' ? '' : Number(raw.price),
    totalRooms: raw.totalRooms === '' ? '' : Number(raw.totalRooms),
    availableRooms: raw.availableRooms === '' ? '' : Number(raw.availableRooms),
    maxGuestsPerRoom: raw.maxGuestsPerRoom ? Number(raw.maxGuestsPerRoom) : 4,
    image: raw.image || splitList(raw.images)[0] || '',
    images: splitList(raw.images || raw.image),
    amenities: splitList(raw.amenities),
    facilities: splitList(raw.facilities),
    checkInTime: raw.checkInTime || '15:00',
    checkOutTime: raw.checkOutTime || '11:00',
    active: activeValue === undefined || activeValue === ''
      ? true
      : ['true', '1', 'yes', 'active'].includes(activeValue)
        ? true
        : ['false', '0', 'no', 'inactive'].includes(activeValue)
          ? false
          : raw.active,
    approvalStatus: raw.approvalStatus || 'approved',
    roomTypes: [],
    policies: { cancellation: '', children: '', pets: '', general: '' },
  };
  for (const field of ['rating', 'ratingCount', 'starRating']) {
    if (raw[field] !== undefined && raw[field] !== '') record[field] = Number(raw[field]);
  }
  if (raw.ratingSource) record.ratingSource = raw.ratingSource;
  if (raw.roomTypes) {
    try {
      record.roomTypes = JSON.parse(raw.roomTypes);
    } catch {
      record.roomTypes = raw.roomTypes;
    }
  }
  if (raw.policies) {
    try {
      record.policies = JSON.parse(raw.policies);
    } catch {
      record.policies = raw.policies;
    }
  }
  return record;
};

export const parseHotelImportFile = async (file) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const rows = extension === 'csv'
    ? parseCsv(await file.text())
    : extension === 'xlsx'
      ? await parseXlsx(file)
      : (() => { throw new Error('Choose a CSV or .xlsx Excel workbook. Legacy .xls files are not supported; save them as .xlsx or CSV.'); })();
  return mapRows(rows).map(normalizeRecord);
};

export const parseHotelJsonFile = async (file) => {
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error('The JSON file is not valid JSON.');
  }
  const records = Array.isArray(parsed) ? parsed : parsed?.records;
  if (!Array.isArray(records) || !records.length) {
    throw new Error('The JSON file must contain a non-empty array of hotel records or a { "records": [] } object.');
  }
  if (records.some((record) => !record || typeof record !== 'object' || Array.isArray(record))) {
    throw new Error('Every JSON hotel record must be an object.');
  }
  return records;
};

export const hotelImportTemplate = () => [
  'name,city,state,address,postalCode,price,totalRooms,availableRooms,images,description,amenities,facilities,roomTypes,checkInTime,checkOutTime,contactPhone,contactEmail,rating,ratingCount,ratingSource,starRating,policies,active,approvalStatus',
  'Sample Hotel,Mumbai,Maharashtra,"123 Example Road, Mumbai",400001,4500,30,24,https://example.com/hotel.jpg|https://example.com/room.jpg,"DEMO ONLY - replace with verified property details","Wi-Fi|Parking","Restaurant|Gym","[{""name"":""Standard"",""price"":4500,""maxGuests"":2,""totalRooms"":20,""availableRooms"":16}]",14:00,11:00,+910000000000,hotel@example.com,,,,,"{""cancellation"":""Sample policy""}",true,pending',
].join('\r\n');
