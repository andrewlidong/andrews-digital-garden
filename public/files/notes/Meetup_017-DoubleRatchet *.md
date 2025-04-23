**

- Meetup 017 - [Double ratchet](https://signal.org/docs/specifications/doubleratchet/) and [Sesame](https://signal.org/docs/specifications/sesame/)
    

**

# Double Ratchet Algorithm

**Authors**: Trevor Perrin, Moxie Marlinspike  
**Revision**: 1 (2016-11-20)

## Overview

- **Purpose**: The Double Ratchet algorithm enables two parties to securely exchange encrypted messages based on a shared secret key, typically initiated via a key agreement protocol like X3DH.
- **Key Features**:
    - **Forward Secrecy**: Ensures that compromising current keys does not expose past keys.
    - **Break-In Recovery**: New keys are continuously generated, ensuring that future messages remain secure even after a compromise.

## Key Concepts

### KDF Chains

- **Key Derivation Function (KDF)**:
    - Generates cryptographic keys from existing data.
    - Used for "chaining" keys: each output is used as input for the next round.
- **Resilience**: Output keys appear random to adversaries without KDF keys.
- **Chains in Double Ratchet**:
    - **Root Chain**: Produces new keys to feed into other chains.
    - **Sending/Receiving Chains**: Produces keys used for encrypting and decrypting individual messages.

### Symmetric-Key Ratchet

- **Purpose**: Ensures that each message is encrypted with a unique key.
- **Operation**: Advances every time a message is sent or received.
- **Properties**:
    - Each message has a unique **message key** that can be deleted after use.
    - Useful for handling **out-of-order messages**.

### Diffie-Hellman (DH) Ratchet

- **Purpose**: Introduces new randomness with every communication exchange.
- **Process**:
    - Each party periodically generates a new DH key pair.
    - Exchanging public keys allows both parties to compute a new shared secret.
    - Ensures future keys cannot be derived by an attacker who compromises a past key.
- **Ping-Pong Behavior**: Both parties take turns replacing their DH key pairs.

### Double Ratchet

- **Combination** of Symmetric-Key and DH Ratchets:
    - Each time a new public key is received, the DH ratchet is applied, generating a new chain key.
    - The symmetric-key ratchet is then used for encrypting individual messages within the chain.

## Handling Out-of-Order Messages

- Each message header contains:
    - **Message number (N)**.
    - **Previous chain length (PN)**.
- This allows the recipient to correctly derive the appropriate decryption keys, even if messages arrive out of order.

## Encryption and Decryption Process

### Encrypting Messages

- **Ratchet Step**: A symmetric ratchet step is applied for each message.
- **Encryption**: Uses a **unique message key** for encryption, providing forward secrecy.

### Decrypting Messages

- **Skipped Messages**: Handles skipped messages by storing keys temporarily.
- **Ratchet Step**: DH ratchet step is performed when a new public key is received.

## Double Ratchet with Header Encryption

- **Header Encryption**:
    - Protects metadata by encrypting message headers.
    - Adds additional keys for encrypting headers (e.g., **sending header key** and **next header key**).
- **Ratchet Advancement**:
    - Header keys are updated during each DH ratchet step.
    - Provides enhanced privacy by concealing which messages belong to which sessions.

## Implementation Considerations

### Integration with X3DH

- **X3DH (Extended Triple Diffie-Hellman)** is used for initial key agreement.
- **Shared Secret (SK)**: Used as the initial root key in the Double Ratchet.

### Recommended Cryptographic Algorithms

- **Curve25519** for DH key generation.
- **HKDF** for key derivation.
- **AES-256 in CBC mode** for encryption, paired with HMAC for authentication.

## Security Considerations

1. **Secure Deletion**: Deleted keys and plaintext should be unrecoverable to ensure security after compromise.
2. **Break-In Recovery**: DH ratchet provides recovery by replacing compromised keys.
3. **Skipped Message Keys**: Stored for handling out-of-order messages, but should be deleted after a reasonable time to prevent misuse.
4. **Ratchet Key Generation**: New keys should be generated just before use to minimize exposure time.
5. **Authentication Tag Truncation**: Truncating HMAC tags is possible but should be approached with caution to maintain security.

## Acknowledgements

- The concept of the **Diffie-Hellman Ratchet** was adapted from the **OTR protocol**.
- Contributions from numerous individuals, including discussions on secure deletion and mitigation strategies.


Here are organized Obsidian notes for the Sesame Algorithm paper:

# Sesame Algorithm

## Overview
- Session management algorithm for asynchronous message encryption
- Designed for Double Ratchet sessions created with X3DH key agreement
- Manages creation, deletion and use of encryption sessions in multi-device settings
- Core idea: Each device tracks "active" session for other devices, converging on single session per remote device

## Prerequisites

### [[System Components]]
- Server 
  - Stores user/device records
  - Maintains mailboxes for devices
  - Temporarily stores messages
- Users
  - Have unique UserID
  - Can be added/deleted
  - Can have multiple devices
- Devices
  - Have unique DeviceID per user
  - Can maintain state
  - Have identity key pairs
- Mailboxes
  - One per device
  - Hold messages sent to device
  - Messages removed when fetched

### [[Session Properties]] 
- Used for message encryption/decryption
- Have unique SessionID
- Can only decrypt messages with matching session
- Two types:
  - Initiating sessions (for sending initial messages)
  - Regular sessions (after first message decrypted)

## Core Algorithm

### [[Device State]]
- UserRecords (indexed by UserID)
  - Set of DeviceRecords
  - Can be marked as "stale" 
- DeviceRecords
  - Contains active session
  - List of inactive sessions
  - Can be marked as "stale"
- Identity key pairs
  - Per-user or per-device models supported

### [[State Update Operations]]
- Delete records and sessions
- Insert new sessions 
- Activate inactive sessions
- Mark records as stale
- Conditional updates based on (UserID, DeviceID, public key)
- Prep for encryption

### [[Message Handling]]
- Sending:
  - Encrypt to active sessions
  - Handle server rejections
  - Update device records
  - Retry if needed
- Receiving:
  - Create new sessions for initiation messages
  - Try decrypting with existing sessions
  - Activate successful session
  - Handle errors

## Optional Features

### [[Retry Handling]]
- MessageRecords track sent messages
- Retry requests for undecryptable messages
- Resending process
- Delivery receipts

### [[Session Expiration]]
- Sessions timestamped
- MAXSEND/MAXRECV constants
- Automatic session rotation
- Cleanup of old sessions

## Security Considerations

### [[Authentication]]
- Relies on user authentication of identity keys
- Handling key changes requires re-authentication
- Importance of validating identity keys

### [[Device Compromise]]
- Impact of compromised keys/state
- Passive decryption resistance
- Key compromise impersonation attacks
- Mitigation strategies

### [[Server Security]]
- Encrypted server communications
- Protection against impersonation
- Preventing DeviceID reuse

### [[Data Management]]
- Deleting old data safely
- Bounded storage requirements
- Error handling
- Partial message delivery

#encryption #security #messaging #protocols