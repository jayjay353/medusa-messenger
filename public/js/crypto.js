// ===== Crypto Utils für E2EE =====

const Crypto = {
  // Base64 <-> ArrayBuffer
  toBase64: (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer))),
  fromBase64: (base64) => Uint8Array.from(atob(base64), c => c.charCodeAt(0)),

  // Schlüsselpaar erzeugen und speichern
  async generateKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveBits"]
    );
    
    const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    
    localStorage.setItem('privateKey', this.toBase64(privateKey));
    return this.toBase64(publicKey);
  },

  // Public Key vom Storage laden
  async getPrivateKey() {
    const privKeyB64 = localStorage.getItem('privateKey');
    if (!privKeyB64) return null;
    
    return await crypto.subtle.importKey(
      "pkcs8",
      this.fromBase64(privKeyB64),
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveBits"]
    );
  },

  // Nachricht verschlüsseln mit AES-GCM
  async encrypt(message, recipientPublicKeyB64) {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const recipientKey = await crypto.subtle.importKey(
      "spki",
      this.fromBase64(recipientPublicKeyB64),
      { name: "ECDH", namedCurve: "P-256" },
      false,
      []
    );
    
    const privateKey = await this.getPrivateKey();
    if (!privateKey) throw new Error("Kein privater Schlüssel gefunden");
    
    // Shared Secret ableiten
    const sharedSecret = await crypto.subtle.deriveBits(
      { name: "ECDH", public: recipientKey },
      privateKey,
      256
    );
    
    // AES Key aus Shared Secret
    const aesKey = await crypto.subtle.importKey(
      "raw",
      sharedSecret,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );
    
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      enc.encode(message)
    );
    
    return {
      iv: this.toBase64(iv),
      data: this.toBase64(encrypted)
    };
  },

  // Nachricht entschlüsseln
  async decrypt(encryptedObj, senderPublicKeyB64) {
    const dec = new TextDecoder();
    
    const senderKey = await crypto.subtle.importKey(
      "spki",
      this.fromBase64(senderPublicKeyB64),
      { name: "ECDH", namedCurve: "P-256" },
      false,
      []
    );
    
    const privateKey = await this.getPrivateKey();
    if (!privateKey) throw new Error("Kein privater Schlüssel gefunden");
    
    const sharedSecret = await crypto.subtle.deriveBits
