# About

Tarot as a Service backend API

# Description

[Taas App](https://taas-tarot.netlify.app/) is an AI text generator powered tarot reading platform.

# Technologies

- TypeScript
- Node
- Express
- Docker
- MongoDB
- Redis
- Supertest
- JWT

# Run Locally

This Express APP is dockerized. To get up and running:

1. Create a `.env` file and fill in the vars from `.env.example`.
2. In the root foder install dependencies: `yarn install`
3. Make sure you have Docker Engine installed and run the following in the root directory:
   `docker compose up`

This will set up a Node app for the API, a MONGO DB instance, and a Redis instance.

# Tests

Tests run on a dockerized test environment separate from development.

1. To run the test environment spin up the `docker-compose.test.yaml` containers running:

`docker compose -f docker-compose.test.yml up`

2. Go into the test app container shell
   `docker exec -ti <test_node_app_container_name> bash`

For example: `docker exec -ti taas-api-test-taas-1 bash`

3. Run tests inside container
   `yarn test`

All tests are inside the `src/tests` directory.

Integration => Api endpoints and useCase function test with supertest library
Unit => Testing individual gateway functions for CRUD operations

### Supertest notes

- Supertest route tests don't need the docker environment set up, as supertest establishes the database connections and app independently.
- Supertest is like a client based http request tool (ex: axios) but for api testing.

# Deployment

This backend is hosted on FlyIO
`flyctl deploy -a taas-backend`

## Useful Fly IO commands:

`flyctl logs -a taas-backend`

### Organizations

`flyctl launch -o <organization_name>` => To launch an app on a specific organization

# Architecture

The app follows an MVC model, with 4 main independent layers:

- Routes: API endpoints
- Use Cases: Functions with business logic
- Gateways: Layer that interacts with the database. All CRUD methods go here.
- Entity: DB Models. No methods here, just Mongo schemas.

Other directories:

- Helpers: Helper functions that combine different methods to simplify a task and can have side effects. For example: email sending, get files from S3.
- Utility: Pure functions that do one task, like data mappers, formatters, calculation, date handling, calculations.
