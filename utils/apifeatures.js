module.exports = class APIFeatures {
  constructor(query, otherQuery) {
    this.query = query;
    this.otherQuery = otherQuery || {};
  }

  sort() {
    if (this.otherQuery.sort) {
      // { field: 'asc', test: -1 }
      this.query = this.query.sort(this.otherQuery.sort);
    }
    return this;
  }

  paginate() {
    const page = this.otherQuery.page * 1 || 1;
    const limit = this.otherQuery.limit * 1 || 100;
    const skipNum = (page - 1) * limit;

    this.query.skip(skipNum).limit(limit);
    return this;
  }
};
