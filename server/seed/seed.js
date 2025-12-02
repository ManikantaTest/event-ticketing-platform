// seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker/locale/en");
const User = require("../models/userModel");
const Organizer = require("../models/organizerModel");
const Event = require("../models/eventModel");
const Session = require("../models/sessionModel");
const bcrypt = require("bcrypt");
const Venue = require("../models/venueModel");
const citiesData = require("../data/Popular-Cities-Per-State.json");
const thumbnailImages = require("./districtImages.json");
const bannerImages = require("./districtBImages.json");

const MONGO_URI = process.env.MONGO_URI;

/* ---------------------- image pools (your links) ---------------------- */
// const bannerImages = [
//   "https://res.cloudinary.com/dwzmsvp7f/image/upload/f_auto,w_1280/c_crop,g_custom/v1754982826/vilaasv0gvddvoxtibuf.png",
//   "https://res.cloudinary.com/dwzmsvp7f/image/upload/f_auto,w_1280/c_crop,g_custom/v1756293972/pjizc69iyi7uuianqkvg.jpg",
//   "https://res.cloudinary.com/dwzmsvp7f/image/upload/f_auto,w_1280/c_crop,g_custom/v1755504411/k7qag8tlilih20xlto5c.jpg",
//   "https://res.cloudinary.com/dwzmsvp7f/image/upload/f_auto,w_1280/c_crop,g_custom/v1754371118/jub74bw6cc99zqe9rg49.jpg",
//   "https://res.cloudinary.com/dwzmsvp7f/image/upload/f_auto,w_1280/c_crop,g_custom/v1748859911/ad5ql06hb51m6zswqbp9.png",
//   "https://res.cloudinary.com/dwzmsvp7f/image/upload/f_auto,w_1280/c_crop,g_custom/v1752150644/docsn9mg48zd8fg3xhhn.jpg",
//   "https://res.cloudinary.com/dwzmsvp7f/image/upload/f_auto,w_1280/c_crop,g_custom/v1750449301/rdovjl5t9yah8wyhjbd6.png",
//   "https://res.cloudinary.com/dwzmsvp7f/image/upload/f_auto,w_1280/c_crop,g_custom/v1755723531/rrbnaeeqwfwlorrgv7dw.png",
//   "https://res.cloudinary.com/dwzmsvp7f/image/upload/f_auto,w_1280/c_crop,g_custom/v1737452072/wohjimg5jhtvmzbnu4jw.png",
//   "https://res.cloudinary.com/dwzmsvp7f/image/upload/f_auto,w_1280/c_crop,g_custom/v1756128204/xxrj1pj6hodelsyx19zi.png",
//   "https://res.cloudinary.com/dwzmsvp7f/image/upload/f_auto,w_1280/c_crop,g_custom/v1756290198/pirtkzu8k2bdwtsdzltz.jpg",
//   "https://res.cloudinary.com/dwzmsvp7f/image/upload/f_auto,w_1280/c_crop,g_custom/v1752042283/kabzyyrkvg1lr7v28pvo.jpg",
//   "https://res.cloudinary.com/dwzmsvp7f/image/upload/f_auto,w_1280/c_crop,g_custom/v1756804163/fkpjpyuskm2cqyumsppp.jpg",
//   "https://res.cloudinary.com/dwzmsvp7f/image/upload/f_auto,w_1280/c_crop,g_custom/v1755088997/zewepemwujadzdcz3agb.jpg",
//   "https://res.cloudinary.com/dwzmsvp7f/image/upload/f_auto,w_1280/c_crop,g_custom/v1756288317/hhnkwsnqqdd0fl54qvxf.jpg",
//   "https://res.cloudinary.com/dwzmsvp7f/image/upload/f_auto,w_1280/c_crop,g_custom/v1755500847/nvf3z9wqzzzphwyr48wj.jpg",
// ];

// const thumbnailImages = [
//   "https://media.insider.in/image/upload/c_crop,g_custom/v1756455254/iquljstfxkgepi8s18pk.jpg",
//   "https://media.insider.in/image/upload/c_crop,g_custom/v1755504163/ovj5vbqwrkhpgwuxuot7.png",
//   "https://media.insider.in/image/upload/c_crop,g_custom/v1755754372/arhhmtdu5jfwd0p7ltea.jpg",
//   "https://media.insider.in/image/upload/c_crop,g_custom/v1754319439/gjzedwmrxfdboi45secc.jpg",
//   "https://media.insider.in/image/upload/c_crop,g_custom/v1753269077/hlxlycj5weawbwgtu9ku.jpg",
//   "https://media.insider.in/image/upload/c_crop,g_custom/v1754049873/soiblnt7uhepydtrl7xr.jpg",
//   "https://media.insider.in/image/upload/c_crop,g_custom/v1748859931/dljaxi11jlhpynilsa37.png",
//   "https://media.insider.in/image/upload/c_crop,g_custom/v1755518637/ailke6ywntn6e2z5bh1h.jpg",
//   "https://media.insider.in/image/upload/c_crop,g_custom/v1751179070/a65bxuisqpchgzyhqs5k.jpg",
//   "https://media.insider.in/image/upload/c_crop,g_custom/v1756110944/k4v176evbapoutmf3q5t.png",
//   "https://media.insider.in/image/upload/c_crop,g_custom/v1756466816/sixkugz3tm2galhkswrd.jpg",
//   "https://media.insider.in/image/upload/c_crop,g_custom/v1756465794/v0c3m7ittcg9pmqx0mj7.jpg",
//   "https://media.insider.in/image/upload/c_crop,g_custom/v1756129940/imzvn6zdal1nqh2js31i.png",
//   "https://media.insider.in/image/upload/c_crop,g_custom/v1749813380/kk679mka8btistydrusi.jpg",
//   "https://media.insider.in/image/upload/c_crop,g_custom/v1756366304/dcbyzlcf4fknj7i7apjw.png",
//   "https://media.insider.in/image/upload/c_crop,g_custom/v1756455616/aueiqdknx2zm7npcuucg.png",
// ];

/* ---------------------- small helpers ---------------------- */

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// sample n items (without depending on faker helpers version)
const sampleElements = (arr, n) => {
  const copy = arr.slice();
  const out = [];
  const pick = Math.min(n, copy.length);
  for (let i = 0; i < pick; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
};

// make an Indian phone number string
const randomIndianPhone = () => {
  let s = "+91";
  for (let i = 0; i < 10; i++) s += Math.floor(Math.random() * 10);
  return s;
};

// returns weekday name for a Date (Monday..Sunday)
const weekdayName = (d) => {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][d.getDay()];
};

function getRandomTimeRange() {
  const startHour = faker.number.int({ min: 9, max: 20 }); // 9 - 20
  const duration = faker.number.int({ min: 1, max: 4 }); // 1 - 4 hours
  const endHour = Math.min(startHour + duration, 23);
  const minute = faker.datatype.boolean() ? "00" : "30";
  const startTime = `${startHour.toString().padStart(2, "0")}:${minute}`;
  const endTime = `${endHour.toString().padStart(2, "0")}:${minute}`;
  return { startTime, endTime };
}

/* ratings generator (returns array of rating objects) */
const generateRatings = (users) => {
  const count = faker.number.int({ min: 0, max: 30 });
  const selectedUsers = faker.helpers.arrayElements(users, count); // ensures uniqueness
  return selectedUsers.map((u) => ({
    user: u._id,
    rating: faker.number.int({ min: 1, max: 5 }),
    review: faker.lorem.sentence(),
  }));
};

// Seating Layout Generator based on capacity
// const generateSeatingLayout = (capacity) => {
//   const sections = ["Platinum", "Gold", "Silver"];
//   const layout = [];

//   // Distribute capacity across sections (50%, 30%, 20%)
//   const distribution = [0.5, 0.3, 0.2];

//   sections.forEach((section, idx) => {
//     const sectionSeats = Math.floor(capacity * distribution[idx]);
//     const rows = [];

//     // Seats per row (8–15 range)
//     const seatsPerRow = Math.floor(Math.random() * 8) + 8;
//     const rowCount = Math.ceil(sectionSeats / seatsPerRow);

//     for (let i = 0; i < rowCount; i++) {
//       const rowLabel = String.fromCharCode(65 + i); // A, B, C...
//       const rowSeats = Array.from(
//         { length: seatsPerRow },
//         (_, j) => `${rowLabel}${j + 1}`
//       );
//       rows.push({ label: rowLabel, seats: rowSeats });
//     }

//     layout.push({
//       section,
//       rows,
//     });
//   });

//   return layout;
// };

const generateSeatingLayout = () => {
  const sections = ["Platinum", "Gold", "Silver"];
  const layout = [];
  let totalCapacity = 0;

  sections.forEach((section) => {
    const rows = [];

    // Natural ranges
    let seatsPerRowRange, rowCountRange;
    if (section === "Platinum") {
      seatsPerRowRange = [6, 10]; // was 8-12
      rowCountRange = [3, 5]; // was 4-6
    } else if (section === "Gold") {
      seatsPerRowRange = [8, 12]; // was 10-15
      rowCountRange = [6, 10]; // was 8-12
    } else {
      // Silver/Other
      seatsPerRowRange = [10, 15]; // was 12-20
      rowCountRange = [8, 15]; // was 12-20
    }

    // Pick random rowCount and seatsPerRow for this section
    const rowCount =
      Math.floor(Math.random() * (rowCountRange[1] - rowCountRange[0] + 1)) +
      rowCountRange[0];

    sectionCapacity = 0;

    for (let i = 0; i < rowCount; i++) {
      const seatsPerRow =
        Math.floor(
          Math.random() * (seatsPerRowRange[1] - seatsPerRowRange[0] + 1)
        ) + seatsPerRowRange[0];

      const rowLabel = String.fromCharCode(65 + i);
      const rowSeats = Array.from(
        { length: seatsPerRow },
        (_, j) => `${rowLabel}${j + 1}`
      );

      rows.push({ label: rowLabel, seats: rowSeats });
      totalCapacity += seatsPerRow;
      sectionCapacity += seatsPerRow;
    }

    layout.push({ section, rows, sectionCapacity });
  });

  return { layout, totalCapacity };
};

function randomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomNearbyCoordinates(lng, lat, radiusInKm = 10) {
  const earthRadius = 6371; // km

  // random distance (0 → radius), in radians
  const dist = Math.random() * (radiusInKm / earthRadius);

  // random bearing (direction in radians)
  const bearing = Math.random() * 2 * Math.PI;

  const newLat = Math.asin(
    Math.sin((lat * Math.PI) / 180) * Math.cos(dist) +
      Math.cos((lat * Math.PI) / 180) * Math.sin(dist) * Math.cos(bearing)
  );

  const newLng =
    (lng * Math.PI) / 180 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(dist) * Math.cos((lat * Math.PI) / 180),
      Math.cos(dist) - Math.sin((lat * Math.PI) / 180) * Math.sin(newLat)
    );

  return [(newLng * 180) / Math.PI, (newLat * 180) / Math.PI]; // [lng, lat]
}

const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
/* ---------------------- main seed ---------------------- */

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // wipe
  await Promise.all([
    User.deleteMany({}),
    Organizer.deleteMany({}),
    Event.deleteMany({}),
    Session.deleteMany({}),
    Venue.deleteMany({}),
  ]);
  console.log("Old data cleared");

  const password = await bcrypt.hash("password123", 10);

  /* ---------- 1) Users ---------- */
  /* ---------- 1) Users ---------- */
  const totalUsers = 25000;
  const batchSize = 100;
  let users = [];

  for (let i = 0; i < totalUsers; i += batchSize) {
    const buffer = Array.from(
      { length: Math.min(batchSize, totalUsers - i) },
      () => ({
        username: faker.person.fullName(),
        email: faker.internet.email(),
        password,
        role: "user",
        phone: randomIndianPhone(),
        userProfileImage:
          "https://cdn-icons-png.flaticon.com/512/847/847969.png",
        interestedEvents: [],
      })
    );

    try {
      const inserted = await User.insertMany(buffer, { ordered: false });
      users.push(...inserted); // optional: keep in memory if needed
      console.log(
        `✅ Inserted ${Math.min(i + batchSize, totalUsers)} users so far`
      );
    } catch (err) {
      console.error("Error inserting batch:", err.message);
    }
  }
  console.log("organizers");

  /* ---------- 2) Organizers ---------- */
  //   const organizersData = [];
  //   for (let i = 0; i < 200; i++) {
  //     const user = new User({
  //       username: faker.person.fullName(),
  //       email: faker.internet.email(),
  //       password,
  //       role: "organizer",
  //       phone: randomIndianPhone(),
  //       userProfileImage: "https://yourcdn.com/default-profile.png",
  //     });
  //     organizersData.push(user);
  //   }
  //   const organizerUsers = await User.insertMany(organizersData);

  //   const organizers = await Organizer.insertMany(
  //     organizerUsers.map((user) => ({
  //       user: user._id,
  //       phone: randomIndianPhone(),
  //       orgName: faker.company.name(),
  //       orgEmail: faker.internet.email(),
  //       orgDescription: `${faker.company.name()} is a ${faker.word.adjective()}
  // organization in the ${faker.commerce.department()} sector, dedicated to
  // ${faker.company.name()} and innovation.
  // With a passion for ${faker.word.adjective()} experiences, we bring together
  // communities and create meaningful connections through our events.`,

  //       orgSpecialities: randomItems(
  //         [
  //           "Conference",
  //           "Workshop",
  //           "Seminar",
  //           "Concert",
  //           "Exhibition",
  //           "Sports",
  //           "Other",
  //         ],
  //         Math.floor(Math.random() * 3) + 2
  //       ),
  //       organizerProfileImage: "https://yourcdn.com/default-profile.png",
  //       organizerBannerImage: "https://yourcdn.com/default-profile.png",
  //       averageRating: 0,
  //       totalReviews: 0,
  //       eventsHosted: [],
  //     }))
  //   );

  /* ---------- 2) Organizers ---------- */
  // const totalOrganizers = 200;
  // const organizerBatchSize = 50; // adjust if needed
  // let organizers = [];

  const organizersData = [];

  for (let i = 0; i < 80; i++) {
    const user = new User({
      username: faker.person.fullName(),
      email: faker.internet.email(),
      password,
      role: "organizer",
      phone: randomIndianPhone(),
      userProfileImage: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
    });

    organizersData.push(user);
  }

  const organizerUsers = await User.insertMany(organizersData);

  const organizers = await Organizer.insertMany(
    organizerUsers.map((user) => ({
      user: user._id,
      phone: randomIndianPhone(),
      orgName: faker.company.name(),
      orgEmail: faker.internet.email(),
      orgDescription: `${faker.company.name()} is a ${faker.word.adjective()} organization in the ${faker.commerce.department()} sector, dedicated to ${faker.company.name()} and innovation. With a passion for ${faker.word.adjective()} experiences, we bring together communities and create meaningful connections through our events.`,
      orgSpecialities: randomItems(
        [
          "Conference",
          "Workshop",
          "Seminar",
          "Concert",
          "Exhibition",
          "Sports",
          "Other",
        ],
        Math.floor(Math.random() * 3) + 2
      ),
      organizerProfileImage: "https://yourcdn.com/default-profile.png",
      organizerBannerImage: randomItem(bannerImages),
      averageRating: 0,
      totalReviews: 0,
      eventsHosted: [],
    }))
  );

  /* ---------- 3) Venues ---------- */
  const generateVenueName = () => {
    const prefix = faker.company.name();
    const suffix = faker.helpers.arrayElement([
      "Convention Center",
      "Auditorium",
      "Arena",
      "Palace Grounds",
      "Banquet Hall",
      "Expo Center",
      "Stadium",
      "Sports Complex",
      "Open Grounds",
      "Cultural Center",
      "Town Hall",
    ]);
    return `${prefix} ${suffix}`;
  };

  console.log("Generating venues...");

  const venues = [];
  for (let i = 0; i < 500; i++) {
    const city = randomItem(citiesData);
    const { layout, totalCapacity } = generateSeatingLayout();
    const [lng, lat] = randomNearbyCoordinates(city.Long, city.Lat, 10);
    venues.push({
      name: generateVenueName(),
      city: city.City,
      state: city.State,
      capacity: totalCapacity,
      location: { type: "Point", coordinates: [lng, lat] },
      seatingLayout: layout,
    });
  }
  const venuesDocs = await Venue.insertMany(venues);

  /* ---------- 4) Events ---------- */

  console.log("Generating events...");
  const categories = [
    "Music",
    "Sports",
    "Workshops",
    "Conferences",
    "Festivals",
    "Tech & Innovation",
    "Charity",
    "Comedy",
    "Exhibitions",
  ];

  const events = [];
  const organizerMap = new Map();

  // seeder-date-generator.js
  const msPerDay = 24 * 60 * 60 * 1000;
  const today = new Date();

  const daysAgo = (d) => new Date(today.getTime() - d * msPerDay);
  const daysFromNow = (d) => new Date(today.getTime() + d * msPerDay);

  // safe faker wrapper: if from > to it swaps them to avoid the "from must be before to" error
  const randomDateBetween = (faker, from, to) => {
    if (from.getTime() > to.getTime()) {
      const tmp = from;
      from = to;
      to = tmp;
    }
    return faker.date.between({ from, to });
  };

  function generateEventDates(faker, recurrence) {
    // 0 = completed, 1 = ongoing, 2 = upcoming
    const statusBucket = faker.number.int({ min: 0, max: 2 });

    let startDate;
    let endDate;
    if (recurrence === "single") {
      if (statusBucket === 0) {
        // completed single: 60 -> 2 days ago
        startDate = randomDateBetween(faker, daysAgo(60), daysAgo(2));
      } else if (statusBucket === 1) {
        // ongoing single: set to today (same-day event)
        startDate = new Date(today); // event is today
      } else {
        // upcoming single: 1 -> 30 days from now
        startDate = randomDateBetween(faker, daysFromNow(1), daysFromNow(30));
      }
      endDate = new Date(startDate.getTime()); // single-day event
    } else if (recurrence === "multi-day") {
      const durationDays = faker.number.int({ min: 2, max: 7 });
      if (statusBucket === 0) {
        // completed multi-day: both start & end in the past
        startDate = randomDateBetween(faker, daysAgo(60), daysAgo(10));
        endDate = new Date(startDate.getTime() + durationDays * msPerDay);
      } else if (statusBucket === 1) {
        // ongoing multi-day: started in past, ends after today
        startDate = randomDateBetween(faker, daysAgo(5), today);
        // ensure endDate > today
        endDate = new Date(today.getTime() + durationDays * msPerDay);
      } else {
        // upcoming multi-day: start in future
        startDate = randomDateBetween(faker, daysFromNow(1), daysFromNow(30));
        endDate = new Date(startDate.getTime() + durationDays * msPerDay);
      }
      // } else if (recurrence === "weekly") {
      //   if (statusBucket === 0) {
      //     // completed weekly: entirely in the past
      //     startDate = randomDateBetween(faker, daysAgo(90), daysAgo(42)); // latest start 42 days ago
      //     endDate = new Date(
      //       startDate.getTime() + faker.number.int({ min: 7, max: 42 }) * msPerDay
      //     );
      //   } else if (statusBucket === 1) {
      //     // ongoing weekly: started in past, ends in future
      //     startDate = randomDateBetween(faker, daysAgo(20), today);
      //     endDate = new Date(
      //       startDate.getTime() + faker.number.int({ min: 7, max: 42 }) * msPerDay
      //     );
      //   } else {
      //     // upcoming weekly: start in future
      //     startDate = randomDateBetween(faker, daysFromNow(1), daysFromNow(30));
      //     endDate = new Date(
      //       startDate.getTime() + faker.number.int({ min: 7, max: 42 }) * msPerDay
      //     );
      //   }
    } else if (recurrence === "weekly") {
      // If caller passes selectedWeekdays use them, otherwise pick random ones
      // selectedWeekdays example: ["Sun","Wed"]
      const allWeekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const selectedWeekdays =
        faker.selectedWeekdays && faker.selectedWeekdays.length
          ? faker.selectedWeekdays
          : faker.helpers.arrayElements(allWeekdays, { min: 1, max: 3 });

      // helper: convert short name -> numeric day (0=Sun .. 6=Sat)
      const weekdayToIndex = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };
      const allowedIndices = selectedWeekdays
        .map((d) => weekdayToIndex[d])
        .filter((n) => n !== undefined);

      // normalize a date to midnight (date-only)
      const dateOnly = (d) => {
        const x = new Date(d);
        return new Date(x.getFullYear(), x.getMonth(), x.getDate());
      };

      // generate raw candidate range (same logic you used before)
      let rawStart, rawEnd;
      if (statusBucket === 0) {
        rawStart = randomDateBetween(faker, daysAgo(90), daysAgo(42));
        rawEnd = new Date(
          rawStart.getTime() + faker.number.int({ min: 7, max: 42 }) * msPerDay
        );
      } else if (statusBucket === 1) {
        rawStart = randomDateBetween(faker, daysAgo(20), today);
        rawEnd = new Date(
          rawStart.getTime() + faker.number.int({ min: 14, max: 42 }) * msPerDay
        );
      } else {
        rawStart = randomDateBetween(faker, daysFromNow(2), daysFromNow(30));
        rawEnd = new Date(
          rawStart.getTime() + faker.number.int({ min: 14, max: 42 }) * msPerDay
        );
      }

      // ensure date-only
      rawStart = dateOnly(rawStart);
      rawEnd = dateOnly(rawEnd);

      // collect all matching dates inside [rawStart, rawEnd]
      const matches = [];
      for (
        let d = new Date(rawStart);
        d <= rawEnd;
        d.setDate(d.getDate() + 1)
      ) {
        if (allowedIndices.includes(d.getDay())) {
          matches.push(new Date(d)); // push a copy
        }
      }

      if (matches.length > 0) {
        // use first & last matching date
        startDate = matches[0];
        endDate = matches[matches.length - 1];
      } else {
        // no matches inside range:
        // pick the next matching weekday after rawStart as start,
        // and set end = start + 7 days (so event has at least one weekly slot)
        let d = new Date(rawStart);
        let guard = 0;
        while (!allowedIndices.includes(d.getDay()) && guard < 14) {
          d.setDate(d.getDate() + 1);
          guard++;
        }
        // if guard reached and nothing found (very unlikely), fallback to rawStart
        startDate = dateOnly(d);
        endDate = new Date(startDate.getTime() + 7 * msPerDay);
      }

      // ensure endDate >= startDate
      if (endDate.getTime() < startDate.getTime()) {
        endDate = new Date(startDate.getTime());
      }

      // set selectedWeekdays on event if you want to store it
      // event.selectedWeekdays = selectedWeekdays; // optional
    } else {
      // fallback to a safe upcoming single
      startDate = randomDateBetween(faker, daysFromNow(1), daysFromNow(30));
      endDate = new Date(startDate.getTime());
    }

    // derive final status from actual dates (always compute from start/end)
    let status = "upcoming";
    if (endDate.getTime() < today.getTime()) status = "completed";
    else if (
      startDate.getTime() <= today.getTime() &&
      endDate.getTime() >= today.getTime()
    )
      status = "ongoing";

    return { startDate, endDate, status };
  }

  function getRecurrence() {
    const r = Math.random();

    if (r < 0.75) return "single"; // 75%
    if (r < 0.95) return "multi-day"; // 20%
    return "weekly"; // 5%
  }

  for (let i = 0; i < 3000; i++) {
    const category = randomItem(categories);
    const organizer = randomItem(organizers);
    const venue = randomItem(venuesDocs);

    // const recurrence = randomItem(["single", "multi-day", "weekly"]);
    const recurrence = getRecurrence();

    const toUTCDate = (d) => {
      const x = new Date(d);
      return new Date(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate()));
    };

    let selectedWeekdays = [];
    if (recurrence === "weekly") {
      const candidates = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      selectedWeekdays = sampleElements(
        candidates,
        faker.number.int({ min: 1, max: 3 })
      );
    }

    // const today = new Date();
    // const startDate = faker.date.between({
    //   from: today,
    //   to: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
    // });
    // let endDate = startDate;

    // let status = "upcoming";
    // if (endDate < today) status = "completed";
    // else if (startDate <= today && endDate >= today) status = "ongoing";
    // if (recurrence !== "single") {
    //   const durationDays = faker.number.int({ min: 2, max: 7 });
    //   endDate = new Date(startDate.getTime() + durationDays * 86400000);
    // }
    faker.selectedWeekdays = selectedWeekdays;
    const { startDate, endDate, status } = generateEventDates(
      faker,
      recurrence
    );
    const { startTime, endTime } = getRandomTimeRange();

    let ratings = [];
    let averageRating = 0;

    if (status !== "upcoming") {
      ratings = generateRatings(users);
      averageRating =
        ratings.length > 0
          ? Number(
              (
                ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
              ).toFixed(1)
            )
          : 0;
    }

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const eventDoc = {
      title: capitalize(faker.company.buzzPhrase()),

      description: `Join us for ${faker.company.catchPhrase()} in ${faker.location.city()}! 
This event brings together ${faker.word.adjective()} minds from ${faker.company.catchPhraseDescriptor()} 
to explore ${faker.company.buzzPhrase().toLowerCase()}. 
Expect inspiring talks, live entertainment, and plenty of opportunities to connect. 
The experience kicks off on ${faker.date.future().toDateString()} — 
don’t miss your chance to be part of it!`,

      startDate: toUTCDate(startDate),
      endDate: toUTCDate(endDate),
      startTime,
      endTime,
      recurrence,
      selectedWeekdays,
      location: {
        type: "Point",
        label: venue.name + ", " + venue.city,
        coordinates: venue.location.coordinates,
      },
      ageLimit: randomItem([0, 5, 12, 16, 18, 21]),
      languages: ["English", "Hindi"],
      category,
      isFeatured: false,
      bannerImage: randomItem(bannerImages),
      thumbnailImage: randomItem(thumbnailImages),
      ratings,
      averageRating,
      interestedUsers: 0,
      organizer: organizer._id,
      venue: venue._id,
      status,
      startingPrice: 0,
    };

    events.push(eventDoc);

    // accumulate organizer updates (only reviews count here)
    const entry = organizerMap.get(organizer._id.toString()) || {
      hostedIds: [],
      totalReviews: 0,
      ratings: [],
    };
    entry.ratings.push(...ratings.map((r) => r.rating));
    organizerMap.set(organizer._id.toString(), entry);
  }

  const eventsDocs = await Event.insertMany(events, { ordered: false });
  console.log("Events created");

  console.log("Assigning featured events...");

  // Group events by location & category
  const byLocation = {};
  const byLocationCategory = {};

  for (const ev of eventsDocs) {
    const city = ev.location.label.split(", ").pop(); // extract city
    const cat = ev.category;

    if (!byLocation[city]) byLocation[city] = [];
    byLocation[city].push(ev);

    const key = city + "-" + cat;
    if (!byLocationCategory[key]) byLocationCategory[key] = [];
    byLocationCategory[key].push(ev);
  }

  const updates = [];

  // 1️⃣ FEATURED PER LOCATION (Homepage)
  for (const [city, list] of Object.entries(byLocation)) {
    const featuredCount = Math.min(
      15,
      Math.max(5, Math.floor(list.length * 0.1))
    );
    const selected = faker.helpers.arrayElements(list, featuredCount);

    selected.forEach((ev) =>
      updates.push({
        updateOne: {
          filter: { _id: ev._id },
          update: { $set: { isFeatured: true } },
        },
      })
    );
  }

  // 2️⃣ FEATURED PER LOCATION + CATEGORY
  for (const [key, list] of Object.entries(byLocationCategory)) {
    const featuredCount = Math.min(
      4,
      Math.max(2, Math.floor(list.length * 0.15))
    );
    const selected = faker.helpers.arrayElements(list, featuredCount);

    selected.forEach((ev) =>
      updates.push({
        updateOne: {
          filter: { _id: ev._id },
          update: { $set: { isFeatured: true } },
        },
      })
    );
  }

  // Execute bulk updates
  if (updates.length > 0) {
    await Event.bulkWrite(updates);
    console.log(`Featured events assigned: ${updates.length}`);
  }

  // update organizerMap with real event _ids
  for (const event of eventsDocs) {
    const entry = organizerMap.get(event.organizer.toString());
    if (entry) {
      entry.hostedIds.push(event._id);
    }
  }

  /* ---------- 5) Sessions (chunked) ---------- */
  const sessionBatchSize = 500;
  const sessions = [];
  let i = 1;
  for (const event of eventsDocs) {
    console.log("session for event ", i);
    i++;
    let sessionDates = [];
    if (event.recurrence === "single") {
      sessionDates.push(new Date(event.startDate));
    } else if (event.recurrence === "multi-day") {
      let cur = new Date(event.startDate);
      while (cur <= event.endDate) {
        sessionDates.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
    } else if (event.recurrence === "weekly") {
      let cur = new Date(event.startDate);
      while (cur <= event.endDate) {
        if (event.selectedWeekdays.includes(weekdayName(cur)))
          sessionDates.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
      if (sessionDates.length === 0)
        sessionDates.push(new Date(event.startDate));
    }

    const venue = venuesDocs.find((v) => v._id.equals(event.venue));

    sessionDates.forEach((sDate, index) => {
      const seats = [];
      const seatStatuses = ["available", "booked"];
      let bookedCount = 0; // track booked seats
      const sectionCapacity = {};
      const capacity = {};

      for (const sec of venue.seatingLayout) {
        let secSeatsCount = 0;
        for (const row of sec.rows) {
          for (const seat of row.seats) {
            const randomStatus =
              seatStatuses[Math.floor(Math.random() * seatStatuses.length)];
            let bookedBy = null;
            if (randomStatus === "booked") {
              bookedCount++;
              const randomUser =
                users[Math.floor(Math.random() * users.length)];
              bookedBy = randomUser._id;

              secSeatsCount++;
            }

            seats.push({
              seatId: seat,
              section: sec.section,
              status: randomStatus,
              user: bookedBy,
            });
          }
        }
        sectionCapacity[sec.section] = secSeatsCount;
        capacity[sec.section] = sec.sectionCapacity;
      }

      // Release date logic → sessions unlock 21 days before event start
      const batchIndex = Math.floor(index / 7);
      const baseRelease = new Date(event.startDate);
      baseRelease.setDate(baseRelease.getDate() - 21 + batchIndex * 7);

      const tickets = Object.entries(sectionCapacity).map(
        ([section, totalSeats]) => {
          let defaultAvailability;
          if (section === "Platinum")
            defaultAvailability = totalSeats; // or apply % if needed
          else if (section === "Gold") defaultAvailability = totalSeats;
          else defaultAvailability = totalSeats; // Silver

          return {
            type: section,
            price: faker.number.int({ min: 75, max: 2000 }), // adjust per section if needed
            available: defaultAvailability,
            totalSeats: capacity[section],
          };
        }
      );

      sessions.push({
        date: sDate,
        startTime: event.startTime,
        endTime: event.endTime,
        releaseDate: baseRelease,
        event: event._id,
        occupancy: Math.floor((bookedCount / seats.length) * 100),
        // tickets: [
        //   {
        //     type: "Gold",
        //     price: faker.number.int({ min: 400, max: 700 }),
        //     available: 100,
        //   },
        //   {
        //     type: "Silver",
        //     price: faker.number.int({ min: 75, max: 400 }),
        //     available: 50,
        //   },
        //   {
        //     type: "Platinum",
        //     price: faker.number.int({ min: 800, max: 2000 }),
        //     available: 20,
        //   },
        // ],
        tickets,
        seats,
      });
    });

    if (sessions.length >= 10) {
      await Session.insertMany(sessions, { ordered: false });
      sessions.length = 0;
    }
  }
  if (sessions.length > 0) {
    console.log(`⚡ Flushing final ${sessions.length} sessions in batches...`);
    const batchSize = 100; // adjust as needed

    for (let i = 0; i < sessions.length; i += batchSize) {
      const batch = sessions.slice(i, i + batchSize);

      try {
        await Session.insertMany(batch, { ordered: false });
        console.log(
          `✅ Inserted final batch of ${batch.length} sessions (${
            i + batch.length
          }/${sessions.length})`
        );
      } catch (err) {
        console.error("Error inserting final batch of sessions:", err.message);
      }
    }
  }

  console.log("Sessions created");

  console.log("Updating startingPrice for events...");

  // Aggregate min ticket price per event
  const minPrices = await Session.aggregate([
    { $unwind: "$tickets" },
    {
      $group: {
        _id: "$event",
        minPrice: { $min: "$tickets.price" },
      },
    },
  ]);

  // Bulk update events
  const bulkPriceOps = minPrices.map((p) => ({
    updateOne: {
      filter: { _id: p._id },
      update: { $set: { startingPrice: p.minPrice } },
    },
  }));

  if (bulkPriceOps.length > 0) {
    await Event.bulkWrite(bulkPriceOps);
  }

  console.log("startingPrice updated ✅");

  /* ---------- 6) Organizer stats update ---------- */
  for (const [orgId, entry] of organizerMap.entries()) {
    const totalReviews = entry.ratings.length;
    const avg =
      totalReviews > 0
        ? Number(
            (entry.ratings.reduce((a, b) => a + b, 0) / totalReviews).toFixed(1)
          )
        : 0;
    await Organizer.findByIdAndUpdate(orgId, {
      $set: {
        totalReviews,
        averageRating: avg,
        eventsHosted: entry.hostedIds,
      },
    });
  }

  /* ---------- 7) User interests (bulkWrite) ---------- */
  const eventInterestCount = new Map();
  const bulkUserOps = [];

  for (const u of users) {
    const pickFn = faker.helpers.weightedArrayElement([
      { weight: 0.6, value: () => faker.number.int({ min: 5, max: 15 }) },
      { weight: 0.3, value: () => faker.number.int({ min: 16, max: 30 }) },
      { weight: 0.1, value: () => faker.number.int({ min: 31, max: 50 }) },
    ]);
    const k = pickFn(); // ✅ call it to get the number

    const picks = sampleElements(eventsDocs, k);
    const interestedIds = picks.map((e) => e._id);

    bulkUserOps.push({
      updateOne: {
        filter: { _id: u._id },
        update: { $set: { interestedEvents: interestedIds } },
      },
    });

    picks.forEach((e) => {
      eventInterestCount.set(
        e._id.toString(),
        (eventInterestCount.get(e._id.toString()) || 0) + 1
      );
    });

    if (bulkUserOps.length >= 5000) {
      await User.bulkWrite(bulkUserOps);
      bulkUserOps.length = 0;
    }
  }
  if (bulkUserOps.length > 0) {
    await User.bulkWrite(bulkUserOps);
  }

  const bulkUpdates = [];
  for (const [eventId, count] of eventInterestCount.entries()) {
    bulkUpdates.push({
      updateOne: {
        filter: { _id: eventId },
        update: { $set: { interestedUsers: count } },
      },
    });
  }
  if (bulkUpdates.length > 0) await Event.bulkWrite(bulkUpdates);

  console.log("Seeding complete");
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  mongoose.connection.close();
});
