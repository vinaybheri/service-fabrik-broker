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
                git url: 'https://github.com/vinaybheri/service-fabrik-broker', branch: 'master', credentialsId: 'GithubOsCredentialsId'
                setupPipelineEnvironment script: this
                echo "[TEST_INFO] : setup"
                echo "PWD: $PWD"
                sh 'ls $WORKSPACE'
                sh 'echo "[TEST_INFO] : env tag : ${ENV_IMAGE_TAG}"'
            }
        }
        stage('Release') {
            when {
                environment name: 'RELEASE', value: 'true'
            }   
            stages {
            stage('Release - continue'){

                input{ 
                     message "Press Ok to continue"  
                }
                steps {
                 echo "proceeding"   
                }
            }
                    
            stage('Release - Update Version') {
              steps {
                echo "Stage: Release"
     
                script {
                    def datas = readYaml file: 'helm-charts/interoperator/Chart.yaml'
                    sh """sed -i 's/${datas.appVersion}/${ENV_IMAGE_TAG}/g' helm-charts/interoperator/Chart.yaml"""
                    sh """sed -i 's/${datas.appVersion}/${ENV_IMAGE_TAG}/g' helm-charts/interoperator/values.yaml"""
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
                    echo "pull_request_data: $pull_request_data"
                    
                    curl -H "Authorization: token ${GITHUB_OS_TOKEN}" -X POST -d "${pull_request_data}" "https://api.github.com/repos/${GITHUB_OS_ORG}/service-fabrik-broker/pulls"
                    
                    '''
                }
              }
            }
            stage('Release - Update gh-pages') {
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
                    echo PATH:$PATH
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
                    ls
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
                    echo "pull_request_data: $pull_request_data"
                    
                    curl -H "Authorization: token ${GITHUB_OS_TOKEN}" -X POST -d "${pull_request_data}" "https://api.github.com/repos/${GITHUB_OS_ORG}/service-fabrik-broker/pulls"
                    
                    
                    '''
                         
                         
                 }   
            }
      }
        }
        }
    
    }
}
