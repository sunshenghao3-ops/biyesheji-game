const http=require("http"),fs=require("fs"),path=require("path");
http.createServer((req,res)=>{const p=req.url==='/'?'/index.html':req.url; const f=path.join(process.cwd(),p); fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end();}else{res.writeHead(200,{"Content-Type":"text/html; charset=utf-8"});res.end(d);}})}).listen(4180,"127.0.0.1");
