const express = require('express');
const app = express();
const port = 8080;
const { Client } = require('pg');


app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const client = new Client({ //Вставьте свои параметры БД
    user: 'postgres',
    host: '192.168.121.137', 
    database: 'lib',
    password: 'P@ssw0rd',
    port: 5432,
});
client.connect();

app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.redirect('/login.html');
})

app.get('/books', async (req, res) => {
    let bookname = req.query.name;
    
    let sql = `select ba.id, a.name as author, b.name as book from books_by_authors ba
                  left join author a on a.id = ba.aid
                  left join book b on b.id = ba.bid`;
    if(bookname){
        sql+=`\rwhere b.name like '%${bookname}%'`        
    }
    try{
        let data = await client.query(sql);
        res.render('booklist', {data: data.rows});
    }
    catch(e)
    {
        console.log(e);
        res.send(`error ${e.message}. <br/> SQL:${sql}`);
    }
    
})

app.post('/signin', async (req, res) => {
    let login = req.body.name;
    let pass = req.body.pass;
    //let sql = "SELECT name as result FROM users WHERE name = '" + login + "' AND pass = md5('" + pass + "')";
    let sql = {
        text: "SELECT name as result FROM users WHERE name = $1 AND pass = md5($2)", 
        values: [login, pass]
    };
    try{
        let data = await client.query(sql);
        if(data.rows.length>0 && data.rows[0].result){
            res.redirect('/books');
        }else
        {
            res.send(`fail ${login}`);
        }
    }
    catch(e)
    {
        console.log(e);
        res.send(`error ${e.message}. <br/> SQL:${sql}`);
    }

  })


app.listen(port, ()=>{
	console.log(`server running at http://localhost:${port}`);
})
