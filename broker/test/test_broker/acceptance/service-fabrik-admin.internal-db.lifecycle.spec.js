'use strict';

const _ = require('lodash');
const app = require('../support/apps').admin;
const dbManager = require('@sf/db').dbManager;
const config = require('@sf/app-config');
const {
  backupStore,
  CloudProviderClient
} = require('@sf/iaas');
const filename = backupStore.filename;
const {
  CONST,
  commonFunctions,
  errors: {
    NotFound
  }
} = require('@sf/common-utils');
const { apiServerClient } = require('@sf/eventmesh');

describe('service-fabrik-admin', function () {
  describe('internal-db-lifecycle', function () {
    /* jshint expr:true */
    const base_url = '/admin';
    const backup_guid = '071acb05-66a3-471b-af3c-8bbf1e4180be';
    const time = Date.now();
    const started_at = isoDate(time);
    const container = backupStore.containerName;
    let deploymentHookRequestBody;
    let timestampStub, uuidv4Stub;

    function isoDate(time) {
      return new Date(time).toISOString().replace(/\.\d*/, '').replace(/:/g, '-');
    }

    before(function () {
      config.mongodb.provision.plan_id = 'bc158c9a-7934-401e-94ab-057082a5073f';
      deploymentHookRequestBody = {
        phase: 'PreCreate',
        actions: ['Blueprint', 'ReserveIps'],
        context: {
          params: {
            context: {
              platform: 'service-fabrik',
              organization_guid: CONST.FABRIK_INTERNAL_MONGO_DB.ORG_ID,
              space_guid: CONST.FABRIK_INTERNAL_MONGO_DB.SPACE_ID
            },
            parameters: {
              '_runImmediately': true
            },
            network_index: config.mongodb.provision.network_index,
            skip_addons: true,
            organization_guid: CONST.FABRIK_INTERNAL_MONGO_DB.ORG_ID,
            space_guid: CONST.FABRIK_INTERNAL_MONGO_DB.SPACE_ID,
            service_id: '24731fb8-7b84-4f57-914f-c3d55d793dd4',
            plan_id: config.mongodb.provision.plan_id
          },
          deployment_name: 'service-fabrik-mongodb',
          sf_operations_args: {}
        }
      };

      // By default config is not configured for DB. So just for the test cases in this suite
      // setting up plan id and reinitializing DBManager.
      dbManager.initialize();
      backupStore.cloudProvider = new CloudProviderClient(config.backup.provider);
      mocks.cloudProvider.auth();
      mocks.cloudProvider.getContainer(container);
      timestampStub = sinon.stub(filename, 'timestamp');
      uuidv4Stub = sinon.stub(commonFunctions, 'uuidV4');
      timestampStub.withArgs().returns(started_at);
      uuidv4Stub.withArgs().returns(Promise.resolve(backup_guid));
      return mocks.setup([
        backupStore.cloudProvider.getContainer()
      ]);
    });

    afterEach(function () {
      mocks.reset();
      timestampStub.resetHistory();
      uuidv4Stub.resetHistory();
    });

    after(function () {
      timestampStub.restore();
      uuidv4Stub.restore();
      delete config.mongodb.provision.plan_id;
    });

    describe('create', function () {
      let clock;
      let sandbox, retryStub;
      let getResourceStub, deleteResourceStub, createResourceStub;
      before(function() {
        sandbox = sinon.createSandbox();
        retryStub = sandbox.stub(commonFunctions, 'retry').callsFake((callback, options) => callback());
      });

      beforeEach(function () {
        clock = sinon.useFakeTimers(new Date().getTime());
        getResourceStub = sandbox.stub(apiServerClient, 'getResource');
        createResourceStub = sandbox.stub(apiServerClient, 'createResource');
        deleteResourceStub = sandbox.stub(apiServerClient, 'deleteResource');
        getResourceStub.withArgs().returns(Promise.try(() => {
          throw new NotFound('resource not found on ApiServer');
        }));
        deleteResourceStub.withArgs().returns(Promise.try(() => {
          throw new NotFound('resource not found on ApiServer');
        }));

        createResourceStub.withArgs().returns(Promise.resolve());

      });

      afterEach(function () {
        getResourceStub.restore();
        createResourceStub.restore();
        deleteResourceStub.restore();
        retryStub.resetHistory();
        clock.restore();
      });
      after(function () {
        sandbox.restore();
      });

      it('should provision service fabrik internal mongodb when deployment not found', function (done) {
        const WAIT_TIME_FOR_ASYNCH_CREATE_DEPLOYMENT_OPERATION = 50;
        const expectedRequestBody = _.cloneDeep(deploymentHookRequestBody);
        expectedRequestBody.context = _.chain(expectedRequestBody.context)
          .set('id', CONST.FABRIK_INTERNAL_MONGO_DB.BINDING_ID)
          .set('parameters', {})
          .omit('params')
          .omit('sf_operations_args')
          .value();
        expectedRequestBody.phase = CONST.SERVICE_LIFE_CYCLE.PRE_BIND;
        mocks.deploymentHookClient.executeDeploymentActions(200, deploymentHookRequestBody);
        mocks.deploymentHookClient.executeDeploymentActions(200, expectedRequestBody);
        mocks.director.getDeployment(config.mongodb.deployment_name, false, undefined, 2);
        mocks.director.getDeploymentInstances(config.mongodb.deployment_name);
        mocks.director.createOrUpdateDeployment('777');
        mocks.director.getDeploymentTask('777', 'done');
        mocks.agent.getInfo();
        config.directors[0].default_task_poll_interval = 10;
        return chai
          .request(app)
          .post(`${base_url}/service-fabrik/db`)
          .set('Accept', 'application/json')
          .auth(config.username, config.password)
          .catch(err => err.response)
          .then(res => {
            clock.tick(config.directors[0].default_task_poll_interval);
            expect(res.body.status).to.be.oneOf(['CREATE_UPDATE_IN_PROGRESS', 'DISCONNECTED']);
            expect(res.body.url).to.eql('');
            expect(res).to.have.status(202);
            clock.restore();
            setTimeout(() => {
              mocks.verify();
              done();
            }, WAIT_TIME_FOR_ASYNCH_CREATE_DEPLOYMENT_OPERATION);
          });
      });
    });

    describe('update', function () {
      let clock;
      beforeEach(function () {
        clock = sinon.useFakeTimers(new Date().getTime());
      });
      afterEach(function () {
        clock.restore();
      });
      it('should update service fabrik internal mongodb deployment ', function (done) {
        const WAIT_TIME_FOR_ASYNCH_CREATE_DEPLOYMENT_OPERATION = 5;
        const expectedRequestBody = _.cloneDeep(deploymentHookRequestBody);
        _.set(expectedRequestBody.context.params, 'previous_values', {
          organization_id: CONST.FABRIK_INTERNAL_MONGO_DB.ORG_ID,
          space_id: CONST.FABRIK_INTERNAL_MONGO_DB.SPACE_ID,
          plan_id: config.mongodb.provision.plan_id
        });
        expectedRequestBody.context.params = _.chain(expectedRequestBody.context.params)
          .omit('space_guid')
          .omit('organization_guid')
          .value();
        expectedRequestBody.phase = CONST.SERVICE_LIFE_CYCLE.PRE_UPDATE;
        mocks.deploymentHookClient.executeDeploymentActions(200, expectedRequestBody);
        mocks.director.getDeployment(config.mongodb.deployment_name, true);
        mocks.director.getDeployment(config.mongodb.deployment_name, true);
        mocks.director.createOrUpdateDeployment('777');
        mocks.director.getDeploymentTask('777', 'done');
        config.directors[0].default_task_poll_interval = 10;
        mocks.director.getDeploymentInstances(config.mongodb.deployment_name);
        mocks.agent.getInfo();
        mocks.agent.preUpdate();
        return chai
          .request(app)
          .put(`${base_url}/service-fabrik/db`)
          .set('Accept', 'application/json')
          .auth(config.username, config.password)
          .catch(err => err.response)
          .then(res => {
            clock.tick(config.directors[0].default_task_poll_interval);
            expect(res.body.status).to.be.oneOf(['CREATE_UPDATE_IN_PROGRESS', 'DISCONNECTED']);
            expect(res.body.url).to.be.oneOf([mocks.agent.credentials.uri, '']);
            clock.restore();
            // If test case is run in isolation then URI will be blank initially.
            // However if the test suite is run, then create operation sets the URI which will be returned as part of update.
            expect(res).to.have.status(202);
            setTimeout(() => {
              mocks.verify();
              done();
            }, WAIT_TIME_FOR_ASYNCH_CREATE_DEPLOYMENT_OPERATION);
          });
      });
    });

  });
});
