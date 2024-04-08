const moment = require('moment');
const AppError = require("./appError");

const filterUpdateObject = (user, ...fields) => {
  const filteredObj = {};

  Object.keys(user).forEach((el) => {
    if (fields.includes(el)) {
      filteredObj[el] = user[el];
    }
  });
  return filteredObj;
};

const sanityCheck = (userData) => {
  if (userData.role && !(['user', 'lead-guide', 'guide'].includes(userData.role))) {
    throw AppError(`Invalid role!! Please select => user, lead guide, guide`, 401);
  }
}

const filterData = (unsanitizedData, sanitizeDict) => {
  const sanitizedData = {};

  try {
    for (let i = 0; i < sanitizeDict; i++) {
      sanitizedData[sanitizeDict[i]] = unsanitizedData[sanitizeDict[i]];
    }

    return sanitizedData;
  } catch (error) {
    console.log("error while filtering data ", error);

    return sanitizedData;
  }
}

const buildQueryData = (req, res, next) => {
  let combineData = {};
  const query = {};
  const otherQuery = {};
  const checkData = {
    "sort": "sort",
    "page": "page",
    "limit": "limit",
    "fields": "fields",
  }

  if (typeof req.body === 'object') {
    combineData = Object.assign(combineData, req.body);
  }

  if (typeof req.query === 'object') {
    combineData = Object.assign(combineData, req.query);
  }

  if (typeof req.params === 'object') {
    combineData = Object.assign(combineData, req.params);
  }

  if (combineData.id) {
    query.id = combineData.id;
    delete combineData.id;
  }

  for( let key in combineData ) {
    if( combineData[key] ) {
      if( key.startsWith('q_') ) {
        query[key.substring(2)] = combineData[key];
        delete combineData[key];
      }
    }
  }

  for( let i = 0; i < checkData.length; i++ ) {
    if( combineData[checkData[i]] ) {
      otherQuery[checkData[i]] = combineData[checkData[i]]; 
      delete combineData[checkData[i]];
    }
  }

  req.sanitizeDict = modelFields(req.type);
  req.query = query;
  req.otherQuery = otherQuery;
  req.docData = combineData;

  next();
}

const modelFields = (type) => {
  switch (type) {
    case 'user': {
      return {
        "name": "name",
        "email": "email",
        "photo": "photo",
        "role": "role",
        "password": "password",
        "active": "active",
      }
    }
    case 'referral': {
      return {
        "referralId": "referralId",
        "referreeId": "referreeId",
        "score": "score",
      }
    }
    default: {
      return {}
    }
  }
}

const getMsDate = ( date ) => {
  if( date ) {
    return parseInt(
      moment( date ).format('x'),
      10
    );
  }

  return parseInt(moment().format('x'), 10);
}

exports.hello = () => { };

module.exports = {
  filterUpdateObject,
  sanityCheck,
  filterData,
  buildQueryData,
  getMsDate
}