'use strict';

var ajax = require('./ajax');
var btClient = require('braintree-web/client');
var btHostedFields = require('braintree-web/hosted-fields');
var btPayPal = require('braintree-web/paypal');

class App {
  constructor() {
    this._activeView = 'loading';
    this._components = {};
    this._dom = {
      useCardBtn: document.getElementById('cc-use'),
      cvvName: document.getElementById('cc-cvv-name'),
      numberType: document.getElementById('cc-number-type'),
      paymentPicker: document.getElementById('payment-picker'),
      paymentArea: document.getElementById('payment-area'),
      completedTypeField: document.getElementById('completed-type'),
      completedDetailField: document.getElementById('completed-detail'),
    };
  }

  start() {
    ajax({
      url: '/tokenization_key',
    }, this.createClient.bind(this));
  }

  createClient(err, xhr) {
    if (err) {
      console.error(err);
      return;
    }

    btClient.create({
      authorization: xhr.text
    }, this.clientCreated.bind(this));
  }

  clientCreated(err, client) {
    if (err) {
      console.error(err);
      return;
    }

    console.info('client created');
    this._components.client = client;

    btHostedFields.create({
      client: client,
      styles: {
        input: {
          'font-family': 'monospace'
        },
        'input.invalid': {
          color: 'tomato'
        }
      },
      fields: {
        number: {
          selector: '#cc-number',
          placeholder: '•••• •••• •••• ••••'
        },
        expirationDate: {
          selector: '#cc-exp',
          placeholder: 'MM / YY'
        },
        cvv: {
          selector: '#cc-cvv',
          placeholder: '•••'
        },
        postalCode: {
          selector: '#cc-postal',
          placeholder: 'Postal Code'
        }
      }
    }, this.componentCreated('hostedFields'));

    btPayPal.create({
      client: client
    }, this.componentCreated('paypal'));
  }

  componentCreated(name) {
    return (err, component) => {
      if (err) {
        console.error(name, 'component not created:', err);
        return;
      }

      this._components[name] = component;

      if (this._components.hostedFields && this._components.paypal) {
        this.setupForm();
      }
    };
  }

  setupForm() {
    console.log('setupForm called');

    this._dom.useCardBtn.addEventListener('click', () => {
      this.disableUseCard('Processing...');
      this._components.hostedFields.tokenize((err, payload) => {
        if (err) {
          console.error(err);
        } else {
          this.complete(payload);
        }
        this.enableUseCard();
      });
    });

    this._dom.paymentPicker.addEventListener('click', (event) => {
      var viewName = event.target.getAttribute('data-view');

      if (this._dom.paymentPicker.classList.contains('collapsed')) {
        this._dom.paymentPicker.classList.toggle('collapsed');
        this._dom.paymentPicker.classList.toggle('expanded');
        return;
      }

      switch(viewName) {
        case '':
          this._dom.paymentPicker.classList.toggle('collapsed');
          this._dom.paymentPicker.classList.toggle('expanded');
          break;
        case 'paypal':
          this.goPayPal();
        default:
          this.navigate(viewName);
      }
    });

    this._components.hostedFields.on('cardTypeChange', (event) => {
      var card, type, cvv;

      if (event.cards.length === 1) {
        card = event.cards[0];
        type = card.niceType;
        cvv = card.code.name;
      } else {
        type = 'Credit Card';
        cvv = 'CVV';
      }

      this._dom.numberType.innerHTML = type;
      this._dom.cvvName.innerHTML = cvv;
    });
    this._components.hostedFields.on('validityChange', (event) => {
      var currentField = event.fields[event.emittedBy];

      currentField.container.parentNode.classList.toggle('has-error', !currentField.isPotentiallyValid);
      currentField.container.parentNode.classList.toggle('has-success', currentField.isValid);

      for (var field in event.fields) {
        if (!event.fields[field].isValid) {
          this.disableUseCard();
          return;
        }
      }

      this.enableUseCard();
    });

    this._dom.paymentArea.classList.remove('loading');
    this._dom.paymentArea.classList.add('payment-picker');
  }

  navigate(viewname) {
    this._dom.paymentArea.classList.remove(this._activeView);
    this._dom.paymentArea.classList.add(viewname);
    this._activeView = viewname;
    this._dom.paymentPicker.classList.add('collapsed');
    this._dom.paymentPicker.classList.remove('expanded');
  }

  complete(payload) {
    var type, detail;

    if (payload.details.email) {
      type = 'PayPal';
      detail = payload.details.email;
    } else {
      type = payload.details.cardType;
      detail = 'ending in **' + payload.details.lastTwo;
    }

    this._dom.completedTypeField.innerHTML = type;
    this._dom.completedDetailField.value = detail;
    console.log(payload);
    this.navigate('completed');
  }

  goPayPal() {
    this._components.paypal.tokenize({
      flow: 'checkout',
      amount: '10.00',
      currency: 'USD'
    }, (err, payload) => {
      this.complete(payload);
    });
  }

  disableUseCard(text) {
    if (text) {
      this._dom.useCardBtn.value = text;
    }
    this._dom.useCardBtn.setAttribute('disabled', 'disabled');
  }

  enableUseCard() {
    this._dom.useCardBtn.value = 'Use Card';
    this._dom.useCardBtn.removeAttribute('disabled');
  }
}

module.exports = App;
