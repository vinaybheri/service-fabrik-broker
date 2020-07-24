@Library(['piper-lib', 'piper-lib-os']) _

pipeline {    
    environment {
        WHITESOURCE_ORG_TOKEN = credentials('whitesource_org_token')
        GITHUB_OS_TOKEN = credentials('GithubOsToken')
    }
    agent any
    
    parameters {
        string(defaultValue: 'test', description: 'Enter Docker image tag version', name: 'IMAGE_TAG')
        booleanParam(defaultValue: false, description: 'Enable for final release', name: 'RELEASE')
    }
    stages {
        stage('Setup') {
   
            steps {
                echo "[TEST_INFO] : setup"
                /*script {
                    def datas = readYaml file: 'helm-charts/interoperator/Chart.yaml'
                    //def CURRENT_CHART_VERSION = ${datas.appVersion}
                    echo "[TEST_INFO] : Got version as ${datas.appVersion} "
                    //echo "[TEST_INFO] : CURRENT_CHART_VERSION: ${CURRENT_CHART_VERSION}"
                }
                deleteDir()
                git url: 'https://github.com/vinaybheri/service-fabrik-broker', branch: 'test', credentialsId: 'GithubOsCredentialsId'
                //setupPipelineEnvironment script: this
                sh 'rm -rf broker/applications/admin'
                sh 'rm -rf broker/applications/deployment_hooks'
                sh 'rm -rf broker/applications/extensions'
                sh 'rm -rf broker/applications/operators'
                sh 'rm -rf broker/applications/reports'
                sh 'rm -rf broker/applications/scheduler'
                sh 'rm -rf broker/test'
                sh 'rm -rf webhooks'*/
            }
        }
        stage('Release') {
            
            when {
                environment name: 'RELEASE', value: 'true'
            }   
            steps {
                echo "Stage: Release"
                script {
                    def datas = readYaml file: 'helm-charts/interoperator/Chart.yaml'
                    //def CURRENT_CHART_VERSION = ${datas.appVersion}
                    echo "[TEST_INFO] : Got version as ${datas.appVersion} "
                    //echo "[TEST_INFO] : CURRENT_CHART_VERSION: ${CURRENT_CHART_VERSION}"
                    echo "Updating chart.yaml file"
                    sh """sed -i 's/${datas.appVersion}/${env.IMAGE_TAG}/g' helm-charts/interoperator/Chart.yaml"""
                    sh 'cat helm-charts/interoperator/Chart.yaml'
                    sh """
                        LINE_NO_SF_BROKER_DOCKER_IMAGE_VERSION="$(cat -n helm-charts/interoperator/values.yaml | awk '/broker:\$/,/tag/ { print }' | grep -E "tag" | awk '{print $1}')"
                        sed -r -i '${LINE_NO_SF_BROKER_DOCKER_IMAGE_VERSION}s/tag.*/tag: ${env.IMAGE_TAG}/1' helm-charts/interoperator/values.yaml
                    """
                    sh 'git diff'
                 }   
            }
        }
        /*stage('DockerBuild') {
            parallel {
                stage('Build Broker Image') {
                    steps {
                        kanikoExecute(script: this,
                            dockerConfigJsonCredentialsId: 'K8sbksrvdockerConfigJsonCredentialsId',
                            containerImage: "${ARTIFACT_DOCKER_HOST_URL}/servicefabrikjenkins/service-fabrik-broker:${env.IMAGE_TAG}",
                            dockerfilePath: 'broker/Dockerfile',
                            customTlsCertificateLinks: ["${CUSTOM_TLS_CERT_1}", "${CUSTOM_TLS_CERT_2}"])
                        kanikoExecute(script: this,
                            dockerConfigJsonCredentialsId: 'DockerHubCredentialsId',
                            containerImage: "docker.io/servicefabrikjenkins/service-fabrik-broker:${env.IMAGE_TAG}",
                            dockerfilePath: 'broker/Dockerfile')
                    }
                }
                stage('Build Interoperator Image') {
                    steps {
                        kanikoExecute(script: this,
                            dockerConfigJsonCredentialsId: 'K8sbksrvdockerConfigJsonCredentialsId',
                            containerImage: "${ARTIFACT_DOCKER_HOST_URL}/servicefabrikjenkins/service-fabrik-interoperator:${env.IMAGE_TAG}",
                            dockerfilePath: 'interoperator/Dockerfile',
                            customTlsCertificateLinks: ["${CUSTOM_TLS_CERT_1}", "${CUSTOM_TLS_CERT_2}"])
                        kanikoExecute(script: this,
                            dockerConfigJsonCredentialsId: 'DockerHubCredentialsId',
                            containerImage: "docker.io/servicefabrikjenkins/service-fabrik-interoperator:${env.IMAGE_TAG}",
                            dockerfilePath: 'interoperator/Dockerfile')
                    }
                }
            }
        }

        stage('Security scans') {
            parallel {
                stage('ProtecodeScan - Broker') {
                    steps {
                        protecodeExecuteScan(script: this,
                            protecodeCredentialsId: 'protecodeCredentialsId',
                            protecodeGroup: '1168',
                            protecodeServerUrl: "${PROTECODE_SERVER_URL}",
                            dockerRegistryUrl: "https://${ARTIFACT_DOCKER_HOST_URL}",
                            dockerImage: "servicefabrikjenkins/service-fabrik-broker:${env.IMAGE_TAG}",
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
                            dockerImage: "servicefabrikjenkins/service-fabrik-interoperator:${env.IMAGE_TAG}",
                            dockerCredentialsId: 'K8sbksrvdockerConfigJsonCredentialsId',
                            reportFileName: 'protecode_report_interoperator.pdf')
                    }
                }

                stage('WhitesourceScan - Broker') {
                    steps {
                        sh 'rm -rfv broker/package.json'
                        whitesourceExecuteScan(script: this,
                            scanType: 'npm',
                            productName: "${WSS_PROD_NAME}",
                            //whitesource/productToken: "${WHITESOURCE_PRODUCT_TOKEN}",
                            userTokenCredentialsId: 'interoperator_whitesource_test_id',
                            configFilePath: './wss-unified-agent.config',
                            buildDescriptorFile: './broker/applications/osb-broker/package.json',
                            securityVulnerabilities: false,
                            orgToken: "${WHITESOURCE_ORG_TOKEN}")
                    }
                }
                stage('WhitesourceScan - Interoperator') {
                    steps {
                        whitesourceExecuteScan(script: this,
                            scanType: 'golang',
                            productName: "${WSS_PROD_NAME}",
                            //whitesource/productToken: "${WHITESOURCE_PRODUCT_TOKEN}",
                            userTokenCredentialsId: 'interoperator_whitesource_test_id',
                            configFilePath: './wss-unified-agent.config',
                            buildDescriptorFile: './interoperator/go.mod',
                            securityVulnerabilities: false,
                            orgToken: "${WHITESOURCE_ORG_TOKEN}")
                    }
                }
            }
        }*/
    }
}
