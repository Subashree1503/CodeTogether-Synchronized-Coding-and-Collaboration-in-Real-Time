# Variables
DOCKER_REPO = subashreedinesh
TAG = latest

# Service names (corresponding to folders in backend/services/)
SERVICES = api-service room-service user-service code-service socket-service frontend

# Default target: Build and push all services
.PHONY: all
all: $(SERVICES)

# Targets for each service
api-service:
	docker build -t $(DOCKER_REPO)/api-gateway:$(TAG) ./backend/services/api-gateway
	docker push $(DOCKER_REPO)/api-gateway:$(TAG)

room-service:
	docker build -t $(DOCKER_REPO)/room-service:$(TAG) ./backend/services/room-service
	docker push $(DOCKER_REPO)/room-service:$(TAG)

user-service:
	docker build -t $(DOCKER_REPO)/user-service:$(TAG) ./backend/services/user-service
	docker push $(DOCKER_REPO)/user-service:$(TAG)

code-service:
	docker build -t $(DOCKER_REPO)/code-service:$(TAG) ./backend/services/code-service
	docker push $(DOCKER_REPO)/code-service:$(TAG)

socket-service:
	docker build -t $(DOCKER_REPO)/socket-service:$(TAG) ./backend/services/socket-service
	docker push $(DOCKER_REPO)/socket-service:$(TAG)

frontend:
	docker build -t subashreedinesh/frontend:latest ./frontend
	docker push subashreedinesh/frontend:latest

# Clean target to remove dangling images
.PHONY: clean
clean:
	docker image prune -f

