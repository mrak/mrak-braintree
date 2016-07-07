(function () {
  var components = {};
  var useCardBtn = document.getElementById('cc-use');
  var cvvName = document.getElementById('cc-cvv-name');
  var numberType = document.getElementById('cc-number-type');

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
    return function (err, component) {
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

  function setupForm() {
    console.log('setupForm called');
    useCardBtn.value = 'Use Card';

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
      for (var field in event.fields) {
        if (!event.fields[field].isValid) {
          disableUseCard();
          return;
        }
      }

      enableUseCard();
    });
  }

  function disableUseCard() {
    useCardBtn.setAttribute('disabled', 'disabled');
  }

  function enableUseCard() {
    useCardBtn.removeAttribute('disabled');
  }
})();
