# Create monitoring namespace
```bash
kubectl create namespace monitoring
```
## Install Prometheus + Grafana
```bash
helm repo add grafana https://grafana.github.io/helm-charts

helm install grafana grafana/grafana --namespace monitoring

helm install prometheus prometheus-community/prometheus --namespace monitoring --create-namespace
```
## Port forward prometheus
```bash
kubectl --namespace monitoring port-forward svc/prometheus-server 9090:80
```
Access Prometheus at:

http://localhost:9090

## Verify Grafana installation
```bash
kubectl --namespace monitoring port-forward svc/grafana 3000:80
```
Access Grafana at:

http://localhost:3000

Username: admin

Pwd: Retrieve it using 
```bash
kubectl get secret --namespace monitoring grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

Add Prometheus as a Data Source:

In Grafana, go to Configuration > Data Sources > Add Data Source.
Select Prometheus.
Enter the URL: 
Copy code
http://prometheus-server.monitoring.svc.cluster.local
Click Save & Test. You should see a success message.