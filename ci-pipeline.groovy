pipeline {
  agent any

  tools {
    nodejs 'nodejs-lts'
  }

  environment {
    branch = 'master'
    scmUrl = 'https://code.dev.sbb.berlin/HSP/prototypes/mirador-ruler.git'
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
        echo 'run tests ...'
      }
    }
  }
}