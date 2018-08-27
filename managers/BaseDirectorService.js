'use strict';

const _ = require('lodash');
const utils = require('../common/utils');
const bosh = require('../data-access-layer/bosh');
const Agent = require('../data-access-layer/service-agent');
const BoshDirectorClient = bosh.BoshDirectorClient;
const Networks = bosh.manifest.Networks;
const BaseService = require('./BaseService');

class BaseDirectorService extends BaseService {
  constructor(plan) {
    super(plan);
    this.plan = plan;
    this.director = bosh.director;
    this.agent = new Agent(this.settings.agent);
  }

  getDeploymentIps(deploymentName) {
    return this.director.getDeploymentIps(deploymentName);
  }

  static parseDeploymentName(deploymentName, subnet) {
    return _
      .chain(utils.deploymentNameRegExp(subnet).exec(deploymentName))
      .slice(1)
      .tap(parts => parts[1] = parts.length ? parseInt(parts[1]) : undefined)
      .value();
  }

  get template() {
    return new Buffer(this.settings.template, 'base64').toString('utf8');
  }

  get stemcell() {
    return _(this.settings)
      .chain()
      .get('stemcell', {})
      .defaults(BoshDirectorClient.getInfrastructure().stemcell)
      .update('version', version => '' + version)
      .value();
  }

  get releases() {
    return _(this.settings)
      .chain()
      .get('releases')
      .map(release => _.pick(release, 'name', 'version'))
      .sortBy(release => `${release.name}/${release.version}`)
      .value();
  }

  get networkName() {
    return this.subnet || BoshDirectorClient.getInfrastructure().segmentation.network_name || 'default';
  }

  getNetworks(index) {
    return new Networks(BoshDirectorClient.getInfrastructure().networks, index, BoshDirectorClient.getInfrastructure().segmentation);
  }

  getNetwork(index) {
    return this.getNetworks(index)[this.networkName];
  }

}

module.exports = BaseDirectorService;