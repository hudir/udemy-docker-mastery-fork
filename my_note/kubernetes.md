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