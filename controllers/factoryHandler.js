const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apifeatures');
const { filterData } = require('../utils/utils');

exports.GenericDeleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { 
      query,
    } = req;
  
    if( typeof query !== 'object' ) {
      console.log("No query provided");
      throw new AppError();      
    }

    const doc = await Model.findByIdAndDelete(query.id);

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
    const {
      query,
      docData,
      sanitizeDict
    } = req;

    if( typeof query !== 'object' ) {
      console.log("No query provided");
      throw new AppError();      
    }

    if( typeof sanitizeDict !== 'object' ) {
      console.log("Please provide sanitization object");
      throw new AppError();      
    }
    
    const updateData = filterData(docData, sanitizeDict);
    const doc = await Model.findByIdAndUpdate(query.id, updateData, {
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
    const {
      docData,
      sanitizeDict
    } = req;
  
    if( typeof sanitizeDict !== 'object' ) {
      console.log("Please provide sanitization object");
      throw new AppError();      
    }

    const insertData = filterData(docData, sanitizeDict);
    const data = await Model.create(insertData);
    res.status(200).json({
      status: 'success',
      data: {
        data,
      },
    });
  });

exports.GenericGetAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const {
      query,
      otherQuery
    } = req;
  
    if( typeof query !== 'object' ) {
      console.log("No query provided");
      throw new AppError();
    }

    const feature = new APIFeatures(Model.find(query), otherQuery)
      .sort()
      .paginate();

    const doc = await feature.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

exports.GenericGetOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { 
      query,
      populateOptions
    } = req;
  
    if( typeof query !== 'object' ) {
      console.log("No query provided");
      throw new AppError();      
    }

    let queryData = await Model.findById(query.id);
    if (populateOptions) queryData = queryData.populate(populateOptions);

    const doc = await queryData;
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
