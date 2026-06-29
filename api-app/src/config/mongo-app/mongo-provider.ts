import { AppConfigService } from '../app-config/app-config.service';
import { Db, MongoClient } from 'mongodb';

export const MongoProvider = {
  provide: 'MONGO-PROVIDER',
  useFactory: async (appConfigService: AppConfigService): Promise<Db> => {
    try {
      const client = new MongoClient(appConfigService.mongoDBConnection);
      await client.connect();
      return client.db(appConfigService.mongoDBName);
    } catch (e) {
      throw e;
    }
  },
  inject: [AppConfigService],
};
