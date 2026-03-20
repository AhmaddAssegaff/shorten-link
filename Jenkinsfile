pipeline {
    agent any 

    stages {
        stage('Test') {
            agent {
                docker {
                    image 'node:22-alpine'
                    args '-u root' 
                }
            }
            steps {
                sh '''
                corepack enable
                pnpm install --frozen-lockfile
                pnpm test
                '''
            }
        }

        stage('Build & Deploy') {
            steps {
                sh 'docker compose up -d --build'
            }
        }

    }
}
