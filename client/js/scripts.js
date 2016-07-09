(function () {
  var components = {};
  var useCardBtn = document.getElementById('cc-use');
  var cvvName = document.getElementById('cc-cvv-name');
  var numberType = document.getElementById('cc-number-type');
  var paymentPicker = document.getElementById('payment-picker');
  var paymentArea = document.getElementById('payment-area');
  var activeView = 'loading';
  var completedTypeField = document.getElementById('completed-type');
  var completedDetailField = document.getElementById('completed-detail');

  ajax({
    url: '/tokenization_key',
  }, createClient);

  function createClient(err, xhr) {
    if (err) {
      console.error(err);
      return;
    }

    braintree.client.create({
      authorization: xhr.text
    }, clientCreated)
  }

  function clientCreated(err, client) {
    if (err) {
      console.error(err);
      return;
    }

    console.info('client created');
    components.client = client;

    braintree.hostedFields.create({
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
    }, componentCreated('hostedFields'));

    braintree.paypal.create({
      client: client
    }, componentCreated('paypal'));
  }

  function componentCreated(name) {
    return (err, component) => {
      if (err) {
        console.error(name, 'component not created:', err);
        return;
      }

      components[name] = component;

      if (components.hostedFields && components.paypal) {
        setupForm();
      }
    };
  }

  function navigate(viewname) {
    paymentArea.classList.remove(activeView);
    paymentArea.classList.add(viewname);
    activeView = viewname;
    paymentPicker.classList.add('collapsed');
    paymentPicker.classList.remove('expanded');
  }

  function setupForm() {
    console.log('setupForm called');

    useCardBtn.addEventListener('click', () => {
      disableUseCard('Processing...');
      components.hostedFields.tokenize((err, payload) => {
        if (err) {
          console.error(err);
        } else {
          complete(payload);
        }
        enableUseCard();
      });
    });

    paymentPicker.addEventListener('click', (event) => {
      var viewName = event.target.getAttribute('data-view');

      if (paymentPicker.classList.contains('collapsed')) {
        paymentPicker.classList.toggle('collapsed');
        paymentPicker.classList.toggle('expanded');
        return;
      }

      switch(viewName) {
        case '':
          paymentPicker.classList.toggle('collapsed');
          paymentPicker.classList.toggle('expanded');
          break;
        case 'paypal':
          goPayPal();
        default:
          navigate(viewName);
      }
    });

    components.hostedFields.on('cardTypeChange', (event) => {
      var card, type, cvv;

      if (event.cards.length === 1) {
        card = event.cards[0];
        type = card.niceType;
        cvv = card.code.name;
      } else {
        type = 'Credit Card';
        cvv = 'CVV';
      }

      numberType.innerHTML = type;
      cvvName.innerHTML = cvv;
    });
    components.hostedFields.on('validityChange', (event) => {
      var currentField = event.fields[event.emittedBy];

      currentField.container.parentNode.classList.toggle('has-error', !currentField.isPotentiallyValid);
      currentField.container.parentNode.classList.toggle('has-success', currentField.isValid);

      for (var field in event.fields) {
        if (!event.fields[field].isValid) {
          disableUseCard();
          return;
        }
      }

      enableUseCard();
    });

    paymentArea.classList.remove('loading');
    paymentArea.classList.add('payment-picker');
  }

  function complete(payload) {
    var type, detail;

    if (payload.details.email) {
      type = 'PayPal';
      detail = payload.details.email;
    } else {
      type = payload.details.cardType;
      detail = 'ending in **' + payload.details.lastTwo;
    }

    completedTypeField.innerHTML = type;
    completedDetailField.value = detail;
    console.log(payload);
    navigate('completed');
  }

  function goPayPal() {
    components.paypal.tokenize({
      flow: 'checkout',
      amount: '10.00',
      currency: 'USD'
    }, (err, payload) => {
      complete(payload);
    });
  }

  function disableUseCard(text) {
    if (text) {
      useCardBtn.value = text;
    }
    useCardBtn.setAttribute('disabled', 'disabled');
  }

  function enableUseCard() {
    useCardBtn.value = 'Use Card';
    useCardBtn.removeAttribute('disabled');
  }
})();
