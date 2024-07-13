# Datamesh

Datamesh is a simplistic digital Zettelkasten, which helps you to collect and organize information relevant or important for you.

Datamesh is NOT a password manager.
The information persisted by Datamesh is NOT SECURED in any way.

![[docs/images/screenshot-v1.png]]

## Run

Use Docker to run a PHP instance containing the webapp.

```bash
docker run -it --rm --name datamesh \
  -p $PORT:80 -P \
  -v "$PWD/src/php":/app \
  -w /app \
  php:7.4-cli \
  php -S 0.0.0.0:80 -n -c /app
```

## License

[[LICENSE | See license document]]
