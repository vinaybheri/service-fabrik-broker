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
                    //def CURRENT_CHART_VERSION = ${datas.appVersion}
                    echo "[TEST_INFO] : Got version as ${datas.appVersion} "
                    //echo "[TEST_INFO] : CURRENT_CHART_VERSION: ${CURRENT_CHART_VERSION}"
                    echo "Updating chart.yaml file"
                    sh """sed -i 's/${datas.appVersion}/${env.IMAGE_TAG}/g' helm-charts/interoperator/Chart.yaml"""
                    sh 'cat helm-charts/interoperator/Chart.yaml'
                    //sh "LINE_NO_SF_BROKER_DOCKER_IMAGE_VERSION="$(cat -n "helm-charts/interoperator/values.yaml" | awk '/broker:$/,/tag/ { print }' | grep -E "tag" | awk '{print $1}')""
                   // echo "LINE_NO_SF_BROKER_DOCKER_IMAGE_VERSION: $LINE_NO_SF_BROKER_DOCKER_IMAGE_VERSION"
                 }   
            }
        }
    
    }
}
