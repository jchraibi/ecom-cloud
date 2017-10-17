var fh;

/**
 * Setting the fh-mbass-api module.
 * @param {object} fhApi
 */
function setFhApi(fhApi) {
  fh = fhApi;
}

/**
 * Getting the fh-mbaas-api module.
 * @returns {object}
 */
function getFhApi() {
  return fh;
}

module.exports = {
  setFhApi: setFhApi,
  getFhApi: getFhApi
};