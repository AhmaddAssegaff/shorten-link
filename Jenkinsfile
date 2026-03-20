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
                dir('be') {
                    sh '''
                    corepack enable
                    pnpm install --frozen-lockfile
                    pnpm test
                    '''
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                dir('be') {
                    withCredentials([file(credentialsId: 'shorten-link-env', variable: 'SECRET_FILE')]) {
                        sh """
                            cp \$SECRET_FILE .env
                            docker compose up -d --build
                        """
                    }
                }
            }
        }
    }
}
