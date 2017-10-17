var _ = require('underscore');
var urlParser = require('url');

/**
 * validNumber - Checking if a number is a valid number
 *
 * @param  {type} testNumber description
 * @return {type}            description
 */
function validNumber(testNumber) {
  return _.isNumber(testNumber) && !_.isNaN(testNumber);
}

/**
 * addPaginationUrlParams - If the endpoint supports pagination, add the required query params
 *
 * @param  {type}    url    Existing url
 * @param  {type}    params
 * @param  {object}  params.paginate
 * @param  {number}  params.paginate.page     Page to get
 * @param  {number}  params.paginate.limit    Entries Per Page
 * @param  {string}  params.paginate.filter   Param to filter by
 * @return {string}  generated URL
 */
module.exports = function addPaginationUrlParams(url, params) {
  var parsedUrl = urlParser.parse(url, true);
  //No pagination required
  if (!params || !params.paginate) {
    return urlParser.format(url);
  }

  var page = parseInt(params.paginate.page);
  var limit = parseInt(params.paginate.limit);

  //If both page, limit and filter are not supported, then don't add query params.
  if (!validNumber(page) && !validNumber(limit) && !_.isString(params.paginate.filter)) {
    return urlParser.format(url);
  }

  if (validNumber(page)) {
    parsedUrl.query.page = page;
  }

  if (validNumber(limit)) {
    parsedUrl.query.limit = limit;
  }

  if (_.isString(params.paginate.filter)) {
    parsedUrl.query.filter = params.paginate.filter;
  }

  return urlParser.format(parsedUrl);
};
