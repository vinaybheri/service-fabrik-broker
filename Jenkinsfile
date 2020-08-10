@Library(['piper-lib', 'piper-lib-os']) _

pipeline {    
    environment {
        WHITESOURCE_ORG_TOKEN = credentials('whitesource_org_token')
        GITHUB_OS_TOKEN = credentials('GithubOsToken')
        GITHUB_WDF_TOKEN = credentials('GithubWdfTokenId')
        ENV_IMAGE_TAG = "${env.IMAGE_TAG}"
        GITHUB_OS_ORG = "vinaybheri"
        GIT_URL_SF_CREDENTIALS = "https://${GITHUB_WDF_TOKEN}@${GITHUB_WDF_HOST}/servicefabrik/credentials.git"
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
                
            stage('Release - Create Tag And Notes') {
                steps {
                    script {
                        sh '''
                        pwd
                        ls -l
                        git tag ${ENV_IMAGE_TAG}
                        echo "installing kubectl"
                        kubectl_version=$(curl --silent https://storage.googleapis.com/kubernetes-release/release/stable.txt)
                        curl --silent -LO "https://storage.googleapis.com/kubernetes-release/release/${kubectl_version}/bin/linux/amd64/kubectl"
                        chmod +x ./kubectl
                        mkdir bin
                        export PATH="$PATH:$PWD/bin"
                        mv ./kubectl bin/
                        kubectl
                        
                        curl https://stedolan.github.io/jq/download/linux64/jq --output bin/jq
                        chmod +x bin/jq
                        
                        git clone "${GIT_URL_SF_CREDENTIALS}" "sfcredentials"
                        export KUBECONFIG="$WORKSPACE/sfcredentials/k8s/n/kubeconfig.yaml"
                        K8S_VERSION_N=$(kubectl version -o json | jq -r '.serverVersion.gitVersion')
                        export KUBECONFIG="$WORKSPACE/sfcredentials/k8s/n-1/kubeconfig.yaml"
                        K8S_VERSION_N_1=$(kubectl version -o json | jq -r '.serverVersion.gitVersion')
                        export KUBECONFIG="$WORKSPACE/sfcredentials/k8s/n-2/kubeconfig.yaml"
                        K8S_VERSION_N_2=$(kubectl version -o json | jq -r '.serverVersion.gitVersion')
                        
                        last_tag_version="$(git tag | grep -E "[0-9]+.[0-9]+.[0-9]+" | grep -v "$ENV_IMAGE_TAG" | tail -1)"
                        commit_list="$(git log --pretty=format:"%h: %s" HEAD...${last_tag_version})"

                        echo """
## New features/Bug fixes
${commit_list}

## Supported K8S Version
- $(echo "${K8S_VERSION_N_2}" | awk -F "." '{print $1"."$2".x"}')
- $(echo "${K8S_VERSION_N_1}" | awk -F "." '{print $1"."$2".x"}')
- $(echo "${K8S_VERSION_N}" | awk -F "." '{print $1"."$2".x"}')
## How to deploy Interoperator
Interoperator requires **helm version >= 3.0.0**, and is **not supported by helm 2**.

To add service fabrik interoperator helm chart repo
```shell
helm repo add interoperator-charts https://cloudfoundry-incubator.github.io/service-fabrik-broker/helm-charts
helm repo update
```

"""

                        '''
                    }
                }
            
            }
         
                    
            /*stage('Release - Update Version') {
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
                    cd helm-charts/interoperator
                    helm package . || true
                    echo "helm package created"
                    
                    cd $WORKSPACE
                    rm -rf gh-pages
                    git clone "https://${GITHUB_OS_TOKEN}@github.com/vinaybheri/service-fabrik-broker" -b "gh-pages" "gh-pages"
                    echo "Copying Helm package"
                    cp helm-charts/interoperator/interoperator-${ENV_IMAGE_TAG}.tgz gh-pages/helm-charts/
                    echo "Copying Done"
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
                    cd "$WORKSPACE"
                    
                    '''
                         
                         
                 }   
            }
      }*/
        }
        }
    
    }
}
