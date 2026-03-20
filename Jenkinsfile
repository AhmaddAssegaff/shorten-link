pipeline {
    agent any

    stages {
        stage('Test') {
            steps {
                sh '''
                docker run --rm \
                  -v $PWD:/app \
                  -w /app \
                  node:22 \
                  bash -c "corepack enable && pnpm install --frozen-lockfile && pnpm test"
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                docker compose up -d --build
                '''
            }
        }
    }
}
