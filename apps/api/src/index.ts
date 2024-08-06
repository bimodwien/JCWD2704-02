import App from './app';
import './cron/orderDuration';
import './cron/orderConfirmation';
import './cron/userVoucher';
import './cron/updateVoucherUser';

const main = () => {
  // init db here

  const app = new App();
  app.start();
};

main();
