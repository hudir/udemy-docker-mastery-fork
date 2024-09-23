
# Swarm Mode

- deploy and maintain - container lifecycle
- scale out/in/up/down
- ensure containers are re-created if they fail
- replace containers without downtime(blue/green deploy)
- control/track where containers get started
- create cross-node virtual networks
- ensure only trusted servers run our containers
- store private infos like .env virables

1. Swarm Mode is a clustering solutiion bring diff os, nodes, hosts .. into a single mangeable unit.
2. not Swarm "classic"
3. commands
   - docker info
   - docker swarm
   - docker node
   - docker service
   - docker stack
   - docker secret

# first try

docker info | grep Swarm ->  Swarm: inactive
docker swarm init

what has done
-> lots of PKI and security automatiion
  - Root signing certificate created for our Swarm
  - Certificate is issued for first Manager node
  - Join tokens are created(for other node to join)

-> Raft database created to store root CA, configs and secrets
  - Encrypted by default on disk
  - no need for another key/value system to hold orchestration/secrets
  - replicates logs amongst managers via mutual TLS in "control plane"

docker node ls
docker node --help
docker swarm --help
docker service --help

docker service create alpine ping 8.8.8.8
docker service ls
docker service ps <name>
docker service update <ID> --replicas 3

docker update --help   -> update some vairables without kill container running
docker service update --help
docker service rm <name>

Starting in 17.10 the --detach  default changes to false , so you'll always see the UI wait synchronously while service tasks are deployed/updated, unless you set --detach true  in each command.

- Use the defaults if you're interactive at the CLI, typing commands yourself.
Use --detach true  if you're using automation or shell scripts to get things done.

We can update a role of another node from a manager node using the "docker node update --role" command.
docker node ps node2
docker service ps <service name> -> to get full list


## multipass[https://multipass.run/docs/mac-tutorial]
Once you have Multipass VM's created, then install docker and/or kubernetes inside them (`multipass shell <name>` gets you into the VM shell, `multipass mount` can connect a host directory into the VM, and `multipass transfer` can copy files in.)

```
multipass list
multipass find
multipass launch docker -n node1
multipass info <iinstance name>
multipass shell <iinstance name>

docker swarm init
docker swarm init --advertise-addr <IP address>
docker node ls
docker node update --role manager node2
docker swarm join-token manager
docker service create --replicas 3 alpine ping 8.8.8.8
docker service ls
docker node ps
docker node ps <iinstance name>
docker service ps <service name>
```

# Section 9
drupal:9
postgres:14

## Overlay Multi-Host Networking
 --driver overlay when creating network
 For container-to-container traffic inside a single Swarm
 Optional IPSec(AES) encryption on network creation
 Each service can be connected to multiple networks
 ```
 docker network create --driver overlay mydrupal
 docker network ls
 ```
 docker_gwbridge -> out going network
 ingress -> swarm default
 ```
docker service create --name psql --network mydrupal -e POSTGRES_PASSWORD=mypass postgres:14
docker service create --name drupal --network mydrupal -p 80:80 drupal:9
watch docker service ls -> watch the command(not docker cmd)
docker service inspect drupal
```

## Swarm routing mesh - Global traffic router
Routing Mesh
- Routes ingress(incoming) packets for a Service to proper Task
- Spans all nodes in Swarm
- Uses IPVS from Linux Kernel
- Load balances Swarm Services across their Tasks
- Two ways this works:
- 1. Container-to-container in a Overlay network (uses VIP)
- 2. External traffic incoming to published ports (all nodes listen)


docker service rm <service name>


## swarm-app-1 assignment
```
docker network create -d overlay backend
docker network create -d overlay frontend
docker service create --name vote --network frontend -p 80:80 --replicas 2 bretfisher/examplevotingapp_vote
docker service create --name redis --network frontend --replicas 1 redis:3.2
docker service create --name worker --network frontend --network backend --replicas 1 bretfisher/examplevotingapp_worker
docker service create --name db --network backend --replicas 1 --mount type=volume,source=db-data,target=/var/lib/postgresql/data -e POSTGRES_HOST_AUTH_METHOD=trust postgres:9.4
docker service create --name result --replicas 1 --network backend -p 5001:80 bretfisher/examplevotingapp_result
```



## Stacks
- Production Grade Compose
- a new layer of abstraction to Swarm called Stacks
- accept Compose files as their declearative definition for services, networks, and volumes , also scrects
- use 'docker stack deploy' rather then docker service create
- stacks manages all those objects. Adds stack name to start of their name
- new deploy: key in compose file. Can't do build
- compose now ignores deploy:, swarm igonore build:
- docker-compose cli not needed on Swarm server

docker stack deploy -c example-voting-app-stack.yml voteapp
above command, -c for compose, then compose file, then stack name
```
docker stack ls
docker stack <stack name>
docker stack ps <stack name>
docker stack ps voteapp 
docker stack services voteapp 

docker stack rm voteapp 
```

If make changes/updates, just re-run the deploy command.



## Secrets Storage
- Easiest "secure" solution for storing secrets in Swarm
- Supports generic strings or binary content up tp 500Kb in size
- Doesn't require apps to be rewritten

### Secrets Storage Cont.
- As of Docker 1.13.0 Swarm Raft DB is encrypted on disk
- Only stored on disk on Manager nodes
- Default is Managers and Workers "control plane" is TLS + Mutual Auth
- Secrets are first stored in Swarm, then assigned to a Service(s)
- Only containers in assigned Service(s) can see them
- They look like files in container but are actually in-memory fs
- /run/secrets/<secret_name> or /run/secrets/<secret_alias> 
- Local docker-compose can use file-based secrets, but not secure

```
docker secret create <name in secret db> <filename>
docker secret create psql_user 

docker secret create psql_user psql_user.txt 
echo "myDBpassWORD" | docker secret create psql_pass -
above command - at end is tell docker to read msg from std input

docker secret ls
docker secret inspect psql_user 

docker service create --name psql --secret psql_user --secret psql_pass -e POSTGRES_PASSWORD_FILE=/run/secrets/psql_pass -e POSTGRES_USER_FILE=/run/secrets/psql_user postgres


docker service ls
docker service ps psql

docker exec -it <container name> bash

ls /run/secrets/
cat /run/secrets/psql_pass 


docker service update --secret-rm <secret name> <sercive name>
this will re-create a new container
docker service update --secret-rm psql_user psql


## Secret with compose files
```
docker stack deploy -c docker-compose.yml mydb

```
Diff -> remove stack will also remove secrets


# Assigment for Create Stack with Secrets

echo "myDBpassWORD" | docker secret create psql_password -
echo "dbuser" | docker secret create psql_user -

docker stack deploy -c docker-compose.yml myDrupal

docker service update --secret-add psql_user --secret-add psql_password myDrupal_psql 


# docker lifecycle

## Local dev with secrets
```
docker compose up -d
docker compose exec psql cat /run/secrets/psql_user
```
This way not safe, work only file based secrets


the override file will be run automaticly
docker compose -f a.yml -f b.yml up

docker compose -f a.yml -f b.yml up config -> combin/merge two files in one


## Service updates
- Provide rolling replacement of tasks/containers in a service
- Limits downtime (be careful with "prevents" downtime)
- Will replace containers for most changes
- Has many, many cli options to control the update
- Create options will usually change, addiing -add or -rm to them
- Includes rollback and healthcheck options
- Also has scale & rollback subcommand for quicker access
  -docker service scale web=4 and docker service rollback web
- A stack deploy, when pre-existing, will issue service updates

#### examples:
 - Just update the image used to a newer version
     docker service update --image myapp:1.2.1 <servicename>
 - Adding an enviroment variable and remove a port
     docker service update --env-add NODE_ENV=production --publish-rm 8080 <servicename>
 - Change number of replicas of two services
     docker service scale web=8 api=6

 - Some command. just edit the YAML file, then
    docker stack deploy -c file.yml <stackname>

docker service create -p 8088:80 --name web nginx:1.13.7
docker service ls
docker service scale web=5
docker service update --image nginx:1.13.6 web
docker service update --publish-rm 8088 --publish-add 9090:80 web

### rebalancing
force update without anything, will rebalaning
docker service update --force web



# Section 10 Swarm App Lifecycle

## Dev, Build and Deploy with a single compose design

For CI Testing: docker compose -f docker-compose.yml -f docker-compose.test.yml
docker compose -f docker-compose.yml -f docker-compose.prod.yml config 

docker compose -f docker-compose.yml -f docker-compose.prod.yml config > newFile.yml


# Section 11 Docker Healthchecks
- Supported in Dockerfile, Compose YAML, docker run and Swarm Service
- Docker engine will exec's the command in the container
- e.g. curl localhost
- It expects exit 0 (OK) or exit 1 (Error)
- Three container states: starting, healthy, unhealthy
- Much better then "is binary still running?"
- Not a extenal monitoring replacement

Healthcheck status shows up in docker container ls
Check last 5 healthchecks with docker container inspect
Docker run does nothing with healthchecks(no action)
Service will replace tasks if they fail healthcheck
Service updates wait for them before continuing

example for docker run:
```
docker run \
  --health-cmd="curl -f localhost:9200/_cluster/health || false" \
  --health-interval=5s \
  --health-retries=3 \
  --health-timeout=2s \
  --health-start-period=15s \
  elasticsearch:2
```
Option for healthcheck command(Docker file)
--interval=DURATION(default: 30s)
--timeout=DURATION(default: 30s)
--start-period=DURATION(default: 0s)  (17.09+)
--retries=N(default: 3)

Basic command using default options
 HEALTHCHECK curl -f http://localhost/ || false

Custom options with the command
  HEALTHCHECK --timeout=2s --interval=3s --retries=3 \
   CMD curl -f http://localhost/ || exit 1

Example: Static website running in Nginx, just test default URL
FROM nginx:1.13

HEALTHCHECK --timeout=3s --interval=30s \
 CMD curl -f http://localhost/ || exit 1


Example2: PHP-FRM running behind Nginx, test the Nginx and FPM status URLs
```
FROM your-nginx-php-fpm-combo-image

# don't do this if php-fpm is another container
# must enable php-fpm ping/status in pool.ini
# must forward /ping and /status urls from nginx to php-fpm

HEALTHCHECK --interval=5s --timeout=3s \
 CMD curl -f htttp://localhost/ping || exit 1
```

Example3: Use a PostgresSQL utility to test for ready stats
```
FROM postgres

# specify real user with -U to prevent errors in log

HEALTHCHECK --interval=5s --timeout=3s \
 CMD pg_isready -U postgres || exit 1 
```

Example4 in Compose/Stack files:

version: "2.1" (minimun for healthchecks)
services:
 web:
  image:nginx
  healthcheck:
   test: ["CMD", "curl", "-f", "http://localhost"]
   interval: 1m30
   timeout: 10s
   retries: 3
   start_period: 1m #version 3.4 minimun


try:
docker container run --name p1 -d postgres
docker container run --name p2 -d --health-cmd="pg_isready -U postgres || exit 1" postgres

docker service create --name p1 postgres
docker service create --name p2 --health-cmd="pg_isready -U postgres || exit 1" postgres


# Section 11 Container Registries: Image Storage and Distribution

## Docker hub
- Image registry
- Docker hub details including auto-build
- Docker Store
- Docker Cloud
- Use new Swarms feature in Cloud to connect Mac/win to Swarm
- Install and use Docker Registry as private image store
- 3rd party registry options

### Docker hub
- Docker registry plus lightweight image building
- Link Github/BitBucket to Hub and auto-build images on commit
- Chain image building togetther

- automated build is good

### Docker Registry
- A private image registry for your network
- part of the   GitHub repo

TD:
- Secure the Registry with TLS
- Storage cleanup via Garbage Collection
- Enable Hub caching via '--registry-mirror'

docker container run -d -p 5000:5000 --name registry registry
docker pull hello-world
docker container run hello-world

docker tag hello-world 127.0.0.1:5000/hello-world
docker push 127.0.0.1:5000/hello-world

docker image remove hello-world

docker image pull 127.0.0.1:5000/hello-world

docker container rm registry

docker container run -d -p 5000:5000 --name registry -v $(pwd)/registry-data:/var/lib/registry registry



hello-world is the repository name, which we are using as a short form of the full image name. The full name is docker.io/hello-world:latest. That breaks down into three parts:

docker.io - the hostname of the registry which stores the image;
hello-world - the repository name, in this case in {imageName} format;
latest - the image tag.
If a tag isn’t specified, then the default latest is used. If a registry hostname isn’t specified then the default docker.io for Docker Store is used. If you want to use images with any other registry, you need to explicitly specify the hostname - the default is always Docker Store.

LTS
Self cetifecate
openssl req -newkey rsa:4096 -nodes -sha256 -keyout certs/domain.key -x509 -days 365 -out certs/domain.crt

mkdir registry-data
docker container run -d -p 5000:5000 --name registry \
  --restart unless-stopped \
  -v $(pwd)/registry-data:/var/lib/registry -v $(pwd)/certs:/certs \
  -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/domain.crt \
  -e REGISTRY_HTTP_TLS_KEY=/certs/domain.key \
  registry

--restart unless-stopped - restart the container when it exits, unless it has been explicitly stopped. When the host restarts, Docker will start the registry container, so it’s always available.
-v $pwd\certs:c:\certs - mount the local certs folder into the container, so the registry server can access the certificate and key files;
-e REGISTRY_HTTP_TLS_CERTIFICATE - specify the location of the SSL certificate file;
-e REGISTRY_HTTP_TLS_KEY - specify the location of the SSL key file.


docker kill registry
docker rm registry
docker run -d -p 5000:5000 --name registry \
  --restart unless-stopped \
  -v $(pwd)/registry-data:/var/lib/registry \
  -v $(pwd)/certs:/certs \
  -v $(pwd)/auth:/auth \
  -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/domain.crt \
  -e REGISTRY_HTTP_TLS_KEY=/certs/domain.key \
  -e REGISTRY_AUTH=htpasswd \
  -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
  -e "REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd" \
  registry


### Private Docker Registry with Swarm
- works the same way as localhost
- because of routing mesh, all nodes can see 127.0.0.1:5000
- do not forget to decide how to store images(volume driver)
- Note: all nodes must be able to access images
- Use a hosted SaaS registry if possibl



# Docker in Production

## 96 what need to know/decide










g -c user.name="hudir" -c user.email=hudirybw@gmail.com ci -am "keep on swarm" && gs