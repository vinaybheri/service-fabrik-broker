@Library(['piper-lib', 'piper-lib-os']) _

pipeline {    
    environment {
        WHITESOURCE_ORG_TOKEN = credentials('whitesource_org_token')
        GITHUB_OS_TOKEN = credentials('GithubOsToken')
        ENV_IMAGE_TAG = "${env.IMAGE_TAG}"
        
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
                sh 'echo "[TEST_INFO] : env tag : ${NEXT_VERSION}"'
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
                    echo "[TEST_INFO] : Got version as ${datas.appVersion} "
                    echo "Updating chart.yaml file"
                    
                   
                   // sh """sed -i 's/${datas.appVersion}/${env.IMAGE_TAG}/g' helm-charts/interoperator/Chart.yaml"""
                   // sh """sed -i 's/${datas.appVersion}/${env.IMAGE_TAG}/g' helm-charts/interoperator/values.yaml"""
                    sh '''
                    echo "Updating Chart.yaml"
                    sed -i 's/${datas.appVersion}/${ENV_IMAGE_TAG}/g' helm-charts/interoperator/Chart.yaml
                    echo "Updating values.yaml"
                    sed -i 's/${datas.appVersion}/${ENV_IMAGE_TAG}/g' helm-charts/interoperator/values.yaml
                    git diff
                    git add helm-charts/interoperator/Chart.yaml
                    git add helm-charts/interoperator/values.yaml
                    git commit -m "Updating Helm chart and docker image versions"
                    '''
                  /*  sh '''
                    helm_version="v3.2.4"
                    os_arch="linux"
                    curl --silent -LO "https://get.helm.sh/helm-${helm_version}-${os_arch}-amd64.tar.gz"
                    echo 3
                    tar -zxf "helm-${helm_version}-${os_arch}-amd64.tar.gz"
                    PATH="$PATH:$PWD/${os_arch}-amd64"
                    export PATH
                    echo PATH:$PATH
                    helm version
                    oldpath=$PWD
                    cd helm-charts/interoperator
                    helm package . || true
                    ls -l
                    echo "help package created"
                    cd $oldpath
                    rm -rf gh-pages
                    git clone "https://${GITHUB_OS_TOKEN}@github.com/vinaybheri/service-fabrik-broker" -b "gh-pages" "gh-pages"
                    ls
                    echo "copying"
                    cp helm-charts/interoperator/interoperator-${ENV_IMAGE_TAG}.tgz gh-pages/helm-charts/
                    echo "copying Done"
                    helm repo index --url https://cloudfoundry-incubator.github.io/service-fabrik-broker/helm-charts "gh-pages/helm-charts/"
                    cd gh-pages
                    git diff
                    '''*/
                 }   
            }
        }
    
    }
}
