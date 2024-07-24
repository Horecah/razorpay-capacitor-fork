import { registerPlugin, WebPlugin } from '@capacitor/core';
import type { CheckoutOptions, CheckoutPlugin } from './definitions';

export class CheckoutWeb extends WebPlugin implements CheckoutPlugin {
  constructor() {
    super({
      name: 'Checkout',
      platforms: ['web'],
    });
  }

  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }

  async open(options: CheckoutOptions): Promise<{ response: string }> {
    console.log(options);

    return new Promise((resolve, reject) => {
      var razorpay: any;
      //add handlers to options to get the success response
      var finalOps: any = options;

      finalOps['handler'] = function (res: any) {
        console.log(res.razorpay_payment_id);
        resolve({
          response: res,
        });
      };

      finalOps['modal.ondismiss'] = function () {
        reject(
          JSON.stringify({ code: 2, description: 'Payment Canceled by User' }),
        );
      };

      var retryCount = 0;
      if (finalOps.hasOwnProperty('retry')) {
        if (finalOps.retry.enabled === true) {
          retryCount = finalOps.retry.max_count;
        }
      }

      //get the first script tag in the document
      var rjs = document.getElementsByTagName('script')[0];
      //create a HTMLScriptElement object for rzp script injection
      var rzpjs = document.createElement('script');
      rzpjs.id = 'rzp-jssdk';
      rzpjs.setAttribute('src', 'https://checkout.razorpay.com/v1/checkout.js');
      rjs.parentNode?.appendChild(rzpjs);
      rzpjs.addEventListener('load', () => {
        try {
          razorpay = new (window as any).Razorpay(finalOps);
          razorpay.open();
          razorpay.on('payment.failed', (res: any) => {
            retryCount = retryCount - 1;
            if (retryCount < 0) {
              console.log(res);
              rjs.parentNode?.removeChild(rzpjs);
              reject(res.error);
            }
          });
        } catch (err) {
          reject({
            response: err,
          });
        }
      });
    });
  }
}


const Checkout = registerPlugin<CheckoutPlugin>('Checkout',{
  web: () => import('./web').then(m => new m.CheckoutWeb())
});

export * from './definitions';
export {Checkout}


