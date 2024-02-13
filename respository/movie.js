var mysql = require('mysql');
const env = require('../env.js');
const config = require('../dbconfig.js')[env];

async function getMovieList() {

    var Query;
    var pool  = mysql.createPool(config);
    
    return new Promise((resolve, reject) => {

       //Query = `SELECT * FROM movies WHERE warehouse_status = 1 ORDER BY CONVERT( warehouse_name USING tis620 ) ASC `;
         Query = `SELECT * FROM movies`;
 
         pool.query(Query, function (error, results, fields) {
            if (error) throw error;

            if (results.length > 0) {
                pool.end();
                return resolve(results);   
            } else {
                pool.end();
                return resolve({
                    statusCode: 404,
                    returnCode: 11,
                    message: 'No movie found',
                });
            }

        });

    });
    

}


async function getMovieSearch(search_text) {

    var Query;
    var pool  = mysql.createPool(config);
    
    return new Promise((resolve, reject) => {

        Query = `SELECT * FROM movies WHERE title LIKE '%${search_text}%'`;
 
         pool.query(Query, function (error, results, fields) {
            if (error) throw error;

            if (results.length > 0) {
                pool.end();
                return resolve({
                    statusCode: 200,
                    returnCode: 1,
                    data: results,
                });   
            } else {
                pool.end();
                return resolve({
                    statusCode: 404,
                    returnCode: 11,
                    message: 'No movie found',
                });
            }

        });

    });


}

async function postMovie(p_title,p_genre,p_director,p_release_year,p_imageName) {
    
    var Query;
    var pool  = mysql.createPool(config);
    
    return new Promise((resolve, reject) => {

        //Query = `SELECT * FROM movies WHERE title LIKE '%${search_text}%'`;

        var post  = {
            title: p_title, 
            genre: p_genre,
            director: p_director,
            release_year: p_release_year,
            Image_name: p_imageName
        };

        console.log('post is: ', post); 

     
        Query = 'INSERT INTO movies SET ?';
        pool.query(Query, post, function (error, results, fields) {
        //pool.query(Query, function (error, results, fields) {
            console.log(results);
            if (error) {
                console.log('error_code_msg: '+error.code+' : '+error.sqlMessage);
                pool.end();
                return resolve({
                    statusCode: 405,
                    returnCode: 9,
                    error_code: error.code+' : '+error.sqlMessage,
                });   
            }else{

            if (results.affectedRows > 0) {
                    pool.end();
                    return resolve({
                        statusCode: 200,
                        returnCode: 1,
                        messsage: 'Movie list was inserted',
                    });   
            }}
            
            


        });


    });


}

module.exports.MovieRepo = {
    getMovieList: getMovieList,
    getMovieSearch: getMovieSearch,
    postMovie: postMovie,
    
};
