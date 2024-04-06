const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apifeatures');

exports.GenericDeleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('requested ID not found in the database', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.GenericUpdateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('requested ID not found in the database', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.GenericCreateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const data = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        data,
      },
    });
  });

exports.GenericGetAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //to handle GET reviews through tours route
    let filter = {};
    if (req.params.tourId) filter = { tourID: req.params.tourId };

    const feature = new APIFeatures(Model.find(filter), req.query)
      .sort()
      .paginate()
      .limitFields()
      .filter();

    //gives additional information about the query!!
    // const doc = await feature.query.explain();
    const doc = await feature.query;

    //method 2: using the Query object methods to find the document
    // const { difficulty } = req.query;
    // const tours = await Tour.find()
    //   .where('difficulty')
    //   .equals(difficulty)
    //   .where('duration')
    //   .equals(5);

    //we are using the JSEND method to send the json file
    res.status(200).json({
      status: 'success',
      results: doc.length,
      //requestTime: req.requestTime,
      // ES6 syntax where if the value and key names are same then no need to specify the key name explicitly!!
      data: {
        data: doc,
      },
    });
  });

exports.GenericGetOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = await Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;
    //used inside a pre() query middleware
    // .populate({
    //   path: 'guides',
    // //to select particular fields!!
    //   select: '-__v -changedAt',
    // });

    if (!doc) {
      return next(new AppError('requested ID not found in the database', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
