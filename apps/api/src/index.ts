import App from './app';
import './cron/orderDuration';

const main = () => {
  // init db here

  const app = new App();
  app.start();
};

main();
