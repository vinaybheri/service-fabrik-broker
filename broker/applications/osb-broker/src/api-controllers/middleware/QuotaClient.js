'use strict';

const _ = require('lodash');
const config = require('@sf/app-config');
const {
  CONST,
  HttpClient
} = require('@sf/common-utils');
const logger = require('@sf/logger');

class QuotaClient extends HttpClient {
  constructor(options) {
    super(_.defaultsDeep({
      baseUrl: config.quota_app.quota_app_url,
      headers: {
        Accept: 'application/json'
      },
      followRedirect: false
    }, options));
    this.username = config.quota_app.username;
    this.password = config.quota_app.password;
  }
  async checkQuotaValidity(options, instanceBasedQuota) {
    if(instanceBasedQuota) {
      return await this.getQuotaValidStatus(options);
    } else {
      return await this.putCompositeQuotaInfo(options);
    }
  }
  async getQuotaValidStatus(options) {
    const orgOrSubaccountId = _.get(options, 'orgOrSubaccountId');
    const res = await this.request({
      url: `${config.quota_app.quota_endpoint}/${orgOrSubaccountId}/quota`,
      method: CONST.HTTP_METHOD.GET,
      auth: {
        user: this.username,
        password: this.password
      },
      qs: _.get(options, 'queryParams'),
      json: true
    }, CONST.HTTP_STATUS_CODE.OK);
    logger.info(`Quota app returned following quotaValidStatus: ${res.body.quotaValidStatus}`);
    return res.body.quotaValidStatus;
  }
  async putCompositeQuotaInfo(options) {
    const orgOrSubaccountId = _.get(options, 'orgOrSubaccountId');
    const res = await this.request({
      url: `${config.quota_app.quota_endpoint}/${orgOrSubaccountId}/quota`,
      method: CONST.HTTP_METHOD.PUT,
      auth: {
        user: this.username,
        password: this.password
      },
      body: _.get(options, 'data'),
      json: true
    }, CONST.HTTP_STATUS_CODE.OK);
    logger.info(`Quota app returned following quotaValidStatus: ${res.body.quotaValidStatus}`);
    return res.body.quotaValidStatus;
  }
}

module.exports = QuotaClient;
/* jshint ignore:end */
