g -c user.name="hudir" -c user.email=hudirybw@gmail.com ci -am "keep on kubernetes" && gs

## Abstractions

controller(like stack in docker) -> pod(like container in docker)

Service: network endpoint to connect to a pod

Namespace: Filtered group of objects in cluster

Secrets, configMaps and more

# Your first pods

## kubectl run, kubectrl create and apply

- `kubectl run`   -- like docker run (single pod per command since 1.18)
- `kubectl create` -- like dokcer create (create some resources via CLI or YAML)
- `kubectl apply` -- like a stack deply with swarm (create/update anything via YAML)

## creating a Pod with kubectl
kubectl version
kubectl version --short !not working

Two way to deploy Pods(containers): via commands or via YAML

in kube no random name, need give every pod a name
润
`kubectl run my-nginx --image nginx`

List the pod
`kubectl get pods`
`kubectl get all`

Pods: why do they exist
- layer of abstraction - some containers share same ip and config
- Unlike Docker, you can't create a container directly in K8s
  -- Kubenetes then creates the container(s) inside it
- kubelet(node agent, runs every once in every cluster) tells the container runtime to create contianers for you
- Every type of resource to run containers uses Pods

user command create a pod -> control plane(save reqest in db) -> kubelet see the new request -> create container(s)


## creating a deployment with kubectl
`kubectl create deployment my-nginx --image nginx`
`kubectl create deploy my-nginx --image nginx`
`kubectl get pods`
`kubectl get all`

different resource type
Deployment -> ReplicaSet(for each new version, old still exist) -> Pods
user command deployment -> api -> store in etcd DB -> manager(with controler) see the new resource -> create a new ReplicaSet request in DB -> ReplicaSet manager -> Create Pods, adding back to DB -> schelduer assign the pods to a node

`kubectl delete pod my-nginx`
`kubectl delete deployment my-nginx`

## 112 Scaling ReplicaSets
`kubectl create deployment my-apache --image httpd`
`kubectl scale deploy/my-apache --replicas 2`
or `kubectl scale deploy my-apache --replicas 2`

What happened when we scaled?
kubectl scale will change the deploymenty record
CM will see that only replica count has changed
It will change the number of pods in ReplicaSet
Scheduler sees a new pod is requested, assigns a node
Kubelet sees a new pod, tells container runtime to start httpd


## 115 Inspecting Resources with Get

List our common resources (in the default namespace)
`kubectl get all`

`kubectl get deploy/my-apache`

Show more with a 'wide' output
`kubectl get all -o wide` 
`kubectl get --help`

`kubectl get deploy/my-apache -o wide`
`kubectl get deploy/my-apache -o yaml`

## 116 Inspecting Resources with Describe

 - kubectl get has a weakness
  - It can only show one resource at a time
 - We need a command that combines related resources
  - Parent/child resources
  - Events of the resource

`kubectl describe deploy/my-apache`
   - Deployment summary
   - ReplicaSet status
   - Pod templacte
   - Old/New ReplicaSet names
   - Deployment Events

Show details about a pod, including events
 `kubectl describe pod/my-apache-xxxx-yyyy`

Inspecting Nodes
- a typical workflow of "high level" to "low level" details
- List all our clusters nodes
`kubectl get nodes`
`kubectl get node docker-desktop -o wide`

- Descibe the node 
`kubectl describe node docker-desktop`


## 117. Watching Resources
`kubectl get pods -w`   log the line is anything changes
`kubectl delete pod my-apache-6c8c89bbb9-4jfx8`
See all recent events
`kubectl get events`
Watch for only future events
`kubectl get events --watch-only`


## 118. Container logs in Kubernetes
Get a container's logs(picks a random replica, first container only)
`kubectl logs deploy/my-apache`
Follow new log entries, and start with the latest log line
`kubectl logs deploy/my-apache --follow --tail 1`
Get a specific container's logs in a pod
`kubectl logs pod/my-apache-6c8c89bbb9-bdbtc -c httpd`
Get logs of all containers in a pod
`kubectl logs pod/my-apache-6c8c89bbb9-bdbtc --all-containers=true`
Get multiple pods logs
`kubectl logs -l app=my-apache`

check github,com/stern/stern

clear up `kubectl delete deployment my-apache`


# 17 Exposing kubenetes Ports

## 120 Service Types
Exposing Containers

- `kubectl expose` creates a service for existing pods
- A service is a stable endpoint/address for pod(s)
- If we want to connect to pod(s), we need service -> create service on top of pods
- CoreDNS allows us to resolve services by name
- There are different types of services
  - ClusterIP
  - NodePort
  - LoadBalancer
  - ExternalName

Basic Service Types
 - ClusterIP => default - good in a cluster
   - Single, internal virtual IP allocated
   - Only reachable from within cluster(nodes and pods)
   - Pods can reach service on apps port number
 
 - NodePort
   - High port allocated on each node
   - Port is open on every node's IP
   - Anyone can connect (if they can reach the node)
   - Other pods need to be updated to this port
   - You can access the service using <NodeIP>:<NodePort>
   - Kubernetes 会为 NodePort 服务分配一个端口范围（默认是 30000-32767）。
   - 外部用户可以通过访问 <节点IP>:<NodePort> 来访问服务。

- LoadBalancer(mostly used in Clould)
  - Controls a LB endpoint external to the cluster
  - Only available when infra provider gives you a LB (AWS ELB, etc)
  - Creates NodePort + ClusterIP services, tell LB to send to NodePort

- ExtenalName
  - Adds CNAME DNS record to CoreDNS only
  - Not used for Pods, but for giving pods a DNS name to use for something outside Kubernetes

- Kuberneter Ingress; for http traic