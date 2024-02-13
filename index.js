const hapi = require("@hapi/hapi");
const AuthBearer = require('hapi-auth-bearer-token');
const Inert = require("@hapi/inert");
const env = require("./env.js");
const Movies = require("./respository/movie.js");
// const express = require('express');
// const app = express();
const fs = require("fs");

const path = require("path");
const { log } = require("console");
bodyParser = require("body-parser");

//const upload = require('./upload.js');
let MoviesName = String;

//------------------
const api_port = 4000;
const web_port = 4001;

//------------ hapi --------------

console.log("Running Environment: " + env);

const init = async () => {
  const server = hapi.Server({
    port: api_port,
    host: "0.0.0.0",
    routes: {
      cors: true,
    },
  });

  //---------

  await server.register(Inert);
  await server.register(AuthBearer);

  server.auth.strategy('simple', 'bearer-access-token', {
    allowQueryToken: true,              // optional, false by default
    validate: async (request, token, h) => {

        // here is where you validate your token
        // comparing with token from your database for example
        const isValid = token === '1234567890'

        const credentials = { token };
        const artifacts = { test: 'info' };

        return { isValid, credentials, artifacts };
    }
});

server.auth.default('simple');

  const handleFileUpload = (file) => {
    return new Promise((resolve, reject) => {
      const filename = file.hapi.filename;
      const newfilename = Date.now() + "-" + filename;
      MoviesName = newfilename;
      console.log(newfilename);
      const data = file._data;
      fs.writeFile(
        "./resources/static/assets/uploads/" + newfilename,
        data,
        (err) => {
          if (err) {
            reject(err);
          }
          resolve({ message: "Upload successfully!" });
        }
      );
    });
  };

  server.route({
    method: "GET",
    path: "/",
    config: {
            cors: {
                origin: ['*'],
                additionalHeaders: ["cache-control", "x-requested-width"],
                credentials: true
            }
        },
    handler: () => {
      return "<h3> Welcome to API Back-end Ver. 1.0.0</h3>";
    },
  });

  server.route({
    method: "GET",
    path: "/api/images/{filename}",
    config: {
      cors: {
        origin: ["*"],
        additionalHeaders: ["cache-control", "x-requested-width"],
        credentials: true
      },
    },
    handler: (request, h) => {
      const { filename } = request.params;
      return h.file(`./resources/static/assets/uploads/${filename}`);
    },
  });

  //API: http://localhost:3001/api/movie/all
  server.route({
    method: "GET",
    path: "/api/movie/all",
    config: {
      cors: {
        origin: ["*"],
        additionalHeaders: ["cache-control", "x-requested-width"],
        credentials: true
      },
    },
    handler: async function (request, reply) {
      //var param = request.query;
      //const category_code = param.category_code;

      try {
        const responsedata = await Movies.MovieRepo.getMovieList();

        if (responsedata.error) {
          return responsedata.errMessage;
        } else {
          console.log("/api/movie/all called!");
          console.log(responsedata);
          return responsedata;
        }
      } catch (err) {
        server.log(["error", "home"], err);
        return err;
      }
    },
  });

  server.route({
    method: "GET",
    path: "/api/movie/search",
    config: {
      cors: {
        origin: ["*"],
        additionalHeaders: ["cache-control", "x-requested-width"],
        credentials: true
      },
    },
    handler: async function (request, reply) {
      var param = request.query;
      const search_text = param.search_text;
      //const title = param.title;

      try {
        const responsedata = await Movies.MovieRepo.getMovieSearch(search_text);
        if (responsedata.error) {
          return responsedata.errMessage;
        } else {
          return responsedata;
        }
      } catch (err) {
        server.log(["error", "home"], err);
        return err;
      }
    },
  });

  server.route({
    method: "POST",
    path: "/api/movie/insert",
    config: {
      payload: {
        output: "stream",
        multipart: true,
        uploads: "file",
      },
      cors: {
        origin: ["*"],
        additionalHeaders: ["cache-control", "x-requested-width"],
        credentials: true
      },
    },
    handler: async function (request, h) {
      console.log("request : " + request);
      try {
        console.log(request.payload.Image_name.hapi.filename);

        const { title, genre, director, release_year } = request.payload;
        handleFileUpload(request.payload.Image_name);
        const imageName = MoviesName; // Extract image name
        // console.log(MoviesName);
        const responsedata = await Movies.MovieRepo.postMovie(
          title,
          genre,
          director,
          release_year,
          imageName
        );

        if (responsedata.error) {
          return h.response(responsedata.errMessage).code(500);
        } else {
          return h.response(responsedata).code(201); 
        }
      } catch (err) {
        server.log(["error", "home"], err);
        return h.response(err).code(500); 
      }
    },
  });

  await server.start();
  try {
    await server.start();
    console.log("Server running on %s", server.info.uri);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
  //---------
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
