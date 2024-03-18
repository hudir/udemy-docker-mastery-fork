# why docker compose?
- configure relatiionships between containers
- save our docker container run settings in easy-to-read file
- create one-liner developer envireonment startups

### YAML-formatted file
- containers
- networks
- volumes

1- Compose YAML format has it's own versions: 1, 2, 2.1, 3, 3.1
2- docker-compose --help
3- docker-compose.yml is default filename, but any can be used with docker-compose -f

### Cli tool docker-compose
used for local/test automation with those YAML files

docker compose up -d
docker compose down

### Using compose to build
docker compose up

rebuild with docker compose build or docker compose --build

For clean up:
docker compose down --rmi local
delete all local(custom) cached images