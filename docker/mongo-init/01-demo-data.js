const dbName = process.env.MONGO_INITDB_DATABASE || 'rapid-test-booking';
const database = db.getSiblingDB(dbName);

const now = new Date();
const center = {
  key: 'demo-center',
  name: 'Rapid Test Demo Center',
  address: 'Demo Street 1',
  postalCode: 10115,
  city: 'Berlin',
  country: 'Germany',
  healthOfficeEmail: 'health-office@example.com',
  maxPerSlot: 5,
  openingTimes: {
    Mo: { isOpen: true, from: '08:00', to: '18:00' },
    Tu: { isOpen: true, from: '08:00', to: '18:00' },
    We: { isOpen: true, from: '08:00', to: '18:00' },
    Th: { isOpen: true, from: '08:00', to: '18:00' },
    Fr: { isOpen: true, from: '08:00', to: '18:00' },
    Sa: { isOpen: true, from: '09:00', to: '14:00' },
    Su: { isOpen: false, from: '09:00', to: '14:00' },
  },
  testKits: [
    { label: 'Demo Antigen Test Kit', isActive: true },
  ],
  testTypes: [
    { label: 'Rapid antigen test', price: '0', isActive: true },
    { label: 'PCR demo test', price: '49', isActive: true },
  ],
};

const testTypes = {
  antigen: { label: 'Rapid antigen test', price: '0', isActive: true },
  pcr: { label: 'PCR demo test', price: '49', isActive: true },
};

const makeDate = (dayOffset, hour, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const person = (uid, firstName, secondName, email, status, extra = {}) => ({
  uid,
  firstName,
  secondName,
  birthDate: '1990-01-01',
  email,
  email_repeat: email,
  telephone: '+49 30 000000',
  address: 'Demo Street 12',
  city: 'Berlin',
  postalCode: 10115,
  country: 'Germany',
  status,
  ...extra,
});

const appointment = (appointmentUid, dayOffset, hour, minute, testType, persons) => {
  const appointmentDate = makeDate(dayOffset, hour, minute);

  return {
    appointmentUid,
    bookedFrom: 'Rapid Test Booking Platform-APP',
    center,
    testType,
    appointment: appointmentDate.toISOString(),
    persons,
    yetaPolicyAccepted: true,
    pocPolicyAccepted: true,
    createDate: now,
    lastModified: now,
  };
};

database.logins.updateOne(
  { userName: 'admin' },
  {
    $set: {
      userName: 'admin',
      email: 'admin@example.com',
      firstName: 'Demo',
      secondName: 'Admin',
      psw: '0192023a7bbd73250516f069df18b500',
      roles: ['admin'],
      active: true,
      updatedAt: now,
    },
    $setOnInsert: {
      createdAt: now,
    },
  },
  { upsert: true }
);

database.settings.updateOne(
  { key: 'demo-center' },
  {
    $set: {
      ...center,
      updatedAt: now,
    },
    $setOnInsert: {
      createdAt: now,
    },
  },
  { upsert: true }
);

const completedAt = makeDate(0, 10, 45).toISOString();
const checkedInAt = makeDate(0, 9, 45).toISOString();
const canceledAt = makeDate(2, 8, 15).toISOString();

const demoAppointments = [
  appointment('DEMO-TODAY-0900', 0, 9, 0, testTypes.antigen, [
    person('DEMO-PERSON-001', 'Lina', 'Weber', 'lina.weber@example.com', 'waiting'),
  ]),
  appointment('DEMO-TODAY-1030', 0, 10, 30, testTypes.antigen, [
    person('DEMO-PERSON-002', 'Jonas', 'Fischer', 'jonas.fischer@example.com', 'checkedIn', {
      checkedIn: true,
      checkedInAt,
      checkedInBy: 'demo-admin',
    }),
  ]),
  appointment('DEMO-TODAY-1300', 0, 13, 0, testTypes.pcr, [
    person('DEMO-PERSON-003', 'Mara', 'Schneider', 'mara.schneider@example.com', 'testPerformed', {
      checkedIn: true,
      checkedInAt,
      checkedInBy: 'demo-admin',
      testedAt: completedAt,
      testedBy: 'demo-admin',
      testResult: 'negative',
    }),
  ]),
  appointment('DEMO-TOMORROW-0910', 1, 9, 10, testTypes.antigen, [
    person('DEMO-PERSON-004', 'Omar', 'Klein', 'omar.klein@example.com', 'waiting'),
    person('DEMO-PERSON-005', 'Nora', 'Klein', 'nora.klein@example.com', 'waiting'),
  ]),
  appointment('DEMO-TOMORROW-1440', 1, 14, 40, testTypes.pcr, [
    person('DEMO-PERSON-006', 'Felix', 'Hoffmann', 'felix.hoffmann@example.com', 'waiting'),
  ]),
  appointment('DEMO-FUTURE-1620', 2, 16, 20, testTypes.antigen, [
    person('DEMO-PERSON-007', 'Sara', 'Meyer', 'sara.meyer@example.com', 'waiting'),
  ]),
  appointment('DEMO-CANCELED-1110', 3, 11, 10, testTypes.antigen, [
    person('DEMO-PERSON-008', 'Paul', 'Wagner', 'paul.wagner@example.com', 'canceled', {
      canceled: true,
      canceledAt,
      canceledBy: 'demo-admin',
    }),
  ]),
];

database.appointments.deleteMany({ appointmentUid: /^DEMO-/ });
database.appointments.insertMany(demoAppointments);
