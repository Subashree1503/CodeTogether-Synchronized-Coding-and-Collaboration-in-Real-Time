# Backend Microservices

Directory Structure

backend/
├── README.md 
├── services/
    ├── user-service/
    │   ├── server.js
    │   ├── package.json
    │   ├── Dockerfile
    ├── room-service/
    │   ├── server.js
    │   ├── package.json
    │   ├── Dockerfile
    ├── code-service/
    │   ├── server.js
    │   ├── package.json
    │   ├── Dockerfile
    └── api-gateway/
        ├── server.js
        ├── package.json
        ├── Dockerfile

Improvements to Consider:
Persistence: Currently, user and room data is stored in-memory. Consider using a database for persistence across application restarts.
Error handling: The code currently sends basic error messages. Implement more descriptive error handling to help with debugging and user experience.
Security: Usernames and rooms are currently stored in plain text. Consider implementing hashing and salting for user information and access control mechanisms for rooms.