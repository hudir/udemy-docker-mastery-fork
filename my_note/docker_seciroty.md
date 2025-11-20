
Docker use namespaces as in linux(but some tool run as root)
- need to enable it. enable "user namespaces"- pre host setting

- for most programming languages app in contianiers, they will run as root. 
 -> Create and switch to the new user is a good practice

- To ios containers with the host(some times there are linux core/docker vulnus)

- Code repo scanning - snyk or github tools

- image scanning - Trivy / micorscanner for CVEs
  - micorscanner could add 3 lines in dockerfile
  - Trivy scan after build

- Runtime Bad Behavior Monitoring: Sysdig falco

- content trust - image,code, everything only your teams signed could run in pipeline

- Later, check out AppArmor, SELinux, Seccomp, and linux "capabilities"

- Docker root-less