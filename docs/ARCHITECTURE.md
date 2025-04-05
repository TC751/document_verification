# System Architecture

```mermaid
graph TD
    A[User Interface] --> B[Web3 Provider/MetaMask]
    B --> C[Smart Contract]
    C --> D[(Blockchain)]
    A --> E[React Frontend]
    E --> F[Document Management]
    F --> G[File Processing]
    G --> H[Hash Generation]
    H --> C
    C --> I[Events]
    I --> J[Event Listeners]
    J --> E
    
    subgraph Smart Contract
    C --> K[Access Control]
    C --> L[Document Storage]
    C --> M[Verification Logic]
    end
    
    subgraph Frontend
    E --> N[User Authentication]
    E --> O[Document Upload]
    E --> P[Status Display]
    end
```

## Component Description

1. **Smart Contract Layer**
   - Document registration and verification
   - Access control management
   - Event emission
   - Status tracking

2. **Frontend Layer**
   - User interface components
   - Web3 integration
   - File handling
   - Status updates

3. **Blockchain Layer**
   - Transaction processing
   - State management
   - Event logging
   - Data persistence

4. **Integration Layer**
   - MetaMask connection
   - Network management
   - Transaction handling
   - Event subscription