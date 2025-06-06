# Blog App

A simple blog application built with Node.js, Express, and SQLite.

## Project Structure

```
/blog_app
|-- /public
|   |-- index.html
|   |-- style.css
|   |-- script.js
|-- server.js
|-- package.json
|-- .gitignore
|-- README.md
```

## Features

- Create, read, update, and delete blog posts (CRUD)
- RESTful API endpoints
- SQLite database for data storage
- Static frontend served from the `public` directory

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) and npm installed

### Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd blog_app
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

### Running the App

Start the server:

```bash
node server.js
```

The server will run at [http://localhost:3000](http://localhost:3000).

### API Endpoints

- `GET /api/posts` — Get all blog posts
- `POST /api/posts` — Create a new post
- `PUT /api/posts/:id` — Update a post
- `DELETE /api/posts/:id` — Delete a post

## License

MIT