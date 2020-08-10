@Library(['piper-lib', 'piper-lib-os']) _

pipeline {
    environment {
        WHITESOURCE_ORG_TOKEN = credentials('whitesource_org_token')
        GITHUB_OS_TOKEN = credentials('GithubOsToken')
        ENV_IMAGE_TAG = "${env.IMAGE_TAG}"
        GITHUB_OS_ORG = "vinaybheri"
    }
    agent any
    parameters {
        string(defaultValue: 'test', description: 'Enter Docker image tag version', name: 'IMAGE_TAG')
        booleanParam(defaultValue: false, description: 'Enable for final release', name: 'RELEASE')
    }
    stages {
        stage('Setup') {
            steps {
                deleteDir()
                git url: 'https://github.com/${GITHUB_OS_ORG}/service-fabrik-broker', branch: 'master', credentialsId: 'GithubOsCredentialsId'
                setupPipelineEnvironment script: this
                sh 'rm -rf broker/applications/admin'
                sh 'rm -rf broker/applications/deployment_hooks'
                sh 'rm -rf broker/applications/extensions'
                sh 'rm -rf broker/applications/operators'
                sh 'rm -rf broker/applications/reports'
                sh 'rm -rf broker/applications/scheduler'
                sh 'rm -rf broker/test'
                sh 'rm -rf webhooks'
            }
        }
        stage('DockerBuild') {
            parallel {
                stage('Build Broker Image') {
                    steps {
                        kanikoExecute(script: this,
                            dockerConfigJsonCredentialsId: 'InteroperatorDockerAuthConfigJson',
                            containerImage: "${ARTIFACT_DOCKER_HOST_URL}/images/service-fabrik-broker:${env.IMAGE_TAG}",
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
                            dockerConfigJsonCredentialsId: 'InteroperatorDockerAuthConfigJson',
                            containerImage: "${ARTIFACT_DOCKER_HOST_URL}/images/service-fabrik-interoperator:${env.IMAGE_TAG}",
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
                            protecodeGroup: "${INTOPERATOR_PROTECODE_GROUP_ID}",
                            protecodeServerUrl: "${PROTECODE_SERVER_URL}",
                            dockerRegistryUrl: "https://${ARTIFACT_DOCKER_HOST_URL}",
                            dockerImage: "images/service-fabrik-broker:${env.IMAGE_TAG}",
                            dockerCredentialsId: 'InteroperatorDockerAuthConfigJson',
                            reportFileName: 'protecode_report_broker.pdf')
                    }
                }
                stage('ProtecodeScan - Interoperator') {
                    steps {
                        protecodeExecuteScan(script: this,
                            protecodeCredentialsId: 'protecodeCredentialsId',
                            protecodeGroup: "${INTOPERATOR_PROTECODE_GROUP_ID}",
                            protecodeServerUrl: "${PROTECODE_SERVER_URL}",
                            dockerRegistryUrl: "https://${ARTIFACT_DOCKER_HOST_URL}",
                            dockerImage: "images/service-fabrik-interoperator:${env.IMAGE_TAG}",
                            dockerCredentialsId: 'InteroperatorDockerAuthConfigJson',
                            reportFileName: 'protecode_report_interoperator.pdf')
                    }
                }

                stage('WhitesourceScan - Broker') {
                    steps {
                        sh 'rm -rfv broker/package.json'
                        whitesourceExecuteScan(script: this,
                            scanType: 'npm',
                            productName: "${WSS_PROD_NAME}",
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
                            userTokenCredentialsId: 'interoperator_whitesource_test_id',
                            configFilePath: './wss-unified-agent.config',
                            buildDescriptorFile: './interoperator/go.mod',
                            securityVulnerabilities: false,
                            orgToken: "${WHITESOURCE_ORG_TOKEN}")
                    }
                }
            }
        }
        
        stage('Release') {
            when {
                environment name: 'RELEASE', value: 'true'
            }
            stages {
                stage('Release - Update Version') {
                    steps {
                        script {
                            def data = readYaml file: 'helm-charts/interoperator/Chart.yaml'
                            sh """sed -i 's/${data.appVersion}/${ENV_IMAGE_TAG}/g' helm-charts/interoperator/Chart.yaml"""
                            sh """sed -i 's/${data.appVersion}/${ENV_IMAGE_TAG}/g' helm-charts/interoperator/values.yaml"""
                            sh '''
                            git checkout -b dev_pr
                            git diff
                            git add helm-charts/interoperator/Chart.yaml
                            git add helm-charts/interoperator/values.yaml
                            git commit -m "Updating Helm chart and docker image versions"
                            git push https://${GITHUB_OS_TOKEN}@github.com/${GITHUB_OS_ORG}/service-fabrik-broker dev_pr              
                            pull_request_data="$(cat << EOF
{
  "title": "Updating docker Version",
  "base": "master",
  "head": "vinaybheri:dev_pr",
  "body": "Updating new docker versions"
}
EOF
)"
                            curl -H "Authorization: token ${GITHUB_OS_TOKEN}" -X POST -d "${pull_request_data}" "https://api.github.com/repos/${GITHUB_OS_ORG}/service-fabrik-broker/pulls"
                        '''
                        }
                    }
                } //End Stage: Release - Update Version
                
                stage('Release - Add Helm Chart') {
                    steps {
                        script {
                            sh '''
                            helm_version="v3.2.4"
                            echo "Installing Helm :$helm_version"
                            os_arch="linux"
                            curl --silent -LO "https://get.helm.sh/helm-${helm_version}-${os_arch}-amd64.tar.gz"
                            tar -zxf "helm-${helm_version}-${os_arch}-amd64.tar.gz"
                            PATH="$PATH:$PWD/${os_arch}-amd64"
                            export PATH
                    
                            helm version
                    
                            echo "Creating Helm Package"
                            oldpath=$PWD
                            cd helm-charts/interoperator
                            helm package . || true
                            ls -l
                            echo "help package created"
                    
                            cd $oldpath
                            rm -rf gh-pages
                            git clone "https://${GITHUB_OS_TOKEN}@github.com/vinaybheri/service-fabrik-broker" -b "gh-pages" "gh-pages"
                            echo "copying Helm package"
                            cp helm-charts/interoperator/interoperator-${ENV_IMAGE_TAG}.tgz gh-pages/helm-charts/
                            echo "copying Done"
                            helm repo index --url https://cloudfoundry-incubator.github.io/service-fabrik-broker/helm-charts "gh-pages/helm-charts/"
                            cd gh-pages
                            git diff
                            git checkout -b dev_pr_gh-pages
                            git add helm-charts/interoperator-${ENV_IMAGE_TAG}.tgz
                            git commit -m "Adding Helm Chart Package: interoperator-${ENV_IMAGE_TAG}.tgz"
                            git push https://${GITHUB_OS_TOKEN}@github.com/${GITHUB_OS_ORG}/service-fabrik-broker dev_pr_gh-pages
                    
                            pull_request_data="$(cat << EOF
{
  "title": "Adding Helm Chart package: interoperator-${ENV_IMAGE_TAG}.tgz",
  "base": "gh-pages",
  "head": "${GITHUB_OS_ORG}:dev_pr_gh-pages",
  "body": "Adding New Helm Chart package"
}
EOF
)"
                            curl -H "Authorization: token ${GITHUB_OS_TOKEN}" -X POST -d "${pull_request_data}" "https://api.github.com/repos/${GITHUB_OS_ORG}/service-fabrik-broker/pulls"
                            '''     
                        } 
                    } 
                }// End Stage: Release - Add Helm Chart
            }
        } //End Stage: Release
    }
}
