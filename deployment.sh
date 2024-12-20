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

# Apply each deployment YAML
echo "Applying Redis deployment..."
kubectl apply -f $REDIS_DEPLOYMENT

echo "Applying Redis service..."
kubectl apply -f $REDIS_SERVICE

echo "Applying API service deployment..."
kubectl apply -f $API_SERVICE_DEPLOYMENT

echo "Applying Room service deployment..."
kubectl apply -f $ROOM_SERVICE_DEPLOYMENT

echo "Applying User service deployment..."
kubectl apply -f $USER_SERVICE_DEPLOYMENT

echo "Applying Code service deployment..."
kubectl apply -f $CODE_SERVICE_DEPLOYMENT

echo "Applying Socket service deployment..."
kubectl apply -f $SOCKET_SERVICE_DEPLOYMENT

echo "Applying Frontend service deployment..."
kubectl apply -f $FRONTEND_DEPLOYMENT

echo "Applying Ingress deployment..."
kubectl apply -f $INGRESS_DEPLOYMENT

# echo "Port-forwarding will start in a few seconds..."
# sleep 20  # Waits for 20 seconds for the services to be ready

# echo "Port-forwarding..."
# kubectl port-forward svc/frontend 8080:80

echo "All services have been deployed."