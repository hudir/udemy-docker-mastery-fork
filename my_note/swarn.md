
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
 1