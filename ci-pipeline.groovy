pipeline {
  agent any

  tools {
    nodejs 'nodejs-lts'
  }

  environment {
    branch = 'master'
    scmUrl = 'https://code.dev.sbb.berlin/HSP/indexupdateservice.git'
  }

  stages {
    stage('Git checkout') {
      steps {
        git branch: branch, credentialsId: 'Jenkins-GitLab', url: scmUrl
      }
    }

    stage('Prerequisites') {
      steps {
        sh 'npm install'
      }
    }

    stage('Test') {
      steps {
      // run cypress tests
      }
    }
  }
}