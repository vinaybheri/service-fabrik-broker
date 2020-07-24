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
                    sh """sed -i 's/${datas.appVersion}/${env.IMAGE_TAG}/g' helm-charts/interoperator/Chart.yaml"""
                    sh """sed -i 's/${datas.appVersion}/${env.IMAGE_TAG}/g' helm-charts/interoperator/values.yaml"""
                    sh 'git diff'
                    sh '''
                    helm_version="v2.16.1"
                    os_arch="linux"
                    curl --silent -LO "https://storage.googleapis.com/kubernetes-helm/helm-${helm_version}-${os_arch}-amd64.tar.gz"
                    tar -zxf "helm-${helm_version}-${os_arch}-amd64.tar.gz"
                    PATH="$PATH:$PWD/${os_arch}-amd64"
                    export PATH
                    echo PATH:$PATH
                    helm
                    '''
                 }   
            }
        }
    
    }
}
