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
        git branch: branch, credentialsId: '116b9191-eb90-4da0-8456-fe196f12c4bc', url: scmUrl
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