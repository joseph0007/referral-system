module.exports = class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    /**
     * Note that the find() returns a Query Object which when we await goes to the database and fetches for the document
     * if we dont await it it will not fetch the document right away!! there is some internal code that when we await
     * the Query object, it will wrap the object inside a promise and fetch the document!!
     * each time we use a query method on a Query object it will return a Query object and then we can use another
     * query method on it and so on and so forth.
     */

    //the req.query object is parsed by the express module and if we were to not use the express module then we would
    //have had to use some other module to parse the query into an object like Body parser

    //method 1: using the filter object to find the document
    // const { difficulty } = req.query;
    // const tours = await Tours.find({ difficulty: difficulty });

    //make the above method more robust
    /**
     * a cool way of destructuring an object using (...) spread operator into an object literal and creating a new object out
     * of it. this is done because using a simple "=" will just create a refrence to the original object and any changes
     * will also reflect in that object!!!
     */

    //formatting the url part 1
    let newObj = { ...this.queryStr };
    const removeList = ['fields', 'limit', 'page', 'sort'];

    //dynamic selection of object properties ---> object["property_name"]
    //delete keyword is used to delete property from the object in this context!!!
    removeList.forEach((el) => delete newObj[el]);

    //formatting the url for any operator intented for mongodb quering
    //by default if we pass any operator inside a [] in the url the express module will parse it into an object!!
    //adding the "$" to enforce mongodb syntax
    const queryStr = JSON.stringify(newObj).replace(
      /\b(lte|lt|gte|gt)\b/g,
      (match) => `$${match}`
    );

    newObj = JSON.parse(queryStr);

    //jonas method
    this.query = this.query.find(newObj);

    return this;
  }

  sort() {
    //SORTING
    /**
     * sort() automatically sorts the documents according to the given key STRING eg: 'price' and if we dont specify a
     * "-" before the key then it sorts it in ascending order and if we specify the key with the '-' in front
     * then it will sort it in descending order.
     * IF there is an exact match for the given key then we can pass in another key which will then be used to sort
     * the documents!!
     */
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  paginate() {
    //PAGINATION
    /**
     * Pagination is used to divide the result documents into pages so that they are much more organised and readable
     * for the user.
     * moongoose provides 2 methods skip() which receives a number which then skips that many number of documents
     * from the result and limit() which also receives a number which will be the number of documents per page.
     */

    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 100;
    const skipNum = (page - 1) * limit;

    // if (req.query.page) {
    //   const docCount = await Tour.countDocuments();
    //   if (skipNum >= docCount) throw Error('no more documents');
    // }

    this.query.skip(skipNum).limit(limit);
    return this;
  }

  limitFields() {
    //LIMITING FIELDS(PROJECTION)
    /**
     * this field is used to show only the necessary data and not all the data to the user basically like a projection object
     * used in mongodb!!
     * if "-" is used before the field name then it will exclude it instead of including it!!
     */

    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
};
