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

exports.hello = () => {};

module.exports = {
    filterUpdateObject,
    sanityCheck
}