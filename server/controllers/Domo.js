const models = require('../models');

const Domo = models.Domo;

// makeDomo()
const makeDomo = (rq, rp) => {
  if (!rq.body.name || !rq.body.age) {
    return rp.status(400).json({ error: 'RAWR! Both name and age are required!' });
  }

  const domoData = {
    name: rq.body.name,
    age: rq.body.age,
    owner: rq.session.account._id,
  };

  // Creating + saving the new Domo
  const newDomo = new Domo.DomoModel(domoData);
  const domoPromise = newDomo.save();

  // Setting up the save callback functions
  domoPromise.then(() => rp.json({ redirect: '/maker' }));
  domoPromise.catch((err) => {
    console.log(err);
    if (err.code === 11000) {
      return rp.status(400).json({ error: 'Domo already exists.' });
    }

    return rp.status(400).json({ error: 'An unexpected error occurred' });
  });

  return domoPromise;
};

// getDomos()
const getDomos = (request, response) => {
  const rq = request;
  const rp = response;

  // Actually getting the Domos
  return Domo.DomoModel.findByOwner(rq.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return rp.status(400).json({ error: 'An error occurred' });
    }

    return rp.json({ domos: docs });
  });
};

// makerPage()
const makerPage = (rq, rp) => {
  Domo.DomoModel.findByOwner(rq.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return rp.status(400).json({ error: 'An unexpected error occurred' });
    }

    return rp.render('app', {
      csrfToken: rq.csrfToken(),
      domos: docs,
    });
  });
};

// The Domo Controller exports
module.exports = {
  makerPage,
  getDomos,
  make: makeDomo,
};
