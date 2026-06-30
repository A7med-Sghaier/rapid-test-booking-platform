const dbName = process.env.MONGO_INITDB_DATABASE || 'rapid-test-booking';
const database = db.getSiblingDB(dbName);

const now = new Date();

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
      key: 'demo-center',
      name: 'Rapid Test Demo Center',
      address: 'Demo Street 1',
      postalCode: 10115,
      city: 'Berlin',
      country: 'Germany',
      healthOfficeEmail: 'health-office@example.com',
      maxPerSlot: 5,
      openingTimes: {
        monday: { isOpen: true, from: '08:00', to: '18:00' },
        tuesday: { isOpen: true, from: '08:00', to: '18:00' },
        wednesday: { isOpen: true, from: '08:00', to: '18:00' },
        thursday: { isOpen: true, from: '08:00', to: '18:00' },
        friday: { isOpen: true, from: '08:00', to: '18:00' },
        saturday: { isOpen: true, from: '09:00', to: '14:00' },
        sunday: { isOpen: false, from: '09:00', to: '14:00' },
      },
      testKits: [
        { label: 'Demo Antigen Test Kit', isActive: true },
      ],
      testTypes: [
        { label: 'Rapid antigen test', price: '0', isActive: true },
        { label: 'PCR demo test', price: '49', isActive: true },
      ],
      updatedAt: now,
    },
    $setOnInsert: {
      createdAt: now,
    },
  },
  { upsert: true }
);
