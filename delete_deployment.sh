#  paths
API_SERVICE_DEPLOYMENT="k8s/api-gateway-deployment.yaml"
ROOM_SERVICE_DEPLOYMENT="k8s/room-service-deployment.yaml"
USER_SERVICE_DEPLOYMENT="k8s/user-service-deployment.yaml"
CODE_SERVICE_DEPLOYMENT="k8s/code-service-deployment.yaml"
SOCKET_SERVICE_DEPLOYMENT="k8s/socket-service-deployment.yaml"
FRONTEND_DEPLOYMENT="k8s/frontend-deployment.yaml"
REDIS_SERVICE="redis/redis-service.yaml"
REDIS_DEPLOYMENT="redis/redis-deployment.yaml"
INGRESS_DEPLOYMENT="k8s/ingress.yaml"

# Delete each deployment YAML
echo "Deleting Redis deployment..."
kubectl delete deployment/redis

echo "Deleting Api Gateway deployment..."
kubectl delete deployment/api-gateway

echo "Deleting Room Service deployment..."
kubectl delete deployment/room-service

echo "Deleting User Service deployment..."
kubectl delete deployment/user-service

echo "Deleting Code Service deployment..."
kubectl delete deployment/code-service

echo "Deleting Socket Service deployment..."
kubectl delete deployment/socket-service

echo "Deleting Frontend deployment..."
kubectl delete deployment/frontend

# Delete each service 
echo "Deleting Redis service..."
kubectl delete svc/redis

echo "Deleting Api Service..."
kubectl delete svc/api-gateway

echo "Deleting Room Service..."
kubectl delete svc/room-service

echo "Deleting User Service ..."
kubectl delete svc/user-service

echo "Deleting Code Service..."
kubectl delete svc/code-service

echo "Deleting Socket Service..."
kubectl delete svc/socket-service

echo "Deleting Frontend service..."
kubectl delete svc/frontend

echo "All services and deployments have been deleted."