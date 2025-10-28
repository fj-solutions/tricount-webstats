import { string } from "astro:schema";
import { generateKeyPairSync, randomUUID } from "crypto";
import fetch from "node-fetch";

export class TricountAPI {
  private baseUrl = "https://api.tricount.bunq.com";
  private appInstallationId: string;
  private publicKey: string;
  private privateKey: string;
  private headers: Record<string, string>;
  private authToken: string | null = null;
  private userId: string | null = null;

  constructor() {
    this.appInstallationId = randomUUID();
    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "pkcs1", format: "pem" },
      privateKeyEncoding: { type: "pkcs1", format: "pem" },
    });

    this.publicKey = publicKey;
    this.privateKey = privateKey;

    this.headers = {
      "User-Agent": "com.bunq.tricount.android:RELEASE:7.0.7:3174:ANDROID:13:C",
      "app-id": this.appInstallationId,
      "X-Bunq-Client-Request-Id": randomUUID(),
      "Content-Type": "application/json",
    };
  }

  /** Authentifiziert sich bei der Tricount API */
  async authenticate(): Promise<void> {
    const payload = {
      app_installation_uuid: this.appInstallationId,
      client_public_key: this.publicKey,
      device_description: "NodeJS",
    };

    const res = await fetch(`${this.baseUrl}/v1/session-registry-installation`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Auth failed: ${text}`);
    }

    const data: any = await res.json();
    const items = data.Response;
    this.authToken = items.find((x: any) => x.Token)?.Token?.token;
    this.userId = items.find((x: any) => x.UserPerson)?.UserPerson?.id;

    if (!this.authToken || !this.userId) {
      throw new Error("Auth token or user ID not found");
    }

    this.headers["X-Bunq-Client-Authentication"] = this.authToken;
  }

  /** Lädt Tricount-Daten anhand des öffentlichen Schlüssels */
  async fetchTricountData(tricountKey: string): Promise<any> {
    if (!this.userId) {
      throw new Error("Not authenticated yet. Call authenticate() first.");
    }

    const url = `${this.baseUrl}/v1/user/${this.userId}/registry?public_identifier_token=${tricountKey}`;
    const res = await fetch(url, { headers: this.headers });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch Tricount data: ${text}`);
    }
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
    return json;
  }
}
