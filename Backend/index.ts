import app from './src/server';
import { env } from './src/config/env';
import { testConnection } from './src/config/database';

async function bootstrap(): Promise<void> {
  await testConnection();

  app.listen(env.PORT, () => {
    console.log(`SmartWallet API corriendo en http://localhost:${env.PORT}/api/v1`);
    console.log(`Entorno: ${env.NODE_ENV}`);
  });
}

bootstrap().catch((err: unknown) => {
  console.error('Error fatal al iniciar el servidor:', err);
  process.exit(1);
});
