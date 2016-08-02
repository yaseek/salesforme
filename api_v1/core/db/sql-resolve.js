'use strict';

const assert = require('assert');

const sql = require('sql-bricks-postgres');

function resolveFilters (filters) {
  if (filters.logic && Array.isArray(filters.filters)) {

    var fn = sql[filters.logic];
    return fn.apply(null, filters.filters.map((filter) => {
      return resolveFilters(filter);
    }))
  } else if (filters.field) {
    //if (filters.operator === 'isNot') return sql.not( {deleted:true});
    var operators = {
      contains: function (field, value) {
        return new sql.Binary('@>', field, value);
      }
    };

    var fn = sql[filters.operator] || operators[filters.operator];
    //console.log('FN', fn);
    assert(fn, `undefined sql operator ${filters.operator}`);
    if (!!filters.not) {
      return sql.not(fn(filters.field, filters.value));
    }
    return fn(filters.field, filters.value);
  }
}

function resolveQuery(q, query) {

  if (!query) {
    query = {};
  }

  if (!query.take) {
    query.take = 30;
  }
  q.limit(query.take);

  if (query.skip) {
    q.offset(query.skip);
  }

  if (query.filters) {
    var whereExpr;
    //query.filters.forEach(())
    if (query.filters.logic) {
      whereExpr = resolveFilters(query.filters);
    } else {
      query.filters = {
        logic: 'and',
        filters: Array.isArray(query.filters)
          ? query.filters
          : [ query.filters ]
      };
      whereExpr = resolveFilters(query.filters);
    }
    q.where(whereExpr);
  }

  if (query.sort) {
    var sortData = Array.isArray(query.sort)
      ? query.sort
      : [query.sort];
    q.orderBy(sortData.map((item) => {
      if (typeof item !== 'object') {
        item = { field: item };
      }
      return [
        item.field,
        item.dir || 'asc'
      ].join(' ');
    }));
  }
  //console.log('QQQ', q.toString());
}
module.exports = resolveQuery;

