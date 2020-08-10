@Library(['piper-lib', 'piper-lib-os']) _

pipeline {    
    environment {
        WHITESOURCE_ORG_TOKEN = credentials('whitesource_org_token')
        GITHUB_OS_TOKEN = credentials('GithubOsToken')
        GITHUB_WDF_TOKEN = credentials('GithubWdfTokenId')
        ENV_IMAGE_TAG = "${env.IMAGE_TAG}"
        GITHUB_OS_ORG = "vinaybheri"
        GIT_URL_SF_CREDENTIALS = "https://${GITHUB_WDF_TOKEN}@${GITHUB_WDF_HOST}/servicefabrik/credentials.git"
        GIT_URL_SF_BROKER = "https://${GITHUB_OS_TOKEN}@github.com/${GITHUB_OS_ORG}/service-fabrik-broker.git"
        
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
                echo "GIT_BRANCH: $GIT_BRANCH"
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
                        
                        if git tag -l | grep "$ENV_IMAGE_TAG" 
                        then
                            git tag -d
                            git push ${GIT_URL_SF_BROKER} --tags
                        fi
                        
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
                        commit_list="$(git log --pretty=format:"%h: %s\\n" HEAD...${last_tag_version})"

echo """
## New features/Bug fixes\\n
${commit_list}\\n
\\n
## Supported K8S Version\\n
- $(echo "${K8S_VERSION_N_2}" | awk -F "." '{print $1"."$2".x"}')\\n
- $(echo "${K8S_VERSION_N_1}" | awk -F "." '{print $1"."$2".x"}')\\n
- $(echo "${K8S_VERSION_N}" | awk -F "." '{print $1"."$2".x"}')\\n
## How to deploy Interoperator\\n
Interoperator requires **helm version >= 3.0.0**, and is **not supported by helm 2**.\\n
\\n
To add service fabrik interoperator helm chart repo\\n
\\`\\`\\`shell\\n
helm repo add interoperator-charts https://cloudfoundry-incubator.github.io/service-fabrik-broker/helm-charts\\n
helm repo update\\n
\\`\\`\\`\\n
\\n
Deploy SF Interoperator using helm\\n
\\`\\`\\`shell\\n
helm install --set cluster.host=sf.ingress.< clusterdomain > --namespace interoperator --version ${ENV_IMAGE_TAG} interoperator interoperator-charts/interoperator\\n
\\`\\`\\`\\n
**NOTE:** \\`cluster.host\\` should be within the [63 character limit](http://man7.org/linux/man-pages/man7/hostname.7.html).\\n
### Deploy SFClusters, SFServices and SFPlans and Register with Interoperator\\n
Please create sfcluster CRs and add reference to secret which contains the its kubeconfig.\\n
For multi-cluster support, all corresponding sfcluster CRs need to be created and their kubeconfig needs to be supplied in the corresponding secret.\\n
Please note that sfcluster, sfservice and sfplans need to be deployed in the same namespace where SF is deployed (default is \\`interoperator\\`).\\n
## Upgrade from the earlier releases(special handling, downtime if any)\\n
\\n
To add service fabrik interoperator helm chart repo if not already added\\n
\\`\\`\\`shell\\n
# Assuming the repo name is chosen as interoperator-charts \\n
helm repo add interoperator-charts https://cloudfoundry-incubator.github.io/service-fabrik-broker/helm-charts\\n
helm repo update\\n
\\`\\`\\`\\n
Helm upgrade should take care of upgrading to the latest release.\\n
\\`\\`\\`shell\\n
# Assuming current helm release name is interoperator\\n
helm --namespace interoperator upgrade -i --force --wait --set cluster.host=sf.ingress.< clusterdomain > --version ${ENV_IMAGE_TAG} interoperator interoperator-charts/interoperator\\n
\\`\\`\\`\\n
Refer detailed [upgrade docs](docs/interoperator-upgrades.md) for more info.\\n
\\n
\\n
""" > .release_notes

text="$(cat .release_notes | tr -d '\n' | tr -d '"')"

generate_post_data()
{
  cat <<EOF
{
  "tag_name": "${ENV_IMAGE_TAG}",
  "target_commitish": "$GIT_BRANCH",
  "name": "${ENV_IMAGE_TAG}",
  "body": "$text",
  "draft": false,
  "prerelease": false
}
EOF
}
generate_post_data
                       repo_full_name="${GITHUB_OS_ORG}/service-fabrik-broker"
echo "Create release $ENV_IMAGE_TAG for $repo_full_name :  branch: $GIT_BRANCH"
curl --data "$(generate_post_data)" "https://api.github.com/repos/$repo_full_name/releases?access_token=$GITHUB_OS_TOKEN"

'''
                        
                        
//cat .release_notes | sed 's/$/\\n/' | tr -d '\n'

                        
/*

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
\\`\\`\\`shell
helm repo add interoperator-charts https://cloudfoundry-incubator.github.io/service-fabrik-broker/helm-charts
helm repo update
\\`\\`\\`

Deploy SF Interoperator using helm
\\`\\`\\`shell
helm install --set cluster.host=sf.ingress.< clusterdomain > --namespace interoperator --version ${new_tag_version} interoperator interoperator-charts/interoperator
\\`\\`\\`
**NOTE:** \\`cluster.host\\` should be within the [63 character limit](http://man7.org/linux/man-pages/man7/hostname.7.html).
### Deploy SFClusters, SFServices and SFPlans and Register with Interoperator
Please create sfcluster CRs and add reference to secret which contains the its kubeconfig.
For multi-cluster support, all corresponding sfcluster CRs need to be created and their kubeconfig needs to be supplied in the corresponding secret.
Please note that sfcluster, sfservice and sfplans need to be deployed in the same namespace where SF is deployed (default is \\`interoperator\\`).
## Upgrade from the earlier releases(special handling, downtime if any)

To add service fabrik interoperator helm chart repo if not already added
\\`\\`\\`shell
# Assuming the repo name is chosen as interoperator-charts 
helm repo add interoperator-charts https://cloudfoundry-incubator.github.io/service-fabrik-broker/helm-charts
helm repo update
\\`\\`\\`
Helm upgrade should take care of upgrading to the latest release.
\\`\\`\\`shell
# Assuming current helm release name is interoperator
helm --namespace interoperator upgrade -i --force --wait --set cluster.host=sf.ingress.< clusterdomain > --version ${new_tag_version} interoperator interoperator-charts/interoperator
\\`\\`\\`
Refer detailed [upgrade docs](docs/interoperator-upgrades.md) for more info.


"""
sh """
generate_post_data()
{
  cat <<EOF
{
  "tag_name": "${ENV_IMAGE_TAG}",
  "target_commitish": "$GIT_BRANCH",
  "name": "${ENV_IMAGE_TAG}",
  "body": "$(cat .release_notes | sed 's/$/\n/')",
  "draft": false,
  "prerelease": false
}
EOF
}
generate_post_data
                       repo_full_name="${GITHUB_OS_ORG}/service-fabrik-broker"
#echo "Create release $ENV_IMAGE_TAG for $repo_full_name :  branch: $GIT_BRANCH"
#curl --data "$(generate_post_data)" "https://api.github.com/repos/$repo_full_name/releases?access_token=$GITHUB_OS_TOKEN"       
                        """*/
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
