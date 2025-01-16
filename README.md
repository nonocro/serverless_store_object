using an image of Minio on Docker Compose


##upload 

```bash
curl --location 'http://localhost:3000/upload' \ --form 'file=@"c:\\Users\\Brevet \index.js"'
```


##download 

```bash
curl --location 'http://localhost:3000/download/index.js'
```

##delete 

```bash
curl --location --request DELETE 'http://localhost:3000/delete/index.js'
```
