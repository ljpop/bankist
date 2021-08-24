'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-06-04T17:01:17.194Z',
    '2021-06-02T23:36:17.929Z',
    '2021-06-03T10:51:36.790Z',
  ],

  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatDate = function (date, locale) {
  const calcDaysPAssed = (date1, date2) =>
    Math.round((date2 - date1) / (1000 * 60 * 60 * 24));

  //console.log(calcDaysPAssed(date, new Date()));
  if (calcDaysPAssed(date, new Date()) === 0) {
    return 'TODAY';
  } else if (calcDaysPAssed(date, new Date()) === 1) {
    return 'YESTERDAY';
  } else if (calcDaysPAssed(date, new Date()) <= 7) {
    return `${calcDaysPAssed(date, new Date())} days ago`;
  } else return new Intl.DateTimeFormat(locale).format(date);
  /*
    return `${String(date.getDate()).padStart(2, 0)}/${String(
      date.getMonth() + 1
    ).padStart(2, 0)}/${date.getFullYear()}`;
    */
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movementsArray.slice().sort((a, b) => a.amount - b.amount)
    : acc.movementsArray;

  //console.log(movs);
  //const movs = acc.movementsArray.slice();
  //console.log(movs);

  movs.forEach(function (mov, i) {
    const type = mov.amount > 0 ? 'deposit' : 'withdrawal';
    // console.log(mov);
    // console.log(mov.amount);
    const dispDateOrig = new Date(mov.isoDATE);
    const dispDate = formatDate(dispDateOrig, acc.locale);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date"> ${dispDate}</div>
      
        <div class="movements__value">${Intl.NumberFormat(acc.locale, {
          style: 'currency',
          currency: acc.currency,
        }).format(mov.amount.toFixed(2))}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency,
  }).format(acc.balance.toFixed(2))}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency,
  }).format(incomes.toFixed(2))}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency,
  }).format(Math.abs(out).toFixed(2))}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency,
  }).format(interest.toFixed(2))}`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

const createMovArray = function (accs) {
  accs.forEach(function (acc) {
    acc.movementsArray = [];
    acc.movements.forEach(function (mov, i) {
      acc.movementsArray.push({ amount: mov, isoDATE: acc.movementsDates[i] });
    });

    {
      //console.log(mov, i);
      //);
    }
  });
};

createMovArray(accounts);
//console.log(accounts);
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      //labelTimer.textContent = 'IZLAZ';
      clearInterval(tajmer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get started`;
    }
    time--;
  };
  let time = 25;
  tick();
  const tajmer = setInterval(tick, 1000);
  return tajmer;
};

const setTajmer = function (tajmer) {
  clearInterval(tajmer);
  tajmer = startLogOutTimer();
  return tajmer;
};
// Event handlers
let currentAccount, tajmer;
/*
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;
*/
//const curDate = new Date();

//labelDate.textContent = curDate.toLocaleString();
// labelDate.textContent = `${String(curDate.getDate()).padStart(2, 0)}/${String(
//   curDate.getMonth() + 1
// ).padStart(2, 0)}/${curDate.getFullYear()}, ${String(
//   curDate.getHours()
// ).padStart(2, 0)}:${String(curDate.getMinutes()).padStart(2, 0)}`;

// console.log(new Intl.DateTimeFormat('en-GB', options).format(now));

///////////////////////////////////////

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  if (tajmer) clearInterval(tajmer);
  tajmer = startLogOutTimer();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  //console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
  }
});

const now = new Date();
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'long',
  weekdays: 'long',
  year: 'numeric',
};

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    currentAccount.movementsArray.push({
      amount: -amount,
      isoDATE: new Date().toISOString(),
    });
    receiverAcc.movements.push(amount);
    receiverAcc.movementsArray.push({
      amount: amount,
      isoDATE: new Date().toISOString(),
    });
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
    clearInterval(tajmer);
    tajmer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      currentAccount.movementsArray.push({
        amount: amount,
        isoDATE: new Date().toISOString(),
      });

      // Update UI
      updateUI(currentAccount);
      clearInterval(tajmer);
      tajmer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  clearInterval(tajmer);
  tajmer = startLogOutTimer();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const isEven = n => n % 2 === 0;
//console.log(isEven(4));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 3 === 0) row.style.backgroundColor = 'lightblue';
  });
  setInterval(function () {
    const now = new Date();
    labelBalance.textContent = `${String(now.getHours()).padStart(
      2,
      0
    )}:${String(now.getMinutes()).padStart(2, 0)}:${String(
      now.getSeconds()
    ).padStart(2, 0)}`;
  }, 1000);
});
/*
const OBJEKAT = {
  nizA: ['f', 'a', 'd', 'm', 'c', 'b'],
  nizB: [5, 7, 11, 3, 4, 12],
};
console.log(OBJEKAT.nizA);

//(a, b) => a - b
OBJEKAT.nizA.sort();
console.log(OBJEKAT.nizA);

OBJEKAT.nizB.sort();

console.log(OBJEKAT.nizB);

const obMap = new Map();
OBJEKAT.forEach(function () {
  obMap.set([nizA[i], nizB[i]]);
});
console.log(obMap);
*/

// const calcDaysPAssed = (date1, date2) =>
//   (date2 - date1) / (1000 * 60 * 60 * 24);
// const days = calcDaysPAssed(new Date(2019, 5, 3), new Date(2020, 5, 3));
// console.log(+new Date(2019, 5, 3));

const ingr = ['aaa', 'bbb'];
const ovajTajmer = setTimeout(
  (ing1, ing2) => console.log(`Here is your letters with: ${ing1} and ${ing2}`),
  3000,
  ...ingr
);
//console.log('Waiting...');

if (ingr.includes('bbb')) clearTimeout(ovajTajmer);

setInterval(function () {
  const now = new Date();
  //console.log(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
}, 1000);
