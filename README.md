# About

Tarot as a Service backend service

# Description

[Taas App](https://app.taasmusic.com) is an AI text generator powered tarot reading platform.

# Technologies

- TypeScript
- Node
- Express
- MongoDB
- Redis

# How to Run Locally

This app is dockerized. To get up and running:

1. Create a `.env` file and fill in the data.
2. In the root foder install dependencies: `yarn install`
3. Make sure you have Docker Engine installed and run the following in the root directory:
   `docker compose up`

This will set up a Node app for the API, a PostgreSQL DB, and a Redis instance.

# Architecture notes

The app follows an MVC model, with 4 main independent layers:

- Routes: API endpoints
- Use Cases: Business logic
- Gateways: Layer that interacts with the database. All CRUD TypeORM methods go in here.
- Entity: DB Models. No methods here, just PostgreSQL tables.

Other folders:

- Helpers: Helper functions that combine different methods to simplify a task and can have side effects. For example: email sending, get files from S3.
- Utility: Pure functions that do one task, like data mappers, formatters, calculation, date handling, calculations.

# Testing

# Tests

Tests run on a dockerized test environment separate from development.

1. To run the test environment spin up the `docker-compose.test.yaml` containers running:

`docker compose -f docker-compose.test.yml up`

2. Go into the test app container shell
   `docker exec -ti <test_node_app_container_name> bash`

For example: `docker exec -ti taas-api-test-taas-1 bash`

3. Run tests inside container
   `yarn test`

## Notes

The docker-compose.test.yml file doesn't have a volume for postgres (commented out). To reset the database completely, just run:
`docker compose -f docker-compose.test.yml down`

### Supertest notes

- Supertest route tests don't need the docker environment set up, as supertest establishes the database connections and app independently.
- Supertest is like a client based http request tool (ex: axios) but for api testing.
