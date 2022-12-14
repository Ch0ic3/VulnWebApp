const express = require("express")
const bodyparser = require("body-parser")
var db = require("./public/js/database.js")
const sessions = require("express-session")

//prototype polution module
const lodash = require("lodash")

const https = require("https")
const {exec} = require("child_process")
const { stderr } = require("process")
const path = require('path');
const fs = require("fs")
const http = require("http")
const md5 = require("md5")
const app = express()
const port = 3000
const maxge = 1000 * 60 * 60





app.use(sessions({
    secret: "weaksecret",
    saveUninitialized:true,
    cookie: { maxAge: maxge },
    resave: false 
}))
app.use(bodyparser.json({
    type: [
        "application/json",
        "application/csp-report"
    ]
}))
app.use(express.static("public"))
app.use(express.urlencoded({extended:true}))
app.set("view engine","ejs")

app.delete("/api/user/:id", function(req,res){
    res.send("flag: c29mdGljZQ==")
})

app.get("/api/user/:id", function(req,res){
    session = req.session
    console.log(req.session)
    if (req.query.id){
        id = req.query.id
        console.log(`${req.query.id}`)
        var sql = 'SELECT * FROM user WHERE id = "' + id + '";'
    }else{
        id = req.params.id
        console.log(`${req.params.id}`)
        var sql = 'SELECT * FROM user WHERE id = "' + id + '";'
    }
    if(req.params.id === "password")
    {
        res.send("You're Retarded fr fr")
    }else 
    {
        db.get(sql, function(err,row){
            if(err)
            {
                res.status(400).json({"error":err.message})
                return;
            } else {
                try {
                    if (row.username && row.email)
                {
                    console.log(row)
                    res.send(row.username + "<br>" + row.email + "<br>" + row.password)
                }
                } catch (error) {
                    res.status(400).json({"ERROR":error.message})
                }
                
            }
        })
    }
    

})

app.get("/api/reset", function(req,res){
    user = req.query.username
    email = req.query.email
    if (user && email){
        sql = `select * from user where username = "${user}" and email = "${email}`
        console.log(sql)
        db.get(sql, function(err,rows){
            console.log(user)
            if (rows){
                console.log(user, rows.username)
                if (req.query.username != rows.username){
                    console.log("nice try with a sql injection")
                    res.send("SQLI")
                }else{
                    console.log(rows)
                    res.send(`Logged into: ${rows.username} <br> Email: ${rows.email} <br> Passsword: ${rows.password} <br>`)
                }
            }        
        })
    }else
    {
        res.send(`<h1 class="cyberpunk">/api/reset?username=&email=</h1>`)
    }
})

app.get("/api/users", (req, res, next) => {
    username = req.query.username
    var sql = `select * from user where username = "${username}"`
    console.log/sql
    var params = []
    db.all(sql, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

app.get("/api/login", function(req,res){
    if (req.query.user && req.query.pass)
    {
        username = req.query.user
        password = req.query.pass

        sql = `SELECT * FROM user WHERE username = "${username}" and password = "${(password)}"`
        params = [username,"'"]
        console.log(sql)
        db.get(sql, function(err,row){
            if(err)
            {
                res.status(400).json({"error": err.message})
            } else {
                console.log(row)
                console.log("checkpoint")
                if (row)
                {
                    if ((md5(password)) === row.password)
                    {
                        session = req.session
                        session.password = row.password
                        session.user = username
                        session.idd = row.id
                        res.send("row")
                        return
                    }
                }
                else{
                    res.send("ERROR")
                    return
                }
                res.send(row)
            }
        })
    }    
})

app.get("/xss", function(req,res){
    res.setHeader('report-to',
        '{"group":"csp-endpoint","max_age":10886400,"endpoints":[{"url":"http://localhost:3000/report"}],"include_subdomains":true}'
    )
    res.setHeader(
        "Content-Security-Policy-report-only","default-src 'self' data: 'unsafe-inline'; font-src 'self' data: *.bootstrapcdn.com *.gstatic.com; img-src 'self'; script-src 'self' 'unsafe-inline';  style-src 'self' data: 'unsafe-inline' *.bootstrapcdn.com *.googleapis.com ; style-src-elem 'self' 'unsafe-inline'; style-src-attr 'self' 'unsafe-inline';report-uri /report;"
    )
    res.sendFile(path.join(__dirname,"/views/xs.html"))
})

app.post("/xss", function(req,res){
    var input = req.body.input
    console.log(input)
    res.send(input)
    
})
/*
app.get("/proto", function(req,res){
    console.log(user)
    console.log(toString)
    console.log(toSting())
    if(!user.admin){
        res.send("Access Deneid")
    } else {
        res.send("Access Gramted <br> Flag:Tomato")
    }

    
})

app.post("/proto", function(req,res){
    user = req.body.user
    session = req.session
    var message = {
        // Default message icon. Cen be overwritten by user.
        icon: 'aaa',
      };
    lodash.merge(message,req.body.text)
    console.log(req.body)

    res.send(req.body)
})
*/


app.get("/rfi", function(req,res){
    const {q, file ,mode, host} = req.query
    if (req.query.mode)
    {
        console.log(req.query)
        if (mode === "read"){
            console.log(`file query: ${file}`)
            if (file.indexOf("./" === -1)){
                file_content = fs.readFileSync(path.join(__dirname, req.query.file))
                console.log(file_content.toString())
                res.send(file_content.toString())
            }
        } else if (mode === "remote") {
            console.log("REMOTE")
            const FILE = fs.createWriteStream("data.txt")
            if (host){
                console.log(host)
                var target = host
                if(target.includes("https://"))
            {
                https.get(target, function(response) {
                    response.pipe(FILE)

                    FILE.on("finish", () => {
                        var file_content = fs.readFileSync("data.txt")
                        res.send(file_content.toString())
                        return
                        })
                    })
            } else if (target.startsWith("http://"))
            {
                http.get(target, function(response){
                FILE.on("finish", () => {
                        var file_content = fs.readFileSync("data.txt")
                        res.send(file_content.toString())
                        return
                        })
                return
                })
            }
            }else{
                res.send("ERROR")
            }
        } else if (mode === "exec"){
            exec(file, (err, stdout, stderr) => {
                if (err){
                    console.log(err)
                    return
                }
                if (stdout) {
                    console.log(`stdout: ${stdout}`)
                    res.send(stdout)
                    return
                }
            })
        }
    } else {
        res.render(path.join(__dirname,"/views/rfi.ejs"))
        return
    }

 
    

})


app.post("/report", function(req,res) {
    console.log(req.body)
})

app.get("/", function(req,res){
    session = req.session
    
    res.sendFile(path.join(__dirname,"/views/index.html"))
})

app.get("/login", function(req,res){
    res.send("Login")
})

app.get("/user/profile", function(req,res){
    session = req.session
    if (session.user === "admin")
    {
        res.render(path.join(__dirname, "/views/profile.ejs"), {username:session.user, id:session.idd, password:session.password, flag:"flag: Z2V0cm9vdA=="})
    }else {
        console.log(session)
        res.render(path.join(__dirname,"/views/profile.ejs"), {username:req.session.user,id:req.session.idd, password:session.password, flag:null})
    }})


app.post("/login", function(req,res) {
    console.log(req.body)
    const {q, username} = req.query
    if (req.body.username === "user" && req.body.pass ===  "pass")
    {
        console.log("Logged in")
    }
    res.send("ERROR")
})

app.get("/api/register", function(req,res) {
    var errors = []
    if (!req.query.pass)
        {
            errors.push("No pass")
        }
    if(!req.query.username)
    {
        errors.push("No username")
    }
    if(!req.query.email)
    {
        errors.push("No email")
    }
    if (errors.length)
    {
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    if (req.query.user && req.query.email && req.query.pass){
        
        console.log(req.query)
        insert = 'INSERT INTO user (name, email, password) VALUES (?,?,?)'
        db.run(insert,[req.query.user,req.query.email,req.query.passw], function(err, result){
            if(err)
            {
                console.log(err.message)
                res.status(400).json({"Error": "Email or Username are not unique"})
            }else
            {
                session = req.session
                session.userid = req.query.username
                session.email = req.query.email
                console.log(session.userid)
            }})
        
        
    }
    res.sendFile(path.join(__dirname,("/views/register.html")))
    
})


app.get("/register", function(req,res){
    var body = req.body
    console.log(body)

    res.sendFile(path.join(__dirname,"/views/register.html"))
})

app.post("/register", function(req,res){
    const body = req.body
    {
        console.log(body)
    }
})


app.listen(port, () => {
    console.log(`Listening on port : ${port}`)
})