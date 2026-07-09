const dbName = process.env.MONGO_INITDB_DATABASE || 'rapid-test-booking';
const appDb = db.getSiblingDB(dbName);
const now = new Date();

function appointmentDate(daysFromNow, hour, minute) {
  const value = new Date(now);
  value.setDate(value.getDate() + daysFromNow);
  value.setHours(hour, minute, 0, 0);
  return value.toISOString();
}

function demoPerson(uid, firstName, secondName, status, overrides = {}) {
  return {
    uid,
    firstName,
    secondName,
    birthDate: '1990-01-15',
    email: `${firstName.toLowerCase()}.${secondName.toLowerCase()}@example.com`,
    email_repeat: `${firstName.toLowerCase()}.${secondName.toLowerCase()}@example.com`,
    telephone: '+49 000 000000',
    address: 'Demo Street 1',
    postalCode: '10115',
    city: 'Berlin',
    country: 'Germany',
    checkedIn: status === 'checkedIn' || status === 'testPerformed',
    canceled: status === 'canceled',
    status,
    ...overrides,
  };
}

appDb.logins.deleteMany({ userName: { $in: ['admin', 'demo.agent'] } });
appDb.settings.deleteMany({ key: 'demo-center' });
appDb.appointments.deleteMany({ bookedFrom: 'Rapid Test Booking Platform-APP' });

appDb.logins.insertMany([
  {
    userName: 'admin',
    email: 'admin@example.com',
    firstName: 'Demo',
    secondName: 'Admin',
    // bcrypt hash of the demo password 'admin123'
    psw: '$2a$10$S4k7Z.KSx6DZPCq.qXb.b.OZTKvYlDuAbhJkaa2YIlWZE1SfhmEY2',
    roles: ['admin'],
    active: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    userName: 'demo.agent',
    email: 'agent@example.com',
    firstName: 'Demo',
    secondName: 'Agent',
    // bcrypt hash of the demo password 'admin123'
    psw: '$2a$10$ks8Q2S0rtBQnc1Obc1w4POwYH9kCKlEelxetRTBKaw8bwm0mH7e0i',
    roles: ['agent'],
    active: true,
    createdAt: now,
    updatedAt: now,
  },
]);

appDb.settings.insertOne({
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
  testKits: [{ label: 'Demo Antigen Test Kit', isActive: true }],
  testTypes: [
    { label: 'Rapid antigen test', price: '0', isActive: true },
    { label: 'PCR demo test', price: '49', isActive: true },
  ],
  createdAt: now,
  updatedAt: now,
});

appDb.appointments.insertMany([
  {
    appointmentUid: 'DEMO-APPT-001',
    bookedFrom: 'Rapid Test Booking Platform-APP',
    appointment: appointmentDate(0, 9, 30),
    testType: { label: 'Rapid antigen test', price: '0', isActive: true },
    persons: [demoPerson('DEMO-PERSON-001', 'Mira', 'Demo', 'booked')],
    createDate: now,
    lastModified: now,
  },
  {
    appointmentUid: 'DEMO-APPT-002',
    bookedFrom: 'Rapid Test Booking Platform-APP',
    appointment: appointmentDate(0, 11, 0),
    testType: { label: 'Rapid antigen test', price: '0', isActive: true },
    persons: [
      demoPerson('DEMO-PERSON-002', 'Samir', 'Example', 'checkedIn', {
        checkedInBy: 'admin',
        checkedInAt: now.toISOString(),
      }),
    ],
    createDate: now,
    lastModified: now,
  },
  {
    appointmentUid: 'DEMO-APPT-003',
    bookedFrom: 'Rapid Test Booking Platform-APP',
    appointment: appointmentDate(1, 10, 15),
    testType: { label: 'PCR demo test', price: '49', isActive: true },
    persons: [
      demoPerson('DEMO-PERSON-003', 'Lea', 'Sample', 'testPerformed', {
        checkedInBy: 'admin',
        checkedInAt: now.toISOString(),
        resultEmittedBy: 'admin',
        resultEmittedAt: now.toISOString(),
        testResult: 'negative',
        testKit: 'Demo Antigen Test Kit',
      }),
    ],
    createDate: now,
    lastModified: now,
  },
  {
    appointmentUid: 'DEMO-APPT-004',
    bookedFrom: 'Rapid Test Booking Platform-APP',
    appointment: appointmentDate(2, 14, 45),
    testType: { label: 'Rapid antigen test', price: '0', isActive: true },
    persons: [
      demoPerson('DEMO-PERSON-004', 'Jonas', 'Patient', 'booked'),
      demoPerson('DEMO-PERSON-005', 'Nora', 'Patient', 'booked'),
    ],
    createDate: now,
    lastModified: now,
  },
]);

print('Seeded rapid-test demo data for database: ' + dbName);
