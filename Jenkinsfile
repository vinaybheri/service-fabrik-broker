@Library(['piper-lib', 'piper-lib-os']) _

pipeline {
    environment {
        imageTag = "kaniko"
        WHITESOURCE_ORG_TOKEN = credentials('whitesource_org_token')
    }
    agent any
    stages {
        stage('Setup') {
            steps {
                echo "[INFO] : imageTag: ${imageTag}"
                echo "[INFO] : WHITESOURCE_ORG_TOKEN: ${WHITESOURCE_ORG_TOKEN}"
                deleteDir()
                git url: 'https://github.com/vinaybheri/service-fabrik-broker', branch: 'master', credentialsId: 'GithubOsCredentialsId'
                setupPipelineEnvironment script: this
                sh 'rm -rfv broker/applications/admin'
                sh 'rm -rfv broker/applications/deployment_hooks'
                sh 'rm -rfv broker/applications/extensions'
                sh 'rm -rfv broker/applications/operators'
                sh 'rm -rfv broker/applications/reports'
                sh 'rm -rfv broker/applications/scheduler'
                sh 'rm -rfv webhooks'
            }
        }
        /*stage('DockerBuild') {
            parallel {
                stage('Build Broker Image') {
                    steps {
                        kanikoExecute(script: this,
                            dockerConfigJsonCredentialsId: 'K8sbksrvdockerConfigJsonCredentialsId',
                            containerImage: "${ARTIFACT_DOCKER_HOST_URL}/servicefabrikjenkins/service-fabrik-broker:${imageTag}",
                            dockerfilePath: 'broker/Dockerfile',
                            customTlsCertificateLinks: ["${CUSTOM_TLS_CERT_1}", "${CUSTOM_TLS_CERT_2}"])
                        kanikoExecute(script: this,
                            dockerConfigJsonCredentialsId: 'DockerHubCredentialsId',
                            containerImage: "docker.io/servicefabrikjenkins/service-fabrik-broker:${imageTag}",
                            dockerfilePath: 'broker/Dockerfile')
                    }
                }
                stage('Build Interoperator Image') {
                    steps {
                        kanikoExecute(script: this,
                            dockerConfigJsonCredentialsId: 'K8sbksrvdockerConfigJsonCredentialsId',
                            containerImage: "${ARTIFACT_DOCKER_HOST_URL}/servicefabrikjenkins/service-fabrik-interoperator:${imageTag}",
                            dockerfilePath: 'interoperator/Dockerfile',
                            customTlsCertificateLinks: ["${CUSTOM_TLS_CERT_1}", "${CUSTOM_TLS_CERT_2}"])
                        kanikoExecute(script: this,
                            dockerConfigJsonCredentialsId: 'DockerHubCredentialsId',
                            containerImage: "docker.io/servicefabrikjenkins/service-fabrik-interoperator:${imageTag}",
                            dockerfilePath: 'interoperator/Dockerfile')
                    }
                }
            }
        }*/

        stage('Security scans') {
            parallel {
                /*stage('ProtecodeScan - Broker') {
                    steps {
                        protecodeExecuteScan(script: this,
                            protecodeCredentialsId: 'protecodeCredentialsId',
                            protecodeGroup: '1168',
                            protecodeServerUrl: "${PROTECODE_SERVER_URL}",
                            dockerRegistryUrl: "https://${ARTIFACT_DOCKER_HOST_URL}",
                            dockerImage: "servicefabrikjenkins/service-fabrik-broker:${imageTag}",
                            dockerCredentialsId: 'K8sbksrvdockerConfigJsonCredentialsId',
                            reportFileName: 'protecode_report_broker.pdf')
                    }
                }
                stage('ProtecodeScan - Interoperator') {
                    steps {
                        protecodeExecuteScan(script: this,
                            protecodeCredentialsId: 'protecodeCredentialsId',
                            protecodeGroup: '1168',
                            protecodeServerUrl: "${PROTECODE_SERVER_URL}",
                            dockerRegistryUrl: "https://${ARTIFACT_DOCKER_HOST_URL}",
                            dockerImage: "servicefabrikjenkins/service-fabrik-interoperator:${imageTag}",
                            dockerCredentialsId: 'K8sbksrvdockerConfigJsonCredentialsId',
                            reportFileName: 'protecode_report_interoperator.pdf')
                    }
                }*/

                stage('WhitesourceScan - Broker') {
                    steps {
                        whitesourceExecuteScan(script: this,
                            scanType: 'npm',
                            productName: 'SHC - SF-INTEROPERATOR-TEST',
                            //whitesource/productToken: "${WHITESOURCE_PRODUCT_TOKEN}",
                            userTokenCredentialsId: 'interoperator_whitesource_test_id',
                            //configFilePath: './wss-unified-agent.config',
                            //buildDescriptorFile: './broker/applications/osb-broker/package.json',
                            configFilePath: './applications/osb-broker/wss-unified-agent.config',
                            buildDescriptorFile: './broker/package.json',
                            securityVulnerabilities: false,
                            orgToken: "${WHITESOURCE_ORG_TOKEN}")
                    }
                }
                /*stage('WhitesourceScan - Interoperator') {
                    steps {
                        whitesourceExecuteScan(script: this,
                            scanType: 'golang',
                            productName: 'SHC - SF-INTEROPERATOR-TEST',
                            //whitesource/productToken: "${WHITESOURCE_PRODUCT_TOKEN}",
                            userTokenCredentialsId: 'interoperator_whitesource_test_id',
                            configFilePath: './wss-unified-agent.config',
                            buildDescriptorFile: './interoperator/go.mod',
                            securityVulnerabilities: false,
                            orgToken: "${WHITESOURCE_ORG_TOKEN}")
                    }
                }*/
            }
        }
    }
}